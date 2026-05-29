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

/**
 * Top-level investor memo structure modeled on the classic 2005 Sequoia
 * YouTube cover memo: Introduction → Deal → Market & Customer → Competition
 * → Business Model → Traction → Key Risks → Team & Hiring Plan →
 * Recommendation. Direct, first-person voice from the founder to the
 * investor.
 */
export const MEMO_SECTIONS: MemoSection[] = [
  {
    key: "introduction",
    title: "Introduction",
    wordTarget: 220,
    sourceStages: [1, 2, 3],
    guidance:
      "Two to three flowing paragraphs that open the memo. Lead with what the company does and the unique insight that powers it (Stages 1 + 2). Place it in time with the technological inflection (Stage 1). End with a sketch of the initial market (Stage 3). Conversational but precise — this is the investor's first read.",
  },
  {
    key: "the_deal",
    title: "The Deal",
    wordTarget: 90,
    sourceStages: [],
    guidance:
      "Founder-provided. What's being raised, the milestones it gets to, the proposed structure (e.g. $1m seed → $4m Series A on hitting X, Y, Z). Brief and direct.",
  },
  {
    key: "market_customer",
    title: "Market & Customer",
    wordTarget: 130,
    sourceStages: [3, 5],
    guidance:
      "The lead bowling pin from Stage 3 — the desperate segment, concrete profile, segmentation dimension, and credible adjacent pins. Cite unmet goals from Stage 5 if they sharpen the picture.",
  },
  {
    key: "competition",
    title: "Competition",
    wordTarget: 140,
    sourceStages: [5],
    guidance:
      "What target customers actually use today (Stage 5 prior_solutions). Honest about real alternatives, including spreadsheets, manual workarounds, point tools, and any direct startup competitors. Why each falls short. Demonstrates the team has surveyed the field.",
  },
  {
    key: "business_model",
    title: "Business Model",
    wordTarget: 110,
    sourceStages: [4],
    guidance:
      "How the company charges and distributes (Stage 4). Charges from day one unless intrinsically advertising-funded. Note the disruptive angle when it is real (simpler/cheaper/more convenient — not 'better, faster, cheaper').",
  },
  {
    key: "traction",
    title: "Traction & PMF Evidence",
    wordTarget: 160,
    sourceStages: [6, 7],
    guidance:
      "Behavioral evidence. Reach-across-the-table reactions from Stage 6. Stage 7 metrics: organic growth or sales yield, retention, word of mouth. The surprise the team is now doubling down on. Concrete numbers wherever possible — no NPS, no intent surveys.",
  },
  {
    key: "key_risks",
    title: "Key Risks",
    wordTarget: 240,
    sourceStages: [4, 6, 7],
    guidance:
      "Three to five honest risks, each as a sub-paragraph (use bold or '—' to separate). Typical categories: competition/defensibility, revenue-model uncertainty, scalability, balancing growth, exit comparables. Use the three-category 'no' diagnosis from Stage 6 to surface the risks the team has actually heard. Investors trust founders who name their risks plainly.",
  },
  {
    key: "team_hiring",
    title: "Team & Hiring Plan",
    wordTarget: 150,
    sourceStages: [1],
    guidance:
      "Founder backgrounds — why this team is uniquely positioned to see this insight (use Stage 1 authenticity). Then the hiring plan: roles needed in the next 6–12 months (CEO if missing, VP Sales, VP Eng, key engineers).",
  },
  {
    key: "recommendation",
    title: "Recommendation",
    wordTarget: 140,
    sourceStages: [1, 7],
    guidance:
      "Closing conviction. Why this team + this insight + this moment add up. Pull from Stage 1 (unique insight, authenticity) and Stage 7 (the surprise). One paragraph, founder's own voice, no hedging.",
  },
];

export interface MemoContent {
  sections: Record<string, string>;
  meta: {
    company_name: string;
    one_liner: string;
    generated_at: string;
    /** Optional: shown in the "From:" line of the header block. */
    from?: string;
  };
}
