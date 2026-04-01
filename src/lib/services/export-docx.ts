// DOCX export logic using the docx library.
// Consumes ContentBlocks from html-parser to render formatted DOCX output.

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
} from "docx";
import { parseHtmlToBlocks, type ContentBlock } from "@/lib/utils/html-parser";
import type { ProposalExportData } from "./export-service";

function blockToDocxParagraphs(block: ContentBlock): Paragraph[] {
  const runs: TextRun[] = block.runs.map(
    (r) => new TextRun({ text: r.text, bold: r.bold, italics: r.italic }),
  );

  switch (block.type) {
    case "h1":
      return [
        new Paragraph({ children: runs, heading: HeadingLevel.HEADING_2 }),
      ];
    case "h2":
      return [
        new Paragraph({ children: runs, heading: HeadingLevel.HEADING_3 }),
      ];
    case "h3":
      return [
        new Paragraph({ children: runs, heading: HeadingLevel.HEADING_4 }),
      ];
    case "bullet":
      return [new Paragraph({ children: runs, bullet: { level: 0 } })];
    case "numbered":
      // docx library handles numbering via styles; fall back to plain paragraph with prefix
      return [
        new Paragraph({
          children: [new TextRun({ text: "• " }), ...runs],
        }),
      ];
    default:
      return [new Paragraph({ children: runs })];
  }
}

function buildDocxDocument(data: ProposalExportData): Document {
  const sorted = [...data.sections].sort((a, b) => a.order - b.order);

  const children: Paragraph[] = [
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
    new Paragraph({ text: "" }),
    ...sorted.flatMap((section) => [
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
      ...parseHtmlToBlocks(section.content).flatMap((block) =>
        blockToDocxParagraphs(block),
      ),
      new Paragraph({ text: "" }),
    ]),
  ];

  return new Document({ sections: [{ children }] });
}

export async function renderProposalToDocx(
  data: ProposalExportData,
): Promise<Buffer> {
  const doc = buildDocxDocument(data);
  return Packer.toBuffer(doc);
}
