// Types for the file upload and text extraction pipeline

export const SUPPORTED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

export type SupportedMimeType = (typeof SUPPORTED_MIME_TYPES)[number];

export const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

export interface ParsedFile {
  text: string;
  pageCount?: number;
  fileName: string;
  mimeType: SupportedMimeType;
  sizeBytes: number;
}

export interface TextChunk {
  /** The chunk's text content */
  text: string;
  /** Zero-based index of this chunk within the document */
  index: number;
  /** Approximate token count (4 chars ≈ 1 token) */
  tokenCount: number;
  /** Character offset of the chunk's start in the original text */
  startChar: number;
  /** Character offset of the chunk's end in the original text */
  endChar: number;
}

export interface ChunkingOptions {
  /** Target tokens per chunk (default: 500) */
  chunkTokens?: number;
  /** Overlap tokens between consecutive chunks (default: 50) */
  overlapTokens?: number;
}

export interface UploadResult {
  fileName: string;
  mimeType: SupportedMimeType;
  sizeBytes: number;
  pageCount?: number;
  totalChunks: number;
  chunks: TextChunk[];
  textPreview: string; // First 500 chars
}
