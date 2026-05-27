import Link from "next/link";
import { Compass } from "@/components/Compass";
import { getCurrentUser } from "@/lib/supabase/server";

export default async function Landing() {
  const user = await getCurrentUser().catch(() => null);
  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <header className="flex items-center justify-between">
          <h1 className="font-display text-2xl text-ink-900">PMFinder</h1>
          <nav className="flex items-center gap-4 text-sm">
            {user ? (
              <Link className="text-ink-800 underline-offset-4 hover:underline" href="/projects">
                Your projects →
              </Link>
            ) : (
              <Link className="text-ink-800 underline-offset-4 hover:underline" href="/sign-in">
                Sign in
              </Link>
            )}
          </nav>
        </header>

        <section className="mt-12 grid items-center gap-12 md:grid-cols-2">
          <div>
            <h2 className="font-display text-5xl leading-tight text-ink-900">
              A compass<br />
              toward product/market fit.
            </h2>
            <p className="mt-5 text-lg text-ink-700">
              A guided journey that gates your progress through the scientific
              PMF process — sourcing, hypothesis, validation, metrics, surprise,
              decision — until you've genuinely earned each waypoint. Then
              exports a Sequoia-style 2-pager.
            </p>
            <ul className="mt-6 space-y-2 text-ink-800">
              <li>· Seven stages, each gated by an LLM grader trained on the rubric.</li>
              <li>· Per-stage evidence — upload screenshots, paste transcripts.</li>
              <li>· Socratic coach to pressure-test your draft before submitting.</li>
              <li>· Shareable, printable memo when you cross the finish line.</li>
            </ul>
            <div className="mt-8">
              <Link
                href={user ? "/projects" : "/sign-in"}
                className="rounded-md bg-compass-rose px-6 py-3 font-serif text-parchment-50 shadow-compass transition hover:bg-compass-rose/90"
              >
                {user ? "Open your projects" : "Sign in to begin"}
              </Link>
            </div>
          </div>

          <div className="flex justify-center">
            <Compass activeStage={1} size={420} />
          </div>
        </section>

        <footer className="mt-20 border-t border-ink-700/15 pt-6 text-xs text-ink-700/70">
          Built on the PMF principles of Andy Rachleff. "When a great team meets
          a lousy market, market wins. When a great team meets a great market —
          something special happens."
        </footer>
      </div>
    </main>
  );
}
