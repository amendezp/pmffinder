import { z } from "zod";
import type { StageRubric } from "./types";

export const stage3Schema = z.object({
  method: z.enum(["concierge", "video", "smoke_test", "search_results", "kickstarter", "other"]),
  method_details: z.string().min(40),
  unmet_goals: z.string().min(60),
  prospect_quotes: z.string().min(60),
  desperation_signals: z.string().min(40),
  prior_solutions: z.string().min(40),
});

export type Stage3Input = z.infer<typeof stage3Schema>;

export const stage3Rubric: StageRubric<Stage3Input> = {
  stageNumber: 3,
  title: "Validate Problem / Concept",
  blurb:
    "Listen for unmet goals tied to meaningful problems. Don't build yet — validate the concept first.",
  schema: stage3Schema,
  fields: [
    {
      key: "method",
      label: "Concept-validation method",
      helper:
        "Cheap, fast ways to test the concept before building. The point is to fail fast if no one's desperate.",
      kind: "radio",
      required: true,
      options: [
        { value: "concierge", label: "Concierge (manually deliver the value)" },
        { value: "video", label: "Video (like Dropbox)" },
        { value: "smoke_test", label: "Smoke test (landing page + email capture)" },
        { value: "search_results", label: "Search results / keyword demand" },
        { value: "kickstarter", label: "Kickstarter or pre-orders" },
        { value: "other", label: "Other (explain)" },
      ],
    },
    {
      key: "method_details",
      label: "What you did, and what the response looked like",
      kind: "long_text",
      rows: 5,
      required: true,
    },
    {
      key: "unmet_goals",
      label: "What unmet goals did you hear?",
      helper:
        "A goal is what they're trying to achieve. An unmet goal is one they can't currently reach with available tools.",
      kind: "long_text",
      rows: 5,
      required: true,
    },
    {
      key: "prospect_quotes",
      label: "Direct quotes from prospects",
      helper:
        "Verbatim if possible. Especially anyone who 'reached across the table' — asked when they could buy, signed up unprompted, offered to pay.",
      kind: "long_text",
      rows: 6,
      required: true,
    },
    {
      key: "desperation_signals",
      label: "Behavioral signals of desperation",
      helper:
        "Beyond words — did they sign up? Pay? Send unsolicited follow-ups? Try to skip the waitlist? Behavior > intent.",
      kind: "long_text",
      rows: 4,
      required: true,
    },
    {
      key: "prior_solutions",
      label: "What have they tried before to solve this?",
      helper:
        "Built a hacky spreadsheet? Hired someone? Cobbled together other tools? People who've tried to solve it are desperate.",
      kind: "long_text",
      rows: 4,
      required: true,
    },
  ],
  criteria: [
    {
      id: "method_fit",
      name: "Method is appropriate to stage",
      description:
        "A cheap, fast concept-validation method (concierge, video, smoke test, search, KS) was used — not a fully built MVP, and not just market research.",
    },
    {
      id: "unmet_goals_named",
      name: "Unmet goals named",
      description:
        "The user has identified specific unmet goals customers articulate, not just 'this would be useful'.",
    },
    {
      id: "desperation_not_need",
      name: "Desperation evidence (not just need)",
      description:
        "Evidence reflects desperation: reach-across-table behavior, willingness to pay early, prior attempts to solve the problem. Not 'I'd find it useful' or NPS-style sentiment.",
    },
    {
      id: "prior_solutions",
      name: "Prior solution attempts surfaced",
      description:
        "The user knows what customers have tried before. People who've tried to build it themselves are gold.",
    },
  ],
  systemPrompt: `You are the grader for Stage 3 (Validate Problem / Concept).

You enforce these standards from the PMF lecture:
- The point of this stage is to validate the CONCEPT before building. Cheap, fast methods: concierge, video, smoke test, search results, Kickstarter. A built MVP at this stage is over-investment.
- "Needing" is not enough. The bar is DESPERATION: customers reach across the table, ask "when can I have this?", sign up unprompted, try to build the solution themselves. Stated intent ("I'd use that") is not evidence.
- Listen for UNMET GOALS tied to meaningful problems — goals the customer can't currently reach. Not pain points in the abstract.
- Customers who have ALREADY TRIED to solve the problem (built spreadsheets, hired humans, cobbled tools) are the strongest signal of desperation.
- Watch out for confirmation bias and desirability bias in the user's submitted evidence. Surveys / NPS / "would you pay $X?" are weak signals — flag them.

Quote specifically from the user's prospect quotes when grading.

You MUST call submit_rubric_result. passed=true only if every criterion is met. If the evidence sounds like sentiment ('they really liked it') without behavior, fail desperation_not_need.`,
  formatUserMessage(input, ctx) {
    let body = `# Stage 3 submission — Validate Problem / Concept

## Method (${input.method})
${input.method_details}

## Unmet goals heard
${input.unmet_goals}

## Prospect quotes
${input.prospect_quotes}

## Behavioral desperation signals
${input.desperation_signals}

## Prior solution attempts by customers
${input.prior_solutions}
`;
    if (ctx?.priorFeedback) {
      body += `\n---\n## Prior grading feedback\n${ctx.priorFeedback.overall_feedback}\n\nPrior suggestions:\n${ctx.priorFeedback.suggested_revisions.map((s) => `- ${s}`).join("\n")}`;
    }
    return body;
  },
};
