"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MemoTemplate } from "@/components/MemoTemplate";
import type { MemoContent } from "@/lib/memo/template";
import type { SectionStatus } from "@/lib/memo/draftFromStages";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="border border-neon-cyan bg-neon-cyan/10 px-4 py-2 font-mono text-xs uppercase tracking-widest text-neon-cyan hover:bg-neon-cyan hover:text-deep-blue"
    >
      Print / Save as PDF
    </button>
  );
}

/**
 * Toggle between the AI-polished memo and the live draft built from the
 * user's stage responses. Both render via the same MemoTemplate component.
 */
export function PolishedOrDraft({
  polishedContent,
  draftContent,
  draftStatuses,
  projectName,
}: {
  polishedContent: MemoContent;
  draftContent: MemoContent;
  draftStatuses: Record<string, SectionStatus>;
  projectName: string;
}) {
  const [showDraft, setShowDraft] = useState(false);

  return (
    <>
      <div className="mb-3 flex items-center justify-end gap-2 font-mono text-[10px] uppercase tracking-widest no-print">
        <button
          type="button"
          onClick={() => setShowDraft(false)}
          className={[
            "border px-3 py-1.5 transition-colors",
            !showDraft
              ? "border-neon-cyan bg-neon-cyan/15 text-neon-cyan"
              : "border-neon-cyan/25 text-neon-cyan/60 hover:text-neon-cyan",
          ].join(" ")}
        >
          Polished
        </button>
        <button
          type="button"
          onClick={() => setShowDraft(true)}
          className={[
            "border px-3 py-1.5 transition-colors",
            showDraft
              ? "border-neon-cyan bg-neon-cyan/15 text-neon-cyan"
              : "border-neon-cyan/25 text-neon-cyan/60 hover:text-neon-cyan",
          ].join(" ")}
        >
          Draft
        </button>
      </div>
      <MemoTemplate
        content={showDraft ? draftContent : polishedContent}
        projectName={projectName}
        sectionStatuses={showDraft ? draftStatuses : undefined}
      />
    </>
  );
}

/**
 * Top controls bar. Print + Polish-with-AI. The polish form expands inline
 * for the few founder-only fields (company name, one-liner, team, ask).
 */
export function MemoControls({
  projectId,
  defaultName,
  hasPolished,
  polishedGeneratedAt,
  draftedCount,
  totalCount,
}: {
  projectId: string;
  defaultName: string;
  hasPolished: boolean;
  polishedGeneratedAt: string | null;
  draftedCount: number;
  totalCount: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [companyName, setCompanyName] = useState(defaultName);
  const [oneLiner, setOneLiner] = useState("");
  const [team, setTeam] = useState("");
  const [ask, setAsk] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function polish() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/generate-memo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, companyName, oneLiner, team, ask }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to polish");
      router.refresh();
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mb-6 border border-neon-cyan/20 bg-neon-cyan/[0.03] p-4 no-print">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="font-mono text-xs text-white/75">
          {hasPolished ? (
            <>
              <span className="uppercase tracking-widest text-neon-cyan/80">
                Last polished
              </span>
              <span className="ml-2 text-white">
                {polishedGeneratedAt &&
                  new Date(polishedGeneratedAt).toLocaleString()}
              </span>
            </>
          ) : draftedCount === 0 ? (
            <span>
              Start filling in stages — sections will populate here as you go.
            </span>
          ) : (
            <span>
              Draft mode: {draftedCount} of {totalCount} sections filling in as
              you pass stages. Polish anytime with AI.
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <PrintButton />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="border border-neon-cyan bg-neon-cyan/15 px-4 py-2 font-mono text-xs uppercase tracking-widest text-neon-cyan shadow-cyber-glow hover:bg-neon-cyan hover:text-deep-blue"
          >
            {hasPolished ? "Re-polish with AI" : "Polish with AI →"}
          </button>
        </div>
      </div>

      {open && (
        <div className="mt-4 border-t border-neon-cyan/20 pt-4">
          <p className="mb-3 font-mono text-xs text-white/70">
            Two founder-only fields (the rest comes from your stages):
          </p>
          <div className="grid gap-3">
            <label className="block">
              <span className="block font-mono text-[10px] uppercase tracking-widest text-neon-cyan/70">
                Company name
              </span>
              <input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="mt-1 w-full border border-neon-cyan/25 bg-neon-cyan/5 px-3 py-2 font-mono text-sm text-white"
              />
            </label>
            <label className="block">
              <span className="block font-mono text-[10px] uppercase tracking-widest text-neon-cyan/70">
                One-liner / company purpose
              </span>
              <input
                value={oneLiner}
                onChange={(e) => setOneLiner(e.target.value)}
                placeholder="A single sentence on why this company exists."
                className="mt-1 w-full border border-neon-cyan/25 bg-neon-cyan/5 px-3 py-2 font-mono text-sm text-white placeholder:text-neon-cyan/40"
              />
            </label>
            <label className="block">
              <span className="block font-mono text-[10px] uppercase tracking-widest text-neon-cyan/70">
                Team
              </span>
              <textarea
                value={team}
                onChange={(e) => setTeam(e.target.value)}
                placeholder="Founders, key hires, why this team can build this."
                rows={3}
                className="mt-1 w-full border border-neon-cyan/25 bg-neon-cyan/5 px-3 py-2 font-mono text-sm text-white placeholder:text-neon-cyan/40"
              />
            </label>
            <label className="block">
              <span className="block font-mono text-[10px] uppercase tracking-widest text-neon-cyan/70">
                The ask
              </span>
              <textarea
                value={ask}
                onChange={(e) => setAsk(e.target.value)}
                placeholder="What you're raising and what milestones it gets you to."
                rows={2}
                className="mt-1 w-full border border-neon-cyan/25 bg-neon-cyan/5 px-3 py-2 font-mono text-sm text-white placeholder:text-neon-cyan/40"
              />
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={polish}
                disabled={busy || !companyName.trim()}
                className="border border-neon-cyan bg-neon-cyan/15 px-5 py-2 font-mono text-xs uppercase tracking-widest text-neon-cyan shadow-cyber-glow hover:bg-neon-cyan hover:text-deep-blue disabled:opacity-60"
              >
                {busy ? "Polishing…" : "Run synthesis"}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="font-mono text-[10px] uppercase tracking-widest text-neon-cyan/60 hover:text-white"
              >
                Cancel
              </button>
              {error && (
                <span className="font-mono text-xs text-neon-pink">{error}</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
