import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MemoTemplate } from "@/components/MemoTemplate";
import { ShareMemoDialog } from "@/components/ShareMemoDialog";
import { MemoControls, PolishedOrDraft } from "./client";
import { buildDraftMemo } from "@/lib/memo/draftFromStages";
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

  // All stages.
  const { data: stages } = await supabase
    .from("stages")
    .select("stage_number, status, responses")
    .eq("project_id", id);

  const stageResponses: Record<number, unknown> = {};
  const stagePassed: Record<number, boolean> = {};
  for (const s of stages ?? []) {
    stageResponses[s.stage_number] = s.responses;
    stagePassed[s.stage_number] = s.status === "passed";
  }

  // Latest polished memo (if any).
  const { data: memo } = await supabase
    .from("memos")
    .select("id, content, generated_at, share_token, is_public, view_count")
    .eq("project_id", id)
    .order("generated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const draft = buildDraftMemo({
    stageResponses,
    stagePassed,
    companyName: project.name,
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const hasPolished = !!memo;

  return (
    <main className="relative mx-auto min-h-screen max-w-5xl px-6 py-10 md:px-12">
      <header className="relative mb-6 no-print">
        <div className="mb-3 flex items-center gap-4 font-mono text-xs uppercase tracking-widest text-neon-cyan/80">
          <div className="h-2 w-2 animate-pulse bg-neon-cyan" />
          <Link href={`/projects/${id}`} className="hover:text-neon-cyan">
            ← {project.name}
          </Link>
          <div className="hud-line-decorator h-px flex-1 opacity-50" />
          <span className="text-white/70">
            Memo · {draft.counts.drafted}/{draft.counts.total} drafted
          </span>
        </div>
        <div className="relative">
          <div className="absolute -left-8 top-0 bottom-0 w-[2px] bg-gradient-to-b from-neon-cyan/0 via-neon-cyan to-neon-cyan/0" />
          <h2 className="mb-1 font-mono text-sm uppercase tracking-widest text-neon-cyan/70">
            Your investment memo
          </h2>
          <h1 className="font-serif text-4xl italic text-white text-glow-white md:text-5xl">
            {project.name}
          </h1>
        </div>
      </header>

      <MemoControls
        projectId={id}
        defaultName={project.name}
        hasPolished={hasPolished}
        polishedGeneratedAt={memo?.generated_at ?? null}
        draftedCount={draft.counts.drafted}
        totalCount={draft.counts.total}
      />

      {hasPolished ? (
        <PolishedOrDraft
          polishedContent={memo!.content as MemoContent}
          draftContent={draft.content}
          draftStatuses={draft.sectionStatuses}
          projectName={project.name}
        />
      ) : (
        <MemoTemplate
          content={draft.content}
          projectName={project.name}
          sectionStatuses={draft.sectionStatuses}
        />
      )}

      {hasPolished && (
        <div className="mt-6 no-print">
          <ShareMemoDialog
            memoId={memo!.id}
            isPublic={memo!.is_public}
            shareToken={memo!.share_token}
            viewCount={memo!.view_count}
            appUrl={appUrl}
          />
        </div>
      )}
    </main>
  );
}
