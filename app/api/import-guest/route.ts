import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { RubricResult } from "@/lib/rubrics";

const bodySchema = z.object({
  projectName: z.string().min(1).max(120),
  stages: z.record(
    z.string(), // stage number as string key
    z.object({
      status: z.enum(["in_progress", "passed"]),
      responses: z.record(z.string(), z.unknown()),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      last_feedback: z.any().nullable().optional(),
      attempts: z.number().int().min(0).default(0),
    })
  ),
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
  const { projectName, stages } = parsed.data;

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .insert({ user_id: user.id, name: projectName })
    .select("id")
    .single();
  if (projectError || !project) {
    return NextResponse.json(
      { error: projectError?.message ?? "Failed to create project" },
      { status: 500 }
    );
  }

  // Bulk-insert stage rows.
  const rows = Object.entries(stages).map(([nStr, s]) => ({
    project_id: project.id,
    stage_number: Number(nStr),
    status: s.status,
    responses: s.responses,
    last_feedback: (s.last_feedback as RubricResult | null) ?? null,
    attempts: s.attempts,
    passed_at: s.status === "passed" ? new Date().toISOString() : null,
  }));

  if (rows.length > 0) {
    const { error: insertError } = await supabase.from("stages").insert(rows);
    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }
  }

  // Make sure stage 1 exists at minimum; otherwise unlock the next stage after
  // the last passed one so the user can continue.
  const passedNumbers = rows
    .filter((r) => r.status === "passed")
    .map((r) => r.stage_number);
  const maxPassed = passedNumbers.length ? Math.max(...passedNumbers) : 0;
  const nextToUnlock = maxPassed + 1;
  if (nextToUnlock >= 1 && nextToUnlock <= 8) {
    const existing = rows.find((r) => r.stage_number === nextToUnlock);
    if (!existing) {
      await supabase.from("stages").insert({
        project_id: project.id,
        stage_number: nextToUnlock,
        status: "in_progress",
      });
    }
  }

  return NextResponse.json({ projectId: project.id });
}
