import Link from "next/link";

export function GuestBanner({ context }: { context?: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border border-zen-line bg-white px-4 py-3 text-sm text-zen-text no-print">
      <div className="flex items-center gap-3">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-zen-accent" />
        <span className="text-[10px] uppercase tracking-widest text-zen-light">
          Demo Mode
        </span>
        <span className="hidden h-3 w-px bg-zen-line md:inline-block" />
        <span className="text-zen-accent">
          {context ??
            "Your progress lives in this browser. Sign in to save, upload evidence, and export your memo."}
        </span>
      </div>
      <Link
        href="/sign-in"
        className="rounded-sm border border-zen-text bg-zen-text px-4 py-1.5 text-[10px] uppercase tracking-widest text-zen-bg transition hover:bg-zen-deep"
      >
        Sign in
      </Link>
    </div>
  );
}
