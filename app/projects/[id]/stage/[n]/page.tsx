import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getRubric } from "@/lib/rubrics";
import { AuthedStageFormWrapper } from "@/components/AuthedStageFormWrapper";
import { EvidencePanel, type EvidenceItem } from "@/components/EvidencePanel";
import { CoachingChat } from "@/components/CoachingChat";
import { StageStepper } from "@/components/StageStepper";
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

  // All stages for the stepper at the top.
  const { data: allStagesRaw } = await supabase
    .from("stages")
    .select("stage_number, status")
    .eq("project_id", id);
  const allStages = (allStagesRaw ?? []) as Array<{
    stage_number: number;
    status: "locked" | "in_progress" | "passed";
  }>;

  const evidence = (evidenceRows ?? []) as EvidenceItem[];
  const chatMessages =
    (chatRow?.messages as Array<{ role: "user" | "assistant"; content: string }>) ?? [];

  return (
    <main className="relative mx-auto min-h-screen max-w-5xl px-6 py-10 md:px-12">
      <header className="relative mb-8">
        <div className="mb-3 flex items-center gap-4 font-mono text-xs uppercase tracking-widest text-neon-cyan/80">
          <div className="h-2 w-2 animate-pulse bg-neon-cyan" />
          <Link href={`/projects/${id}`} className="hover:text-neon-cyan">
            ← {project.name}
          </Link>
          <div className="hud-line-decorator h-px flex-1 opacity-50" />
        </div>
        <div className="relative">
          <div className="absolute -left-8 top-0 bottom-0 w-[2px] bg-gradient-to-b from-neon-cyan/0 via-neon-cyan to-neon-cyan/0" />
          <h2 className="mb-1 font-mono text-sm uppercase tracking-widest text-neon-cyan/70">
            Stage {stageNumber} of 7
          </h2>
          <h1 className="font-serif text-4xl italic text-white text-glow-white md:text-5xl">
            {rubric.title}
          </h1>
        </div>
        <p className="mt-3 max-w-2xl font-mono text-sm leading-relaxed text-white/70">
          {rubric.blurb}
        </p>
      </header>

      <div className="mb-10">
        <StageStepper
          stages={allStages}
          currentStage={stageNumber}
          hrefForStage={(n) => `/projects/${id}/stage/${n}`}
        />
      </div>

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
