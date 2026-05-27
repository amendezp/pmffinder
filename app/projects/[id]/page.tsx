import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Compass } from "@/components/Compass";
import { JourneyMap } from "@/components/JourneyMap";
import { StageStepper } from "@/components/StageStepper";
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
    <main className="relative min-h-screen w-full overflow-hidden pb-16">
      <section className="relative z-10 mx-auto max-w-7xl px-8 py-12 md:px-16">
        {/* Breadcrumb + brand */}
        <header className="mb-10 flex items-center gap-4 font-mono text-xs uppercase tracking-widest text-neon-cyan/80">
          <div className="h-2 w-2 animate-pulse bg-neon-cyan" />
          <Link href="/projects" className="hover:text-neon-cyan">
            ← All projects
          </Link>
          <div className="hud-line-decorator h-px flex-1 opacity-50" />
        </header>

        {/* Hero */}
        <div className="relative mb-8 max-w-2xl fade-in-up">
          <div className="absolute -left-8 top-0 bottom-0 w-[2px] bg-gradient-to-b from-neon-cyan/0 via-neon-cyan to-neon-cyan/0" />
          <h2 className="mb-2 font-mono text-sm uppercase tracking-widest text-neon-cyan/70">
            Your journey
          </h2>
          <h1 className="font-serif text-5xl italic leading-tight text-white text-glow-white md:text-6xl">
            {project.name}
          </h1>
          {allPassed && (
            <div className="mt-6">
              <Link
                href={`/projects/${project.id}/memo`}
                className="inline-block border border-neon-cyan bg-neon-cyan/15 px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-neon-cyan shadow-cyber-glow transition hover:bg-neon-cyan hover:text-deep-blue"
              >
                {memo ? "Open your memo →" : "Generate your memo →"}
              </Link>
            </div>
          )}
        </div>

        {/* Always-visible stepper */}
        <div className="mb-12 max-w-2xl fade-in-up" style={{ animationDelay: "0.03s" }}>
          <StageStepper
            stages={stages}
            currentStage={active}
            hrefForStage={(n) => `/projects/${id}/stage/${n}`}
          />
        </div>

        <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,500px)]">
          <section className="fade-in-up" style={{ animationDelay: "0.05s" }}>
            <h2 className="mb-6 flex items-center gap-3 font-mono text-[10px] uppercase tracking-widest text-neon-cyan/70">
              <span>The 7 stages</span>
              <div className="h-px flex-1 bg-neon-cyan/20" />
            </h2>
            <JourneyMap projectId={project.id} stages={stages} />
          </section>

          <aside
            className="flex justify-center lg:sticky lg:top-8 fade-in-up"
            style={{ animationDelay: "0.1s" }}
          >
            <Compass activeStage={active} passedStages={passedStages} size={460} />
          </aside>
        </div>
      </section>
    </main>
  );
}
