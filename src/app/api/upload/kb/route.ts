// POST /api/upload/kb — server-side KB document ingestion pipeline.
// Accepts multipart/form-data: file, type, title.
// Extracts text, creates KnowledgeBaseItem + KbChunk rows, fires async
// batch embedding. Returns { documentId, chunkCount } — no text on the wire.
//
// Distinct from /api/upload, which is a generic extraction utility used
// by the RFP upload flow and must remain unchanged.

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { type Prisma } from "@prisma/client";
import { extractText } from "@/lib/services/file-processor";
import { chunkText } from "@/lib/utils/chunker";
import {
  VoyageEmbeddingProvider,
  embedAndStoreChunks,
} from "@/lib/services/embeddings";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import { checkRateLimit } from "@/lib/middleware/rate-limit";
import { isAppError } from "@/lib/types/errors";
import {
  SUPPORTED_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
} from "@/lib/types/file-processing";

// ── KB item type validation ───────────────────────────────────────────────────

const KB_ITEM_TYPES = [
  "CASE_STUDY",
  "PAST_PROPOSAL",
  "METHODOLOGY",
  "TEAM_BIO",
  "CAPABILITY",
  "PRICING",
  "CERTIFICATE",
  "OTHER",
] as const;

type KBItemType = (typeof KB_ITEM_TYPES)[number];

function isKBItemType(v: unknown): v is KBItemType {
  return (
    typeof v === "string" && (KB_ITEM_TYPES as readonly string[]).includes(v)
  );
}

// ── Voyage AI singleton ───────────────────────────────────────────────────────

let _voyageProvider: VoyageEmbeddingProvider | null = null;
function getVoyageProvider(): VoyageEmbeddingProvider {
  if (!_voyageProvider) _voyageProvider = new VoyageEmbeddingProvider();
  return _voyageProvider;
}

// ── Handler ───────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  const { userId, orgId } = await auth();

  if (!userId || !orgId) {
    return errorResponse("UNAUTHORIZED", "Authentication required", 401);
  }

  // SEC-004: 50 uploads per hour per user (shared limit with /api/upload)
  try {
    checkRateLimit(`upload:${userId}`, 50, 60 * 60_000);
  } catch (err) {
    if (isAppError(err)) {
      return errorResponse("RATE_LIMIT_EXCEEDED", err.message, 429);
    }
  }

  const requestId = crypto.randomUUID();

  // 1. Parse multipart form
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return errorResponse(
      "INVALID_REQUEST",
      "Could not parse multipart form data",
      400,
    );
  }

  const fileField = formData.get("file");
  const typeField = formData.get("type");
  const titleField = formData.get("title");

  if (!(fileField instanceof File)) {
    return errorResponse(
      "MISSING_FILE",
      'Request must include a "file" field',
      400,
    );
  }
  if (!isKBItemType(typeField)) {
    return errorResponse(
      "INVALID_TYPE",
      `Unsupported document type: ${String(typeField)}`,
      400,
    );
  }
  if (typeof titleField !== "string" || !titleField.trim()) {
    return errorResponse("INVALID_TITLE", "Title is required", 400);
  }

  const docType: KBItemType = typeField;
  const docTitle = titleField.trim().slice(0, 255);
  const mimeType = fileField.type;

  // 2. Validate MIME type before reading buffer (fast path)
  if (
    !SUPPORTED_MIME_TYPES.includes(
      mimeType as (typeof SUPPORTED_MIME_TYPES)[number],
    )
  ) {
    return errorResponse(
      "UNSUPPORTED_FILE_TYPE",
      `File type "${mimeType}" is not supported. Upload a PDF or DOCX.`,
      415,
    );
  }

  // 3. Read buffer and enforce size cap
  const arrayBuffer = await fileField.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  if (buffer.length > MAX_FILE_SIZE_BYTES) {
    return errorResponse(
      "FILE_TOO_LARGE",
      `File is ${(buffer.length / 1024 / 1024).toFixed(1)} MB. Maximum is 50 MB.`,
      413,
    );
  }

  // 4. Resolve internal org ID from Clerk orgId
  const org = await db.organization.findUnique({
    where: { clerkOrgId: orgId },
    select: { id: true },
  });

  if (!org) {
    return errorResponse("ORG_NOT_FOUND", "Organization not found", 403);
  }

  logger.info("KB upload request received", {
    requestId,
    userId,
    orgId: org.id,
  });

  // 5. Extract raw text from file
  let parsedText: string;
  let pageCount: number | undefined;
  try {
    const parsed = await extractText(buffer, fileField.name, mimeType);
    parsedText = parsed.text;
    pageCount = parsed.pageCount;
  } catch (err) {
    if (isAppError(err)) {
      logger.warn("KB file extraction failed", {
        requestId,
        code: err.code,
        message: err.message,
      });
      return errorResponse(err.code, err.message, err.statusCode);
    }
    logger.error("Unexpected error during KB file extraction", {
      requestId,
      error: err instanceof Error ? err.message : String(err),
    });
    return errorResponse(
      "INTERNAL_ERROR",
      "File processing failed unexpectedly",
      500,
    );
  }

  // 6. Persist KnowledgeBaseItem with full extracted text
  const item = await db.knowledgeBaseItem.create({
    data: {
      orgId: org.id,
      type: docType,
      title: docTitle,
      content: parsedText,
      metadata: {
        fileSize: buffer.length,
        fileName: fileField.name,
        ...(pageCount !== undefined ? { pageCount } : {}),
      } as Prisma.InputJsonValue,
    },
  });

  // 7. Chunk and persist KbChunk rows.
  // Title is prepended so every chunk carries document identity context.
  const chunks = chunkText(`${docTitle}\n\n${parsedText}`);

  if (chunks.length > 0) {
    await db.kbChunk.createMany({
      data: chunks.map((c) => ({
        itemId: item.id,
        index: c.index,
        text: c.text,
        tokenCount: c.tokenCount,
      })),
    });

    const chunkRecords = await db.kbChunk.findMany({
      where: { itemId: item.id },
      select: { id: true, text: true },
      orderBy: { index: "asc" },
    });

    // Batch-embed — non-fatal: item is usable for full-text search without vectors.
    embedAndStoreChunks(db, chunkRecords, getVoyageProvider()).catch(
      (err: unknown) => {
        logger.warn("Failed to batch-embed KB chunks", {
          requestId,
          itemId: item.id,
          chunkCount: chunkRecords.length,
          error: err instanceof Error ? err.message : String(err),
        });
      },
    );
  }

  logger.info("KB document ingested successfully", {
    requestId,
    itemId: item.id,
    orgId: org.id,
    chunkCount: chunks.length,
    fileName: fileField.name,
  });

  return NextResponse.json({
    ok: true,
    data: {
      documentId: item.id,
      chunkCount: chunks.length,
      fileName: fileField.name,
      sizeBytes: buffer.length,
      pageCount,
    },
  });
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function errorResponse(
  code: string,
  message: string,
  status: number,
): NextResponse {
  return NextResponse.json({ ok: false, error: { code, message } }, { status });
}
