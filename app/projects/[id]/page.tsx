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

  const { data: memo } = await supabase
    .from("memos")
    .select("id, generated_at")
    .eq("project_id", id)
    .order("generated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <main className="relative min-h-screen w-full overflow-hidden">
      <div className="absolute right-8 top-8 z-30 text-right text-[10px] uppercase tracking-widest text-zen-light no-print">
        <div className="mb-1">System // Analysis</div>
        <div className="text-zen-text">
          {passedStages.size} / 7 · Stage {active}
        </div>
      </div>

      <section className="relative z-10 mx-auto max-w-7xl px-8 py-12 md:px-16 md:pl-24">
        <header className="mb-12 flex items-center gap-4 text-[10px] uppercase tracking-widest text-zen-light">
          <Link href="/projects" className="hover:text-zen-text">
            ← All Projects
          </Link>
          <div className="h-px w-8 bg-zen-line" />
          <span>Project // Active</span>
        </header>

        <div className="mb-12 max-w-2xl fade-in-up">
          <h2 className="mb-3 text-[11px] uppercase tracking-widest text-zen-light">
            Current Journey
          </h2>
          <h1 className="font-serif text-5xl font-light leading-tight tracking-wide text-zen-text md:text-6xl">
            {project.name}
          </h1>
          {allPassed && (
            <div className="mt-6">
              <Link
                href={`/projects/${project.id}/memo`}
                className="inline-block rounded-sm border border-zen-text bg-zen-text px-5 py-2.5 text-xs uppercase tracking-widest text-zen-bg transition hover:bg-zen-deep"
              >
                {memo ? "Open memo →" : "Generate memo →"}
              </Link>
            </div>
          )}
        </div>

        <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,460px)]">
          <section
            className="fade-in-up"
            style={{ animationDelay: "0.05s" }}
          >
            <h2 className="mb-6 flex items-center gap-3 text-[11px] uppercase tracking-widest text-zen-light">
              <span>The Waypoints</span>
              <div className="h-px flex-1 bg-zen-line" />
            </h2>
            <JourneyMap projectId={project.id} stages={stages} />
          </section>

          <aside
            className="flex justify-center lg:sticky lg:top-8 fade-in-up"
            style={{ animationDelay: "0.1s" }}
          >
            <Compass
              activeStage={active}
              passedStages={passedStages}
              size={440}
              decorative
            />
          </aside>
        </div>
      </section>
    </main>
  );
}
