// PDF export logic using @react-pdf/renderer.
// Consumes ContentBlocks from html-parser to render formatted PDF output.

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
  parseHtmlToBlocks,
  type ContentBlock,
  type InlineRun,
} from "@/lib/utils/html-parser";
import type { ProposalExportData } from "./export-service";

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
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
  coverSubtitle: { fontSize: 14, color: "#475569", marginBottom: 40 },
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
  contentH1: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    marginTop: 14,
    marginBottom: 6,
    color: "#0f172a",
  },
  contentH2: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    marginTop: 10,
    marginBottom: 4,
    color: "#1e293b",
  },
  contentH3: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    marginTop: 8,
    marginBottom: 4,
    color: "#334155",
  },
  paragraph: { marginBottom: 8, textAlign: "justify" as const },
  bulletRow: {
    flexDirection: "row" as const,
    marginBottom: 4,
    paddingLeft: 12,
  },
  bulletMark: { width: 14, fontFamily: "Helvetica" },
  bulletContent: { flex: 1 },
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

// ── Helpers ───────────────────────────────────────────────────────────────────

function runFontFamily(run: InlineRun): string {
  if (run.bold && run.italic) return "Helvetica-BoldOblique";
  if (run.bold) return "Helvetica-Bold";
  if (run.italic) return "Helvetica-Oblique";
  return "Helvetica";
}

function runsToTextChildren(runs: InlineRun[]): React.ReactElement[] {
  return runs.map((run, i) =>
    React.createElement(
      Text,
      { key: i, style: { fontFamily: runFontFamily(run) } },
      run.text,
    ),
  );
}

function renderBlocksForPdf(
  blocks: ContentBlock[],
  keyPrefix: string,
): React.ReactElement[] {
  return blocks.map((block, i) => {
    const key = `${keyPrefix}-${i}`;
    const children = runsToTextChildren(block.runs);

    switch (block.type) {
      case "h1":
        return React.createElement(
          Text,
          { key, style: styles.contentH1 },
          ...children,
        );
      case "h2":
        return React.createElement(
          Text,
          { key, style: styles.contentH2 },
          ...children,
        );
      case "h3":
        return React.createElement(
          Text,
          { key, style: styles.contentH3 },
          ...children,
        );
      case "bullet":
        return React.createElement(
          View,
          { key, style: styles.bulletRow },
          React.createElement(Text, { style: styles.bulletMark }, "\u2022 "),
          React.createElement(
            Text,
            { style: styles.bulletContent },
            ...children,
          ),
        );
      case "numbered":
        return React.createElement(
          View,
          { key, style: styles.bulletRow },
          React.createElement(Text, { style: styles.bulletMark }, `${i + 1}. `),
          React.createElement(
            Text,
            { style: styles.bulletContent },
            ...children,
          ),
        );
      default:
        return React.createElement(
          View,
          { key, style: styles.paragraph },
          React.createElement(Text, null, ...children),
        );
    }
  });
}

// ── Builder ───────────────────────────────────────────────────────────────────

function buildPDFDocument(
  data: ProposalExportData,
): React.ReactElement<DocumentProps> {
  const sorted = [...data.sections].sort((a, b) => a.order - b.order);

  return React.createElement(
    PDFDocument,
    null,
    React.createElement(
      Page,
      { size: "A4", style: styles.page },
      React.createElement(Text, { style: styles.coverTitle }, data.title),
      data.clientName
        ? React.createElement(
            Text,
            { style: styles.coverSubtitle },
            `Prepared for: ${data.clientName}`,
          )
        : null,
      React.createElement(View, { style: styles.divider }),
      ...sorted.flatMap((section) => [
        React.createElement(
          Text,
          { key: `t-${section.order}`, style: styles.sectionTitle },
          section.title,
        ),
        ...renderBlocksForPdf(
          parseHtmlToBlocks(section.content),
          `s${section.order}`,
        ),
      ]),
      React.createElement(
        Text,
        {
          style: styles.footer,
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

export async function renderProposalToPdf(
  data: ProposalExportData,
): Promise<Buffer> {
  const doc = buildPDFDocument(data);
  const buffer = await renderToBuffer(doc);
  return Buffer.from(buffer);
}
