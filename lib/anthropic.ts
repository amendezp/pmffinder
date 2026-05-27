import Anthropic from "@anthropic-ai/sdk";

if (!process.env.ANTHROPIC_API_KEY) {
  // Don't throw at module load — Next.js may import this during build.
  // The actual route handlers will throw a clear error if the key is missing.
}

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY ?? "",
});

// Model selection — see plan: Sonnet for grading (fast, cheap), Opus for memo synthesis.
export const MODELS = {
  grading: "claude-sonnet-4-6",
  chat: "claude-sonnet-4-6",
  memo: "claude-opus-4-7",
} as const;

export function requireApiKey() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set. Add it to .env.local (see .env.example)."
    );
  }
}
