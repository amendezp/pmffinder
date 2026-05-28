export interface MemoSection {
  key: string;
  title: string;
  /** Soft length target in words for the generated copy. */
  wordTarget: number;
  /** Stages whose responses feed this section. */
  sourceStages: number[];
  /** What the section should communicate. */
  guidance: string;
}

export const MEMO_SECTIONS: MemoSection[] = [
  {
    key: "company_purpose",
    title: "Company Purpose",
    wordTarget: 25,
    sourceStages: [2],
    guidance:
      "One sentence. The product's reason to exist. Distilled from the 'What' (Stage 2) — concrete, ambitious, but specific.",
  },
  {
    key: "problem",
    title: "The Problem",
    wordTarget: 120,
    sourceStages: [5, 1],
    guidance:
      "What the target customer can't do today, and why it matters to them. Use language the customer would recognize. Cite the unmet goals heard in concept validation (Stage 5).",
  },
  {
    key: "solution",
    title: "The Solution",
    wordTarget: 140,
    sourceStages: [2, 6],
    guidance:
      "What you've built (or are building). Anchor it to the unique insight from Stage 1. State the core value, not a feature list.",
  },
  {
    key: "why_now",
    title: "Why Now",
    wordTarget: 110,
    sourceStages: [1],
    guidance:
      "The technological inflection. Why this is possible now and wasn't before. What technological shift unlocks this opportunity in this window.",
  },
  {
    key: "market_customer",
    title: "Market & Customer",
    wordTarget: 130,
    sourceStages: [3, 5],
    guidance:
      "The lead bowling pin — the desperate segment from Stage 3 — and the adjacent markets you can move into. Concrete profile.",
  },
  {
    key: "competition",
    title: "Competition / Alternatives",
    wordTarget: 100,
    sourceStages: [5],
    guidance:
      "What customers have tried before to solve this (Stage 5). Honest about real alternatives (incl. spreadsheets, manual workarounds). Why those fall short.",
  },
  {
    key: "traction",
    title: "Traction & PMF Evidence",
    wordTarget: 140,
    sourceStages: [7, 6],
    guidance:
      "Behavioral evidence from Stages 6–7: organic growth, sales yield, word of mouth, reach-across-table reactions, the surprise you're doubling down on.",
  },
  {
    key: "business_model",
    title: "Business Model",
    wordTarget: 90,
    sourceStages: [4],
    guidance:
      "How you charge and distribute (Stage 4). Note the disruptive angle if relevant (simpler/cheaper/more convenient).",
  },
  {
    key: "team_ask",
    title: "Team & The Ask",
    wordTarget: 110,
    sourceStages: [],
    guidance:
      "Team is filled in by the founder at memo-gen time. The ask is what they want next (raise size, milestone, etc.). Keep this short — it's a 2-pager.",
  },
];

export interface MemoContent {
  sections: Record<string, string>;
  meta: {
    company_name: string;
    one_liner: string;
    generated_at: string;
  };
}
