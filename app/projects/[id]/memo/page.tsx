import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MemoTemplate } from "@/components/MemoTemplate";
import { ShareMemoDialog } from "@/components/ShareMemoDialog";
import { MemoBuilderForm, PrintButton } from "./client";
import type { MemoContent } from "@/lib/memo/template";

export default async function MemoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: project } = await supabase
    .from("projects")
    .select("id, name, user_id")
    .eq("id", id)
    .single();
  if (!project || project.user_id !== user.id) notFound();

  // Check stage 7.
  const { data: stage7 } = await supabase
    .from("stages")
    .select("status")
    .eq("project_id", id)
    .eq("stage_number", 7)
    .maybeSingle();
  const stage7Passed = stage7?.status === "passed";

  // Latest memo.
  const { data: memo } = await supabase
    .from("memos")
    .select("id, content, generated_at, share_token, is_public, view_count")
    .eq("project_id", id)
    .order("generated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (!stage7Passed && !memo) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-16 text-center">
        <Link href={`/projects/${id}`} className="text-xs text-ink-700/80 underline">
          ← Back to journey
        </Link>
        <h1 className="mt-4 font-display text-3xl text-ink-900">Memo not unlocked yet</h1>
        <p className="mt-2 text-ink-700">
          Finish Stage 7 (Decision Tree) — that's the final gate before the memo.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3 no-print">
        <div>
          <Link
            href={`/projects/${id}`}
            className="text-xs text-ink-700/80 underline-offset-4 hover:underline"
          >
            ← Back to journey
          </Link>
          <h1 className="mt-1 font-display text-3xl text-ink-900">{project.name} — memo</h1>
        </div>
        <div className="flex items-center gap-2">
          {memo && <PrintButton />}
        </div>
      </header>

      {!memo ? (
        <MemoBuilderForm projectId={id} defaultName={project.name} />
      ) : (
        <>
          <MemoTemplate
            content={memo.content as MemoContent}
            projectName={project.name}
          />
          <div className="mt-6">
            <ShareMemoDialog
              memoId={memo.id}
              isPublic={memo.is_public}
              shareToken={memo.share_token}
              viewCount={memo.view_count}
              appUrl={appUrl}
            />
          </div>
          <div className="mt-6 no-print">
            <MemoBuilderForm
              projectId={id}
              defaultName={project.name}
              regenerate
            />
          </div>
        </>
      )}
    </main>
  );
}
