import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_KINDS = new Set(["image", "pdf", "audio", "note"]);
const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const projectId = formData.get("projectId");
  const stageNumber = Number(formData.get("stageNumber"));
  const kind = formData.get("kind");
  const caption = (formData.get("caption") ?? "").toString();
  const tag = (formData.get("tag") ?? "").toString();
  const body = (formData.get("body") ?? "").toString();
  const file = formData.get("file");

  if (
    typeof projectId !== "string" ||
    !Number.isInteger(stageNumber) ||
    stageNumber < 1 ||
    stageNumber > 7 ||
    typeof kind !== "string" ||
    !ALLOWED_KINDS.has(kind)
  ) {
    return NextResponse.json({ error: "Missing or invalid fields" }, { status: 400 });
  }

  // Ownership check.
  const { data: project } = await supabase
    .from("projects")
    .select("user_id")
    .eq("id", projectId)
    .single();
  if (!project || project.user_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let storagePath: string | null = null;
  if (kind !== "note") {
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }
    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json({ error: "File too large (10 MB max)" }, { status: 413 });
    }
    const ext = file.name.split(".").pop() || "bin";
    storagePath = `${user.id}/${projectId}/${stageNumber}/${crypto.randomUUID()}.${ext}`;
    const arrayBuffer = await file.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from("evidence")
      .upload(storagePath, new Uint8Array(arrayBuffer), {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });
    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }
  }

  const { data: row, error: insertError } = await supabase
    .from("evidence")
    .insert({
      project_id: projectId,
      stage_number: stageNumber,
      kind,
      storage_path: storagePath,
      caption: caption || null,
      tag: tag || null,
      body: kind === "note" ? body : null,
    })
    .select()
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ evidence: row });
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  // RLS will block cross-user deletes; also clean up storage if a file exists.
  const { data: row } = await supabase
    .from("evidence")
    .select("storage_path")
    .eq("id", id)
    .single();
  if (row?.storage_path) {
    await supabase.storage.from("evidence").remove([row.storage_path]);
  }
  const { error } = await supabase.from("evidence").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
