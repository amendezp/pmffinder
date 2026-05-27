import Link from "next/link";
import { Compass } from "@/components/Compass";
import { getCurrentUser } from "@/lib/supabase/server";
import { rubrics } from "@/lib/rubrics";

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
        {/* Brand bar */}
        <div className="mb-16 flex items-center gap-4 font-mono text-xs uppercase tracking-widest text-neon-cyan/80 fade-in-up">
          <div className="h-2 w-2 animate-pulse bg-neon-cyan" />
          <span>PMFinder</span>
          <div className="hud-line-decorator h-px flex-1 opacity-50" />
          {user ? (
            <Link href="/projects" className="hover:text-white">
              Your projects →
            </Link>
          ) : (
            <Link href="/sign-in" className="hover:text-white">
              Sign in
            </Link>
          )}
        </div>

        {/* Hero */}
        <div
          className="relative max-w-2xl fade-in-up"
          style={{ animationDelay: "0.1s" }}
        >
          <div className="absolute -left-8 top-0 bottom-0 w-[2px] bg-gradient-to-b from-neon-cyan/0 via-neon-cyan to-neon-cyan/0" />
          <h2 className="mb-4 font-mono text-xs uppercase tracking-widest text-neon-cyan/70">
            A guided journey to
          </h2>
          <h1 className="bg-gradient-to-br from-white to-neon-cyan bg-clip-text font-serif text-7xl italic leading-[0.95] text-transparent text-glow md:text-[7rem]">
            product/
            <br />
            market fit
          </h1>
        </div>

        {/* Anchor quote */}
        <p
          className="mt-14 max-w-lg font-serif text-2xl italic leading-tight text-white/80 fade-in-up md:text-3xl"
          style={{ animationDelay: "0.2s" }}
        >
          &ldquo;In tech, better doesn&rsquo;t win.{" "}
          <span className="text-neon-cyan text-glow">
            Only the different dominate.&rdquo;
          </span>
        </p>

        {/* CTAs */}
        <div
          className="mt-10 flex flex-wrap items-center gap-3 fade-in-up"
          style={{ animationDelay: "0.3s" }}
        >
          <Link
            href={user ? "/projects" : "/try"}
            className="border border-neon-cyan bg-neon-cyan/15 px-7 py-3 font-mono text-xs uppercase tracking-widest text-neon-cyan shadow-cyber-glow transition hover:bg-neon-cyan hover:text-deep-blue"
          >
            {user ? "Open your projects →" : "Begin your journey →"}
          </Link>
          {!user && (
            <Link
              href="/sign-in"
              className="border border-neon-cyan/40 px-7 py-3 font-mono text-xs uppercase tracking-widest text-white/80 transition hover:border-neon-cyan hover:text-white"
            >
              Sign in to save
            </Link>
          )}
        </div>

        {/* Slim stage strip — no blurbs */}
        <div className="mt-20 max-w-4xl fade-in-up" style={{ animationDelay: "0.4s" }}>
          <div className="mb-3 flex items-center gap-3 font-mono text-[10px] uppercase tracking-widest text-neon-cyan/60">
            <span>The seven stages</span>
            <div className="h-px flex-1 bg-neon-cyan/15" />
          </div>
          <ol className="grid grid-cols-2 gap-x-8 gap-y-2 md:grid-cols-4 lg:grid-cols-7">
            {stages.map((s) => (
              <li
                key={s.stageNumber}
                className="flex items-center gap-2 font-mono text-[11px] text-white/65"
              >
                <span className="text-neon-cyan/70">
                  {`0${s.stageNumber}`.slice(-2)}
                </span>
                <span className="truncate">{s.title}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Footer tagline */}
        <footer className="mt-16 font-mono text-[11px] uppercase tracking-widest text-neon-cyan/55">
          Don&rsquo;t panic. Fortune favors the focused.
        </footer>
      </section>
    </main>
  );
}
