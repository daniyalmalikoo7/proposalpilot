// ExportService — public API for generating PDF and DOCX exports of a proposal.
// PDF rendering: export-pdf.ts | DOCX rendering: export-docx.ts
// HTML parsing (Tiptap output): src/lib/utils/html-parser.ts

import { logger } from "@/lib/logger";
import { renderProposalToPdf } from "./export-pdf";
import { renderProposalToDocx } from "./export-docx";

// ── Types ──────────────────────────────────────────────────────────────────

export interface ProposalExportData {
  title: string;
  clientName?: string | null;
  sections: Array<{
    order: number;
    title: string;
    content: string; // Tiptap editor.getHTML() output
  }>;
}

export type ExportFormat = "pdf" | "docx";

export interface ExportResult {
  buffer: Buffer;
  mimeType: string;
  filename: string;
}

// ── Public API ──────────────────────────────────────────────────────────────

export async function exportProposal(
  data: ProposalExportData,
  format: ExportFormat,
): Promise<ExportResult> {
  const slug = data.title
    .replace(/[^a-z0-9]+/gi, "-")
    .toLowerCase()
    .slice(0, 60);
  const t0 = Date.now();

  if (format === "pdf") {
    const buffer = await renderProposalToPdf(data);

    logger.info("export.pdf.complete", {
      title: data.title,
      sectionCount: data.sections.length,
      bytes: buffer.byteLength,
      latencyMs: Date.now() - t0,
    });

    return { buffer, mimeType: "application/pdf", filename: `${slug}.pdf` };
  }

  const buffer = await renderProposalToDocx(data);

  logger.info("export.docx.complete", {
    title: data.title,
    sectionCount: data.sections.length,
    bytes: buffer.byteLength,
    latencyMs: Date.now() - t0,
  });

  return {
    buffer,
    mimeType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    filename: `${slug}.docx`,
  };
}
