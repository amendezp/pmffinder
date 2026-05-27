import Link from "next/link";
import { GuestBanner } from "@/components/GuestBanner";
import { GuestJourney } from "@/components/GuestJourney";

export const metadata = {
  title: "Try PMFinder — demo journey",
};

export default function TryPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <header className="mb-6 flex items-center justify-between">
        <Link href="/" className="font-display text-2xl text-ink-900">
          PMFinder
        </Link>
        <Link
          href="/sign-in"
          className="text-sm text-ink-700 underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </header>

      <div className="mb-6">
        <GuestBanner />
      </div>

      <h1 className="font-display text-3xl text-ink-900">Your demo journey</h1>
      <p className="mb-8 mt-1 max-w-2xl text-ink-700">
        Walk through all seven stages right here. Claude grades each one against the
        same rubric a signed-in user gets. Sign in any time to save your progress and
        export the memo at the end.
      </p>

      <GuestJourney />
    </main>
  );
}
