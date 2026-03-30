// ExportService — generates PDF and DOCX exports of a proposal.
// PDF: @react-pdf/renderer (server-side React → PDF)
// DOCX: docx (pure Node.js)

import React from "react";
import {
  Document as PDFDocument,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
  type DocumentProps,
} from "@react-pdf/renderer";
import {
  Document as DocxDocument,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
} from "docx";
import { logger } from "@/lib/logger";

// ── Types ──────────────────────────────────────────────────────────────────

export interface ProposalExportData {
  title: string;
  clientName?: string | null;
  sections: Array<{
    order: number;
    title: string;
    content: string;
  }>;
}

export type ExportFormat = "pdf" | "docx";

export interface ExportResult {
  buffer: Buffer;
  mimeType: string;
  filename: string;
}

// ── PDF ─────────────────────────────────────────────────────────────────────

const pdfStyles = StyleSheet.create({
  page: {
    padding: 60,
    fontFamily: "Helvetica",
    fontSize: 11,
    lineHeight: 1.6,
    color: "#1a1a1a",
  },
  coverTitle: {
    fontSize: 28,
    fontFamily: "Helvetica-Bold",
    marginBottom: 8,
    color: "#0f172a",
  },
  coverSubtitle: {
    fontSize: 14,
    color: "#475569",
    marginBottom: 40,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    marginTop: 28,
    marginBottom: 10,
    color: "#0f172a",
  },
  paragraph: {
    marginBottom: 8,
    textAlign: "justify" as const,
  },
  boldSpan: {
    fontFamily: "Helvetica-Bold",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 60,
    right: 60,
    fontSize: 9,
    color: "#94a3b8",
    textAlign: "center" as const,
  },
});

/**
 * Render plain text paragraphs from markdown-ish content.
 * Handles **bold** markers; strips other markdown syntax.
 */
function renderContentParagraphs(content: string): React.ReactElement[] {
  const paragraphs = content
    .split(/\n{2,}/)
    .map((p) => p.replace(/\n/g, " ").trim())
    .filter(Boolean);

  return paragraphs.map((para, i) => {
    // Split on **bold** markers
    const parts = para.split(/(\*\*[^*]+\*\*)/g);
    const children = parts.map((part, j) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return React.createElement(
          Text,
          { key: j, style: pdfStyles.boldSpan },
          part.slice(2, -2),
        );
      }
      // Strip remaining markdown artifacts
      return React.createElement(
        Text,
        { key: j },
        part.replace(/[*_`#>-]/g, ""),
      );
    });
    return React.createElement(
      View,
      { key: i, style: pdfStyles.paragraph },
      React.createElement(Text, null, ...children),
    );
  });
}

function buildPDFDocument(
  data: ProposalExportData,
): React.ReactElement<DocumentProps> {
  const sortedSections = [...data.sections].sort((a, b) => a.order - b.order);

  return React.createElement(
    PDFDocument,
    null,
    React.createElement(
      Page,
      { size: "A4", style: pdfStyles.page },
      // Cover
      React.createElement(Text, { style: pdfStyles.coverTitle }, data.title),
      data.clientName
        ? React.createElement(
            Text,
            { style: pdfStyles.coverSubtitle },
            `Prepared for: ${data.clientName}`,
          )
        : null,
      React.createElement(View, { style: pdfStyles.divider }),
      // Sections
      ...sortedSections.flatMap((section) => [
        React.createElement(
          Text,
          { key: `title-${section.order}`, style: pdfStyles.sectionTitle },
          section.title,
        ),
        ...renderContentParagraphs(section.content),
      ]),
      // Footer
      React.createElement(
        Text,
        {
          style: pdfStyles.footer,
          render: ({
            pageNumber,
            totalPages,
          }: {
            pageNumber: number;
            totalPages: number;
          }) => `${pageNumber} / ${totalPages}`,
          fixed: true,
        },
        "",
      ),
    ),
  );
}

// ── DOCX ─────────────────────────────────────────────────────────────────────

function contentToParagraphs(content: string): Paragraph[] {
  const lines = content
    .split(/\n{1,2}/)
    .map((l) => l.trim())
    .filter(Boolean);

  return lines.map((line) => {
    // Handle bullet points
    if (line.startsWith("- ") || line.startsWith("* ")) {
      return new Paragraph({
        text: line.slice(2),
        bullet: { level: 0 },
      });
    }

    // Handle **bold** inline
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    const runs: TextRun[] = parts.map((part) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return new TextRun({ text: part.slice(2, -2), bold: true });
      }
      return new TextRun({ text: part.replace(/[*_`#>]/g, "") });
    });

    return new Paragraph({ children: runs });
  });
}

function buildDocxDocument(data: ProposalExportData): DocxDocument {
  const sortedSections = [...data.sections].sort((a, b) => a.order - b.order);

  const children: Paragraph[] = [
    // Cover title
    new Paragraph({
      text: data.title,
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
    }),
    ...(data.clientName
      ? [
          new Paragraph({
            children: [
              new TextRun({
                text: `Prepared for: ${data.clientName}`,
                italics: true,
              }),
            ],
            alignment: AlignmentType.CENTER,
          }),
        ]
      : []),
    new Paragraph({ text: "" }), // spacer
    // Sections
    ...sortedSections.flatMap((section) => [
      new Paragraph({
        text: section.title,
        heading: HeadingLevel.HEADING_1,
        border: {
          bottom: {
            color: "E2E8F0",
            space: 1,
            style: BorderStyle.SINGLE,
            size: 6,
          },
        },
      }),
      ...contentToParagraphs(section.content),
      new Paragraph({ text: "" }), // spacer between sections
    ]),
  ];

  return new DocxDocument({ sections: [{ children }] });
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
    const doc = buildPDFDocument(data);
    const buffer = await renderToBuffer(doc);

    logger.info("export.pdf.complete", {
      title: data.title,
      sectionCount: data.sections.length,
      bytes: buffer.byteLength,
      latencyMs: Date.now() - t0,
    });

    return {
      buffer: Buffer.from(buffer),
      mimeType: "application/pdf",
      filename: `${slug}.pdf`,
    };
  }

  // DOCX
  const doc = buildDocxDocument(data);
  const buffer = await Packer.toBuffer(doc);

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
