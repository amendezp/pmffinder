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

const STATUS_TEXT: Record<"locked" | "in_progress" | "passed", string> = {
  locked: "STANDBY",
  in_progress: "TRACKING",
  passed: "LOCKED ON",
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
    <ol className="flex flex-col gap-3">
      {Array.from({ length: 7 }).map((_, idx) => {
        const n = idx + 1;
        const status =
          (statusByStage.get(n) as "locked" | "in_progress" | "passed" | undefined) ??
          (n === 1 ? "in_progress" : n < firstLocked ? "in_progress" : "locked");
        const rubric = rubrics[n as 1 | 2 | 3 | 4 | 5 | 6 | 7];
        const isLocked = status === "locked";
        const isPassed = status === "passed";
        const isActive = status === "in_progress";

        const accent = isLocked ? "neon-cyan/20" : isPassed ? "neon-cyan/60" : "neon-cyan";
        const progress = isPassed ? 100 : isActive ? 35 : 0;

        const body = (
          <motion.div
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={[
              "group relative border-l py-3 pl-6 backdrop-blur-sm transition-colors duration-300 cursor-crosshair",
              isLocked
                ? "border-neon-cyan/15 opacity-60"
                : isActive
                  ? "border-neon-cyan/60 bg-gradient-to-r from-neon-cyan/5 to-transparent hover:border-neon-cyan"
                  : "border-neon-cyan/40 hover:border-neon-cyan hover:bg-neon-cyan/5",
            ].join(" ")}
          >
            {/* Anchor dot on the left border */}
            <div
              className={[
                "absolute -left-[5px] top-1/2 -translate-y-1/2 h-[9px] w-[9px] rounded-full border bg-deep-blue transition-all",
                isLocked
                  ? "border-neon-cyan/30"
                  : isPassed
                    ? "border-neon-cyan bg-neon-cyan shadow-cyber-glow"
                    : "border-neon-cyan group-hover:bg-neon-cyan group-hover:shadow-cyber-glow",
              ].join(" ")}
            />

            <div className="flex items-baseline justify-between gap-3">
              <h3
                className={[
                  "font-serif italic text-2xl leading-tight transition-colors",
                  isLocked
                    ? "text-neon-cyan/30"
                    : isPassed
                      ? "text-white"
                      : "text-white group-hover:text-neon-cyan",
                ].join(" ")}
              >
                {rubric.title}
              </h3>
              <span className="rounded border border-neon-cyan/20 bg-neon-cyan/10 px-2 py-0.5 font-mono text-[10px] tracking-widest text-neon-cyan/80">
                {`0${n}`.slice(-2)}
              </span>
            </div>

            <p className="mt-1 font-mono text-[11px] text-neon-cyan/55">
              {rubric.blurb}
            </p>

            <div className="mt-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-widest">
              <span className="text-neon-cyan/60">Signal</span>
              <span
                className={[
                  "font-bold",
                  isPassed
                    ? "text-white text-glow-white"
                    : isActive
                      ? "text-neon-cyan text-glow"
                      : "text-neon-cyan/40",
                ].join(" ")}
              >
                {STATUS_TEXT[status]}
              </span>
            </div>

            {/* Progress bar */}
            <div className="mt-2 h-[3px] w-full overflow-hidden rounded-sm bg-neon-cyan/15">
              <div
                className={[
                  "relative h-full transition-all duration-500",
                  isPassed ? "bg-neon-cyan" : isActive ? "bg-neon-cyan" : "bg-neon-cyan/0",
                ].join(" ")}
                style={{ width: `${progress}%` }}
              >
                {isActive && (
                  <div className="absolute top-0 right-0 h-full w-8 bg-white/60 animate-pulse-fast" />
                )}
              </div>
            </div>
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
