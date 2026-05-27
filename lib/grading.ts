import type { ContentBlockParam, Tool } from "@anthropic-ai/sdk/resources/messages";
import { anthropic, MODELS, requireApiKey } from "@/lib/anthropic";
import { getRubric, type RubricResult, type Criterion } from "@/lib/rubrics";

type EvidenceForGrading = {
  kind: "image" | "pdf" | "audio" | "note";
  caption?: string | null;
  tag?: string | null;
  /** Base64-encoded data + media type, for image content blocks. */
  imageData?: { base64: string; mediaType: "image/png" | "image/jpeg" | "image/gif" | "image/webp" };
  /** For text notes. */
  body?: string | null;
};

function rubricResultTool(criteria: Criterion[]): Tool {
  return {
    name: "submit_rubric_result",
    description:
      "Submit the structured grading result for this stage. Call this exactly once at the end of your evaluation.",
    input_schema: {
      type: "object",
      properties: {
        passed: {
          type: "boolean",
          description: "True only if EVERY criterion is met.",
        },
        criteria: {
          type: "array",
          description: "One entry per rubric criterion, in the same order as provided.",
          items: {
            type: "object",
            properties: {
              id: { type: "string", enum: criteria.map((c) => c.id) },
              name: { type: "string" },
              met: { type: "boolean" },
              feedback: {
                type: "string",
                description:
                  "1–3 sentences explaining why this criterion is met or not. Quote phrases from the user's response when relevant.",
              },
            },
            required: ["id", "name", "met", "feedback"],
          },
        },
        overall_feedback: {
          type: "string",
          description:
            "A short (3–5 sentence) overall assessment for the user. Direct, specific.",
        },
        suggested_revisions: {
          type: "array",
          items: { type: "string" },
          description:
            "Concrete next steps if not passed. Each item is a single actionable instruction. Leave empty if passed.",
        },
      },
      required: ["passed", "criteria", "overall_feedback", "suggested_revisions"],
    },
  };
}

export async function gradeStage(args: {
  stageNumber: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  responses: any;
  priorFeedback?: RubricResult;
  evidence?: EvidenceForGrading[];
}): Promise<RubricResult> {
  requireApiKey();
  const rubric = getRubric(args.stageNumber);

  // Validate responses against the stage's Zod schema. Map Zod issues to a
  // single readable sentence pointing at the offending fields.
  const parsed = rubric.schema.safeParse(args.responses);
  if (!parsed.success) {
    const fieldByKey = new Map(rubric.fields.map((f) => [f.key, f]));
    const issues = parsed.error.issues.map((iss) => {
      const key = (iss.path[0] ?? "").toString();
      const label = fieldByKey.get(key)?.label ?? key;
      if (iss.code === "too_small") return `"${label}" needs a bit more detail`;
      if (iss.code === "invalid_enum_value") return `"${label}" — please pick an option`;
      if (iss.code === "invalid_type") return `"${label}" is required`;
      return `"${label}" — ${iss.message}`;
    });
    const dedup = Array.from(new Set(issues));
    throw new Error(
      dedup.length === 1
        ? `${dedup[0]} before submitting.`
        : `A few things to fix before submitting: ${dedup.join("; ")}.`
    );
  }

  const userText = rubric.formatUserMessage(parsed.data, {
    priorFeedback: args.priorFeedback,
  });

  // Build the user message content blocks: text + any image evidence.
  const userContent: ContentBlockParam[] = [
    { type: "text", text: userText },
  ];

  const noteEvidence = (args.evidence ?? []).filter((e) => e.kind === "note" && e.body);
  if (noteEvidence.length > 0) {
    userContent.push({
      type: "text",
      text:
        "\n\n## Evidence — text notes\n" +
        noteEvidence
          .map(
            (e, i) =>
              `### Note ${i + 1}${e.caption ? ` — ${e.caption}` : ""}${e.tag ? ` (${e.tag})` : ""}\n${e.body}`
          )
          .join("\n\n"),
    });
  }

  const imageEvidence = (args.evidence ?? []).filter((e) => e.kind === "image" && e.imageData);
  for (const ev of imageEvidence) {
    userContent.push({
      type: "image",
      source: {
        type: "base64",
        media_type: ev.imageData!.mediaType,
        data: ev.imageData!.base64,
      },
    });
    if (ev.caption || ev.tag) {
      userContent.push({
        type: "text",
        text: `^ Caption: ${ev.caption ?? "(no caption)"}${ev.tag ? ` — tag: ${ev.tag}` : ""}`,
      });
    }
  }

  // Static system prompt benefits from prompt caching.
  const message = await anthropic.messages.create({
    model: MODELS.grading,
    max_tokens: 2000,
    system: [
      {
        type: "text",
        text:
          rubric.systemPrompt +
          "\n\n## Rubric criteria (you must return one entry per criterion in the same order)\n" +
          rubric.criteria
            .map((c, i) => `${i + 1}. id=${c.id} — ${c.name}: ${c.description}`)
            .join("\n"),
        cache_control: { type: "ephemeral" },
      },
    ],
    tools: [rubricResultTool(rubric.criteria)],
    tool_choice: { type: "tool", name: "submit_rubric_result" },
    messages: [{ role: "user", content: userContent }],
  });

  const toolBlock = message.content.find(
    (b) => b.type === "tool_use" && b.name === "submit_rubric_result"
  );
  if (!toolBlock || toolBlock.type !== "tool_use") {
    throw new Error(
      "Grader did not return a structured result — got: " + JSON.stringify(message.content)
    );
  }

  const result = toolBlock.input as RubricResult;

  // Defense in depth: if any criterion is unmet, passed must be false.
  const allMet = result.criteria.every((c) => c.met);
  return { ...result, passed: result.passed && allMet };
}
