import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const bodySchema = z.object({
  memoId: z.string().uuid(),
  action: z.enum(["toggle_public", "rotate_token"]),
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
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const { memoId, action } = parsed.data;

  // Verify ownership via the project.
  const { data: memo } = await supabase
    .from("memos")
    .select("id, is_public, share_token, project_id, projects!inner(user_id)")
    .eq("id", memoId)
    .single();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ownerId = (memo as any)?.projects?.user_id;
  if (!memo || ownerId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (action === "toggle_public") {
    const { data, error } = await supabase
      .from("memos")
      .update({ is_public: !memo.is_public })
      .eq("id", memoId)
      .select("is_public, share_token")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ memo: data });
  }

  if (action === "rotate_token") {
    const { data, error } = await supabase
      .from("memos")
      .update({ share_token: crypto.randomUUID() })
      .eq("id", memoId)
      .select("is_public, share_token")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ memo: data });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
