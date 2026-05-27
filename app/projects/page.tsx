import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ImportGuestBanner } from "@/components/ImportGuestBanner";

export default async function ProjectsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  // Fetch projects + passed-stage counts in one round trip per project (small N).
  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, created_at, updated_at")
    .order("updated_at", { ascending: false });

  const counts = new Map<string, number>();
  if (projects && projects.length > 0) {
    const { data: stages } = await supabase
      .from("stages")
      .select("project_id, status")
      .in(
        "project_id",
        projects.map((p) => p.id)
      )
      .eq("status", "passed");
    for (const s of stages ?? []) {
      counts.set(s.project_id, (counts.get(s.project_id) ?? 0) + 1);
    }
  }

  return (
    <main className="relative mx-auto min-h-screen max-w-4xl px-8 py-12 md:px-12">
      <header className="mb-10 flex items-center gap-4 font-mono text-xs uppercase tracking-widest text-neon-cyan/80">
        <div className="h-2 w-2 animate-pulse bg-neon-cyan" />
        <Link href="/" className="hover:text-neon-cyan">
          ← PMFinder
        </Link>
        <div className="hud-line-decorator h-px flex-1 opacity-50" />
        <form action="/auth/sign-out" method="post">
          <button className="hover:text-white">Sign out</button>
        </form>
      </header>

      <div className="relative mb-10 flex items-end justify-between fade-in-up">
        <div className="relative">
          <div className="absolute -left-8 top-0 bottom-0 w-[2px] bg-gradient-to-b from-neon-cyan/0 via-neon-cyan to-neon-cyan/0" />
          <h2 className="mb-2 font-mono text-sm uppercase tracking-widest text-neon-cyan/70">
            Your projects
          </h2>
          <h1 className="font-serif text-5xl italic text-white text-glow-white">
            Pick up where you left off
          </h1>
        </div>
        <Link
          href="/projects/new"
          className="border border-neon-cyan bg-neon-cyan/15 px-4 py-2.5 font-mono text-xs uppercase tracking-widest text-neon-cyan shadow-cyber-glow hover:bg-neon-cyan hover:text-deep-blue"
        >
          + Start a new journey
        </Link>
      </div>

      <ImportGuestBanner />

      <ol className="flex flex-col gap-3">
        {(projects ?? []).length === 0 && (
          <li className="border border-dashed border-neon-cyan/30 px-1 py-12 text-center font-mono text-sm text-neon-cyan/60">
            No journeys yet. Start your first one.
          </li>
        )}
        {(projects ?? []).map((p, idx) => {
          const passed = counts.get(p.id) ?? 0;
          return (
            <li key={p.id}>
              <Link
                href={`/projects/${p.id}`}
                className="group relative block cursor-pointer border-l border-neon-cyan/30 bg-gradient-to-r from-neon-cyan/5 to-transparent py-3 pl-6 backdrop-blur-sm transition-colors duration-300 hover:border-neon-cyan"
              >
                <div className="absolute -left-[5px] top-1/2 h-[9px] w-[9px] -translate-y-1/2 rounded-full border border-neon-cyan bg-deep-blue transition-all group-hover:bg-neon-cyan group-hover:shadow-cyber-glow" />
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-serif text-2xl italic text-white transition-colors group-hover:text-neon-cyan">
                    {p.name}
                  </h3>
                  <span className="border border-neon-cyan/20 bg-neon-cyan/10 px-2 py-0.5 font-mono text-[10px] tracking-widest text-neon-cyan/80">
                    {`0${idx + 1}`.slice(-2)}
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-neon-cyan/60">
                  <span>
                    {passed} of 7 stages passed
                  </span>
                  <span className="text-white/80">
                    Updated {new Date(p.updated_at).toLocaleDateString()}
                  </span>
                </div>
                {/* Mini progress bar */}
                <div className="mt-2 h-[3px] w-full overflow-hidden bg-neon-cyan/15">
                  <div
                    className="h-full bg-neon-cyan transition-all"
                    style={{ width: `${(passed / 7) * 100}%` }}
                  />
                </div>
              </Link>
            </li>
          );
        })}
      </ol>
    </main>
  );
}
