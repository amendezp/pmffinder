import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getRubric } from "@/lib/rubrics";
import { AuthedStageFormWrapper } from "@/components/AuthedStageFormWrapper";
import { EvidencePanel, type EvidenceItem } from "@/components/EvidencePanel";
import { CoachingChat } from "@/components/CoachingChat";
import type { RubricResult } from "@/lib/rubrics";

export default async function StagePage({
  params,
}: {
  params: Promise<{ id: string; n: string }>;
}) {
  const { id, n } = await params;
  const stageNumber = Number(n);
  if (!Number.isInteger(stageNumber) || stageNumber < 1 || stageNumber > 7) notFound();

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

  // Enforce gating: all prior stages must be passed.
  if (stageNumber > 1) {
    const { data: priors } = await supabase
      .from("stages")
      .select("stage_number, status")
      .eq("project_id", id)
      .lt("stage_number", stageNumber);
    const passed = (priors ?? []).filter((s) => s.status === "passed").length;
    if (passed < stageNumber - 1) {
      redirect(`/projects/${id}`);
    }
  }

  const rubric = getRubric(stageNumber);

  const { data: stageRow } = await supabase
    .from("stages")
    .select("status, responses, last_feedback")
    .eq("project_id", id)
    .eq("stage_number", stageNumber)
    .maybeSingle();

  const { data: evidenceRows } = await supabase
    .from("evidence")
    .select("id, kind, caption, tag, body, storage_path")
    .eq("project_id", id)
    .eq("stage_number", stageNumber)
    .order("created_at", { ascending: false });

  const { data: chatRow } = await supabase
    .from("stage_chats")
    .select("messages")
    .eq("project_id", id)
    .eq("stage_number", stageNumber)
    .maybeSingle();

  const evidence = (evidenceRows ?? []) as EvidenceItem[];
  const chatMessages =
    (chatRow?.messages as Array<{ role: "user" | "assistant"; content: string }>) ?? [];

  return (
    <main className="relative mx-auto max-w-5xl px-6 py-10 md:px-12">
      <header className="mb-10">
        <div className="mb-3 flex items-center gap-4 text-[10px] uppercase tracking-widest text-zen-light">
          <Link href={`/projects/${id}`} className="hover:text-zen-text">
            ← Back to journey
          </Link>
          <div className="h-px w-8 bg-zen-line" />
          <span>
            Stage {`0${stageNumber}`.slice(-2)} / 07
          </span>
        </div>
        <h1 className="font-serif text-4xl font-light tracking-wide text-zen-text md:text-5xl">
          {rubric.title}
        </h1>
        <p className="mt-2 max-w-2xl text-base font-light leading-relaxed text-zen-accent">
          {rubric.blurb}
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)]">
        <section>
          <AuthedStageFormWrapper
            projectId={id}
            rubric={rubric}
            initialResponses={(stageRow?.responses as Record<string, unknown>) ?? {}}
            initialFeedback={(stageRow?.last_feedback as RubricResult | null) ?? null}
            alreadyPassed={stageRow?.status === "passed"}
          />
        </section>

        <aside>
          <EvidencePanel projectId={id} stageNumber={stageNumber} items={evidence} />
        </aside>
      </div>

      <CoachingChat
        projectId={id}
        stageNumber={stageNumber}
        initialMessages={chatMessages}
      />
    </main>
  );
}
