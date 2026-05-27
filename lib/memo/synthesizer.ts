import type { Tool } from "@anthropic-ai/sdk/resources/messages";
import { anthropic, MODELS, requireApiKey } from "@/lib/anthropic";
import { MEMO_SECTIONS, type MemoContent } from "./template";

interface SynthesizeArgs {
  companyName: string;
  oneLiner: string;
  team: string;
  ask: string;
  /** Stage responses keyed by stage number. */
  stageResponses: Record<number, unknown>;
}

function memoTool(): Tool {
  return {
    name: "emit_memo",
    description:
      "Emit the synthesized 2-pager memo content. Call exactly once at the end.",
    input_schema: {
      type: "object",
      properties: {
        sections: {
          type: "object",
          description:
            "Map of section key to prose. One entry per section in the template.",
          properties: Object.fromEntries(
            MEMO_SECTIONS.map((s) => [
              s.key,
              {
                type: "string",
                description: `${s.title} — target ~${s.wordTarget} words. ${s.guidance}`,
              },
            ])
          ),
          required: MEMO_SECTIONS.map((s) => s.key),
        },
      },
      required: ["sections"],
    },
  };
}

export async function synthesizeMemo(args: SynthesizeArgs): Promise<MemoContent> {
  requireApiKey();

  const stagesText = Object.entries(args.stageResponses)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([n, resp]) => `### Stage ${n}\n${JSON.stringify(resp, null, 2)}`)
    .join("\n\n");

  const sectionsList = MEMO_SECTIONS.map(
    (s) =>
      `- **${s.title}** (~${s.wordTarget} words) — sources: stages ${s.sourceStages.join(",") || "founder input"}. ${s.guidance}`
  ).join("\n");

  const message = await anthropic.messages.create({
    model: MODELS.memo,
    max_tokens: 4000,
    system: [
      {
        type: "text",
        text:
          `You are writing a Sequoia-style 2-pager memo for a startup that has gone through a rigorous Product/Market Fit process. ` +
          `Tight, declarative, evidence-led prose. No hype, no buzzwords, no marketing-speak. Each section is short — this is a 2-pager. ` +
          `Concrete details from the founder's stage responses; quote customer language when it strengthens the case. Do not invent ` +
          `metrics, customers, or quotes that aren't in the source material. If a section has thin evidence, write it short and honest, ` +
          `not padded.\n\n## Sections (in order)\n${sectionsList}\n\n` +
          `Use the emit_memo tool to deliver the structured result.`,
        cache_control: { type: "ephemeral" },
      },
    ],
    tools: [memoTool()],
    tool_choice: { type: "tool", name: "emit_memo" },
    messages: [
      {
        role: "user",
        content:
          `# ${args.companyName}\n` +
          `One-liner (founder-provided): ${args.oneLiner}\n` +
          `Team: ${args.team || "(not provided)"}\n` +
          `The ask: ${args.ask || "(not provided)"}\n\n` +
          `## Stage responses\n\n${stagesText}`,
      },
    ],
  });

  const toolBlock = message.content.find(
    (b) => b.type === "tool_use" && b.name === "emit_memo"
  );
  if (!toolBlock || toolBlock.type !== "tool_use") {
    throw new Error(
      "Synthesizer did not return a structured memo: " + JSON.stringify(message.content)
    );
  }

  const sections = (toolBlock.input as { sections: Record<string, string> }).sections;
  return {
    sections,
    meta: {
      company_name: args.companyName,
      one_liner: args.oneLiner,
      generated_at: new Date().toISOString(),
    },
  };
}
