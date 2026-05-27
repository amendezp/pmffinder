import { z } from "zod";
import type { StageRubric, ReferenceQuestions } from "./types";

const CONCEPT_TEST_QUESTIONS: ReferenceQuestions = [
  {
    category: "Lived the problem (Job-to-be-done)",
    questions: [
      "Can you talk me through the last time you faced ____ problem? (Walkthrough the job-to-be-done.)",
      "What's the hardest part about solving this problem for you?",
    ],
  },
  {
    category: "Desperate / frequent / consequential",
    questions: [
      "How do you currently solve this problem? What's good and bad about that?",
      "How often is this problem happening?",
      "What's the impact (so what?) if you don't solve this? What's the worst consequence? (Listen for loss: time, money, frustration.)",
      "Why would your boss care if this problem were solved? Why would the company care?",
    ],
  },
  {
    category: "Actively seeking solutions",
    questions: [
      "Have you tried using an external tool to solve this? Why or why not?",
      "Have you ever paid for a solution? Why or why not?",
      "Have you tried to build a solution yourself? How did that go?",
      "If you could wave a magic wand, how would you solve this?",
    ],
  },
  {
    category: "Ideal outcome / next steps",
    questions: [
      "If you could solve this problem, what would it mean to you? What's the biggest value to you?",
      "How would you measure success (KPIs)?",
      "Is there anyone else you'd advise me to talk to who faces a similar challenge?",
    ],
  },
];

export const stage5Schema = z.object({
  method: z.enum(["concierge", "video", "smoke_test", "search_results", "kickstarter", "other"]),
  method_details: z.string().min(40),
  unmet_goals: z.string().min(60),
  prospect_quotes: z.string().min(60),
  desperation_signals: z.string().min(40),
  prior_solutions: z.string().min(40),
});

export type Stage5Input = z.infer<typeof stage5Schema>;

export const stage5Rubric: StageRubric<Stage5Input> = {
  stageNumber: 5,
  title: "Validate Problem / Concept",
  blurb:
    "Listen for unmet goals tied to meaningful problems. Don't build yet — validate the concept first.",
  schema: stage5Schema,
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
  systemPrompt: `You are the grader for Stage 5 (Validate Problem / Concept).

You enforce these canonical PMF standards:
- The point of this stage is to validate the CONCEPT before building. Cheap, fast methods: concierge, video, smoke test, search results, Kickstarter, follow-me-home observation. A built MVP at this stage is over-investment.
- The instruction is: ATTEMPT TO SELL, do not ask. Customers do not enjoy delivering negative feedback and would rather agree politely than tell the truth — which produces false positives indistinguishable from real demand. Concept testing is not a test of imagination; it is a test of recognition. People know when they are desperate; the team's job is to find them.
- "Needing" is not enough. The bar is DESPERATION: customers reach across the table, ask "when can I have this?", sign up unprompted, try to build the solution themselves. Stated intent ("I'd use that") is not evidence.
- Listen for UNMET GOALS tied to meaningful problems — goals the customer can't currently reach. Not pain points in the abstract.
- Customers who have ALREADY TRIED to solve the problem (built spreadsheets, hired humans, cobbled tools) are the strongest signal of desperation.
- Two biases get formal counter-measures: Desirability bias is addressed by writing KILL CRITERIA before the experiment. Confirmation bias is addressed by using the 5 WHYS on every "no". Flag if neither shows up in the submission.
- Watch out for surveys / NPS / "would you pay $X?" — weak signals; flag them.

## Reference question bank (concept test)
Use these as a check on whether the user's evidence sounds like answers to the right questions:
- Lived the problem (JTBD): "Talk me through the last time you faced [problem]." "What's the hardest part about solving it?"
- Desperate / frequent / consequential: "How do you currently solve this?" "How often does it happen?" "What's the impact if you don't solve it — worst consequence?"
- Actively seeking solutions: "Have you paid for a solution?" "Have you tried to build one yourself? How did that go?" "If you could wave a magic wand…"
- Ideal outcome: "If solved, what's the biggest value?" "How would you measure success?" "Who else faces this?"

Quote specifically from the user's prospect quotes when grading.

You MUST call submit_rubric_result. passed=true only if every criterion is met. If the evidence sounds like sentiment ('they really liked it') without behavior, fail desperation_not_need.`,
  referenceQuestions: CONCEPT_TEST_QUESTIONS,
  formatUserMessage(input, ctx) {
    let body = `# Stage 5 submission — Validate Problem / Concept

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
