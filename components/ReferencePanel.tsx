"use client";

import { useState } from "react";
import type { ReferenceQuestions } from "@/lib/rubrics";

interface ReferencePanelProps {
  /** Customer-development question banks for this stage. */
  questions: ReferenceQuestions;
  /** Header label, e.g. "Concept-test questions". */
  title?: string;
  /** Optional one-line attribution, e.g. "Adapted from Unusual Ventures". */
  attribution?: string;
}

/**
 * Collapsible "question bank" panel for the stage page sidebar. Click a
 * question to copy it. Useful for users running their own interviews.
 */
export function ReferencePanel({
  questions,
  title = "Reference questions",
  attribution,
}: ReferencePanelProps) {
  const [open, setOpen] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  async function copy(q: string) {
    try {
      await navigator.clipboard.writeText(q);
      setCopied(q);
      setTimeout(() => setCopied((curr) => (curr === q ? null : curr)), 1200);
    } catch {
      // Clipboard might be blocked — silently swallow.
    }
  }

  return (
    <div className="border-l border-neon-cyan/40 bg-neon-cyan/[0.03] p-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-neon-cyan/80">
            {title}
          </div>
          <h3 className="mt-1 font-serif text-2xl italic text-white">
            Interview question bank
          </h3>
          {attribution && (
            <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-neon-cyan/50">
              {attribution}
            </p>
          )}
        </div>
        <span className="font-mono text-xs text-neon-cyan/70">
          {open ? "Hide" : "Show"}
        </span>
      </button>

      {open && (
        <div className="mt-4 space-y-4">
          <p className="font-mono text-[11px] leading-relaxed text-white/60">
            Use these verbatim in conversations. <em>Attempt to sell, do not ask.</em>{" "}
            Click a question to copy it.
          </p>
          {questions.map((group) => (
            <div key={group.category}>
              <h4 className="mb-2 font-mono text-[10px] uppercase tracking-widest text-neon-cyan">
                {group.category}
              </h4>
              <ul className="space-y-1.5">
                {group.questions.map((q) => (
                  <li key={q}>
                    <button
                      type="button"
                      onClick={() => copy(q)}
                      className="group block w-full text-left font-mono text-xs leading-snug text-white/80 transition-colors hover:text-neon-cyan"
                      title="Click to copy"
                    >
                      <span className="mr-2 text-neon-cyan/40 group-hover:text-neon-cyan">
                        ›
                      </span>
                      {q}
                      {copied === q && (
                        <span className="ml-2 font-mono text-[9px] uppercase tracking-widest text-neon-green">
                          copied
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
