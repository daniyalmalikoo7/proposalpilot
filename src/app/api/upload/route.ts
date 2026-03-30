// POST /api/upload — file upload endpoint for PDF and DOCX
// Accepts multipart/form-data with a "file" field.
// Returns structured UploadResult with extracted text chunks.
//
// In production this would:
//   1. Authenticate via Clerk middleware
//   2. Persist RFPSource + chunks to DB
//   3. Queue background job for embedding generation

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { processUpload } from "@/lib/services/file-processor";
import { isAppError } from "@/lib/types/errors";
import { logger } from "@/lib/logger";
import { checkRateLimit } from "@/lib/middleware/rate-limit";
import {
  SUPPORTED_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
  type UploadResult,
} from "@/lib/types/file-processing";

// ── Response schemas ──────────────────────────────────────────────────────────

const SuccessResponseSchema = z.object({
  ok: z.literal(true),
  data: z.object({
    fileName: z.string(),
    mimeType: z.string(),
    sizeBytes: z.number(),
    pageCount: z.number().optional(),
    totalChunks: z.number(),
    textPreview: z.string(),
    chunks: z.array(
      z.object({
        index: z.number(),
        tokenCount: z.number(),
        startChar: z.number(),
        endChar: z.number(),
        text: z.string(),
      }),
    ),
  }),
});

const ErrorResponseSchema = z.object({
  ok: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
});

type SuccessResponse = z.infer<typeof SuccessResponseSchema>;
type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

// ── Handler ───────────────────────────────────────────────────────────────────

export async function POST(
  request: NextRequest,
): Promise<NextResponse<SuccessResponse | ErrorResponse>> {
  const { userId } = await auth();

  if (!userId) {
    return errorResponse("UNAUTHORIZED", "Authentication required", 401);
  }

  // SEC-004: 50 uploads per hour per user
  try {
    checkRateLimit(`upload:${userId}`, 50, 60 * 60_000);
  } catch (err) {
    if (isAppError(err)) {
      return errorResponse("RATE_LIMIT_EXCEEDED", err.message, 429);
    }
  }

  const requestId = crypto.randomUUID();

  logger.info("Upload request received", { requestId, userId });

  // 1. Parse multipart form
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return errorResponse(
      "INVALID_REQUEST",
      "Could not parse multipart form data",
      400,
    );
  }

  const fileField = formData.get("file");

  if (!(fileField instanceof File)) {
    return errorResponse(
      "MISSING_FILE",
      'Request must include a "file" field in multipart/form-data',
      400,
    );
  }

  // 2. Validate MIME type before reading the buffer (fast path)
  const mimeType = fileField.type;
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

  // 4. Extract text and chunk
  let result: UploadResult;
  try {
    result = await processUpload(buffer, fileField.name, mimeType, {
      chunkTokens: 500,
      overlapTokens: 50,
    });
  } catch (err) {
    if (isAppError(err)) {
      logger.warn("File processing failed", {
        requestId,
        code: err.code,
        message: err.message,
        context: err.context,
      });
      return errorResponse(err.code, err.message, err.statusCode);
    }

    logger.error("Unexpected error during file processing", {
      requestId,
      error: err instanceof Error ? err.message : String(err),
    });
    return errorResponse(
      "INTERNAL_ERROR",
      "File processing failed unexpectedly",
      500,
    );
  }

  logger.info("Upload processed successfully", {
    requestId,
    fileName: result.fileName,
    totalChunks: result.totalChunks,
  });

  return NextResponse.json<SuccessResponse>(
    {
      ok: true,
      data: {
        fileName: result.fileName,
        mimeType: result.mimeType,
        sizeBytes: result.sizeBytes,
        pageCount: result.pageCount,
        totalChunks: result.totalChunks,
        textPreview: result.textPreview,
        chunks: result.chunks,
      },
    },
    { status: 200 },
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function errorResponse(
  code: string,
  message: string,
  status: number,
): NextResponse<ErrorResponse> {
  return NextResponse.json<ErrorResponse>(
    { ok: false, error: { code, message } },
    { status },
  );
}
