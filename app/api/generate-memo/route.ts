import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { synthesizeMemo } from "@/lib/memo/synthesizer";

const bodySchema = z.object({
  projectId: z.string().uuid(),
  companyName: z.string().min(1).max(120),
  oneLiner: z.string().min(1).max(280),
  team: z.string().max(2000).optional().default(""),
  ask: z.string().max(2000).optional().default(""),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", issues: parsed.error.format() },
      { status: 400 }
    );
  }
  const { projectId, companyName, oneLiner, team, ask } = parsed.data;

  // Ownership.
  const { data: project } = await supabase
    .from("projects")
    .select("user_id")
    .eq("id", projectId)
    .single();
  if (!project || project.user_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Gating: memo requires Stage 9 (Decision Tree) passed.
  const { data: finalStage } = await supabase
    .from("stages")
    .select("status, responses")
    .eq("project_id", projectId)
    .eq("stage_number", 9)
    .maybeSingle();
  if (!finalStage || finalStage.status !== "passed") {
    return NextResponse.json(
      { error: "Stage 9 (Decision Tree) must be passed before generating a memo" },
      { status: 409 }
    );
  }

  // Gather all stage responses.
  const { data: stages } = await supabase
    .from("stages")
    .select("stage_number, responses")
    .eq("project_id", projectId)
    .order("stage_number");
  const stageResponses: Record<number, unknown> = {};
  for (const s of stages ?? []) {
    stageResponses[s.stage_number] = s.responses;
  }

  let content;
  try {
    content = await synthesizeMemo({
      companyName,
      oneLiner,
      team,
      ask,
      stageResponses,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Synthesis failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  const { data: memo, error: insertError } = await supabase
    .from("memos")
    .insert({ project_id: projectId, content })
    .select("id, share_token, is_public, generated_at")
    .single();
  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ memo, content });
}
