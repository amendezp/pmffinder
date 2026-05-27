import Link from "next/link";
import { GuestBanner } from "@/components/GuestBanner";
import { GuestJourney } from "@/components/GuestJourney";

export const metadata = {
  title: "PMFinder — demo journey",
};

export default function TryPage() {
  return (
    <main className="relative min-h-screen w-full overflow-hidden pb-16">
      <section className="relative z-10 mx-auto max-w-7xl px-8 py-12 md:px-16">
        <header className="mb-10 flex items-center gap-4 font-mono text-xs uppercase tracking-widest text-neon-cyan/80">
          <div className="h-2 w-2 animate-pulse bg-neon-cyan" />
          <Link href="/" className="hover:text-neon-cyan">
            ← PMFinder
          </Link>
          <div className="hud-line-decorator h-px flex-1 opacity-50" />
          <Link href="/sign-in" className="hover:text-white">
            Sign in to save
          </Link>
        </header>

        <div className="relative mb-8 max-w-2xl fade-in-up">
          <div className="absolute -left-8 top-0 bottom-0 w-[2px] bg-gradient-to-b from-neon-cyan/0 via-neon-cyan to-neon-cyan/0" />
          <h2 className="mb-2 font-mono text-sm uppercase tracking-widest text-neon-cyan/70">
            Your demo journey
          </h2>
          <h1 className="font-serif text-5xl italic leading-tight text-white text-glow-white md:text-6xl">
            Seven stages to PMF
          </h1>
          <p className="mt-4 max-w-lg font-mono text-sm leading-relaxed text-white/75">
            Walk through every stage right here. Each one is graded against
            the same rubric a signed-in user gets. Sign in at any time to save
            your progress and export your memo at the end.
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
