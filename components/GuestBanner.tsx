import Link from "next/link";

export function GuestBanner({ context }: { context?: string }) {
  return (
    <div className="rounded-md border border-brass-500/40 bg-parchment-100/80 px-4 py-2.5 text-sm text-ink-800 no-print">
      <span className="mr-2">
        <span className="font-semibold">Demo mode.</span>{" "}
        {context ??
          "Your progress lives in this browser. Sign in to save, upload evidence, and export your memo."}
      </span>
      <Link
        href="/sign-in"
        className="rounded-md bg-compass-rose px-3 py-1 font-serif text-parchment-50 hover:bg-compass-rose/90"
      >
        Sign in
      </Link>
    </div>
  );
}
