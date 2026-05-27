import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getRubric } from "@/lib/rubrics";
import { StageForm } from "@/components/StageForm";
import { EvidencePanel, type EvidenceItem } from "@/components/EvidencePanel";
import { CoachingChat } from "@/components/CoachingChat";

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
    <main className="relative mx-auto max-w-5xl px-6 py-10">
      <header className="mb-6">
        <Link
          href={`/projects/${id}`}
          className="text-xs text-ink-700/80 underline-offset-4 hover:underline"
        >
          ← Back to journey
        </Link>
        <div className="mt-1 flex items-baseline gap-3">
          <span className="rounded-full bg-compass-rose px-3 py-0.5 font-serif text-sm text-parchment-50">
            Stage {stageNumber}
          </span>
          <h1 className="font-display text-3xl text-ink-900">{rubric.title}</h1>
        </div>
        <p className="mt-2 max-w-2xl text-ink-700">{rubric.blurb}</p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)]">
        <section>
          <StageForm
            projectId={id}
            rubric={rubric}
            initialResponses={(stageRow?.responses as Record<string, unknown>) ?? {}}
            initialFeedback={
              (stageRow?.last_feedback as Parameters<typeof StageForm>[0]["initialFeedback"]) ??
              null
            }
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
