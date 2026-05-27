import { z } from "zod";
import type { StageRubric } from "./types";

export const stage6Schema = z.object({
  surprise: z.string().min(80),
  inflection_in_data: z.string().min(60),
  doubling_down_plan: z.string().min(80),
  ignoring_the_bad: z.string().min(40),
  iteration_on_what: z.string().optional().default(""),
});

export type Stage6Input = z.infer<typeof stage6Schema>;

export const stage6Rubric: StageRubric<Stage6Input> = {
  stageNumber: 6,
  title: "Savor the Surprise",
  blurb:
    "Where's the inflection in your data? Double down on what works. Fixing the bad offers no leverage.",
  schema: stage6Schema,
  fields: [
    {
      key: "surprise",
      label: "The surprise",
      helper:
        "What did the data show that you didn't expect? Could be a segment that took off, a use case you didn't plan for, an unexpected referral source, anything.",
      kind: "long_text",
      rows: 5,
      required: true,
    },
    {
      key: "inflection_in_data",
      label: "The inflection in your data",
      helper:
        "Where is the positive second derivative? The point where slope changed. Be specific — date range, segment, metric.",
      kind: "long_text",
      rows: 4,
      required: true,
    },
    {
      key: "doubling_down_plan",
      label: "How will you double down on what works?",
      helper:
        "Concrete next steps. More of the surprising segment, more of the surprising use case, more of the surprising channel.",
      kind: "long_text",
      rows: 5,
      required: true,
    },
    {
      key: "ignoring_the_bad",
      label: "What 'bad' are you intentionally NOT fixing?",
      helper:
        "Fixing the bad offers no leverage. List the failures or weak segments you're explicitly de-prioritizing.",
      kind: "long_text",
      rows: 3,
      required: true,
    },
    {
      key: "iteration_on_what",
      label: "(If applicable) Are you iterating on the What?",
      helper:
        "Counter to the Stage 2 default, savoring the surprise may require iterating on the What — and that's OK if the surprise demands it.",
      kind: "long_text",
      rows: 3,
    },
  ],
  criteria: [
    {
      id: "real_surprise",
      name: "A real surprise is named",
      description:
        "A specific, concrete surprise is named — not 'everything went to plan' or vague 'people liked it'. The user can point to the data point that surprised them.",
    },
    {
      id: "inflection_identified",
      name: "Inflection in the data identified",
      description:
        "The positive second derivative (change in slope) is identified specifically — which metric, which segment, which time window.",
    },
    {
      id: "double_down_not_fix",
      name: "Plan invests in the good, doesn't fix the bad",
      description:
        "The plan focuses on amplifying what works. The user has explicitly named what bad/weak signal they will NOT spend time fixing.",
    },
  ],
  systemPrompt: `You are the grader for Stage 6 (Savor the Surprise) — a core PMF principle: look for the unexpected positive signal and pour fuel on it rather than fixing the bad.

Standards:
- A REAL SURPRISE must be named. If the user says "things went as planned" or describes only what they expected, fail real_surprise — that means they aren't paying close enough attention to the data, OR they don't actually have data yet (in which case they should be back in Stage 5).
- The INFLECTION must be identified specifically. "Growth picked up" is vague. "Organic signups from the design segment 3x'd in week 6" is specific. Push for specificity.
- The plan must DOUBLE DOWN, not FIX THE BAD. "We'll target the surprising segment harder and de-prioritize the original ICP that's not converting" — good. "We need to fix our onboarding for the bad segment" — bad.
- It is acceptable to iterate on the What if the surprise demands it. Don't fail the user for this — credit it as healthy.

You MUST call submit_rubric_result. Strict pass.`,
  formatUserMessage(input, ctx) {
    let body = `# Stage 6 submission — Savor the Surprise

## The surprise
${input.surprise}

## Inflection in the data
${input.inflection_in_data}

## Doubling-down plan
${input.doubling_down_plan}

## What I'm NOT fixing
${input.ignoring_the_bad}
`;
    if (input.iteration_on_what) {
      body += `\n## Iterating on the What?\n${input.iteration_on_what}\n`;
    }
    if (ctx?.priorFeedback) {
      body += `\n---\n## Prior grading feedback\n${ctx.priorFeedback.overall_feedback}\n\nPrior suggestions:\n${ctx.priorFeedback.suggested_revisions.map((s) => `- ${s}`).join("\n")}`;
    }
    return body;
  },
};
