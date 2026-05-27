"use client";

import { motion } from "framer-motion";
import type { RubricResult } from "@/lib/rubrics";

export function FeedbackPanel({ feedback }: { feedback: RubricResult }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={[
        "rounded-lg border-2 p-5",
        feedback.passed
          ? "border-brass-500/60 bg-parchment-100/80"
          : "border-compass-rose/50 bg-parchment-50/90",
      ].join(" ")}
    >
      <header className="mb-3 flex items-center justify-between">
        <h3 className="font-serif text-xl text-ink-900">
          {feedback.passed ? "Passed — onward" : "Not yet — revise and resubmit"}
        </h3>
        <span
          className={[
            "rounded-full px-3 py-0.5 text-xs uppercase tracking-wider",
            feedback.passed
              ? "bg-brass-500 text-parchment-50"
              : "bg-compass-rose text-parchment-50",
          ].join(" ")}
        >
          {feedback.passed ? "passed" : "in progress"}
        </span>
      </header>

      <p className="mb-4 whitespace-pre-wrap text-sm text-ink-800">
        {feedback.overall_feedback}
      </p>

      <div className="space-y-2">
        {feedback.criteria.map((c) => (
          <div
            key={c.id}
            className={[
              "rounded-md border px-3 py-2",
              c.met
                ? "border-brass-500/40 bg-parchment-50/80"
                : "border-compass-rose/40 bg-parchment-50/60",
            ].join(" ")}
          >
            <div className="flex items-center gap-2">
              <span
                className={[
                  "inline-flex h-5 w-5 items-center justify-center rounded-full text-xs",
                  c.met
                    ? "bg-brass-500 text-parchment-50"
                    : "bg-compass-rose text-parchment-50",
                ].join(" ")}
              >
                {c.met ? "✓" : "·"}
              </span>
              <span className="font-serif text-base text-ink-900">{c.name}</span>
            </div>
            <p className="mt-1 whitespace-pre-wrap pl-7 text-sm text-ink-700">{c.feedback}</p>
          </div>
        ))}
      </div>

      {!feedback.passed && feedback.suggested_revisions.length > 0 && (
        <div className="mt-4 border-t border-ink-700/15 pt-3">
          <h4 className="mb-2 font-serif text-base text-ink-900">Suggested next steps</h4>
          <ul className="ml-5 list-disc space-y-1 text-sm text-ink-700">
            {feedback.suggested_revisions.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      )}
    </motion.section>
  );
}
