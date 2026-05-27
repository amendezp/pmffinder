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
    <div className="mb-6 rounded-md border border-brass-500/50 bg-parchment-100/90 p-4">
      <h3 className="font-serif text-lg text-ink-900">Import your demo progress</h3>
      <p className="mt-1 text-sm text-ink-700/85">
        We saved your demo journey in this browser. Want to bring it in as a new
        project? You can keep going from where you left off.
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <input
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="Project name"
          className="rounded-md border border-ink-700/25 bg-parchment-50 px-3 py-1.5 text-sm"
        />
        <button
          type="button"
          onClick={importNow}
          disabled={busy || !projectName.trim()}
          className="rounded-md bg-compass-rose px-3 py-1.5 text-sm font-serif text-parchment-50 hover:bg-compass-rose/90 disabled:opacity-60"
        >
          {busy ? "Importing…" : "Import as new project"}
        </button>
        <button
          type="button"
          onClick={discard}
          className="rounded-md border border-ink-700/30 px-3 py-1.5 text-sm text-ink-700 hover:bg-parchment-50"
        >
          Discard
        </button>
        <button
          type="button"
          onClick={dismiss}
          className="text-xs text-ink-700/70 underline-offset-4 hover:underline"
        >
          Not now
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-compass-rose">{error}</p>}
    </div>
  );
}
