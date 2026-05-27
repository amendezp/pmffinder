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
    <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,500px)]">
      <section className="fade-in-up" style={{ animationDelay: "0.1s" }}>
        <h2 className="mb-6 flex items-center gap-3 font-mono text-[10px] uppercase tracking-widest text-neon-cyan/60">
          <span>// Waypoints</span>
          <div className="h-px flex-1 bg-neon-cyan/20" />
        </h2>
        <JourneyMap
          projectId="try"
          stages={stagesArr}
          hrefForStage={(n) => `/try/stage/${n}`}
        />

        {allPassed && (
          <div className="mt-8 border-l border-neon-cyan bg-gradient-to-r from-neon-cyan/10 to-transparent px-5 py-4 shadow-cyber-glow">
            <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-neon-cyan">
              // All targets acquired
            </div>
            <h3 className="font-serif text-3xl italic text-white text-glow">
              Mission ready.
            </h3>
            <p className="mb-3 mt-2 font-mono text-sm text-white/75">
              Authenticate to synthesize and export your Sequoia-style 2-pager memo.
              Your demo progress will be imported as a new mission.
            </p>
            <Link
              href="/sign-in"
              className="inline-block border border-neon-cyan bg-neon-cyan/10 px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-neon-cyan transition hover:bg-neon-cyan hover:text-deep-blue"
            >
              Authenticate to export memo →
            </Link>
          </div>
        )}

        {mounted && Object.keys(state?.stages ?? {}).length > 0 && (
          <button
            type="button"
            onClick={resetDemo}
            className="mt-8 font-mono text-[10px] uppercase tracking-widest text-neon-cyan/50 hover:text-neon-pink"
          >
            // Reset demo scan
          </button>
        )}
      </section>

      <aside
        className="flex justify-center lg:sticky lg:top-8 fade-in-up"
        style={{ animationDelay: "0.15s" }}
      >
        <Compass activeStage={active} passedStages={passed} size={460} />
      </aside>
    </div>
  );
}
