import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { gradeStage } from "@/lib/grading";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import type { RubricResult } from "@/lib/rubrics";

const authedBodySchema = z.object({
  projectId: z.string().uuid(),
  stageNumber: z.number().int().min(1).max(9),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  responses: z.any(),
});

const guestBodySchema = z.object({
  stageNumber: z.number().int().min(1).max(9),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  responses: z.any(),
  /** Last feedback (kept by client) so the grader can see iteration context. */
  priorFeedback: z
    .object({
      passed: z.boolean(),
      criteria: z.array(z.any()),
      overall_feedback: z.string(),
      suggested_revisions: z.array(z.string()),
    })
    .optional(),
});

const IMAGE_MIME = new Set(["image/png", "image/jpeg", "image/gif", "image/webp"]);

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);

  // Branch: guest mode (no projectId) vs authed (with projectId).
  if (json && typeof json === "object" && !("projectId" in json)) {
    return handleGuest(request, json);
  }

  return handleAuthed(request, json);
}

async function handleGuest(request: Request, json: unknown) {
  const parsed = guestBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", issues: parsed.error.format() },
      { status: 400 }
    );
  }

  // Rate-limit guests to keep API costs sane. Per-IP, sliding hour.
  const ip = getClientIp(request);
  const limit = checkRateLimit({
    key: `grade:${ip}`,
    max: 25,
    windowMs: 60 * 60 * 1000,
  });
  if (!limit.allowed) {
    return NextResponse.json(
      {
        error:
          "You've hit the demo's hourly limit. Sign in to keep going — signed-in usage isn't capped.",
      },
      { status: 429 }
    );
  }

  const { stageNumber, responses, priorFeedback } = parsed.data;

  let result: RubricResult;
  try {
    result = await gradeStage({
      stageNumber,
      responses,
      priorFeedback,
      // No evidence in guest mode (no Supabase Storage available).
      evidence: [],
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Grading failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  return NextResponse.json({ result, guest: true });
}

async function handleAuthed(_request: Request, json: unknown) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const parsed = authedBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", issues: parsed.error.format() },
      { status: 400 }
    );
  }
  const { projectId, stageNumber, responses } = parsed.data;

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

  // Note: stages are not gated — the user can submit any stage in any order.
  // We still encourage the natural sequence via UI, but never block.

  const { data: existing } = await supabase
    .from("stages")
    .select("last_feedback, attempts")
    .eq("project_id", projectId)
    .eq("stage_number", stageNumber)
    .maybeSingle();

  const priorFeedback = (existing?.last_feedback as RubricResult | null) ?? undefined;

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

  if (result.passed && stageNumber < 9) {
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
