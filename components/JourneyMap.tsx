"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { rubrics } from "@/lib/rubrics";

interface JourneyMapProps {
  stages: Array<{ stage_number: number; status: "locked" | "in_progress" | "passed" }>;
  /**
   * Base path; each row links to `${hrefBase}/${stageNumber}`. Use a string
   * so this prop can be passed from Server Components (functions can't cross
   * the boundary).
   */
  hrefBase: string;
}

const STATUS_TEXT: Record<"locked" | "in_progress" | "passed", string> = {
  locked: "Not started",
  in_progress: "In progress",
  passed: "Passed",
};

export function JourneyMap({ stages, hrefBase }: JourneyMapProps) {
  const buildHref = (n: number) => `${hrefBase}/${n}`;
  const statusByStage = new Map<number, "locked" | "in_progress" | "passed">(
    stages.map((s) => [s.stage_number, s.status])
  );

  // The "current" stage = first non-passed; everything else is open.
  let current = 1;
  for (let i = 1; i <= 8; i++) {
    if (statusByStage.get(i) !== "passed") {
      current = i;
      break;
    }
    if (i === 8) current = 8;
  }

  return (
    <ol className="flex flex-col gap-3">
      {Array.from({ length: 8 }).map((_, idx) => {
        const n = idx + 1;
        const status =
          (statusByStage.get(n) as "locked" | "in_progress" | "passed" | undefined) ??
          "locked"; // "locked" here just means "not started yet"
        const rubric = rubrics[n as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8];
        const isPassed = status === "passed";
        const isCurrent = n === current && !isPassed;

        // Color logic:
        // - passed → green accent
        // - the user's current focus (first non-passed) → cyan accent, glow
        // - everything else → muted cyan, still clickable
        const borderClass = isPassed
          ? "border-neon-green/70 hover:border-neon-green"
          : isCurrent
            ? "border-neon-cyan bg-gradient-to-r from-neon-cyan/5 to-transparent hover:border-neon-cyan"
            : "border-neon-cyan/30 hover:border-neon-cyan/60";

        const dotClass = isPassed
          ? "border-neon-green bg-neon-green shadow-cyber-green-glow"
          : isCurrent
            ? "border-neon-cyan group-hover:bg-neon-cyan group-hover:shadow-cyber-glow"
            : "border-neon-cyan/50 group-hover:border-neon-cyan";

        const titleClass = isPassed
          ? "text-neon-green text-glow-green"
          : isCurrent
            ? "text-white group-hover:text-neon-cyan"
            : "text-white/85 group-hover:text-white";

        const statusClass = isPassed
          ? "text-neon-green"
          : isCurrent
            ? "text-neon-cyan text-glow"
            : "text-neon-cyan/50";

        const progress = isPassed ? 100 : isCurrent ? 30 : 0;

        return (
          <li key={n}>
            <Link href={buildHref(n)} className="block">
              <motion.div
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={[
                  "group relative cursor-pointer border-l py-3 pl-6 backdrop-blur-sm transition-colors duration-300",
                  borderClass,
                ].join(" ")}
              >
                <div
                  className={[
                    "absolute -left-[5px] top-1/2 h-[9px] w-[9px] -translate-y-1/2 rounded-full border bg-deep-blue transition-all",
                    dotClass,
                  ].join(" ")}
                />

                <div className="flex items-baseline justify-between gap-3">
                  <h3
                    className={[
                      "font-serif text-2xl italic leading-tight transition-colors",
                      titleClass,
                    ].join(" ")}
                  >
                    {rubric.title}
                  </h3>
                  <span
                    className={[
                      "border px-2 py-0.5 font-mono text-[10px] tracking-widest",
                      isPassed
                        ? "border-neon-green/30 bg-neon-green/10 text-neon-green/90"
                        : "border-neon-cyan/20 bg-neon-cyan/10 text-neon-cyan/80",
                    ].join(" ")}
                  >
                    {`0${n}`.slice(-2)}
                  </span>
                </div>

                <p className="mt-1 font-mono text-[11px] text-white/55">
                  {rubric.blurb}
                </p>

                <div className="mt-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-widest">
                  <span className="text-neon-cyan/60">Status</span>
                  <span className={statusClass}>{STATUS_TEXT[status]}</span>
                </div>

                {/* Progress bar */}
                <div className="mt-2 h-[3px] w-full overflow-hidden bg-neon-cyan/15">
                  <div
                    className={[
                      "relative h-full transition-all duration-500",
                      isPassed ? "bg-neon-green" : "bg-neon-cyan",
                    ].join(" ")}
                    style={{ width: `${progress}%` }}
                  >
                    {isCurrent && (
                      <div className="absolute top-0 right-0 h-full w-8 animate-pulse-fast bg-white/60" />
                    )}
                  </div>
                </div>
              </motion.div>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
