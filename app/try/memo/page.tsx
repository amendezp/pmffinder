"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { readGuestState } from "@/lib/guest-storage";
import { buildDraftMemo, type DraftMemoResult } from "@/lib/memo/draftFromStages";
import { MemoTemplate } from "@/components/MemoTemplate";
import { GuestBanner } from "@/components/GuestBanner";

export default function GuestMemoPage() {
  const [mounted, setMounted] = useState(false);
  const [draft, setDraft] = useState<DraftMemoResult | null>(null);

  useEffect(() => {
    setMounted(true);
    const state = readGuestState();
    const stageResponses: Record<number, unknown> = {};
    const stagePassed: Record<number, boolean> = {};
    for (let i = 1; i <= 7; i++) {
      const s = state.stages[i];
      stageResponses[i] = s?.responses ?? {};
      stagePassed[i] = s?.status === "passed";
    }
    setDraft(
      buildDraftMemo({
        stageResponses,
        stagePassed,
        companyName: "Demo memo",
      })
    );
  }, []);

  if (!mounted || !draft) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-10">
        <p className="font-mono text-sm text-white/70">Loading…</p>
      </main>
    );
  }

  return (
    <main className="relative mx-auto min-h-screen max-w-5xl px-6 py-10 md:px-12">
      <header className="relative mb-6 no-print">
        <div className="mb-3 flex items-center gap-4 font-mono text-xs uppercase tracking-widest text-neon-cyan/80">
          <div className="h-2 w-2 animate-pulse bg-neon-cyan" />
          <Link href="/try" className="hover:text-neon-cyan">
            ← Your journey
          </Link>
          <div className="hud-line-decorator h-px flex-1 opacity-50" />
          <span className="text-white/70">
            Memo · {draft.counts.drafted}/{draft.counts.total} drafted · Demo
          </span>
        </div>
        <div className="relative">
          <div className="absolute -left-8 top-0 bottom-0 w-[2px] bg-gradient-to-b from-neon-cyan/0 via-neon-cyan to-neon-cyan/0" />
          <h2 className="mb-1 font-mono text-sm uppercase tracking-widest text-neon-cyan/70">
            Your investment memo (preview)
          </h2>
          <h1 className="font-serif text-4xl italic text-white text-glow-white md:text-5xl">
            Demo memo
          </h1>
        </div>
      </header>

      <div className="mb-6">
        <GuestBanner context="In demo mode, the memo lives in your browser. Sign in to save, share, and polish with AI." />
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border border-neon-cyan/20 bg-neon-cyan/[0.03] p-4 no-print">
        <div className="font-mono text-xs text-white/75">
          {draft.counts.drafted === 0 ? (
            <span>
              Start filling in stages — sections will populate here as you go.
            </span>
          ) : (
            <span>
              Draft mode: {draft.counts.drafted} of {draft.counts.total} sections
              filling in.
            </span>
          )}
        </div>
        <Link
          href="/sign-in"
          className="border border-neon-cyan bg-neon-cyan/15 px-4 py-2 font-mono text-xs uppercase tracking-widest text-neon-cyan shadow-cyber-glow hover:bg-neon-cyan hover:text-deep-blue"
        >
          Sign in to polish with AI →
        </Link>
      </div>

      <MemoTemplate
        content={draft.content}
        projectName="Demo memo"
        sectionStatuses={draft.sectionStatuses}
      />
    </main>
  );
}
