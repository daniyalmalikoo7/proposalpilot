// Prompt loader — loads versioned prompts from docs/prompts/*.v{N}.md
// Format: YAML frontmatter, then <s>system</s><user>user template</user>
// Variables: {{variableName}} — all must be supplied or an error is thrown

import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import matter from "gray-matter";
import { logger } from "../../logger";

export interface PromptMetadata {
  id: string;
  version: string;
  model: string;
  max_tokens: number;
  temperature: number;
  description?: string;
}

export interface LoadedPrompt {
  metadata: PromptMetadata;
  systemMessage: string;
  userTemplate: string;
}

const PROMPTS_DIR = join(process.cwd(), "docs", "prompts");

/**
 * Load a versioned prompt from docs/prompts/{promptId}.v{version}.md
 * If version is omitted, loads the highest available version.
 */
export function loadPrompt(promptId: string, version?: string): LoadedPrompt {
  const targetFile = resolvePromptFile(promptId, version);
  const raw = readFileSync(targetFile, "utf-8");
  const { data, content } = matter(raw);

  // Split on the <user> opening tag — everything before is the system message
  const [rawSystem, rawUser] = content.split("<user>");

  if (rawUser === undefined) {
    throw new Error(
      `Prompt ${targetFile} is missing a <user> section. ` +
        `Format: <s>system</s><user>user template</user>`,
    );
  }

  const systemMessage = rawSystem.replace(/<\/?s>/g, "").trim();

  const userTemplate = rawUser.replace("</user>", "").trim();

  logger.debug("Loaded prompt", {
    promptId,
    version: data.version as string,
    file: targetFile,
  });

  return {
    metadata: data as PromptMetadata,
    systemMessage,
    userTemplate,
  };
}

/**
 * Render a prompt template by substituting {{variable}} placeholders.
 * All placeholders must be present in `variables` — missing keys throw.
 * User-supplied values are sanitized to prevent prompt injection.
 */
export function renderPrompt(
  template: string,
  variables: Record<string, string>,
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    if (!(key in variables)) {
      throw new Error(`Missing prompt variable: {{${key}}}`);
    }
    return sanitizeForPrompt(variables[key]);
  });
}

// ── Private ────────────────────────────────────────────────────────────────

function resolvePromptFile(promptId: string, version?: string): string {
  if (version) {
    return join(PROMPTS_DIR, `${promptId}.v${version}.md`);
  }

  // Find the highest available version
  const files = readdirSync(PROMPTS_DIR).filter((f) =>
    f.startsWith(`${promptId}.v`),
  );

  if (files.length === 0) {
    throw new Error(`No prompt files found for id: ${promptId}`);
  }

  // Sort by version number descending, take the first
  files.sort((a, b) => {
    const vA = parseVersionFromFilename(a);
    const vB = parseVersionFromFilename(b);
    return vB - vA;
  });

  return join(PROMPTS_DIR, files[0]);
}

function parseVersionFromFilename(filename: string): number {
  const match = /\.v(\d+)\.md$/.exec(filename);
  return match ? parseInt(match[1], 10) : 0;
}

/**
 * Strip prompt-injection vectors from user-supplied content.
 * This is a defence-in-depth measure; system/user message separation is the
 * primary control (see CLAUDE.md AI/GenAI Invariant #7).
 */
function sanitizeForPrompt(input: string): string {
  return input
    .replace(/<\/?s>/g, "") // remove system message tags
    .replace(/<\/?user>/g, "") // remove user message tags
    .replace(/\{\{/g, "{ {") // escape template syntax
    .slice(0, 10_000); // hard length cap
}
