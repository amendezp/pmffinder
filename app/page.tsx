import Link from "next/link";
import { Compass } from "@/components/Compass";
import { getCurrentUser } from "@/lib/supabase/server";

export default async function Landing() {
  const user = await getCurrentUser().catch(() => null);
  return (
    <main className="relative min-h-screen w-full overflow-hidden">
      {/* Off-canvas decorative compass — large, faint, anchored right */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-[-22%] top-1/2 z-0 hidden -translate-y-1/2 opacity-50 mix-blend-multiply lg:block"
      >
        <Compass activeStage={1} size={900} decorative />
      </div>

      {/* HUD */}
      <div className="absolute right-8 top-8 z-30 text-right text-[10px] uppercase tracking-widest text-zen-light no-print">
        <div className="mb-1">System // Compass</div>
        <div className="text-zen-text">PMF · 07 stages</div>
      </div>

      <div className="absolute bottom-8 left-8 z-30 flex items-center gap-3 text-[10px] uppercase tracking-widest text-zen-light no-print md:left-24">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-zen-accent" />
        Active
      </div>

      <section className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-8 py-16 md:px-16 md:pl-24">
        <div className="mb-8 flex items-center gap-4 text-[10px] uppercase tracking-widest text-zen-light fade-in-up">
          <span>PMFinder</span>
          <div className="h-px w-8 bg-zen-line" />
          <span>A guided journey toward PMF</span>
        </div>

        <div className="mb-12 max-w-xl fade-in-up" style={{ animationDelay: "0.05s" }}>
          <h2 className="mb-4 text-[11px] uppercase tracking-widest text-zen-light">
            Current State
          </h2>
          <h1 className="font-serif text-6xl font-light leading-tight tracking-wide text-zen-text md:text-7xl">
            Product-Market
            <br />
            Fit
          </h1>
          <p className="mt-6 max-w-lg text-base font-light leading-relaxed text-zen-accent">
            A guided journey that gates your progress through the scientific PMF
            process — until each waypoint is genuinely earned. Sourcing, hypothesis,
            validation, metrics, surprise, decision. Then exports a Sequoia-style
            2-pager memo.
          </p>
        </div>

        <div
          className="flex max-w-xl flex-col gap-6 fade-in-up"
          style={{ animationDelay: "0.1s" }}
        >
          {[
            { label: "Unique Insight", value: "Right + Non-consensus" },
            { label: "Technological Inflection", value: "Durable" },
            { label: "Desperate Customers", value: "Behavior > Intent" },
            { label: "The Surprise", value: "Look for the good" },
          ].map((row) => (
            <div
              key={row.label}
              className="group flex items-baseline justify-between border-b border-zen-line/60 pb-1 transition-colors duration-500 hover:border-zen-text/40"
            >
              <h3 className="font-serif text-2xl text-zen-text">{row.label}</h3>
              <span className="text-xs uppercase tracking-widest text-zen-accent">
                {row.value}
              </span>
            </div>
          ))}
        </div>

        <div
          className="mt-12 flex flex-wrap items-center gap-4 fade-in-up"
          style={{ animationDelay: "0.2s" }}
        >
          <Link
            href={user ? "/projects" : "/try"}
            className="rounded-sm border border-zen-text bg-zen-text px-6 py-3 text-sm uppercase tracking-widest text-zen-bg transition hover:bg-zen-deep"
          >
            {user ? "Open your projects →" : "Try the journey →"}
          </Link>
          {!user && (
            <Link
              href="/sign-in"
              className="rounded-sm border border-zen-line px-6 py-3 text-sm uppercase tracking-widest text-zen-text transition hover:border-zen-text"
            >
              Sign in to save
            </Link>
          )}
        </div>

        {!user && (
          <p
            className="mt-4 max-w-md text-xs text-zen-light fade-in-up"
            style={{ animationDelay: "0.25s" }}
          >
            No account required to demo. Sign in to save progress, upload evidence,
            and export your memo.
          </p>
        )}

        <footer className="mt-20 max-w-md border-t border-zen-line/60 pt-6 text-xs text-zen-light">
          “When a great team meets a lousy market, market wins. When a great team
          meets a great market — something special happens.”
        </footer>
      </section>
    </main>
  );
}
