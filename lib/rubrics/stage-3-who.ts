import { z } from "zod";
import type { StageRubric } from "./types";

export const stage3Schema = z.object({
  who: z.string().min(40),
  who_segmentation: z.string().min(40),
  who_desperation_evidence: z.string().min(40),
  adjacent_markets: z.string().optional().default(""),
});

export type Stage3Input = z.infer<typeof stage3Schema>;

export const stage3Rubric: StageRubric<Stage3Input> = {
  stageNumber: 3,
  title: "The Who",
  blurb:
    "Your lead bowling pin — the most desperate, narrowly defined segment you can name. You'll iterate on the Who; you won't iterate on the What.",
  schema: stage3Schema,
  fields: [
    {
      key: "who",
      label: "The Who — your lead bowling pin",
      helper:
        "Not 'everyone'. The most desperate segment you can name. Start narrow; you'll knock down adjacent pins later. A market half-won produces no references and is functionally equivalent to a market not won at all.",
      kind: "long_text",
      rows: 4,
      required: true,
      minLength: 40,
      example:
        "Example (Airbnb): Travelers attending major conferences in cities where hotels routinely sell out (e.g., SXSW in Austin, design conferences in SF). They're price-sensitive, time-constrained, and have no fallback once hotels are gone.",
    },
    {
      key: "who_segmentation",
      label: "On what dimension is this segment defined?",
      helper:
        "Consumer: psychographic, demographic (incl. job/school), behavioral, geography, jobs-to-be-done. Enterprise: vertical, business function, geography, company size, jobs-to-be-done.",
      kind: "long_text",
      rows: 3,
      required: true,
      minLength: 40,
    },
    {
      key: "who_desperation_evidence",
      label: "Why is this segment *desperate*, not just 'needing'?",
      helper:
        "Two questions you must answer with yes: (1) why are these customers reaching across the table for this? (2) have they tried to build it themselves? If neither answer is yes, the niche is not desperate — merely interested, and interest does not pay the bills.",
      kind: "long_text",
      rows: 4,
      required: true,
      minLength: 40,
    },
    {
      key: "adjacent_markets",
      label: "(Optional) Adjacent markets to knock down later",
      helper:
        "Markets that don't reference each other directly but share characteristics with your lead pin. Dominating pin one generates the credibility and adjacency to knock down pin two.",
      kind: "long_text",
      rows: 3,
    },
  ],
  criteria: [
    {
      id: "who_specific",
      name: "Who is a specific segment",
      description:
        "The Who is one nameable segment along a recognized dimension (jobs-to-be-done, vertical, psychographic, etc.) — not 'everyone' or vague. Narrowly defined enough that the team can win it completely.",
    },
    {
      id: "who_desperate",
      name: "Who is plausibly desperate",
      description:
        "Evidence (even early/anecdotal) suggests this segment is desperate, not just 'would find it useful'. They reach across the table; bonus if they've tried to build their own solution.",
    },
    {
      id: "adjacencies_credible",
      name: "Credible adjacencies named",
      description:
        "Even if optional, when adjacencies are mentioned they sound plausible — the lead pin can credibly knock them down once dominated. The team isn't just saying 'huge TAM'.",
    },
  ],
  systemPrompt: `You are the grader for Stage 3 (The Who) of a Product/Market Fit journey app, applying canonical PMF standards.

The Who is one third of the Value Hypothesis. Using Moore's Technology Adoption Lifecycle, the only relevant initial customer is an EARLY ADOPTER — a visionary who buys on proof of concept rather than reference. Targeting the early majority first creates the chasm. You enforce:

- The Who must be a SPECIFIC bowling-pin segment along a real dimension (consumer: psycho/demo/behavioral/geo/JTBD; enterprise: vertical/function/size/geo/JTBD). 'Everyone', 'busy professionals', 'SMBs', 'startups' = fail.
- The Who must be plausibly DESPERATE, not 'needing'. Desperation looks like:
  • reaching across the table ("when can I have this?")
  • willing to pay with little proof
  • TRIED TO BUILD IT THEMSELVES (the single strongest signal)
- The lead pin must be small enough that the team can win it COMPLETELY. A market half-won produces no references.
- The team should not iterate on the What going forward — they will iterate on the Who. So the Who needs to be sharp now; pivots later will be along this same dimension.

You may NOT pass a submission where the Who is generic, the desperation evidence is just stated intent ("they say they'd use it"), or the segment is too broad for the team to dominate end-to-end.

You MUST call the submit_rubric_result tool exactly once with passed=true only if every criterion is met. Quote phrases from the user's response when explaining your verdict.`,
  formatUserMessage(input, ctx) {
    let body = `# Stage 3 submission — The Who

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
    if (ctx?.priorFeedback) {
      body += `\n---\n## Prior grading feedback\n${ctx.priorFeedback.overall_feedback}\n\nPrior suggestions:\n${ctx.priorFeedback.suggested_revisions.map((s) => `- ${s}`).join("\n")}`;
    }
    return body;
  },
};
