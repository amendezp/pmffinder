import { z } from "zod";
import type { StageRubric, RubricResult } from "./types";

export const stage1Schema = z.object({
  origin_story: z.string().min(80, "Tell the story — at least a paragraph."),
  inflection_point: z.string().min(40),
  inflection_category: z.enum(["technological", "behavioral", "cultural", "regulatory"]),
  insight: z.string().min(40),
  authenticity: z.string().min(40),
  prior_attempts: z.string().optional().default(""),
});

export type Stage1Input = z.infer<typeof stage1Schema>;

export const stage1Rubric: StageRubric<Stage1Input> = {
  stageNumber: 1,
  title: "Sourcing & Vetting",
  blurb:
    "Great ideas find you — they don't come from brainstorming. Anchor your unique insight in a technological inflection.",
  schema: stage1Schema,
  fields: [
    {
      key: "origin_story",
      label: "How did this idea find you?",
      helper:
        "A unique insight is non-consensus by definition. Tell the unusual story — what were you doing, what did you notice, why couldn't you let it go?",
      kind: "long_text",
      rows: 6,
      placeholder:
        "I was working on X when I noticed Y... I kept seeing this pattern in...",
      required: true,
    },
    {
      key: "inflection_point",
      label: "The technological inflection",
      helper:
        "What changed in technology that makes this possible *now*? Behavioral, cultural, and regulatory shifts don't count — the bar here is a real technological inflection.",
      kind: "long_text",
      rows: 4,
      required: true,
    },
    {
      key: "inflection_category",
      label: "Confirm: is this inflection actually technological?",
      helper:
        "Technological inflections are far more durable than behavioral, cultural, or regulatory ones. If you check anything other than technological, this stage will not pass.",
      kind: "radio",
      required: true,
      options: [
        { value: "technological", label: "Technological (e.g., new model capability, new HW class)" },
        { value: "behavioral", label: "Behavioral (a shift in what people do)" },
        { value: "cultural", label: "Cultural (a shift in values/attitudes)" },
        { value: "regulatory", label: "Regulatory (a new rule or removed barrier)" },
      ],
    },
    {
      key: "insight",
      label: "The unique insight",
      helper:
        "What do you believe that most people don't? An idea everyone already agrees with isn't a unique insight — it's consensus.",
      kind: "long_text",
      rows: 4,
      required: true,
    },
    {
      key: "authenticity",
      label: "Why are *you* the one to see this?",
      helper:
        "Authenticity to a market takes time. Lived experience, deep domain immersion, an unusual technical lens.",
      kind: "long_text",
      rows: 4,
      required: true,
    },
    {
      key: "prior_attempts",
      label: "(Optional) Have others tried this and failed?",
      helper:
        "If yes, why did they fail — and why is now different? If no, why hasn't anyone tried?",
      kind: "long_text",
      rows: 3,
    },
  ],
  criteria: [
    {
      id: "tech_inflection",
      name: "Technological inflection",
      description:
        "The inflection is rooted in technology change (more enduring than behavior, culture, or regulation).",
    },
    {
      id: "non_consensus",
      name: "Unique, non-consensus insight",
      description:
        "The unique insight is something most people would *not* immediately agree with. Right + non-consensus is where outsized returns live.",
    },
    {
      id: "authenticity",
      name: "Authenticity to the market",
      description:
        "There is a credible reason this founder, specifically, can see the technological inflection — lived experience, technical depth, cross-field connection.",
    },
    {
      id: "found_you",
      name: "Idea found you (not brainstormed)",
      description:
        "The origin story shows the idea emerged from observation/practice, not from a 'let's come up with ideas' meeting.",
    },
  ],
  systemPrompt: `You are the grader for Stage 1 (Sourcing & Vetting Ideas) of a Product/Market Fit journey app, applying canonical product/market fit standards.

The bar to PASS this stage is high but specific. You grade strictly because the app refuses to advance the user until they meet the bar — your job is to push them to clarify or pivot, not to be nice.

Key principles you enforce:
- Great tech companies start with a TECHNOLOGICAL INFLECTION that enables a new type of product. Technological inflections are far more durable than behavioral, cultural, or regulatory ones. Behavioral/cultural/regulatory inflections do NOT pass on their own.
- The unique insight must be NON-CONSENSUS. "Right + non-consensus" is where outsized returns come from. If the unique insight is something a generic MBA would write down ("AI is transforming X"), it is consensus and fails.
- AUTHENTICITY: there must be a credible reason this founder can see this technological inflection. Generic curiosity is not authenticity. Lived experience, deep technical familiarity, or cross-field expertise are.
- Great ideas FIND YOU. If the origin story sounds like a brainstorming output or "I was looking for a startup idea", that's a fail signal.
- "Solving your own problem" alone is a weaker form of authenticity — note it but do not auto-fail.

For each criterion in the rubric, return whether it is met and a short explanation. Be concrete: quote phrases from the user's responses when explaining why something does or doesn't meet the bar.

You MUST call the submit_rubric_result tool exactly once with the structured result. Set passed=true ONLY if every criterion is met. If even one is not met, passed=false and provide suggested_revisions with concrete next steps (e.g., "Reframe your inflection as the underlying technology, not the behavior it enables").`,
  formatUserMessage(input, ctx) {
    let body = `# Stage 1 submission — Sourcing & Vetting

## Origin story
${input.origin_story}

## Technological inflection (self-classified as: ${input.inflection_category})
${input.inflection_point}

## The unique insight
${input.insight}

## Why this founder
${input.authenticity}
`;
    if (input.prior_attempts) {
      body += `\n## Prior attempts by others\n${input.prior_attempts}\n`;
    }
    if (ctx?.priorFeedback) {
      body += `\n---\n## Prior grading feedback (last attempt)\n${ctx.priorFeedback.overall_feedback}\n\nSuggested revisions you were given:\n${ctx.priorFeedback.suggested_revisions.map((s) => `- ${s}`).join("\n")}\n\nNote whether the user addressed these in their revision.`;
    }
    return body;
  },
};

export type { RubricResult };
