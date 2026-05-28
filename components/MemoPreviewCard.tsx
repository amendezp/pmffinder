import Link from "next/link";
import { MEMO_SECTIONS } from "@/lib/memo/template";
import type { SectionStatus } from "@/lib/memo/draftFromStages";

interface MemoPreviewCardProps {
  sectionStatuses: Record<string, SectionStatus>;
  draftedCount: number;
  href: string;
  /** Optional smaller variant for inline use. */
  compact?: boolean;
}

/**
 * Sidebar / inline card that shows how much of the memo is drafted, with one
 * dot per memo section colored by status. Click → memo page.
 */
export function MemoPreviewCard({
  sectionStatuses,
  draftedCount,
  href,
  compact = false,
}: MemoPreviewCardProps) {
  const total = MEMO_SECTIONS.length;
  return (
    <Link
      href={href}
      className={[
        "group block border border-neon-cyan/30 bg-gradient-to-b from-neon-cyan/[0.04] to-transparent transition-colors hover:border-neon-cyan/70",
        compact ? "p-3" : "w-full p-4",
      ].join(" ")}
    >
      <div
        className={[
          "mb-3 flex items-center justify-between font-mono uppercase tracking-widest text-neon-cyan/80",
          compact ? "text-[9px]" : "text-[10px]",
        ].join(" ")}
      >
        <span>Your memo</span>
        <span className="text-white">
          {draftedCount} of {total} drafted
        </span>
      </div>

      <div className="mb-3 grid grid-cols-3 gap-1.5">
        {MEMO_SECTIONS.map((s) => {
          const status = sectionStatuses[s.key] ?? "pending";
          const cls =
            status === "ready"
              ? "bg-neon-green shadow-cyber-green-glow"
              : status === "draft"
                ? "bg-neon-cyan"
                : "border border-neon-cyan/30";
          return (
            <div
              key={s.key}
              className={`h-1.5 ${cls}`}
              title={`${s.title} — ${status}`}
            />
          );
        })}
      </div>

      <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-neon-cyan/70">
        <span>View your memo</span>
        <span className="transition-transform group-hover:translate-x-0.5">→</span>
      </div>
    </Link>
  );
}
