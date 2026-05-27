"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getRubric, type RubricResult } from "@/lib/rubrics";
import { StageForm } from "./StageForm";
import { GuestBanner } from "./GuestBanner";
import { GuestCoachingChat } from "./GuestCoachingChat";
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
  const [gateOk, setGateOk] = useState(true);

  useEffect(() => {
    setMounted(true);
    const state = readGuestState();
    setStageState(state.stages[stageNumber] ?? null);

    // Enforce client-side gating — all prior stages must be passed.
    if (stageNumber > 1) {
      for (let i = 1; i < stageNumber; i++) {
        if (state.stages[i]?.status !== "passed") {
          setGateOk(false);
          return;
        }
      }
    }
  }, [stageNumber]);

  if (!mounted) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-10">
        <p className="text-ink-700/70">Loading…</p>
      </main>
    );
  }

  if (!gateOk) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-16 text-center">
        <Link href="/try" className="text-xs text-ink-700/80 underline">
          ← Back to journey
        </Link>
        <h1 className="mt-4 font-display text-3xl text-ink-900">Stage locked</h1>
        <p className="mt-2 text-ink-700">
          Pass the earlier stages first. Go back to the journey to see where you are.
        </p>
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

  return (
    <main className="relative mx-auto min-h-screen max-w-5xl px-6 py-10 md:px-12">
      <header className="relative mb-10">
        <div className="mb-3 flex items-center gap-4 font-mono text-xs uppercase tracking-widest opacity-80">
          <div className="h-2 w-2 animate-pulse bg-neon-cyan" />
          <Link href="/try" className="hover:text-neon-cyan">
            ← Back to scan
          </Link>
          <div className="hud-line-decorator h-px flex-1 opacity-50" />
          <span className="text-white/70">
            TGT_{`0${stageNumber}`.slice(-2)} / 07 · DEMO
          </span>
        </div>
        <div className="relative">
          <div className="absolute -left-8 top-0 bottom-0 w-[2px] bg-gradient-to-b from-neon-cyan/0 via-neon-cyan to-neon-cyan/0" />
          <h2 className="mb-1 font-mono text-sm text-white/70">Waypoint:</h2>
          <h1 className="font-serif text-4xl italic text-white text-glow-white md:text-5xl">
            {rubric.title}
          </h1>
        </div>
        <p className="mt-3 max-w-2xl font-mono text-sm leading-relaxed text-white/70">
          {rubric.blurb}
        </p>
      </header>

      <div className="mb-6">
        <GuestBanner context="Demo mode — your progress lives in this browser. Sign in to upload screenshots/transcripts and save your journey." />
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,320px)]">
        <section>
          <StageForm
            rubric={rubric}
            initialResponses={stageState?.responses ?? {}}
            initialFeedback={stageState?.last_feedback ?? null}
            alreadyPassed={stageState?.status === "passed"}
            onGrade={onGrade}
            onSaveResponses={onSaveResponses}
          />
        </section>

        <aside>
          <div className="border-l border-neon-pink/40 bg-neon-pink/5 p-4">
            <div className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-neon-pink">
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-neon-pink" />
              Evidence // Locked
            </div>
            <h3 className="font-serif text-2xl italic text-white">Artifacts</h3>
            <p className="mt-2 font-mono text-xs leading-relaxed text-white/70">
              Screenshots, transcripts, and inline notes unlock once you
              authenticate. The grader uses them to verify claims.
            </p>
            <Link
              href="/sign-in"
              className="mt-4 inline-block border border-neon-cyan bg-neon-cyan/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-neon-cyan hover:bg-neon-cyan hover:text-deep-blue"
            >
              Authenticate to unlock →
            </Link>
          </div>
        </aside>
      </div>

      <GuestCoachingChat stageNumber={stageNumber} />
    </main>
  );
}
