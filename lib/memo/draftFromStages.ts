import { MEMO_SECTIONS, type MemoContent } from "./template";

export type SectionStatus = "pending" | "draft" | "ready";

export interface DraftMemoResult {
  content: MemoContent;
  sectionStatuses: Record<string, SectionStatus>;
  counts: {
    ready: number;
    draft: number;
    pending: number;
    /** ready + draft */
    drafted: number;
    total: number;
  };
}

interface StageInfo {
  responses: Record<string, unknown>;
  passed: boolean;
  hasContent: boolean;
}

function str(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.trim();
}

/**
 * Pure: turn raw stage responses into a draft `MemoContent` plus a per-section
 * status map. No LLM call — each section assembles short prose from the
 * relevant rubric fields. Sections whose source stages are empty fall back to
 * `pending`.
 *
 * Hard-codes which rubric fields feed which memo section. Keep this explicit;
 * it's the auditable bridge between the stage schemas and the memo template.
 */
export function buildDraftMemo(args: {
  stageResponses: Record<number, unknown>;
  stagePassed: Record<number, boolean>;
  companyName: string;
  oneLiner?: string;
}): DraftMemoResult {
  const stages: Record<number, StageInfo> = {};
  for (let i = 1; i <= 7; i++) {
    const raw = (args.stageResponses[i] ?? {}) as Record<string, unknown>;
    stages[i] = {
      responses: raw,
      passed: !!args.stagePassed[i],
      hasContent: Object.values(raw).some(
        (v) => typeof v === "string" && v.trim().length > 0
      ),
    };
  }

  // Drafters: each builds a short paragraph for its section.
  const drafters: Record<string, () => string> = {
    company_purpose: () => {
      const benefit = str(stages[2].responses.single_primary_benefit);
      const what = str(stages[2].responses.what);
      if (benefit && what) return `${benefit}\n\n${what}`;
      return benefit || what;
    },

    problem: () => {
      const unmet = str(stages[5].responses.unmet_goals);
      const prior = str(stages[5].responses.prior_solutions);
      const insight = str(stages[1].responses.insight);
      const parts: string[] = [];
      if (unmet) parts.push(unmet);
      if (prior) parts.push(`What they've tried: ${prior}`);
      if (!unmet && !prior && insight) parts.push(insight);
      return parts.join("\n\n");
    },

    solution: () => {
      const what = str(stages[2].responses.what);
      const rooted = str(stages[2].responses.what_rooted_in_insight);
      const reach = str(stages[6].responses.reach_across_table);
      const parts: string[] = [];
      if (what) parts.push(what);
      if (rooted) parts.push(rooted);
      if (reach) parts.push(`How buyers respond: ${reach}`);
      return parts.join("\n\n");
    },

    why_now: () => {
      const inflection = str(stages[1].responses.inflection_point);
      const insight = str(stages[1].responses.insight);
      const parts: string[] = [];
      if (inflection) parts.push(inflection);
      if (insight) parts.push(`The non-consensus take: ${insight}`);
      return parts.join("\n\n");
    },

    market_customer: () => {
      const who = str(stages[3].responses.who);
      const seg = str(stages[3].responses.who_segmentation);
      const desp = str(stages[3].responses.who_desperation_evidence);
      const adj = str(stages[3].responses.adjacent_markets);
      const parts: string[] = [];
      if (who) parts.push(who);
      if (seg) parts.push(`Segmentation: ${seg}`);
      if (desp) parts.push(`Why they're desperate: ${desp}`);
      if (adj) parts.push(`Adjacent markets: ${adj}`);
      return parts.join("\n\n");
    },

    competition: () => {
      const prior = str(stages[5].responses.prior_solutions);
      if (!prior) return "";
      return `Today, target customers cobble together: ${prior}\n\nThese fall short because none address the unique insight driving this approach.`;
    },

    traction: () => {
      const summary = str(stages[7].responses.metric_summary);
      const businessType = str(stages[7].responses.business_type);
      const consumerGrowth = str(stages[7].responses.consumer_growth_data);
      const enterpriseYield = str(stages[7].responses.enterprise_sales_yield);
      const wom = str(stages[7].responses.word_of_mouth_evidence);
      const surprise = str(stages[7].responses.surprise_double_down);
      const reach = str(stages[6].responses.reach_across_table);
      const parts: string[] = [];
      if (summary) parts.push(summary);
      if (businessType === "consumer" && consumerGrowth) {
        parts.push(`Organic growth: ${consumerGrowth}`);
      }
      if (businessType === "enterprise" && enterpriseYield) {
        parts.push(`Sales yield: ${enterpriseYield}`);
      }
      if (wom) parts.push(`Word of mouth: ${wom}`);
      if (surprise) parts.push(`The surprise we're doubling down on: ${surprise}`);
      if (reach && parts.length === 0) parts.push(`Early reactions: ${reach}`);
      return parts.join("\n\n");
    },

    business_model: () => {
      const details = str(stages[4].responses.how_business_model_details);
      const model = str(stages[4].responses.how_business_model);
      const disruptive = str(stages[4].responses.disruptive_angle);
      const parts: string[] = [];
      if (model && details) {
        const m = model.charAt(0).toUpperCase() + model.slice(1);
        parts.push(`${m}-based.\n\n${details}`);
      } else if (details) {
        parts.push(details);
      }
      if (disruptive) parts.push(`Disruptive angle: ${disruptive}`);
      return parts.join("\n\n");
    },

    team_ask: () => "", // Founder fills this in at polish time.
  };

  const sections: Record<string, string> = {};
  const sectionStatuses: Record<string, SectionStatus> = {};
  let ready = 0;
  let draft = 0;
  let pending = 0;

  for (const section of MEMO_SECTIONS) {
    const drafter = drafters[section.key];
    const text = drafter ? drafter() : "";
    sections[section.key] = text;

    const sources = section.sourceStages;
    if (sources.length === 0) {
      // team_ask — pending until polish.
      sectionStatuses[section.key] = "pending";
      pending++;
      continue;
    }

    const anyHasContent = sources.some((n) => stages[n]?.hasContent);
    const allPassed = sources.every((n) => stages[n]?.passed);

    if (allPassed && text.length > 0) {
      sectionStatuses[section.key] = "ready";
      ready++;
    } else if (anyHasContent && text.length > 0) {
      sectionStatuses[section.key] = "draft";
      draft++;
    } else {
      sectionStatuses[section.key] = "pending";
      pending++;
    }
  }

  return {
    content: {
      sections,
      meta: {
        company_name: args.companyName,
        one_liner: args.oneLiner ?? "",
        generated_at: new Date().toISOString(),
      },
    },
    sectionStatuses,
    counts: {
      ready,
      draft,
      pending,
      drafted: ready + draft,
      total: MEMO_SECTIONS.length,
    },
  };
}
