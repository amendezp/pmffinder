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
    <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,460px)]">
      <section className="fade-in-up" style={{ animationDelay: "0.1s" }}>
        <h2 className="mb-6 flex items-center gap-3 text-[11px] uppercase tracking-widest text-zen-light">
          <span>The Waypoints</span>
          <div className="h-px flex-1 bg-zen-line" />
        </h2>
        <JourneyMap
          projectId="try"
          stages={stagesArr}
          hrefForStage={(n) => `/try/stage/${n}`}
        />

        {allPassed && (
          <div className="mt-8 rounded-sm border border-zen-text/30 bg-white px-5 py-4">
            <h3 className="mb-1 font-serif text-xl text-zen-text">
              All seven waypoints reached.
            </h3>
            <p className="mb-3 text-sm text-zen-accent">
              Sign in to synthesize and export your Sequoia-style 2-pager memo. Your
              demo progress will be imported into a new project.
            </p>
            <Link
              href="/sign-in"
              className="inline-block rounded-sm border border-zen-text bg-zen-text px-5 py-2.5 text-xs uppercase tracking-widest text-zen-bg transition hover:bg-zen-deep"
            >
              Sign in to export memo
            </Link>
          </div>
        )}

        {mounted && Object.keys(state?.stages ?? {}).length > 0 && (
          <button
            type="button"
            onClick={resetDemo}
            className="mt-8 text-[10px] uppercase tracking-widest text-zen-light underline-offset-4 hover:text-zen-text hover:underline"
          >
            Reset demo progress
          </button>
        )}
      </section>

      <aside
        className="flex justify-center lg:sticky lg:top-8 fade-in-up"
        style={{ animationDelay: "0.15s" }}
      >
        <Compass
          activeStage={active}
          passedStages={passed}
          size={440}
          decorative
        />
      </aside>
    </div>
  );
}
