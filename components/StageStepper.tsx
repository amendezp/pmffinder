"use client";

import Link from "next/link";
import { rubrics } from "@/lib/rubrics";

interface StageStepperProps {
  stages: Array<{ stage_number: number; status: "locked" | "in_progress" | "passed" }>;
  currentStage?: number;
  /**
   * Base path; each stage links to `${hrefBase}/${stageNumber}`. Use a string
   * so this prop can be passed from Server Components (functions can't cross
   * the boundary).
   */
  hrefBase?: string;
}

/**
 * Always-visible horizontal progression bar. Every node is clickable — passed
 * nodes are filled green, the current focus node has a pulsing cyan ring,
 * everything else is a muted cyan outline.
 */
export function StageStepper({
  stages,
  currentStage,
  hrefBase,
}: StageStepperProps) {
  const statusByStage = new Map<number, "locked" | "in_progress" | "passed">(
    stages.map((s) => [s.stage_number, s.status])
  );

  const passedCount = stages.filter((s) => s.status === "passed").length;

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-neon-cyan/70">
        <span>Your journey</span>
        <span className="text-white">
          {passedCount} of 7 passed
          {currentStage ? ` · on stage ${currentStage}` : ""}
        </span>
      </div>
      <ol className="flex w-full items-center">
        {Array.from({ length: 7 }).map((_, idx) => {
          const n = idx + 1;
          const status = statusByStage.get(n) ?? "locked";
          const rubric = rubrics[n as 1 | 2 | 3 | 4 | 5 | 6 | 7];
          const isCurrent = currentStage === n;
          const isPassed = status === "passed";

          const dot = (
            <div
              className={[
                "relative flex h-7 w-7 shrink-0 items-center justify-center border font-mono text-[10px] transition-all",
                isPassed
                  ? "border-neon-green bg-neon-green text-deep-blue shadow-cyber-green-glow"
                  : isCurrent
                    ? "border-neon-cyan bg-neon-cyan/15 text-white"
                    : "border-neon-cyan/40 bg-deep-blue text-neon-cyan/70 hover:border-neon-cyan hover:text-white",
              ].join(" ")}
              title={`Stage ${n}: ${rubric.title}`}
            >
              {isCurrent && !isPassed && (
                <span className="absolute inset-[-4px] animate-pulse-fast border border-neon-cyan/50" />
              )}
              {isPassed ? "✓" : n}
            </div>
          );

          const href = hrefBase ? `${hrefBase}/${n}` : null;

          return (
            <li
              key={n}
              className={[
                "flex flex-1 items-center",
                idx === 6 ? "flex-none" : "",
              ].join(" ")}
            >
              {href ? (
                <Link href={href} className="group">
                  {dot}
                </Link>
              ) : (
                dot
              )}
              {idx < 6 && (
                <div
                  className={[
                    "h-px flex-1",
                    isPassed ? "bg-neon-green/60" : "bg-neon-cyan/15",
                  ].join(" ")}
                />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
