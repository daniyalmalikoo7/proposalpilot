// Hallucination guards — every AI output passes through these before reaching users.
// See CLAUDE.md AI/GenAI Invariant #3 and #4.

import { logger } from "../../logger";

export interface HallucinationCheck {
  name: string;
  check: (output: string, context: string) => Promise<boolean>;
  /** "block" stops the pipeline; "warn" logs but allows through */
  severity: "block" | "warn";
}

export const defaultGuards: HallucinationCheck[] = [
  {
    name: "json_validity",
    check: async (output) => {
      try {
        JSON.parse(output);
        return true;
      } catch {
        return false;
      }
    },
    severity: "block",
  },
  {
    name: "non_empty_output",
    check: async (output) => output.trim().length > 0,
    severity: "block",
  },
  {
    name: "no_fabricated_urls",
    check: async (output, context) => {
      const outputUrls = output.match(/https?:\/\/[^\s"']+/g) ?? [];
      // Warn if output URLs were not present in the provided context
      const ungrounded = outputUrls.filter((url) => !context.includes(url));
      return ungrounded.length === 0;
    },
    severity: "warn",
  },
  {
    name: "confidence_threshold",
    check: async (output) => {
      try {
        const parsed = JSON.parse(output) as Record<string, unknown>;
        if (typeof parsed.confidence === "number") {
          return parsed.confidence >= 0.7;
        }
        return true; // no confidence field — pass
      } catch {
        return true; // non-JSON output — handled by json_validity guard
      }
    },
    severity: "warn",
  },
];

export interface GuardResult {
  passed: boolean;
  failures: string[];
  blocked: boolean;
}

/**
 * Run a set of hallucination guards against an AI output.
 * Returns early on the first "block"-severity failure.
 */
export async function runGuards(
  output: string,
  context: string,
  guards: HallucinationCheck[] = defaultGuards,
): Promise<GuardResult> {
  const failures: string[] = [];

  for (const guard of guards) {
    let passed: boolean;
    try {
      passed = await guard.check(output, context);
    } catch (err) {
      logger.warn("Guard check threw an error — treating as failed", {
        guard: guard.name,
        error: err instanceof Error ? err.message : String(err),
      });
      passed = false;
    }

    if (!passed) {
      failures.push(guard.name);

      if (guard.severity === "block") {
        logger.error("AI output blocked by hallucination guard", {
          guard: guard.name,
          outputPreview: output.slice(0, 200),
        });
        return { passed: false, failures, blocked: true };
      }

      logger.warn("AI output flagged by hallucination guard (non-blocking)", {
        guard: guard.name,
      });
    }
  }

  return { passed: failures.length === 0, failures, blocked: false };
}
