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
 * relevant rubric fields. Hard-codes which rubric fields feed which memo
 * section, mapped to the new top-level investor-memo structure.
 */
export function buildDraftMemo(args: {
  stageResponses: Record<number, unknown>;
  stagePassed: Record<number, boolean>;
  companyName: string;
  oneLiner?: string;
  from?: string;
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

  const drafters: Record<string, () => string> = {
    introduction: () => {
      const what = str(stages[2].responses.what);
      const benefit = str(stages[2].responses.single_primary_benefit);
      const insight = str(stages[1].responses.insight);
      const inflection = str(stages[1].responses.inflection_point);
      const who = str(stages[3].responses.who);

      const parts: string[] = [];
      if (benefit && what) {
        parts.push(`${benefit} ${what}`);
      } else if (what) {
        parts.push(what);
      } else if (benefit) {
        parts.push(benefit);
      }
      if (insight) parts.push(`The non-consensus thesis: ${insight}`);
      if (inflection) parts.push(`Why now: ${inflection}`);
      if (who) parts.push(`Initial market: ${who}`);
      return parts.join("\n\n");
    },

    // Founder-provided at polish time. Empty in draft mode.
    the_deal: () => "",

    market_customer: () => {
      const who = str(stages[3].responses.who);
      const seg = str(stages[3].responses.who_segmentation);
      const desp = str(stages[3].responses.who_desperation_evidence);
      const adj = str(stages[3].responses.adjacent_markets);
      const unmet = str(stages[5].responses.unmet_goals);
      const parts: string[] = [];
      if (who) parts.push(who);
      if (seg) parts.push(`Defined by: ${seg}`);
      if (unmet) parts.push(`What they can't currently do: ${unmet}`);
      if (desp) parts.push(`Why they're desperate: ${desp}`);
      if (adj) parts.push(`Adjacent pins: ${adj}`);
      return parts.join("\n\n");
    },

    competition: () => {
      const prior = str(stages[5].responses.prior_solutions);
      const quotes = str(stages[5].responses.prospect_quotes);
      const parts: string[] = [];
      if (prior) {
        parts.push(`Target customers cobble together: ${prior}`);
      }
      if (quotes) {
        parts.push(`Direct from prospects: ${quotes}`);
      }
      if (parts.length > 0) {
        parts.push(
          "These alternatives fall short because none addresses the unique insight driving this approach."
        );
      }
      return parts.join("\n\n");
    },

    business_model: () => {
      const details = str(stages[4].responses.how_business_model_details);
      const model = str(stages[4].responses.how_business_model);
      const disruptive = str(stages[4].responses.disruptive_angle);
      const parts: string[] = [];
      if (model && details) {
        const m = model.charAt(0).toUpperCase() + model.slice(1);
        parts.push(`${m}-based. ${details}`);
      } else if (details) {
        parts.push(details);
      } else if (model) {
        parts.push(`${model.charAt(0).toUpperCase() + model.slice(1)}-based model.`);
      }
      if (disruptive) parts.push(`Disruptive angle: ${disruptive}`);
      return parts.join("\n\n");
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
      if (reach && !summary) parts.push(`Early reactions: ${reach}`);
      if (surprise) {
        parts.push(`The surprise we're doubling down on: ${surprise}`);
      }
      return parts.join("\n\n");
    },

    key_risks: () => {
      const noDiagnosis = str(stages[6].responses.no_diagnosis);
      const noDiagnosisEvidence = str(
        stages[6].responses.no_diagnosis_evidence
      );
      const wom = str(stages[7].responses.word_of_mouth_evidence);
      const disruptive = str(stages[4].responses.disruptive_angle);
      const model = str(stages[4].responses.how_business_model);
      const risks: string[] = [];

      // Validation-based risk (Stage 6 no_diagnosis)
      const diagLabel: Record<string, string> = {
        who_wrong: "Targeting the wrong Who",
        implementation_wrong: "Implementation may need work",
        inflection_not_legible: "Inflection isn't yet legible to buyers",
        other: "Mixed signal from non-buyers",
      };
      if (noDiagnosis && noDiagnosisEvidence) {
        const label = diagLabel[noDiagnosis] ?? "Validation feedback";
        risks.push(`**${label}.** ${noDiagnosisEvidence}`);
      }

      // Competition / defensibility
      if (disruptive) {
        risks.push(
          `**Competition / defensibility.** Our disruption is uneconomic for incumbents to copy in their existing cost structure. If they do compete, our model still holds — but we need to entrench inside the lead pin before they react.`
        );
      } else {
        risks.push(
          `**Competition / defensibility.** We need to establish defensibility before fast followers arrive. Speed and a clean cost structure will determine whether we open a real gap in the next 12 months.`
        );
      }

      // Revenue model risk
      if (model && model !== "advertising") {
        risks.push(
          `**Revenue model.** We charge from day one (${model}-based), but the willingness-to-pay curve is under-validated at scale. The first 60–90 days post-MVP will test pricing assumptions; we'll iterate fast if early customers churn at the proposed price.`
        );
      } else if (model === "advertising") {
        risks.push(
          `**Revenue model.** Advertising depends on reaching scale before monetization kicks in. We need to balance burn against the user growth required to start booking ad revenue.`
        );
      }

      // Scalability / growth balance
      if (!wom) {
        risks.push(
          `**Balancing growth.** Without proven unprompted word-of-mouth yet, we cannot safely accelerate paid acquisition. Holding back on growth spend until we see organic compounding.`
        );
      }

      return risks.length > 0 ? risks.join("\n\n") : "";
    },

    team_hiring: () => {
      const authenticity = str(stages[1].responses.authenticity);
      if (!authenticity) return "";
      return `Founder background: ${authenticity}\n\n_Key hires to fill in next 6–12 months: add at memo generation (CEO if missing, VP Sales, VP Eng, founding engineers)._`;
    },

    recommendation: () => {
      const insight = str(stages[1].responses.insight);
      const surprise = str(stages[7].responses.surprise_double_down);
      const authenticity = str(stages[1].responses.authenticity);
      const parts: string[] = [];
      if (insight) parts.push(`What we believe: ${insight}`);
      if (authenticity) parts.push(`Why us: ${authenticity}`);
      if (surprise) parts.push(`Where the signal is: ${surprise}`);
      if (parts.length === 0) return "";
      parts.push(
        "On the basis of the above, we are the right team to chase this insight at this moment."
      );
      return parts.join("\n\n");
    },
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
        from: args.from,
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
