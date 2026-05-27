import { z } from "zod";
import type { StageRubric } from "./types";

export const stage4Schema = z.object({
  sprint_summary: z.string().min(80),
  selling_approach: z.string().min(60),
  reach_across_table: z.string().min(40),
  prior_attempts: z.string().min(40),
  five_whys_log: z.string().min(80),
  five_whys_root_cause: z.string().min(40),
  no_diagnosis: z.enum([
    "who_wrong",
    "implementation_wrong",
    "inflection_not_legible",
    "other",
  ]),
  no_diagnosis_evidence: z.string().min(40),
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
      key: "no_diagnosis",
      label: "Which kind of 'no' are you hearing?",
      helper:
        "Every 'no' falls into one of three diagnostic categories. Conflating them is the most expensive mistake at this stage — each one points to a different next move.",
      kind: "radio",
      required: true,
      options: [
        {
          value: "who_wrong",
          label: "(a) The prospect doesn't have the problem → the Who is wrong",
        },
        {
          value: "implementation_wrong",
          label:
            "(b) Has the problem, doesn't believe THIS implementation solves it → implementation is wrong (concept may still be intact)",
        },
        {
          value: "inflection_not_legible",
          label:
            "(c) Has the problem, believes a solution is possible, doesn't believe THIS team can deliver → inflection isn't legible yet",
        },
        {
          value: "other",
          label: "Mixed / no clear pattern yet — need more conversations",
        },
      ],
    },
    {
      key: "no_diagnosis_evidence",
      label: "Evidence for that diagnosis",
      helper:
        "Quote what prospects said that put you in that category. Each diagnosis implies a different next move: pivot the Who, change the implementation, or build legibility for the inflection.",
      kind: "long_text",
      rows: 4,
      required: true,
      minLength: 40,
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
      id: "no_diagnosis",
      name: "'No' diagnosed correctly",
      description:
        "The user has classified objections into the right category (Who wrong, implementation wrong, or inflection not legible) with concrete evidence. Pivots without diagnosis are guesses.",
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
- Every "no" must be classified into one of three diagnostic categories — (a) Who is wrong, (b) implementation is wrong, (c) inflection isn't legible yet. Conflating them is the most expensive mistake at this stage; each implies a different next move. If the user picked "other / mixed", that's acceptable only if they explicitly say they need more conversations to find a pattern.
- The user must acknowledge biases (confirmation, desirability, customer reluctance to be negative). Bonus: real counter-measures (kill criteria written before the experiment, skeptic interviewer, etc.).
- One hypothesis at a time. Never test multiple Whats in parallel. If the sprint mixes multiple value propositions, flag it.

## Reference question bank (implementation test)
Use these to check whether the user's sprint asked the right things:
- Feedback on UX: "What was the first thing you wanted to try?" "Where did you get confused?" "What felt unnecessary?"
- vs current solution: "How did this compare to how you do it today?" "Would it work in your environment?" "What would it replace?" "If you couldn't use this, what would you go back to doing?"
- Wildly successful: "What would make this 10x better?" "If released today, what would prevent you from using it?"
- Measurable impact: "What measurable impact would this have on your day-to-day?" "What goal of your boss would this hit?"

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

## "No" diagnosis (which of the 3 categories): ${input.no_diagnosis}
${input.no_diagnosis_evidence}

## Bias acknowledgement
${input.bias_acknowledgement}
`;
    if (ctx?.priorFeedback) {
      body += `\n---\n## Prior grading feedback\n${ctx.priorFeedback.overall_feedback}\n\nPrior suggestions:\n${ctx.priorFeedback.suggested_revisions.map((s) => `- ${s}`).join("\n")}`;
    }
    return body;
  },
};
