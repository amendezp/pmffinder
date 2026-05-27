"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { RubricResult } from "@/lib/rubrics";

interface FeedbackPanelProps {
  feedback: RubricResult;
  /** Render a "Continue to Stage N+1 →" CTA when passed. */
  nextStageHref?: string;
  nextStageNumber?: number;
}

export function FeedbackPanel({
  feedback,
  nextStageHref,
  nextStageNumber,
}: FeedbackPanelProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={[
        "border-l p-5 backdrop-blur-sm",
        feedback.passed
          ? "border-neon-cyan bg-gradient-to-r from-neon-cyan/10 to-transparent"
          : "border-neon-pink bg-gradient-to-r from-neon-pink/10 to-transparent",
      ].join(" ")}
    >
      <header className="mb-3 flex items-center justify-between">
        <h3
          className={[
            "font-serif text-2xl italic",
            feedback.passed ? "text-white text-glow" : "text-white text-glow-pink",
          ].join(" ")}
        >
          {feedback.passed ? "Stage passed." : "Not yet — keep going."}
        </h3>
        <span
          className={[
            "border px-3 py-0.5 font-mono text-[10px] uppercase tracking-widest",
            feedback.passed
              ? "border-neon-cyan/40 bg-neon-cyan/10 text-neon-cyan"
              : "border-neon-pink/40 bg-neon-pink/10 text-neon-pink",
          ].join(" ")}
        >
          {feedback.passed ? "Passed" : "Try again"}
        </span>
      </header>

      <p className="mb-4 whitespace-pre-wrap font-mono text-sm text-white/85">
        {feedback.overall_feedback}
      </p>

      <div className="space-y-2">
        {feedback.criteria.map((c) => (
          <div
            key={c.id}
            className={[
              "border-l px-3 py-2",
              c.met
                ? "border-neon-cyan/40 bg-neon-cyan/5"
                : "border-neon-pink/40 bg-neon-pink/5",
            ].join(" ")}
          >
            <div className="flex items-center gap-2">
              <span
                className={[
                  "inline-flex h-4 w-4 items-center justify-center border font-mono text-[9px]",
                  c.met
                    ? "border-neon-cyan bg-neon-cyan/20 text-neon-cyan"
                    : "border-neon-pink bg-neon-pink/20 text-neon-pink",
                ].join(" ")}
              >
                {c.met ? "✓" : "!"}
              </span>
              <span className="font-mono text-xs uppercase tracking-widest text-white">
                {c.name}
              </span>
            </div>
            <p className="mt-1 whitespace-pre-wrap pl-6 font-mono text-xs text-white/70">
              {c.feedback}
            </p>
          </div>
        ))}
      </div>

      {!feedback.passed && feedback.suggested_revisions.length > 0 && (
        <div className="mt-4 border-t border-neon-cyan/15 pt-3">
          <h4 className="mb-2 font-mono text-[10px] uppercase tracking-widest text-neon-cyan/80">
            What to fix
          </h4>
          <ul className="ml-5 list-disc space-y-1 font-mono text-xs text-white/80">
            {feedback.suggested_revisions.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      )}

      {feedback.passed && nextStageHref && nextStageNumber && nextStageNumber <= 9 && (
        <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-neon-cyan/15 pt-4">
          <Link
            href={nextStageHref}
            className="border border-neon-cyan bg-neon-cyan/15 px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-neon-cyan shadow-cyber-glow transition hover:bg-neon-cyan hover:text-deep-blue"
          >
            Continue to stage {nextStageNumber} →
          </Link>
          <span className="font-mono text-[10px] uppercase tracking-widest text-neon-cyan/60">
            {nextStageNumber === 10
              ? "You're done — generate your memo"
              : `${9 - nextStageNumber + 1} stages to go`}
          </span>
        </div>
      )}

      {feedback.passed && (!nextStageHref || (nextStageNumber ?? 10) > 9) && (
        <div className="mt-5 border-t border-neon-cyan/15 pt-4 font-mono text-xs text-neon-cyan">
          All nine stages passed. Time to generate your memo.
        </div>
      )}
    </motion.section>
  );
}
