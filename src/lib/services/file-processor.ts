// File processor — extracts text from PDF and DOCX, then chunks for embedding.
// Runs server-side only (Node.js). Never import in client components.

import pdfParse from "pdf-parse";
import mammoth from "mammoth";
import { chunkText } from "../utils/chunker";
import { FileProcessingError, ValidationError } from "../types/errors";
import {
  SUPPORTED_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
  type ParsedFile,
  type SupportedMimeType,
  type UploadResult,
  type ChunkingOptions,
} from "../types/file-processing";
import { logger } from "../logger";

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Validate and extract text from a PDF or DOCX buffer.
 * Throws ValidationError for bad inputs, FileProcessingError for parse failures.
 */
export async function extractText(
  buffer: Buffer,
  fileName: string,
  mimeType: string,
): Promise<ParsedFile> {
  validateFile(buffer, fileName, mimeType);

  const safeMime = mimeType as SupportedMimeType;

  logger.info("Extracting text from file", {
    fileName,
    mimeType,
    sizeBytes: buffer.length,
  });

  if (safeMime === "application/pdf") {
    return extractFromPdf(buffer, fileName, safeMime);
  }

  return extractFromDocx(buffer, fileName, safeMime);
}

/**
 * Full pipeline: extract text → chunk → return structured result.
 */
export async function processUpload(
  buffer: Buffer,
  fileName: string,
  mimeType: string,
  chunkingOptions?: ChunkingOptions,
): Promise<UploadResult> {
  const parsed = await extractText(buffer, fileName, mimeType);
  const chunks = chunkText(parsed.text, chunkingOptions);

  logger.info("File processed successfully", {
    fileName,
    mimeType,
    pageCount: parsed.pageCount,
    totalChunks: chunks.length,
  });

  return {
    fileName: parsed.fileName,
    mimeType: parsed.mimeType,
    sizeBytes: parsed.sizeBytes,
    pageCount: parsed.pageCount,
    totalChunks: chunks.length,
    chunks,
    textPreview: parsed.text.slice(0, 500),
  };
}

// ── Private helpers ────────────────────────────────────────────────────────────

function validateFile(
  buffer: Buffer,
  fileName: string,
  mimeType: string,
): void {
  if (buffer.length === 0) {
    throw new ValidationError("Uploaded file is empty", { fileName });
  }

  if (buffer.length > MAX_FILE_SIZE_BYTES) {
    throw new ValidationError(
      `File exceeds the 50 MB limit (received ${(buffer.length / 1024 / 1024).toFixed(1)} MB)`,
      { fileName, sizeBytes: buffer.length },
    );
  }

  if (!SUPPORTED_MIME_TYPES.includes(mimeType as SupportedMimeType)) {
    throw new ValidationError(
      `Unsupported file type: ${mimeType}. Accepted: PDF, DOCX`,
      { fileName, mimeType },
    );
  }

  // Basic magic-byte checks to guard against spoofed Content-Type headers
  if (
    mimeType === "application/pdf" &&
    buffer.slice(0, 4).toString("ascii") !== "%PDF"
  ) {
    throw new ValidationError("File does not appear to be a valid PDF", {
      fileName,
    });
  }
}

async function extractFromPdf(
  buffer: Buffer,
  fileName: string,
  mimeType: SupportedMimeType,
): Promise<ParsedFile> {
  try {
    const data = await pdfParse(buffer, {
      // Disable the default test-file handler that prints to stdout
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      pagerender: undefined,
    });

    if (!data.text || data.text.trim().length === 0) {
      throw new FileProcessingError(
        "PDF contains no extractable text (may be image-only)",
        {
          fileName,
        },
      );
    }

    return {
      text: data.text,
      pageCount: data.numpages,
      fileName,
      mimeType,
      sizeBytes: buffer.length,
    };
  } catch (err) {
    if (err instanceof FileProcessingError) throw err;
    throw new FileProcessingError("Failed to parse PDF", {
      fileName,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

async function extractFromDocx(
  buffer: Buffer,
  fileName: string,
  mimeType: SupportedMimeType,
): Promise<ParsedFile> {
  try {
    const result = await mammoth.extractRawText({ buffer });

    if (result.messages.length > 0) {
      logger.warn("DOCX extraction warnings", {
        fileName,
        messages: result.messages.map((m) => m.message),
      });
    }

    if (!result.value || result.value.trim().length === 0) {
      throw new FileProcessingError("DOCX contains no extractable text", {
        fileName,
      });
    }

    return {
      text: result.value,
      fileName,
      mimeType,
      sizeBytes: buffer.length,
    };
  } catch (err) {
    if (err instanceof FileProcessingError) throw err;
    throw new FileProcessingError("Failed to parse DOCX", {
      fileName,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
