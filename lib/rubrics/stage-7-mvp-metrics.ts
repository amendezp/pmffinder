import { z } from "zod";
import type { StageRubric } from "./types";

export const stage7Schema = z.object({
  business_type: z.enum(["consumer", "enterprise"]),
  metric_summary: z.string().min(60),
  consumer_growth_data: z.string().optional().default(""),
  enterprise_sales_yield: z.string().optional().default(""),
  retention_data: z.string().min(40),
  word_of_mouth_evidence: z.string().min(40),
  intent_metrics_avoided: z.string().min(40),
});

export type Stage7Input = z.infer<typeof stage7Schema>;

export const stage7Rubric: StageRubric<Stage7Input> = {
  stageNumber: 7,
  title: "PMF Metrics",
  blurb:
    "Consumer: exponential organic growth. Enterprise: sales yield > 1. Behavior > intent. WoM > retention.",
  schema: stage7Schema,
  fields: [
    {
      key: "business_type",
      label: "Business type",
      kind: "radio",
      required: true,
      options: [
        { value: "consumer", label: "Consumer" },
        { value: "enterprise", label: "Enterprise" },
      ],
    },
    {
      key: "metric_summary",
      label: "Summary of what you're seeing",
      helper:
        "Plain-English account of the metrics: numbers, time periods, what's growing or stalling.",
      kind: "long_text",
      rows: 5,
      required: true,
    },
    {
      key: "consumer_growth_data",
      label: "(Consumer) Organic growth curve",
      helper:
        "Daily/weekly new users from organic channels only. Paste numbers, screenshots of charts, or describe the curve. Exponential = the only pass.",
      kind: "long_text",
      rows: 5,
    },
    {
      key: "enterprise_sales_yield",
      label: "(Enterprise) Sales yield calculation",
      helper:
        "Sales yield = annual revenue per sales rep divided by their fully-loaded cost (or whatever your team's definition is). Show the math. > 1 is the inflection.",
      kind: "long_text",
      rows: 5,
    },
    {
      key: "retention_data",
      label: "Retention data",
      helper:
        "Necessary but not sufficient. Cohort curves, repeat-usage rates, churn — whatever's relevant for your model.",
      kind: "long_text",
      rows: 4,
      required: true,
    },
    {
      key: "word_of_mouth_evidence",
      label: "Word-of-mouth evidence",
      helper:
        "The #1 PMF signal. Unprompted referrals, organic shares, sign-ups via 'a friend told me', viral coefficient. Behavioral evidence, not survey answers.",
      kind: "long_text",
      rows: 4,
      required: true,
    },
    {
      key: "intent_metrics_avoided",
      label: "Why you're NOT relying on NPS or intent surveys",
      helper:
        "NPS and 'how disappointed would you be if you couldn't use this' are intent-based. They're nice but they don't validate the value hypothesis. Show you understand this.",
      kind: "long_text",
      rows: 3,
      required: true,
    },
  ],
  criteria: [
    {
      id: "behavior_based",
      name: "Behavior-based metrics",
      description:
        "Metrics are behavioral (usage, growth, revenue), not stated intent (NPS, surveys, 'would you pay').",
    },
    {
      id: "primary_pmf_signal",
      name: "Primary PMF signal met",
      description:
        "Consumer: exponential organic growth is shown (curve, not linear). Enterprise: sales yield > 1 is computed and demonstrated.",
    },
    {
      id: "word_of_mouth",
      name: "Word-of-mouth evidence",
      description:
        "Unprompted referral / organic sharing / viral pickup is documented with behavioral evidence — not 'people say they'd recommend it'.",
    },
    {
      id: "retention_supporting",
      name: "Retention is real and supporting",
      description:
        "Retention data is presented with real numbers. Acknowledged as necessary but not sufficient for PMF.",
    },
  ],
  systemPrompt: `You are the grader for Stage 7 (Validate MVP with PMF Metrics).

You enforce:
- For consumer businesses, the PMF signal is EXPONENTIAL ORGANIC GROWTH. Linear growth, growth from paid acquisition, or "growing 10% MoM" alone are NOT exponential organic growth. Look at the actual curve and numbers.
- For enterprise businesses, the PMF signal is SALES YIELD > 1. This is the inflection. The user should compute it explicitly. Yield of 0.5 or 0.8 fails — once you cross 1, it typically races to 2.
- METRICS MUST BE BEHAVIOR-BASED. NPS, "how disappointed would you be" (Sean Ellis), survey-based satisfaction scores — these are intent-based and do NOT validate the value hypothesis. If the user is leaning on these, fail behavior_based.
- WORD OF MOUTH is the #1 signal — more important than retention. Look for unprompted referrals, organic sharing, "a friend told me", viral mechanics.
- Retention is necessary but not sufficient. It supports the case, doesn't make it alone.

If the user has not yet shipped or has no real users, you should fail this stage and tell them to ship before re-submitting. There is no substitute for behavioral data here.

You MUST call submit_rubric_result. Strict pass only.`,
  formatUserMessage(input, ctx) {
    let body = `# Stage 7 submission — MVP PMF Metrics

## Business type: ${input.business_type}

## Summary
${input.metric_summary}
`;
    if (input.business_type === "consumer" && input.consumer_growth_data) {
      body += `\n## Organic growth curve\n${input.consumer_growth_data}\n`;
    }
    if (input.business_type === "enterprise" && input.enterprise_sales_yield) {
      body += `\n## Sales yield\n${input.enterprise_sales_yield}\n`;
    }
    body += `\n## Retention\n${input.retention_data}\n\n## Word of mouth\n${input.word_of_mouth_evidence}\n\n## Why not NPS/intent metrics\n${input.intent_metrics_avoided}\n`;
    if (ctx?.priorFeedback) {
      body += `\n---\n## Prior grading feedback\n${ctx.priorFeedback.overall_feedback}\n\nPrior suggestions:\n${ctx.priorFeedback.suggested_revisions.map((s) => `- ${s}`).join("\n")}`;
    }
    return body;
  },
};
