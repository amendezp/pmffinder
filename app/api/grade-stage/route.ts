import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { gradeStage } from "@/lib/grading";
import type { RubricResult } from "@/lib/rubrics";

const bodySchema = z.object({
  projectId: z.string().uuid(),
  stageNumber: z.number().int().min(1).max(7),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  responses: z.any(),
});

const IMAGE_MIME = new Set(["image/png", "image/jpeg", "image/gif", "image/webp"]);

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
  const { projectId, stageNumber, responses } = parsed.data;

  // Verify the user owns the project. RLS would block anyway, but be explicit.
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id, user_id")
    .eq("id", projectId)
    .single();
  if (projectError || !project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }
  if (project.user_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Server-side gating: all prior stages must be passed before this one can be graded.
  if (stageNumber > 1) {
    const { data: priors } = await supabase
      .from("stages")
      .select("stage_number, status")
      .eq("project_id", projectId)
      .lt("stage_number", stageNumber);
    const allPassed = (priors ?? []).filter((s) => s.status === "passed").length;
    if (allPassed < stageNumber - 1) {
      return NextResponse.json(
        { error: "Earlier stages must pass before grading this one" },
        { status: 409 }
      );
    }
  }

  // Fetch existing stage row (for prior feedback context).
  const { data: existing } = await supabase
    .from("stages")
    .select("last_feedback, attempts")
    .eq("project_id", projectId)
    .eq("stage_number", stageNumber)
    .maybeSingle();

  const priorFeedback = (existing?.last_feedback as RubricResult | null) ?? undefined;

  // Fetch evidence for this stage. Image attachments are fetched as base64 for
  // inclusion in the Claude message.
  const { data: evidenceRows } = await supabase
    .from("evidence")
    .select("id, kind, caption, tag, body, storage_path")
    .eq("project_id", projectId)
    .eq("stage_number", stageNumber);

  const evidence = await Promise.all(
    (evidenceRows ?? []).map(async (e) => {
      if (e.kind === "image" && e.storage_path) {
        const { data: file } = await supabase.storage
          .from("evidence")
          .download(e.storage_path);
        if (!file) return null;
        const buffer = Buffer.from(await file.arrayBuffer());
        const mediaType = (file.type && IMAGE_MIME.has(file.type)
          ? file.type
          : "image/png") as "image/png" | "image/jpeg" | "image/gif" | "image/webp";
        return {
          kind: "image" as const,
          caption: e.caption,
          tag: e.tag,
          imageData: { base64: buffer.toString("base64"), mediaType },
        };
      }
      if (e.kind === "note") {
        return {
          kind: "note" as const,
          caption: e.caption,
          tag: e.tag,
          body: e.body,
        };
      }
      // PDFs/audio: skip for now; could be transcribed/extracted later.
      return null;
    })
  );

  let result: RubricResult;
  try {
    result = await gradeStage({
      stageNumber,
      responses,
      priorFeedback,
      evidence: evidence.filter(Boolean) as Parameters<typeof gradeStage>[0]["evidence"],
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Grading failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  // Persist stage state. Upsert so it works whether the row exists or not.
  const status = result.passed ? "passed" : "in_progress";
  const { error: upsertError } = await supabase.from("stages").upsert(
    {
      project_id: projectId,
      stage_number: stageNumber,
      status,
      responses,
      last_feedback: result,
      attempts: (existing?.attempts ?? 0) + 1,
      passed_at: result.passed ? new Date().toISOString() : null,
    },
    { onConflict: "project_id,stage_number" }
  );
  if (upsertError) {
    return NextResponse.json({ error: upsertError.message }, { status: 500 });
  }

  // If passed, unlock the next stage (create an in_progress row if absent).
  if (result.passed && stageNumber < 7) {
    const next = stageNumber + 1;
    const { data: nextStage } = await supabase
      .from("stages")
      .select("status")
      .eq("project_id", projectId)
      .eq("stage_number", next)
      .maybeSingle();
    if (!nextStage) {
      await supabase.from("stages").insert({
        project_id: projectId,
        stage_number: next,
        status: "in_progress",
      });
    } else if (nextStage.status === "locked") {
      await supabase
        .from("stages")
        .update({ status: "in_progress" })
        .eq("project_id", projectId)
        .eq("stage_number", next);
    }
  }

  return NextResponse.json({ result });
}
