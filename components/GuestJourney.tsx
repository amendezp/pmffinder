"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Compass } from "./Compass";
import { JourneyMap } from "./JourneyMap";
import {
  readGuestState,
  activeStageNumber,
  passedStages,
  clearGuestState,
} from "@/lib/guest-storage";

export function GuestJourney() {
  const [, setTick] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const onStorage = () => setTick((t) => t + 1);
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const state = mounted ? readGuestState() : null;
  const active = state ? activeStageNumber(state) : 1;
  const passed = state ? passedStages(state) : new Set<number>();

  const stagesArr = Array.from({ length: 7 }).map((_, i) => {
    const n = i + 1;
    const guestStage = state?.stages[n];
    const status: "locked" | "in_progress" | "passed" = guestStage?.status === "passed"
      ? "passed"
      : n === 1 || (state?.stages[n - 1]?.status === "passed")
        ? "in_progress"
        : "locked";
    return { stage_number: n, status };
  });

  const allPassed = passed.size === 7;

  function resetDemo() {
    if (!confirm("Reset your demo progress? This clears everything in this browser.")) return;
    clearGuestState();
    setTick((t) => t + 1);
  }

  return (
    <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)]">
      <section>
        <h2 className="mb-3 font-serif text-xl text-ink-900">The journey</h2>
        <JourneyMap
          projectId="try"
          stages={stagesArr}
          hrefForStage={(n) => `/try/stage/${n}`}
        />

        {allPassed && (
          <div className="mt-6 rounded-md border border-brass-500/50 bg-parchment-100/80 px-4 py-4">
            <h3 className="mb-1 font-serif text-lg text-ink-900">
              All seven stages passed.
            </h3>
            <p className="mb-3 text-sm text-ink-700">
              Sign in to synthesize and export your Sequoia-style 2-pager memo. Your
              demo progress will be imported into a new project.
            </p>
            <Link
              href="/sign-in"
              className="inline-block rounded-md bg-compass-rose px-4 py-2 font-serif text-parchment-50 shadow-compass hover:bg-compass-rose/90"
            >
              Sign in to export memo
            </Link>
          </div>
        )}

        {mounted && Object.keys(state?.stages ?? {}).length > 0 && (
          <button
            type="button"
            onClick={resetDemo}
            className="mt-6 text-xs text-ink-700/70 underline-offset-4 hover:underline"
          >
            Reset demo progress
          </button>
        )}
      </section>

      <aside className="flex justify-center lg:sticky lg:top-8">
        <Compass activeStage={active} passedStages={passed} />
      </aside>
    </div>
  );
}
