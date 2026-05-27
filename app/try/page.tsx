import Link from "next/link";
import { GuestBanner } from "@/components/GuestBanner";
import { GuestJourney } from "@/components/GuestJourney";

export const metadata = {
  title: "Try PMFinder — demo journey",
};

export default function TryPage() {
  return (
    <main className="relative min-h-screen w-full overflow-hidden">
      <div className="absolute right-8 top-8 z-30 text-right text-[10px] uppercase tracking-widest text-zen-light no-print">
        <div className="mb-1">System // Demo</div>
        <Link href="/sign-in" className="text-zen-text hover:underline">
          Sign in to save →
        </Link>
      </div>

      <section className="relative z-10 mx-auto max-w-7xl px-8 py-12 md:px-16 md:pl-24">
        <header className="mb-10 flex items-center gap-4 text-[10px] uppercase tracking-widest text-zen-light">
          <Link href="/" className="hover:text-zen-text">
            ← PMFinder
          </Link>
          <div className="h-px w-8 bg-zen-line" />
          <span>Demo // No Account</span>
        </header>

        <div className="mb-8 max-w-2xl fade-in-up">
          <h2 className="mb-3 text-[11px] uppercase tracking-widest text-zen-light">
            Current Journey
          </h2>
          <h1 className="font-serif text-5xl font-light leading-tight tracking-wide text-zen-text md:text-6xl">
            Your demo journey
          </h1>
          <p className="mt-4 max-w-lg text-base font-light leading-relaxed text-zen-accent">
            Walk through all seven stages right here. Claude grades each one against
            the same rubric a signed-in user gets. Sign in any time to save your
            progress and export the memo at the end.
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
