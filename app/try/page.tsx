import Link from "next/link";
import { GuestBanner } from "@/components/GuestBanner";
import { GuestJourney } from "@/components/GuestJourney";

export const metadata = {
  title: "PMFinder — demo scan",
};

export default function TryPage() {
  return (
    <main className="relative min-h-screen w-full overflow-hidden pb-16">
      <div className="absolute right-8 top-8 z-30 text-right font-mono text-[10px] tracking-widest text-neon-cyan/70 no-print">
        <div className="mb-1 flex items-center justify-end gap-3">
          <span>MODE</span>
          <span className="w-[60px] text-white">DEMO</span>
        </div>
        <Link href="/sign-in" className="text-neon-cyan hover:text-white">
          Authenticate →
        </Link>
      </div>

      <section className="relative z-10 mx-auto max-w-7xl px-8 py-12 md:px-16">
        <header className="mb-10 flex items-center gap-4 font-mono text-xs uppercase tracking-widest opacity-80">
          <div className="h-2 w-2 animate-pulse bg-neon-cyan" />
          <Link href="/" className="hover:text-neon-cyan">
            ← PMFinder
          </Link>
          <div className="hud-line-decorator h-px flex-1 opacity-50" />
        </header>

        <div className="relative mb-8 max-w-2xl fade-in-up">
          <div className="absolute -left-8 top-0 bottom-0 w-[2px] bg-gradient-to-b from-neon-cyan/0 via-neon-cyan to-neon-cyan/0" />
          <h2 className="mb-2 font-mono text-sm text-white/70">Target Objective:</h2>
          <h1 className="font-serif text-5xl italic leading-tight text-white text-glow-white md:text-6xl">
            Demo scan
          </h1>
          <p className="mt-4 max-w-lg font-mono text-sm leading-relaxed text-white/70">
            Walk through all seven waypoints right here. Claude grades each
            against the same rubric a signed-in user gets. Authenticate any time
            to save your progress and export the memo at the end.
          </p>
        </div>

        <div className="mb-8 max-w-2xl fade-in-up" style={{ animationDelay: "0.05s" }}>
          <GuestBanner />
        </div>

        <GuestJourney />
      </section>
    </main>
  );
}
