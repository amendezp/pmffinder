import { z } from "zod";
import type { StageRubric, RubricResult } from "./types";

export const stage1Schema = z.object({
  insight: z.string().min(40, "Aim for a concise, complete sentence — at least a line."),
  inflection_point: z.string().min(40),
  inflection_category: z.enum(["technological", "behavioral", "cultural", "regulatory"]),
  authenticity: z.string().min(40),
  prior_attempts: z.string().optional().default(""),
});

export type Stage1Input = z.infer<typeof stage1Schema>;

export const stage1Rubric: StageRubric<Stage1Input> = {
  stageNumber: 1,
  title: "Sourcing & Vetting",
  blurb:
    "Anchor a unique insight — something right AND non-consensus — in a technological inflection.",
  schema: stage1Schema,
  fields: [
    {
      key: "insight",
      label: "Your unique insight",
      helper:
        "Write a clear and concise statement of your unique insight. It must be both RIGHT and NON-CONSENSUS — something most people would not immediately agree with.",
      kind: "long_text",
      rows: 4,
      placeholder:
        "In one or two sentences: what do you believe that most people don't?",
      required: true,
      minLength: 40,
      example:
        "LLMs make it economically viable to read every contract a mid-market company has ever signed — which means procurement can be run as continuous negotiation, not quarterly cycles. Most procurement leaders assume price discovery only happens at renewal, and that's the assumption I think is wrong.",
    },
    {
      key: "inflection_category",
      label: "What type of inflection is your idea built on?",
      helper:
        "Pick the closest match honestly — be specific about what you're seeing. Only technological inflections pass this stage: they're far more durable than behavioral, cultural, or regulatory shifts.",
      kind: "radio",
      required: true,
      options: [
        {
          value: "technological",
          label: "Technological (e.g., new model capability, new HW class)",
        },
        {
          value: "behavioral",
          label: "Behavioral (a shift in what people do)",
          notice:
            "Behavioral shifts fade. Look harder — is there a *technology* enabling this behavior? Anchor the inflection there.",
        },
        {
          value: "cultural",
          label: "Cultural (a shift in values/attitudes)",
          notice:
            "Cultural shifts are unreliable and rarely durable enough for a tech company. Find the underlying technology, if any.",
        },
        {
          value: "regulatory",
          label: "Regulatory (a new rule or removed barrier)",
          notice:
            "Regulation can flip back. The bar here is technology — what new technical capability does the regulation unlock for you?",
        },
      ],
    },
    {
      key: "inflection_point",
      label: "Describe the inflection",
      helper:
        "What specifically changed that makes this possible *now*? Name the technology, capability, or shift — be concrete.",
      kind: "long_text",
      rows: 4,
      required: true,
      minLength: 40,
      example:
        "Frontier LLMs crossed the threshold where they can reliably extract structured terms from messy PDFs at ~$0.001/doc. Two years ago this required a human paralegal at ~$5/doc; now it's economically viable to do it continuously instead of once a quarter.",
    },
    {
      key: "authenticity",
      label: "Why are *you* the one to see this?",
      helper:
        "Authenticity to a market takes time. Lived experience, deep domain immersion, an unusual technical lens.",
      kind: "long_text",
      rows: 4,
      required: true,
      minLength: 40,
      example:
        "I led procurement at a 400-person SaaS company for 5 years and watched our team burn ~30 hours/quarter pulling pricing data from PDFs. I also spent 3 years on an NLP team that shipped contract-extraction models pre-LLMs, so I know which tasks just became cheap and which are still hard.",
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
        "The insight is stated clearly and concisely AND is non-consensus — something most people would not immediately agree with. Right + non-consensus is where outsized returns live.",
    },
    {
      id: "authenticity",
      name: "Authenticity to the market",
      description:
        "There is a credible reason this founder, specifically, can see the technological inflection — lived experience, technical depth, cross-field connection.",
    },
  ],
  systemPrompt: `You are the grader for Stage 1 (Sourcing & Vetting Ideas) of a Product/Market Fit journey app, applying canonical product/market fit standards.

The bar to PASS this stage is high but specific. You grade strictly because the app refuses to advance the user until they meet the bar — your job is to push them to clarify or pivot, not to be nice.

Key principles you enforce:
- The unique insight must be CLEAR, CONCISE, and NON-CONSENSUS. "Right + non-consensus" is where outsized returns come from. If the insight is something a generic MBA would write down ("AI is transforming X", "remote work is here to stay"), it is consensus and fails. Vague or sprawling statements also fail — push for one to two crisp sentences.
- Great tech companies start with a TECHNOLOGICAL INFLECTION that enables a new type of product. Technological inflections are far more durable than behavioral, cultural, or regulatory ones. Behavioral/cultural/regulatory inflections do NOT pass on their own.
- AUTHENTICITY: there must be a credible reason this founder can see this technological inflection. Generic curiosity is not authenticity. Lived experience, deep technical familiarity, or cross-field expertise are.
- "Solving your own problem" alone is a weaker form of authenticity — note it but do not auto-fail.

For each criterion in the rubric, return whether it is met and a short explanation. Be concrete: quote phrases from the user's responses when explaining why something does or doesn't meet the bar.

You MUST call the submit_rubric_result tool exactly once with the structured result. Set passed=true ONLY if every criterion is met. If even one is not met, passed=false and provide suggested_revisions with concrete next steps (e.g., "Tighten your insight to one sentence and make sure it's something a thoughtful peer would push back on", "Reframe your inflection as the underlying technology, not the behavior it enables").`,
  formatUserMessage(input, ctx) {
    let body = `# Stage 1 submission — Sourcing & Vetting

## The unique insight
${input.insight}

## Technological inflection (self-classified as: ${input.inflection_category})
${input.inflection_point}

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
