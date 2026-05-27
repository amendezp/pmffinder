import { z } from "zod";
import type { StageRubric } from "./types";

export const stage2Schema = z.object({
  what: z.string().min(60),
  single_primary_benefit: z.string().min(10),
  what_rooted_in_insight: z.string().min(40),
  leap_of_faith: z.string().min(40),
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
    "The What, Who, and How — rooted in your unique insight. You won't change the What. You'll iterate on the Who.",
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
      minLength: 60,
      example:
        "Example (Airbnb): A two-sided online marketplace where anyone can list a spare room or home for short-term rental, with built-in payments, two-way reviews, and verified profiles handling the trust layer.",
    },
    {
      key: "single_primary_benefit",
      label: "The single primary benefit",
      helper:
        "In one phrase: the ONE thing this product does. Buyers reject products with multiple benefits when they need only one and find the others suspicious. More than one is the most popular failure mode.",
      kind: "short_text",
      required: true,
      minLength: 10,
      placeholder: "One sentence, one benefit.",
      example:
        "Example (Airbnb): Sleep somewhere in a city when hotels are sold out or too expensive.",
    },
    {
      key: "what_rooted_in_insight",
      label: "How is this What rooted in your unique insight from Stage 1?",
      helper:
        "If you swapped this What for any other, would your unique insight still be relevant? If yes, the What isn't rooted enough.",
      kind: "long_text",
      rows: 3,
      required: true,
      minLength: 40,
    },
    {
      key: "leap_of_faith",
      label: "Your leap of faith",
      helper:
        "In one sentence: the assumption that, if false, kills the company. This is not the value hypothesis itself — it's the bet underneath it, and it sets the floor for the MVP.",
      kind: "long_text",
      rows: 3,
      required: true,
      minLength: 40,
      example:
        "Example (Airbnb): Travelers will trust online reviews enough to sleep in a stranger's home. If false, no amount of feature work or marketing rescues the business.",
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
      name: "What is rooted in the unique insight",
      description:
        "The What follows from the Stage 1 unique insight, not from a market-search-for-a-solution. Changing the What would obsolete the unique insight.",
    },
    {
      id: "single_primary_benefit",
      name: "Exactly one primary benefit",
      description:
        "The What promises ONE primary benefit, stated in a single phrase. Products that promise multiple benefits get rejected by buyers who only need one and find the others suspicious.",
    },
    {
      id: "leap_of_faith",
      name: "Leap of faith is sharp and falsifiable",
      description:
        "The leap of faith is one sentence and identifies the specific assumption that, if false, kills the company. Not vague (e.g. 'people will love this'); specific and testable.",
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
  systemPrompt: `You are the grader for Stage 2 (Value Hypothesis) of a Product/Market Fit journey app, applying canonical PMF standards.

The Value Hypothesis = What + Who + How, rooted in the Stage 1 unique insight. You enforce:
- The What MUST be rooted in the unique insight. If swapping the What for a different product wouldn't change the unique insight's relevance, the What isn't rooted.
- The product is permitted EXACTLY ONE primary benefit. More than one is the most popular failure mode — buyers reject products with multiple benefits when they need only one and find the others suspicious. If the user's "single primary benefit" field reads as two benefits stapled together ("X and Y"), fail single_primary_benefit.
- The LEAP OF FAITH must be a single sentence naming the specific assumption that, if false, kills the company. Vague claims ("people will love this", "the market is large") fail. The leap is the bet underneath the hypothesis — it sets the floor for the MVP.
- The Who must be a SPECIFIC bowling-pin segment along a real dimension (consumer: psycho/demo/behavioral/geo/JTBD; enterprise: vertical/function/size/geo/JTBD). 'Everyone', 'busy professionals', 'SMBs' = fail.
- The Who must be plausibly DESPERATE, not 'needing'. Desperation looks like: reaching across the table; willing to pay with little proof; tried to build it themselves. 'They'd find it useful' or 'this saves time' is not desperation.
- The How specifies a business model. Non-ad models should plan to charge from MVP from day one — if not, that's a warning sign that the customer isn't desperate. Note this if relevant.
- Disruptive angle is OPTIONAL but worth crediting when present. Disruption ≠ 'better, faster, cheaper'. Disruption = simpler, cheaper, more convenient (new-market or low-end).
- The What is the only thing the founder won't change going forward. They'll iterate on the Who. Don't grade this stage on whether the What is "the right one" — grade on whether it's coherently rooted in the unique insight and clearly stated.

You may NOT pass a submission where the Who is generic, the desperation evidence is just stated intent ("they say they'd use it"), the What is disconnected from the unique insight, or the leap of faith is fuzzy.

You MUST call the submit_rubric_result tool exactly once with passed=true only if every criterion is met. Quote phrases from the user's response when explaining your verdict.`,
  formatUserMessage(input, ctx) {
    let body = `# Stage 2 submission — Value Hypothesis

## The What
${input.what}

## Single primary benefit
${input.single_primary_benefit}

## How the What is rooted in the unique insight
${input.what_rooted_in_insight}

## Leap of faith
${input.leap_of_faith}

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
