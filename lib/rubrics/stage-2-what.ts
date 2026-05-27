import { z } from "zod";
import type { StageRubric } from "./types";

export const stage2Schema = z.object({
  what: z.string().min(60),
  single_primary_benefit: z.string().min(10),
  what_rooted_in_insight: z.string().min(40),
  leap_of_faith: z.string().min(40),
});

export type Stage2Input = z.infer<typeof stage2Schema>;

export const stage2Rubric: StageRubric<Stage2Input> = {
  stageNumber: 2,
  title: "The What",
  blurb:
    "What you'll build — one primary benefit, rooted in your unique insight. The What is the thing you won't change.",
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
  ],
  systemPrompt: `You are the grader for Stage 2 (The What) of a Product/Market Fit journey app, applying canonical PMF standards.

The What is one third of the Value Hypothesis (What + Who + How). It captures the LEAP OF FAITH and must be:
- ROOTED in the Stage 1 unique insight. If swapping the What for a different product wouldn't change the unique insight's relevance, the What isn't rooted.
- Limited to EXACTLY ONE primary benefit. More than one is the most popular failure mode — buyers reject products with multiple benefits when they need only one and find the others suspicious. If the user's "single primary benefit" field reads as two benefits stapled together ("X and Y"), fail single_primary_benefit.
- Anchored to a sharp LEAP OF FAITH: one sentence naming the specific assumption that, if false, kills the company. Vague claims ("people will love this", "the market is large") fail. The leap is the bet underneath the hypothesis — it sets the floor for the MVP.

The What is the only thing the founder won't change going forward. They'll iterate on the Who. Don't grade this stage on whether the What is "the right one" — grade on whether it's coherently rooted in the unique insight, names ONE benefit, and rests on a falsifiable leap of faith.

You MUST call the submit_rubric_result tool exactly once with passed=true only if every criterion is met. Quote phrases from the user's response when explaining your verdict.`,
  formatUserMessage(input, ctx) {
    let body = `# Stage 2 submission — The What

## The What
${input.what}

## Single primary benefit
${input.single_primary_benefit}

## How the What is rooted in the unique insight
${input.what_rooted_in_insight}

## Leap of faith
${input.leap_of_faith}
`;
    if (ctx?.priorFeedback) {
      body += `\n---\n## Prior grading feedback\n${ctx.priorFeedback.overall_feedback}\n\nPrior suggestions:\n${ctx.priorFeedback.suggested_revisions.map((s) => `- ${s}`).join("\n")}`;
    }
    return body;
  },
};
