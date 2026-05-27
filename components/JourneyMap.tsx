"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { rubrics } from "@/lib/rubrics";

interface JourneyMapProps {
  projectId: string;
  stages: Array<{ stage_number: number; status: "locked" | "in_progress" | "passed" }>;
  /** Defaults to `/projects/{projectId}/stage/{n}`. */
  hrefForStage?: (n: number) => string;
}

const statusLabel: Record<"locked" | "in_progress" | "passed", string> = {
  locked: "LOCKED",
  in_progress: "OPEN",
  passed: "PASSED",
};

export function JourneyMap({ projectId, stages, hrefForStage }: JourneyMapProps) {
  const buildHref =
    hrefForStage ?? ((n: number) => `/projects/${projectId}/stage/${n}`);
  const statusByStage = new Map<number, string>(
    stages.map((s) => [s.stage_number, s.status])
  );

  let firstLocked = 8;
  for (let i = 1; i <= 7; i++) {
    const status = statusByStage.get(i) ?? (i === 1 ? "in_progress" : "locked");
    if (status === "locked") {
      firstLocked = i;
      break;
    }
  }

  return (
    <ol className="flex flex-col">
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
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={[
              "group relative flex items-baseline justify-between gap-4 border-b py-4 transition-colors duration-500",
              isLocked
                ? "border-zen-line/40 opacity-50"
                : "border-zen-line/60 hover:border-zen-text/40",
            ].join(" ")}
          >
            <div className="flex items-baseline gap-5">
              <span className="font-mono text-[10px] uppercase tracking-widest text-zen-light">
                {`0${n}`.slice(-2)}
              </span>
              <div>
                <h3 className="font-serif text-xl text-zen-text leading-tight">
                  {rubric.title}
                </h3>
                <p className="mt-0.5 text-xs text-zen-light">{rubric.blurb}</p>
              </div>
            </div>
            <span
              className={[
                "shrink-0 text-[10px] tracking-widest uppercase",
                isPassed
                  ? "text-zen-text"
                  : isLocked
                    ? "text-zen-light/60"
                    : "text-zen-accent",
              ].join(" ")}
            >
              {statusLabel[status]}
            </span>
          </motion.div>
        );

        return (
          <li key={n}>
            {isLocked ? (
              <div aria-disabled className="cursor-not-allowed">
                {body}
              </div>
            ) : (
              <Link href={buildHref(n)} className="block">
                {body}
              </Link>
            )}
          </li>
        );
      })}
    </ol>
  );
}
