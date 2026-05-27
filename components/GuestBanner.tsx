import Link from "next/link";

export function GuestBanner({ context }: { context?: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border border-neon-pink/40 bg-neon-pink/5 px-4 py-3 font-mono text-xs text-white no-print">
      <div className="flex items-center gap-3">
        <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-neon-pink shadow-cyber-pink-glow" />
        <span className="text-[10px] uppercase tracking-widest text-neon-pink">
          Demo Mode
        </span>
        <span className="hidden h-3 w-px bg-neon-pink/40 md:inline-block" />
        <span className="text-white/80">
          {context ??
            "Progress lives in this browser. Authenticate to save, upload evidence, and export your memo."}
        </span>
      </div>
      <Link
        href="/sign-in"
        className="border border-neon-cyan bg-neon-cyan/10 px-4 py-1.5 text-[10px] uppercase tracking-widest text-neon-cyan transition hover:bg-neon-cyan hover:text-deep-blue"
      >
        Authenticate
      </Link>
    </div>
  );
}
