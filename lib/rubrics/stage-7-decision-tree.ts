import { z } from "zod";
import type { StageRubric } from "./types";

export const stage7Schema = z.object({
  pmf_assessment: z.enum(["signal", "no_signal"]),
  assessment_evidence: z.string().min(80),

  // Branch A — signal: develop a growth hypothesis
  growth_hypothesis: z.string().optional().default(""),
  growth_channels: z.string().optional().default(""),
  growth_cost_effectiveness: z.string().optional().default(""),

  // Branch B — no signal: 5 Whys on non-adopters, pivot the Who
  non_adopter_five_whys: z.string().optional().default(""),
  pivoted_who: z.string().optional().default(""),
  revised_value_hypothesis: z.string().optional().default(""),
});

export type Stage7Input = z.infer<typeof stage7Schema>;

export const stage7Rubric: StageRubric<Stage7Input> = {
  stageNumber: 7,
  title: "Decision Tree",
  blurb:
    "3 months in: signal or no signal? If yes, draft the growth hypothesis. If no, pivot the Who (never the What).",
  schema: stage7Schema,
  fields: [
    {
      key: "pmf_assessment",
      label: "After ~3 months, do you have a PMF signal?",
      helper:
        "Be brutally honest. The bar is exponential organic growth (consumer) or sales yield > 1 (enterprise). 'Encouraging' isn't signal.",
      kind: "radio",
      required: true,
      options: [
        { value: "signal", label: "Yes — we have signal" },
        { value: "no_signal", label: "No — we don't" },
      ],
    },
    {
      key: "assessment_evidence",
      label: "Evidence for your assessment",
      helper:
        "Reference the metrics from Stage 5 and any new data. Avoid intent-based metrics.",
      kind: "long_text",
      rows: 5,
      required: true,
    },
    {
      key: "growth_hypothesis",
      label: "(If signal) Growth hypothesis",
      helper:
        "How will you grow your customer base in a cost-effective way? Distinct from your value hypothesis. Don't worry yet about brand, barriers, scale, competition — those come later.",
      kind: "long_text",
      rows: 5,
    },
    {
      key: "growth_channels",
      label: "(If signal) Channels you'll test, and how",
      kind: "long_text",
      rows: 4,
    },
    {
      key: "growth_cost_effectiveness",
      label: "(If signal) Cost-effectiveness test",
      helper:
        "What does 'cost-effective' mean for your model? CAC/LTV target? Payback period? Be specific so you'll know if a channel works.",
      kind: "long_text",
      rows: 3,
    },
    {
      key: "non_adopter_five_whys",
      label: "(If no signal) 5 Whys with non-adopters",
      helper:
        "Talk to people who *didn't* convert. Keep drilling until you find a structural reason. This is the second key 5 Whys moment in the journey.",
      kind: "long_text",
      rows: 7,
    },
    {
      key: "pivoted_who",
      label: "(If no signal) The pivoted Who",
      helper:
        "Pivot is on the WHO, not the WHAT. Changing the What would obsolete your unique insight. Who else might be desperate for this same value?",
      kind: "long_text",
      rows: 4,
    },
    {
      key: "revised_value_hypothesis",
      label: "(If no signal) Revised value hypothesis to re-run",
      kind: "long_text",
      rows: 4,
    },
  ],
  criteria: [
    {
      id: "honest_assessment",
      name: "Honest PMF assessment against the right bar",
      description:
        "Assessment uses the right bar (exp organic growth / sales yield > 1) and is evidence-based, not aspirational.",
    },
    {
      id: "correct_branch",
      name: "Correct branch executed",
      description:
        "If signal: growth hypothesis is provided, distinct from the value hypothesis, focused on cost-effective acquisition, and avoids distractions (brand, scale, barriers, competition). If no signal: 5 Whys with non-adopters reaches root, pivot is on the Who not the What, and a revised value hypothesis is drafted.",
    },
    {
      id: "no_premature_growth",
      name: "No premature growth focus",
      description:
        "If no signal: user is not trying to accelerate growth, fix competition, or build brand — they're correctly returning to the value hypothesis. If signal: growth efforts don't yet include scale/barriers/brand prematurely.",
    },
  ],
  systemPrompt: `You are the grader for Stage 7 (Decision Tree) — the branching exit of the PMF journey.

You enforce:
- Be HONEST about whether there is a signal. The bar is exponential organic growth (consumer) or sales yield > 1 (enterprise). "Things are encouraging" or "MAU is growing" without the curve is NOT signal. PMF is either obvious or it is not — if the user is debating whether the curve has started bending, it hasn't. Push back if the assessment doesn't match the evidence.
- IF SIGNAL: a growth hypothesis must be provided. It is DISTINCT from the value hypothesis. It focuses on cost-effective customer acquisition.
- IF NO SIGNAL: the founder must (a) run 5 Whys with NON-ADOPTERS to reach a root cause, (b) pivot the WHO (not the What — changing the What obsoletes the unique insight), (c) revise the value hypothesis to re-run. If they're pivoting the What, fail correct_branch.
- 5 Whys: surface answers (no time, no budget) aren't root causes. Push for structural reasons.

## Pre-PMF distractions (DO NOT entertain at this stage)
Even post-signal, the following are explicitly NOT yet appropriate. If the user's growth hypothesis or revised plan invokes any of these, flag it and fail no_premature_growth:
- Paying attention to competitors
- Building barriers to entry / moats
- Building the brand
- Going stealth
- Signing corporate partnerships
- Optimizing margins
- Working on culture
- Filing patents
- Raising more than necessary
- Recruiting heavily
- Defining the whole product (beyond the lead pin)
- Brainstorming growth tactics broadly
- Chasing adjacent markets prematurely

These are all post-PMF activities. The growth hypothesis at this stage should be about cost-effective acquisition for the lead pin, full stop.

Quote the user's response. Be specific.

You MUST call submit_rubric_result. Strict pass.`,
  formatUserMessage(input, ctx) {
    let body = `# Stage 7 submission — Decision Tree

## PMF assessment: ${input.pmf_assessment}

## Evidence
${input.assessment_evidence}
`;
    if (input.pmf_assessment === "signal") {
      body += `\n## Growth hypothesis\n${input.growth_hypothesis}\n\n## Channels to test\n${input.growth_channels}\n\n## Cost-effectiveness definition\n${input.growth_cost_effectiveness}\n`;
    } else {
      body += `\n## 5 Whys with non-adopters\n${input.non_adopter_five_whys}\n\n## Pivoted Who\n${input.pivoted_who}\n\n## Revised value hypothesis\n${input.revised_value_hypothesis}\n`;
    }
    if (ctx?.priorFeedback) {
      body += `\n---\n## Prior grading feedback\n${ctx.priorFeedback.overall_feedback}\n\nPrior suggestions:\n${ctx.priorFeedback.suggested_revisions.map((s) => `- ${s}`).join("\n")}`;
    }
    return body;
  },
};
