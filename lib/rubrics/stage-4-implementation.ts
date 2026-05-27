import { z } from "zod";
import type { StageRubric } from "./types";

export const stage4Schema = z.object({
  sprint_summary: z.string().min(80),
  selling_approach: z.string().min(60),
  reach_across_table: z.string().min(40),
  prior_attempts: z.string().min(40),
  five_whys_log: z.string().min(80),
  five_whys_root_cause: z.string().min(40),
  bias_acknowledgement: z.string().min(40),
});

export type Stage4Input = z.infer<typeof stage4Schema>;

export const stage4Rubric: StageRubric<Stage4Input> = {
  stageNumber: 4,
  title: "Validate Implementation",
  blurb:
    "Design sprint: try to *sell* it. Listen for 'when can I have this?' Use the 5 Whys when they don't bite.",
  schema: stage4Schema,
  fields: [
    {
      key: "sprint_summary",
      label: "Design sprint summary",
      helper:
        "What you showed (prototype, mockups, pitch), to whom, and what happened. Aim for a tight cycle — Steve Blank's customer development, modernized.",
      kind: "long_text",
      rows: 6,
      required: true,
    },
    {
      key: "selling_approach",
      label: "How did you *try to sell* (not ask what they want)?",
      helper:
        "Asking what the customer wants is market research and is not valuable. Trying to sell forces a real signal.",
      kind: "long_text",
      rows: 4,
      required: true,
    },
    {
      key: "reach_across_table",
      label: "Who reached across the table?",
      helper:
        "Verbatim where possible. 'When can I have this?', 'Can I pay now?', 'Have you built this yet?' If nobody, say so — that's a real signal too.",
      kind: "long_text",
      rows: 4,
      required: true,
    },
    {
      key: "prior_attempts",
      label: "What had they tried to solve this problem before?",
      kind: "long_text",
      rows: 3,
      required: true,
    },
    {
      key: "five_whys_log",
      label: "5 Whys log for objections from non-buyers",
      helper:
        "Customers are uncomfortable giving negative feedback — keep asking why until you get to the root. Be willing to annoy a few people.",
      kind: "long_text",
      rows: 8,
      required: true,
      placeholder:
        "Q1: Why didn't you buy?\nA1: ...\nQ2: Why is that?\nA2: ...\n...",
    },
    {
      key: "five_whys_root_cause",
      label: "What's the root cause you reached?",
      helper:
        "Surface answers like 'no time' or 'too expensive' are not root causes. Push until you find a structural reason.",
      kind: "long_text",
      rows: 4,
      required: true,
    },
    {
      key: "bias_acknowledgement",
      label: "Which biases did you guard against?",
      helper:
        "Confirmation bias (seeing what you look for), desirability bias (hearing what you want to hear), customer reluctance to give negative feedback. How did you counteract them?",
      kind: "long_text",
      rows: 3,
      required: true,
    },
  ],
  criteria: [
    {
      id: "tried_to_sell",
      name: "Tried to sell, didn't ask what they want",
      description:
        "The implementation was validated by attempting to sell — putting price, offer, or commitment in front of prospects — rather than asking what they want.",
    },
    {
      id: "behavioral_signal",
      name: "Behavioral signal (not stated intent)",
      description:
        "Desperation appears as behavior (reach-across-table, payment, follow-up) or behavioral absence is honestly reported. Stated intent alone is not sufficient.",
    },
    {
      id: "five_whys_root",
      name: "5 Whys reached a root cause",
      description:
        "The 5 Whys analysis reaches a structural root cause for objections, not surface excuses ('no time', 'no budget').",
    },
    {
      id: "biases_addressed",
      name: "Biases acknowledged and countered",
      description:
        "User shows awareness of confirmation bias, desirability bias, and the customer-can't-give-negative-feedback problem — and took steps to counter them.",
    },
  ],
  systemPrompt: `You are the grader for Stage 4 (Validate Implementation).

You enforce:
- The implementation must be tested by *attempting to sell*. Asking what the customer wants is market research and is NOT valuable. If the user's sprint sounds like interviews asking "would you use this?", that's a fail.
- Signals must be BEHAVIORAL: payment, sign-up, follow-up, "when can I have this?". Stated intent alone fails the behavioral_signal criterion.
- The 5 Whys must reach a structural ROOT CAUSE. Surface answers (no time, no money) are starting points, not endings.
- The user must acknowledge biases (confirmation, desirability, customer reluctance to be negative). Bonus: real counter-measures (e.g., asked a skeptic to interview prospects, used a co-founder as devil's advocate).
- It is fine and important to test ONE What at a time. If the sprint mixes multiple value propositions, flag it.

Quote the user's responses. Be specific in feedback so they know exactly what to fix.

You MUST call submit_rubric_result. passed=true only if every criterion is met.`,
  formatUserMessage(input, ctx) {
    let body = `# Stage 4 submission — Validate Implementation

## Design sprint summary
${input.sprint_summary}

## How they tried to sell (not ask)
${input.selling_approach}

## Reach-across-table reactions
${input.reach_across_table}

## Customers' prior attempts to solve
${input.prior_attempts}

## 5 Whys log
${input.five_whys_log}

## Root cause reached
${input.five_whys_root_cause}

## Bias acknowledgement
${input.bias_acknowledgement}
`;
    if (ctx?.priorFeedback) {
      body += `\n---\n## Prior grading feedback\n${ctx.priorFeedback.overall_feedback}\n\nPrior suggestions:\n${ctx.priorFeedback.suggested_revisions.map((s) => `- ${s}`).join("\n")}`;
    }
    return body;
  },
};
