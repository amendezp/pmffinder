import Link from "next/link";
import { Compass } from "@/components/Compass";
import { getCurrentUser } from "@/lib/supabase/server";
import { rubrics } from "@/lib/rubrics";

const HOW_IT_WORKS = [
  {
    n: "01",
    title: "Walk through 7 stages",
    body: "From the unique insight that started it, all the way to the decision on whether you have PMF.",
  },
  {
    n: "02",
    title: "AI grades each one",
    body: "Each stage is checked against a rubric. You see exactly which criteria you met and which you didn't.",
  },
  {
    n: "03",
    title: "Export your memo",
    body: "Finish the journey and export a 2-pager investor memo built from your seven stages.",
  },
];

export default async function Landing() {
  const user = await getCurrentUser().catch(() => null);
  const stages = Object.values(rubrics).sort((a, b) => a.stageNumber - b.stageNumber);

  return (
    <main className="relative min-h-screen w-full overflow-hidden">
      {/* Off-canvas decorative radar */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-[-22%] top-1/2 z-0 hidden -translate-y-1/2 lg:block"
      >
        <Compass activeStage={1} size={900} decorative />
      </div>

      <section className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-8 py-16 md:px-16">
        {/* Brand */}
        <div className="mb-10 flex items-center gap-4 font-mono text-xs uppercase tracking-widest text-neon-cyan/80 fade-in-up">
          <div className="h-2 w-2 animate-pulse bg-neon-cyan" />
          <span>PMFinder</span>
          <div className="hud-line-decorator h-px flex-1 opacity-50" />
        </div>

        {/* Hero */}
        <div
          className="relative mb-12 max-w-2xl fade-in-up"
          style={{ animationDelay: "0.05s" }}
        >
          <div className="absolute -left-8 top-0 bottom-0 w-[2px] bg-gradient-to-b from-neon-cyan/0 via-neon-cyan to-neon-cyan/0" />
          <h2 className="mb-3 font-mono text-sm uppercase tracking-widest text-neon-cyan/70">
            A guided journey to
          </h2>
          <h1 className="bg-gradient-to-br from-white to-neon-cyan bg-clip-text pb-2 font-serif text-6xl italic leading-[1.05] text-transparent text-glow md:text-7xl">
            product/market fit
          </h1>
          <p className="mt-6 max-w-lg font-mono text-base leading-relaxed text-white/75">
            Seven stages. Each one graded against a rubric so you know exactly
            where you stand. Finish, and export a 2-pager investor memo built
            from everything you wrote.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href={user ? "/projects" : "/try"}
              className="border border-neon-cyan bg-neon-cyan/15 px-6 py-3 font-mono text-xs uppercase tracking-widest text-neon-cyan shadow-cyber-glow transition hover:bg-neon-cyan hover:text-deep-blue"
            >
              {user ? "Open your projects →" : "Begin your journey →"}
            </Link>
            {!user && (
              <Link
                href="/sign-in"
                className="border border-neon-cyan/40 px-6 py-3 font-mono text-xs uppercase tracking-widest text-white/80 transition hover:border-neon-cyan hover:text-white"
              >
                Sign in to save
              </Link>
            )}
          </div>
          {!user && (
            <p className="mt-3 font-mono text-[11px] text-neon-cyan/60">
              No account needed for the demo. Sign in to save your progress and
              export your memo.
            </p>
          )}
        </div>

        {/* How it works — three plain steps */}
        <div
          className="mb-16 grid max-w-3xl gap-6 fade-in-up md:grid-cols-3"
          style={{ animationDelay: "0.1s" }}
        >
          {HOW_IT_WORKS.map((step) => (
            <div
              key={step.n}
              className="border-l border-neon-cyan/30 pl-4"
            >
              <div className="font-mono text-[10px] uppercase tracking-widest text-neon-cyan/70">
                Step {step.n}
              </div>
              <h3 className="mt-1 font-serif text-2xl italic text-white">
                {step.title}
              </h3>
              <p className="mt-1 font-mono text-xs leading-relaxed text-white/65">
                {step.body}
              </p>
            </div>
          ))}
        </div>

        {/* The 7 stages — real preview, not a fake metric grid */}
        <div
          className="mb-14 max-w-3xl fade-in-up"
          style={{ animationDelay: "0.15s" }}
        >
          <h3 className="mb-4 flex items-center gap-3 font-mono text-[10px] uppercase tracking-widest text-neon-cyan/70">
            <span>The journey</span>
            <div className="h-px flex-1 bg-neon-cyan/20" />
          </h3>
          <ol className="grid gap-2 md:grid-cols-2">
            {stages.map((s) => (
              <li
                key={s.stageNumber}
                className="flex items-start gap-3 border-l border-neon-cyan/20 py-2 pl-4"
              >
                <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center border border-neon-cyan/40 bg-neon-cyan/5 font-mono text-[10px] text-neon-cyan">
                  {`0${s.stageNumber}`.slice(-2)}
                </span>
                <div>
                  <div className="font-serif text-lg italic text-white">
                    {s.title}
                  </div>
                  <p className="font-mono text-[11px] leading-snug text-white/55">
                    {s.blurb}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <footer className="max-w-2xl border-t border-neon-cyan/15 pt-5 font-mono text-[11px] text-neon-cyan/60">
          &ldquo;When a great team meets a great market — something special
          happens.&rdquo;
        </footer>
      </section>
    </main>
  );
}
