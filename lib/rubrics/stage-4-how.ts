import { z } from "zod";
import type { StageRubric } from "./types";

export const stage4Schema = z.object({
  how_business_model: z.enum(["advertising", "subscription", "transaction", "other"]),
  how_business_model_details: z.string().min(40),
  disruptive_angle: z.string().optional().default(""),
});

export type Stage4Input = z.infer<typeof stage4Schema>;

export const stage4Rubric: StageRubric<Stage4Input> = {
  stageNumber: 4,
  title: "The How",
  blurb:
    "How you'll charge and distribute. Aim for disruptive in the Christensen sense — simpler, cheaper, more convenient, and uneconomic for the incumbent to copy.",
  schema: stage4Schema,
  fields: [
    {
      key: "how_business_model",
      label: "Primary business model",
      helper:
        "The three basic models of the internet are advertising, subscription, and transaction fees. Pick the closest match.",
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
        "Unless your model is intrinsically advertising-based, you should plan to charge from MVP. If customers won't pay an MVP, they likely never will — because they're not desperate.",
      kind: "long_text",
      rows: 5,
      required: true,
      minLength: 40,
      example:
        "Example (Airbnb): Transaction fee on each booking — ~3% from the guest, ~3% from the host. The marketplace itself bears no inventory cost. Distribution is direct (we own the homepage where supply and demand meet) with paid search initially to seed liquidity in lead cities.",
    },
    {
      key: "disruptive_angle",
      label: "(Optional) Disruptive angle",
      helper:
        "Christensen-style disruption: simpler, cheaper, more convenient — NOT 'better, faster, cheaper'. Two paths: new-market (serves non-consumers) or low-end (serves the over-served). True disruption is uneconomic for the incumbent to copy, which creates an Innovator's Dilemma.",
      kind: "long_text",
      rows: 4,
      example:
        "Example (Airbnb): New-market disruption. We don't compete with hotels — we compete with non-consumption (people who'd otherwise not travel, or sleep on a friend's couch). Hotels can't profitably defend on price because their cost structure assumes a $200/night room. Our marginal cost per room is zero.",
    },
  ],
  criteria: [
    {
      id: "business_model_clear",
      name: "Business model is clear",
      description:
        "How you charge and distribute is specified. Non-ad models should plan to charge from MVP. Apparent vs embedded fees are considered.",
    },
    {
      id: "charges_from_day_one",
      name: "Charges from day one (unless ad-based)",
      description:
        "Unless intrinsically advertising-funded, the team plans to charge from MVP. Free MVPs are a flag: if customers won't pay an MVP, they likely never will — they're not desperate.",
    },
  ],
  systemPrompt: `You are the grader for Stage 4 (The How) of a Product/Market Fit journey app, applying canonical PMF standards.

The How is the third element of the Value Hypothesis. You enforce:

- The HOW specifies a clear business model. The three basic internet models are advertising, subscription, and transaction. "Other" is acceptable only when fully explained.
- Unless the model is intrinsically ADVERTISING-BASED, the product must charge from DAY ONE. This is non-negotiable. If customers won't pay for the MVP, they likely never will — because they are not desperate. Flag any free-MVP-with-monetization-later plan.
- DISRUPTIVE ANGLE is optional but worth crediting heavily when present and real. The Christensen test: simpler, cheaper, more convenient — NOT 'better, faster, cheaper'. Two valid paths:
  • New-market disruption: serves non-consumers, easiest competitor to beat.
  • Low-end disruption: serves the over-served, priced below what the incumbent's cost structure can profitably defend.
- True disruption is UNECONOMIC FOR THE INCUMBENT to copy — that's what creates the Innovator's Dilemma. If the user claims "disruptive" but the model is just "do what the incumbent does, but cheaper", that's competition, not disruption. Note this.

You may NOT pass a submission where the business model is vague, or where the team plans to give the MVP away for free with no clear monetization path (unless ad-based).

You MUST call the submit_rubric_result tool exactly once with passed=true only if every criterion is met.`,
  formatUserMessage(input, ctx) {
    let body = `# Stage 4 submission — The How

## Business model (${input.how_business_model})
${input.how_business_model_details}
`;
    if (input.disruptive_angle) {
      body += `\n## Disruptive angle\n${input.disruptive_angle}\n`;
    }
    if (ctx?.priorFeedback) {
      body += `\n---\n## Prior grading feedback\n${ctx.priorFeedback.overall_feedback}\n\nPrior suggestions:\n${ctx.priorFeedback.suggested_revisions.map((s) => `- ${s}`).join("\n")}`;
    }
    return body;
  },
};
