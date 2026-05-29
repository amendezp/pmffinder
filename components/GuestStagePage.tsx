"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getRubric, type RubricResult } from "@/lib/rubrics";
import { StageForm } from "./StageForm";
import { GuestBanner } from "./GuestBanner";
import { GuestCoachingChat } from "./GuestCoachingChat";
import { StageStepper } from "./StageStepper";
import { ReferencePanel } from "./ReferencePanel";
import { buildDraftMemo } from "@/lib/memo/draftFromStages";
import {
  readGuestState,
  setStage,
  type GuestStageState,
} from "@/lib/guest-storage";

export function GuestStagePage({ stageNumber }: { stageNumber: number }) {
  const router = useRouter();
  const rubric = getRubric(stageNumber);

  const [mounted, setMounted] = useState(false);
  const [stageState, setStageState] = useState<GuestStageState | null>(null);
  const [allStages, setAllStages] = useState<
    Array<{ stage_number: number; status: "locked" | "in_progress" | "passed" }>
  >([]);

  useEffect(() => {
    setMounted(true);
    const state = readGuestState();
    setStageState(state.stages[stageNumber] ?? null);

    // Build the stepper view from local state. All stages are accessible —
    // the only states that matter are "passed" vs "not passed".
    const sArr: Array<{ stage_number: number; status: "locked" | "in_progress" | "passed" }> = [];
    for (let i = 1; i <= 7; i++) {
      const s = state.stages[i];
      sArr.push({
        stage_number: i,
        status: s?.status === "passed" ? "passed" : "in_progress",
      });
    }
    setAllStages(sArr);
  }, [stageNumber]);

  if (!mounted) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-10">
        <p className="font-mono text-sm text-white/70">Loading…</p>
      </main>
    );
  }

  async function onGrade(responses: Record<string, string>): Promise<RubricResult> {
    const res = await fetch("/api/grade-stage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        stageNumber,
        responses,
        priorFeedback: stageState?.last_feedback ?? undefined,
      }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed to grade.");
    return json.result as RubricResult;
  }

  function onSaveResponses(
    responses: Record<string, string>,
    feedback: RubricResult
  ) {
    const next: GuestStageState = {
      status: feedback.passed ? "passed" : "in_progress",
      responses,
      last_feedback: feedback,
      attempts: (stageState?.attempts ?? 0) + 1,
    };
    setStage(stageNumber, next);
    setStageState(next);
    if (feedback.passed) {
      // Nudge the journey map to refresh next time the user goes back.
      router.refresh();
    }
  }

  const nextN = stageNumber + 1;
  const nextHref = nextN <= 7 ? `/try/stage/${nextN}` : "/try";

  // Build a draft memo for the breadcrumb chip.
  const memoDraft = mounted
    ? buildDraftMemo({
        stageResponses: Object.fromEntries(
          allStages.map((s) => {
            const local = readGuestState().stages[s.stage_number];
            return [s.stage_number, local?.responses ?? {}];
          })
        ),
        stagePassed: Object.fromEntries(
          allStages.map((s) => [s.stage_number, s.status === "passed"])
        ),
        companyName: "Demo memo",
      })
    : null;

  return (
    <main className="relative mx-auto min-h-screen max-w-5xl px-6 py-10 md:px-12">
      <header className="relative mb-8">
        <div className="mb-3 flex items-center gap-4 font-mono text-xs uppercase tracking-widest text-neon-cyan/80">
          <div className="h-2 w-2 animate-pulse bg-neon-cyan" />
          <Link href="/try" className="hover:text-neon-cyan">
            ← Your journey
          </Link>
          <div className="hud-line-decorator h-px flex-1 opacity-50" />
          {memoDraft && (
            <Link
              href="/try/memo"
              className="border border-neon-cyan/30 bg-neon-cyan/[0.03] px-3 py-1 normal-case text-neon-cyan/85 hover:border-neon-cyan/70 hover:text-neon-cyan"
              title="View your investment memo"
            >
              Memo · {memoDraft.counts.drafted}/{memoDraft.counts.total} →
            </Link>
          )}
        </div>
        <div className="relative">
          <div className="absolute -left-8 top-0 bottom-0 w-[2px] bg-gradient-to-b from-neon-cyan/0 via-neon-cyan to-neon-cyan/0" />
          <h2 className="mb-1 font-mono text-sm uppercase tracking-widest text-neon-cyan/70">
            Stage {stageNumber} of 7 · Demo
          </h2>
          <h1 className="font-serif text-4xl italic text-white text-glow-white md:text-5xl">
            {rubric.title}
          </h1>
        </div>
        <p className="mt-3 max-w-2xl font-mono text-sm leading-relaxed text-white/70">
          {rubric.blurb}
        </p>
      </header>

      {allStages.length > 0 && (
        <div className="mb-8">
          <StageStepper
            stages={allStages}
            currentStage={stageNumber}
            hrefBase="/try/stage"
          />
        </div>
      )}

      <div className="mb-6">
        <GuestBanner context="Demo mode — your progress lives in this browser. Sign in to upload screenshots/transcripts and save your journey." />
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,320px)]">
        <section>
          <StageForm
            fields={rubric.fields}
            initialResponses={stageState?.responses ?? {}}
            initialFeedback={stageState?.last_feedback ?? null}
            alreadyPassed={stageState?.status === "passed"}
            onGrade={onGrade}
            onSaveResponses={onSaveResponses}
            nextStageHref={nextHref}
            nextStageNumber={nextN <= 7 ? nextN : 8}
          />
        </section>

        <aside className="space-y-6">
          {rubric.referenceQuestions && (
            <ReferencePanel
              questions={rubric.referenceQuestions}
              title={`Stage ${stageNumber} · Question bank`}
              attribution="Adapted from Unusual Ventures' customer development framework."
            />
          )}
          <div className="border-l border-neon-pink/40 bg-neon-pink/5 p-4">
            <div className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-neon-pink">
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-neon-pink" />
              Sign in to unlock
            </div>
            <h3 className="font-serif text-2xl italic text-white">Evidence</h3>
            <p className="mt-2 font-mono text-xs leading-relaxed text-white/70">
              Screenshots, transcripts, and inline notes unlock when you sign in.
              The grader uses them to check your claims.
            </p>
            <Link
              href="/sign-in"
              className="mt-4 inline-block border border-neon-cyan bg-neon-cyan/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-neon-cyan hover:bg-neon-cyan hover:text-deep-blue"
            >
              Sign in to unlock →
            </Link>
          </div>
        </aside>
      </div>

      <GuestCoachingChat stageNumber={stageNumber} />
    </main>
  );
}
