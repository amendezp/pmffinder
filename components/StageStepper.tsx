"use client";

import Link from "next/link";
import { rubrics } from "@/lib/rubrics";

interface StageStepperProps {
  stages: Array<{ stage_number: number; status: "locked" | "in_progress" | "passed" }>;
  currentStage?: number;
  hrefForStage?: (n: number) => string;
}

/**
 * Always-visible horizontal progression bar. Seven dots connected by hairline
 * segments — passed = solid cyan, current = pulsing cyan ring, locked = dim.
 * Hover/focus on a passed or current node reveals the stage title.
 */
export function StageStepper({
  stages,
  currentStage,
  hrefForStage,
}: StageStepperProps) {
  const statusByStage = new Map<number, "locked" | "in_progress" | "passed">(
    stages.map((s) => [s.stage_number, s.status])
  );

  // Default to fall-through: stage N defaults to locked unless the previous
  // stage is passed (which would make N in_progress).
  function statusFor(n: number) {
    const explicit = statusByStage.get(n);
    if (explicit) return explicit;
    if (n === 1) return "in_progress";
    const prev = statusByStage.get(n - 1);
    return prev === "passed" ? "in_progress" : "locked";
  }

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
          const status = statusFor(n);
          const rubric = rubrics[n as 1 | 2 | 3 | 4 | 5 | 6 | 7];
          const isCurrent = currentStage === n;
          const isPassed = status === "passed";
          const isLocked = status === "locked";

          const dot = (
            <div
              className={[
                "relative flex h-7 w-7 shrink-0 items-center justify-center border font-mono text-[10px] transition-all",
                isLocked
                  ? "border-neon-cyan/20 bg-deep-blue text-neon-cyan/40"
                  : isPassed
                    ? "border-neon-cyan bg-neon-cyan text-deep-blue shadow-cyber-glow"
                    : isCurrent
                      ? "border-neon-cyan bg-neon-cyan/15 text-white"
                      : "border-neon-cyan/60 bg-deep-blue text-neon-cyan",
              ].join(" ")}
            >
              {isCurrent && (
                <span className="absolute inset-[-4px] animate-pulse-fast border border-neon-cyan/50" />
              )}
              {isPassed ? "✓" : n}
            </div>
          );

          const href = hrefForStage ? hrefForStage(n) : null;
          const canLink = href && !isLocked;

          return (
            <li
              key={n}
              className={[
                "flex flex-1 items-center",
                idx === 6 ? "flex-none" : "",
              ].join(" ")}
              title={`Stage ${n}: ${rubric.title}`}
            >
              {canLink ? (
                <Link href={href!} className="group">
                  {dot}
                </Link>
              ) : (
                dot
              )}
              {idx < 6 && (
                <div
                  className={[
                    "h-px flex-1",
                    isPassed ? "bg-neon-cyan/70" : "bg-neon-cyan/15",
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
