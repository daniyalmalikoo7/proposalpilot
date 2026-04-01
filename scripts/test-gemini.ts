/**
 * Quick Gemini API connectivity test.
 * Usage: npx tsx scripts/test-gemini.ts
 */

import { readFileSync } from "fs";
import { join } from "path";

// Manually parse .env so we don't need the dotenv package at runtime
function loadEnv(): Record<string, string> {
  try {
    const raw = readFileSync(join(process.cwd(), ".env"), "utf-8");
    return Object.fromEntries(
      raw
        .split("\n")
        .filter((l) => l.trim() && !l.startsWith("#"))
        .map((l) => {
          const idx = l.indexOf("=");
          return [l.slice(0, idx).trim(), l.slice(idx + 1).trim()];
        })
        .filter(([k]) => k.length > 0),
    );
  } catch {
    return {};
  }
}

const env = loadEnv();
const apiKey =
  env["GOOGLE_GEMINI_API_KEY"] ?? process.env["GOOGLE_GEMINI_API_KEY"];

if (!apiKey) {
  console.error("❌  GOOGLE_GEMINI_API_KEY is not set in .env");
  process.exit(1);
}

console.log(`✓  API key found (${apiKey.slice(0, 8)}...)`);

// Test both models in the fallback chain
const MODELS = ["gemini-2.5-flash", "gemini-2.5-flash-lite"] as const;

async function testModel(model: string): Promise<void> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const body = {
    system_instruction: { parts: [{ text: "You are a helpful assistant." }] },
    contents: [
      {
        role: "user",
        parts: [{ text: 'Respond with exactly: {"status":"ok"}' }],
      },
    ],
    generationConfig: { maxOutputTokens: 64, temperature: 0 },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const json = (await res.json()) as {
    candidates?: { content: { parts: { text: string }[] } }[];
    error?: { message: string; code: number };
  };

  if (!res.ok || json.error) {
    console.error(
      `❌  ${model}: ${json.error?.message ?? `HTTP ${res.status}`}`,
    );
    return;
  }

  const text = json.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  console.log(`✓  ${model}: "${text.trim()}"`);
}

async function main() {
  for (const model of MODELS) {
    await testModel(model);
  }
}

void main();
