import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Compass } from "@/components/Compass";
import { JourneyMap } from "@/components/JourneyMap";
import { createClient } from "@/lib/supabase/server";

export default async function ProjectPage({
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

  const { data: stagesRaw } = await supabase
    .from("stages")
    .select("stage_number, status")
    .eq("project_id", id);
  const stages = (stagesRaw ?? []) as Array<{
    stage_number: number;
    status: "locked" | "in_progress" | "passed";
  }>;

  // Active = first non-passed stage that isn't locked; default 1.
  let active = 1;
  const statusMap = new Map(stages.map((s) => [s.stage_number, s.status]));
  for (let i = 1; i <= 7; i++) {
    const st = statusMap.get(i);
    if (st !== "passed") {
      active = i;
      break;
    }
    if (i === 7 && st === "passed") active = 7;
  }
  const passedStages = new Set(
    stages.filter((s) => s.status === "passed").map((s) => s.stage_number)
  );

  const allPassed = passedStages.size === 7;

  // Latest memo (if any).
  const { data: memo } = await supabase
    .from("memos")
    .select("id, generated_at")
    .eq("project_id", id)
    .order("generated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href="/projects"
            className="text-xs text-ink-700/80 underline-offset-4 hover:underline"
          >
            ← All projects
          </Link>
          <h1 className="mt-1 font-display text-3xl text-ink-900">{project.name}</h1>
        </div>
        <div className="flex items-center gap-3">
          {allPassed && (
            <Link
              href={`/projects/${project.id}/memo`}
              className="rounded-md bg-brass-500 px-4 py-2 text-sm font-serif text-parchment-50 shadow-compass hover:bg-brass-500/90"
            >
              {memo ? "Open memo →" : "Generate memo →"}
            </Link>
          )}
        </div>
      </header>

      <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)]">
        <section>
          <h2 className="mb-3 font-serif text-xl text-ink-900">The journey</h2>
          <JourneyMap projectId={project.id} stages={stages} />
        </section>

        <aside className="flex justify-center lg:sticky lg:top-8">
          <Compass activeStage={active} passedStages={passedStages} />
        </aside>
      </div>
    </main>
  );
}
