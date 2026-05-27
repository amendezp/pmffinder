import { z } from "zod";
import type { StageRubric } from "./types";

export const stage2Schema = z.object({
  what: z.string().min(60),
  what_rooted_in_insight: z.string().min(40),
  who: z.string().min(40),
  who_segmentation: z.string().min(40),
  who_desperation_evidence: z.string().min(40),
  adjacent_markets: z.string().optional().default(""),
  how_business_model: z.enum(["advertising", "subscription", "transaction", "other"]),
  how_business_model_details: z.string().min(40),
  disruptive_angle: z.string().optional().default(""),
});

export type Stage2Input = z.infer<typeof stage2Schema>;

export const stage2Rubric: StageRubric<Stage2Input> = {
  stageNumber: 2,
  title: "Value Hypothesis",
  blurb:
    "The What, Who, and How — rooted in your insight. You won't change the What. You'll iterate on the Who.",
  schema: stage2Schema,
  fields: [
    {
      key: "what",
      label: "The What",
      helper:
        "What specifically will you build? Concrete, not abstract — but not yet a feature list. Capture the core value.",
      kind: "long_text",
      rows: 5,
      required: true,
    },
    {
      key: "what_rooted_in_insight",
      label: "How is this What rooted in your insight from Stage 1?",
      helper:
        "If you swapped this What for any other, would your insight still be relevant? If yes, the What isn't rooted enough.",
      kind: "long_text",
      rows: 3,
      required: true,
    },
    {
      key: "who",
      label: "The Who — your lead bowling pin",
      helper:
        "Not 'everyone'. The most desperate segment you can name. Start narrow; you'll knock down adjacent pins later.",
      kind: "long_text",
      rows: 4,
      required: true,
    },
    {
      key: "who_segmentation",
      label: "On what dimension is this segment defined?",
      helper:
        "Consumer: psychographic, demographic (incl. job/school), behavioral, geography, jobs-to-be-done. Enterprise: vertical, business function, geography, company size, jobs-to-be-done.",
      kind: "long_text",
      rows: 3,
      required: true,
    },
    {
      key: "who_desperation_evidence",
      label: "Why is this segment *desperate*, not just 'needing'?",
      helper:
        "Desperation = reaching across the table, willing to pay with little proof, has tried to build it themselves. 'They'd find it useful' is not desperation.",
      kind: "long_text",
      rows: 4,
      required: true,
    },
    {
      key: "adjacent_markets",
      label: "(Optional) Adjacent markets to knock down later",
      helper:
        "Markets that don't reference each other directly but share characteristics with your lead pin.",
      kind: "long_text",
      rows: 3,
    },
    {
      key: "how_business_model",
      label: "Primary business model",
      kind: "radio",
      required: true,
      options: [
        { value: "advertising", label: "Advertising" },
        { value: "subscription", label: "Subscription" },
        { value: "transaction", label: "Transaction fee" },
        { value: "other", label: "Other (explain below)" },
      ],
    },
    {
      key: "how_business_model_details",
      label: "How will you charge and distribute?",
      helper:
        "If not ad-based, you should plan to charge from MVP. If customers won't pay an MVP, they won't pay later — they're not desperate.",
      kind: "long_text",
      rows: 4,
      required: true,
    },
    {
      key: "disruptive_angle",
      label: "(Optional) Disruptive angle",
      helper:
        "Christensen-style disruption: simpler, cheaper, more convenient — not 'better, faster, cheaper'. New-market (non-consumers) or low-end (overserved)?",
      kind: "long_text",
      rows: 3,
    },
  ],
  criteria: [
    {
      id: "what_rooted_in_insight",
      name: "What is rooted in the insight",
      description:
        "The What follows from the Stage 1 insight, not from a market-search-for-a-solution. Changing the What would obsolete the insight.",
    },
    {
      id: "who_specific",
      name: "Who is a specific segment",
      description:
        "The Who is one nameable segment along a recognized dimension (jobs-to-be-done, vertical, psychographic, etc.) — not 'everyone' or vague.",
    },
    {
      id: "who_desperate",
      name: "Who is plausibly desperate",
      description:
        "Evidence (even early/anecdotal) suggests this segment is desperate, not just 'would find it useful'. They reach across the table.",
    },
    {
      id: "business_model_clear",
      name: "Business model is clear",
      description:
        "How you charge and distribute is specified. Non-ad models should charge from MVP. Apparent vs embedded fees are considered.",
    },
  ],
  systemPrompt: `You are the grader for Stage 2 (Value Hypothesis) of a PMF journey app, applying Andy Rachleff's standards.

The Value Hypothesis = What + Who + How, rooted in the Stage 1 insight. You enforce:
- The What MUST be rooted in the insight. If swapping the What for a different product wouldn't change the insight's relevance, the What isn't rooted.
- The Who must be a SPECIFIC bowling-pin segment along a real dimension (consumer: psycho/demo/behavioral/geo/JTBD; enterprise: vertical/function/size/geo/JTBD). 'Everyone', 'busy professionals', 'SMBs' = fail.
- The Who must be plausibly DESPERATE, not 'needing'. Desperation looks like: reaching across the table; willing to pay with little proof; tried to build it themselves. 'They'd find it useful' or 'this saves time' is not desperation.
- The How specifies a business model. Non-ad models should plan to charge from MVP — if not, that's a warning sign that the customer isn't desperate. Note this if relevant.
- Disruptive angle is OPTIONAL but worth crediting when present. Disruption ≠ 'better, faster, cheaper'. Disruption = simpler, cheaper, more convenient (new-market or low-end).
- The What is the only thing the founder won't change going forward. They'll iterate on the Who. Don't grade this stage on whether the What is "the right one" — grade on whether it's coherently rooted in the insight and clearly stated.

You may NOT pass a submission where the Who is generic, the desperation evidence is just stated intent ("they say they'd use it"), or the What is disconnected from the insight.

You MUST call the submit_rubric_result tool exactly once with passed=true only if every criterion is met. Quote phrases from the user's response when explaining your verdict.`,
  formatUserMessage(input, ctx) {
    let body = `# Stage 2 submission — Value Hypothesis

## The What
${input.what}

## How the What is rooted in the insight
${input.what_rooted_in_insight}

## The Who (lead bowling pin)
${input.who}

## Segmentation dimension
${input.who_segmentation}

## Evidence the Who is desperate
${input.who_desperation_evidence}
`;
    if (input.adjacent_markets) {
      body += `\n## Adjacent markets\n${input.adjacent_markets}\n`;
    }
    body += `\n## Business model (${input.how_business_model})\n${input.how_business_model_details}\n`;
    if (input.disruptive_angle) {
      body += `\n## Disruptive angle\n${input.disruptive_angle}\n`;
    }
    if (ctx?.priorFeedback) {
      body += `\n---\n## Prior grading feedback\n${ctx.priorFeedback.overall_feedback}\n\nPrior suggestions:\n${ctx.priorFeedback.suggested_revisions.map((s) => `- ${s}`).join("\n")}`;
    }
    return body;
  },
};
