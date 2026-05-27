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
    <main className="relative mx-auto max-w-5xl px-6 py-10">
      <header className="mb-6">
        <Link
          href="/try"
          className="text-xs text-ink-700/80 underline-offset-4 hover:underline"
        >
          ← Back to journey
        </Link>
        <div className="mt-1 flex items-baseline gap-3">
          <span className="rounded-full bg-compass-rose px-3 py-0.5 font-serif text-sm text-parchment-50">
            Stage {stageNumber}
          </span>
          <h1 className="font-display text-3xl text-ink-900">{rubric.title}</h1>
        </div>
        <p className="mt-2 max-w-2xl text-ink-700">{rubric.blurb}</p>
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
          <div className="rounded-md border border-ink-700/15 bg-parchment-50/60 p-4">
            <h3 className="font-serif text-lg text-ink-900">Evidence</h3>
            <p className="mt-1 text-sm text-ink-700/85">
              Screenshots, transcripts, and inline notes are available once you
              sign in. The grader can then verify your claims against the artifacts.
            </p>
            <Link
              href="/sign-in"
              className="mt-3 inline-block rounded-md bg-ink-700 px-3 py-1.5 text-xs text-parchment-50"
            >
              Sign in to unlock
            </Link>
          </div>
        </aside>
      </div>

      <GuestCoachingChat stageNumber={stageNumber} />
    </main>
  );
}
