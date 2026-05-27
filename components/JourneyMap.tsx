"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { rubrics } from "@/lib/rubrics";

interface JourneyMapProps {
  projectId: string;
  stages: Array<{ stage_number: number; status: "locked" | "in_progress" | "passed" }>;
}

export function JourneyMap({ projectId, stages }: JourneyMapProps) {
  const statusByStage = new Map<number, string>(
    stages.map((s) => [s.stage_number, s.status])
  );

  // First locked stage = the one to unlock next; everything before is open.
  let firstLocked = 8;
  for (let i = 1; i <= 7; i++) {
    const status = statusByStage.get(i) ?? (i === 1 ? "in_progress" : "locked");
    if (status === "locked") {
      firstLocked = i;
      break;
    }
  }

  return (
    <ol className="space-y-3">
      {Array.from({ length: 7 }).map((_, idx) => {
        const n = idx + 1;
        const status =
          (statusByStage.get(n) as "locked" | "in_progress" | "passed" | undefined) ??
          (n === 1 ? "in_progress" : n < firstLocked ? "in_progress" : "locked");
        const rubric = rubrics[n as 1 | 2 | 3 | 4 | 5 | 6 | 7];
        const isLocked = status === "locked";
        const isPassed = status === "passed";

        const body = (
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.06 }}
            className={[
              "flex items-center gap-4 rounded-lg border px-4 py-3 transition",
              isPassed
                ? "border-brass-500/50 bg-parchment-100/60"
                : isLocked
                  ? "border-ink-700/15 bg-parchment-50/40 opacity-60"
                  : "border-compass-rose/40 bg-parchment-100/80 shadow-compass",
            ].join(" ")}
          >
            <span
              className={[
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-serif text-base",
                isPassed
                  ? "bg-brass-500 text-parchment-50"
                  : isLocked
                    ? "bg-parchment-200 text-ink-700/60"
                    : "bg-compass-rose text-parchment-50",
              ].join(" ")}
            >
              {isPassed ? "✓" : n}
            </span>
            <div className="flex-1">
              <div className="font-serif text-lg text-ink-900">{rubric.title}</div>
              <div className="text-sm text-ink-700/80">{rubric.blurb}</div>
            </div>
            <span className="text-xs uppercase tracking-wider text-ink-700/70">
              {isPassed ? "passed" : isLocked ? "locked" : "open"}
            </span>
          </motion.div>
        );

        return (
          <li key={n}>
            {isLocked ? (
              <div aria-disabled>{body}</div>
            ) : (
              <Link href={`/projects/${projectId}/stage/${n}`}>{body}</Link>
            )}
          </li>
        );
      })}
    </ol>
  );
}
