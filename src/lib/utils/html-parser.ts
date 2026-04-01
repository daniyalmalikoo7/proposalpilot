// Parses Tiptap editor.getHTML() output into structured content blocks.
// No external dependencies — handles the predictable subset of HTML Tiptap produces.

export interface InlineRun {
  text: string;
  bold: boolean;
  italic: boolean;
}

export type BlockType =
  | "paragraph"
  | "h1"
  | "h2"
  | "h3"
  | "bullet"
  | "numbered";

export interface ContentBlock {
  type: BlockType;
  runs: InlineRun[];
}

function decodeEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

/**
 * Parse inline HTML into styled text runs.
 * Tracks bold/italic state via a tag stack as tags open and close.
 */
export function parseInlineRuns(
  html: string,
  bold = false,
  italic = false,
): InlineRun[] {
  const runs: InlineRun[] = [];
  const tagRe = /<(\/?)(\w+)([^>]*)>/g;
  let lastIndex = 0;
  let currentBold = bold;
  let currentItalic = italic;

  // Stack tracks formatting at each nesting level
  const stack: Array<{ tag: string; bold: boolean; italic: boolean }> = [
    { tag: "__root__", bold, italic },
  ];

  let match: RegExpExecArray | null;
  while ((match = tagRe.exec(html)) !== null) {
    const textBefore = html.slice(lastIndex, match.index);
    if (textBefore) {
      const decoded = decodeEntities(textBefore);
      if (decoded)
        runs.push({ text: decoded, bold: currentBold, italic: currentItalic });
    }
    lastIndex = match.index + match[0].length;

    const isClose = match[1] === "/";
    const tag = match[2].toLowerCase();

    if (tag === "br") {
      runs.push({ text: "\n", bold: currentBold, italic: currentItalic });
    } else if (!isClose) {
      const newBold = currentBold || tag === "strong" || tag === "b";
      const newItalic = currentItalic || tag === "em" || tag === "i";
      stack.push({ tag, bold: newBold, italic: newItalic });
      currentBold = newBold;
      currentItalic = newItalic;
    } else {
      // Pop the matching open tag (most-recent-first)
      for (let i = stack.length - 1; i > 0; i--) {
        if (stack[i].tag === tag) {
          stack.splice(i, 1);
          break;
        }
      }
      const top = stack[stack.length - 1];
      currentBold = top.bold;
      currentItalic = top.italic;
    }
  }

  // Remaining text after the last tag
  const tail = html.slice(lastIndex);
  if (tail) {
    const decoded = decodeEntities(tail.replace(/<[^>]+>/g, ""));
    if (decoded)
      runs.push({ text: decoded, bold: currentBold, italic: currentItalic });
  }

  return runs.filter((r) => r.text.length > 0);
}

/**
 * Parse Tiptap HTML output into a flat list of content blocks.
 * Handles: p, h1–h6, ul/ol > li, blockquote.
 */
export function parseHtmlToBlocks(html: string): ContentBlock[] {
  if (!html?.trim()) return [];

  const blocks: ContentBlock[] = [];
  const normalized = html.replace(/\r\n?/g, "\n");
  const blockRe = /<(p|h[1-6]|ul|ol|blockquote)([^>]*)>/gi;

  let match: RegExpExecArray | null;
  blockRe.lastIndex = 0;

  while ((match = blockRe.exec(normalized)) !== null) {
    const tagName = match[1].toLowerCase();
    const closeTag = `</${tagName}>`;
    const contentStart = match.index + match[0].length;
    const closeIdx = normalized.indexOf(closeTag, contentStart);
    if (closeIdx === -1) continue;

    const inner = normalized.slice(contentStart, closeIdx);

    if (tagName === "p") {
      const runs = parseInlineRuns(inner);
      if (runs.some((r) => r.text.trim()))
        blocks.push({ type: "paragraph", runs });
    } else if (/^h[1-6]$/.test(tagName)) {
      const level = parseInt(tagName[1], 10);
      const type: BlockType = level <= 2 ? "h1" : level === 3 ? "h2" : "h3";
      const runs = parseInlineRuns(inner);
      if (runs.length) blocks.push({ type, runs });
    } else if (tagName === "ul" || tagName === "ol") {
      const listType: BlockType = tagName === "ul" ? "bullet" : "numbered";
      const liRe = /<li[^>]*>([\s\S]*?)<\/li>/gi;
      let liMatch: RegExpExecArray | null;
      liRe.lastIndex = 0;
      while ((liMatch = liRe.exec(inner)) !== null) {
        // Tiptap wraps li content in <p>; strip those wrapper tags
        const liContent = liMatch[1].replace(/<\/?(p|ul|ol)[^>]*>/gi, "");
        const runs = parseInlineRuns(liContent);
        if (runs.some((r) => r.text.trim()))
          blocks.push({ type: listType, runs });
      }
    } else if (tagName === "blockquote") {
      const content = inner.replace(/<\/?(p)[^>]*>/gi, "");
      const runs = parseInlineRuns(content);
      if (runs.some((r) => r.text.trim()))
        blocks.push({ type: "paragraph", runs });
    }

    blockRe.lastIndex = closeIdx + closeTag.length;
  }

  return blocks;
}
