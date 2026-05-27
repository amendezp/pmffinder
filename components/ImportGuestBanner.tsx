"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  readGuestState,
  guestHasProgress,
  clearGuestState,
} from "@/lib/guest-storage";

export function ImportGuestBanner() {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projectName, setProjectName] = useState("My PMF journey");

  useEffect(() => {
    if (guestHasProgress()) setShow(true);
  }, []);

  if (!show) return null;

  async function importNow() {
    setBusy(true);
    setError(null);
    try {
      const state = readGuestState();
      const res = await fetch("/api/import-guest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectName, stages: state.stages }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Import failed");
      clearGuestState();
      router.push(`/projects/${json.projectId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setBusy(false);
    }
  }

  function dismiss() {
    setShow(false);
  }

  function discard() {
    if (!confirm("Discard your demo progress? This can't be undone.")) return;
    clearGuestState();
    setShow(false);
  }

  return (
    <div className="mb-8 border-l border-neon-cyan bg-gradient-to-r from-neon-cyan/10 to-transparent p-5">
      <div className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-neon-cyan">
        <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-neon-cyan" />
        Demo progress found
      </div>
      <h3 className="font-serif text-2xl italic text-white">
        Want to keep your demo journey?
      </h3>
      <p className="mt-1 font-mono text-sm text-white/75">
        We saved your demo in this browser. Bring it in as a new project and
        pick up where you left off.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <input
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="Project name"
          className="border border-neon-cyan/30 bg-deep-blue/40 px-3 py-1.5 font-mono text-sm text-white placeholder:text-neon-cyan/40 focus:border-neon-cyan focus:outline-none"
        />
        <button
          type="button"
          onClick={importNow}
          disabled={busy || !projectName.trim()}
          className="border border-neon-cyan bg-neon-cyan/15 px-3 py-1.5 font-mono text-xs uppercase tracking-widest text-neon-cyan hover:bg-neon-cyan hover:text-deep-blue disabled:opacity-60"
        >
          {busy ? "Importing…" : "Import as new project"}
        </button>
        <button
          type="button"
          onClick={discard}
          className="border border-neon-pink/30 px-3 py-1.5 font-mono text-xs uppercase tracking-widest text-neon-pink/80 hover:text-neon-pink"
        >
          Discard
        </button>
        <button
          type="button"
          onClick={dismiss}
          className="font-mono text-[10px] uppercase tracking-widest text-neon-cyan/60 hover:text-white"
        >
          Not now
        </button>
      </div>
      {error && (
        <p className="mt-2 font-mono text-xs text-neon-pink">{error}</p>
      )}
    </div>
  );
}
