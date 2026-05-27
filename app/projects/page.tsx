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

  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, created_at, updated_at")
    .order("updated_at", { ascending: false });

  return (
    <main className="relative mx-auto min-h-screen max-w-4xl px-8 py-12 md:px-12">
      <div className="absolute right-8 top-8 text-right font-mono text-[10px] tracking-widest text-neon-cyan/70 no-print">
        <div className="mb-1">SYS // PROJECTS</div>
        <form action="/auth/sign-out" method="post">
          <button className="text-white hover:text-neon-cyan">Sign out →</button>
        </form>
      </div>

      <header className="mb-10 flex items-center gap-4 font-mono text-xs uppercase tracking-widest opacity-80">
        <div className="h-2 w-2 animate-pulse bg-neon-cyan" />
        <Link href="/" className="hover:text-neon-cyan">
          ← PMFinder
        </Link>
        <div className="hud-line-decorator h-px flex-1 opacity-50" />
      </header>

      <div className="relative mb-10 flex items-end justify-between fade-in-up">
        <div className="relative">
          <div className="absolute -left-8 top-0 bottom-0 w-[2px] bg-gradient-to-b from-neon-cyan/0 via-neon-cyan to-neon-cyan/0" />
          <h2 className="mb-1 font-mono text-sm text-white/70">Active Missions:</h2>
          <h1 className="font-serif text-5xl italic text-white text-glow-white">
            Projects
          </h1>
        </div>
        <Link
          href="/projects/new"
          className="border border-neon-cyan bg-neon-cyan/10 px-4 py-2.5 font-mono text-xs uppercase tracking-widest text-neon-cyan shadow-cyber-glow hover:bg-neon-cyan hover:text-deep-blue"
        >
          + New mission
        </Link>
      </div>

      <ImportGuestBanner />

      <ol className="flex flex-col gap-3">
        {(projects ?? []).length === 0 && (
          <li className="border border-dashed border-neon-cyan/30 px-1 py-12 text-center font-mono text-sm text-neon-cyan/60">
            No missions yet. Start your first one.
          </li>
        )}
        {(projects ?? []).map((p, idx) => (
          <li key={p.id}>
            <Link
              href={`/projects/${p.id}`}
              className="group relative block cursor-crosshair border-l border-neon-cyan/30 bg-gradient-to-r from-neon-cyan/5 to-transparent py-3 pl-6 backdrop-blur-sm transition-colors duration-300 hover:border-neon-cyan"
            >
              <div className="absolute -left-[5px] top-1/2 h-[9px] w-[9px] -translate-y-1/2 rounded-full border border-neon-cyan bg-deep-blue transition-all group-hover:bg-neon-cyan group-hover:shadow-cyber-glow" />
              <div className="flex items-baseline justify-between">
                <h3 className="font-serif text-2xl italic text-white transition-colors group-hover:text-neon-cyan">
                  {p.name}
                </h3>
                <span className="rounded border border-neon-cyan/20 bg-neon-cyan/10 px-2 py-0.5 font-mono text-[10px] tracking-widest text-neon-cyan/80">
                  {`0${idx + 1}`.slice(-2)}
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-neon-cyan/60">
                <span>Last updated</span>
                <span className="text-white/80">
                  {new Date(p.updated_at).toLocaleDateString()}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </main>
  );
}
