"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-md bg-ink-700 px-4 py-2 text-sm font-serif text-parchment-50 hover:bg-ink-600"
    >
      Print / Save as PDF
    </button>
  );
}

export function MemoBuilderForm({
  projectId,
  defaultName,
  regenerate = false,
}: {
  projectId: string;
  defaultName: string;
  regenerate?: boolean;
}) {
  const router = useRouter();
  const [companyName, setCompanyName] = useState(defaultName);
  const [oneLiner, setOneLiner] = useState("");
  const [team, setTeam] = useState("");
  const [ask, setAsk] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/generate-memo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, companyName, oneLiner, team, ask }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to generate memo");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="space-y-4 rounded-md border border-ink-700/20 bg-parchment-100/70 p-5"
    >
      <h2 className="font-serif text-xl text-ink-900">
        {regenerate ? "Regenerate memo" : "Build your 2-pager memo"}
      </h2>
      <p className="text-sm text-ink-700/85">
        Most of the memo is synthesized from your seven stages. Just add the few
        founder-specific fields below.
      </p>

      <label className="block">
        <span className="block font-serif text-sm text-ink-900">Company name</span>
        <input
          required
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          className="mt-1 w-full rounded-md border border-ink-700/25 bg-parchment-50 px-3 py-2"
        />
      </label>

      <label className="block">
        <span className="block font-serif text-sm text-ink-900">
          One-liner / company purpose
        </span>
        <input
          required
          value={oneLiner}
          onChange={(e) => setOneLiner(e.target.value)}
          placeholder="A single sentence on why this company exists."
          className="mt-1 w-full rounded-md border border-ink-700/25 bg-parchment-50 px-3 py-2"
        />
      </label>

      <label className="block">
        <span className="block font-serif text-sm text-ink-900">Team</span>
        <textarea
          value={team}
          onChange={(e) => setTeam(e.target.value)}
          placeholder="Founders, key hires, why this team can build this. Keep it tight."
          rows={3}
          className="mt-1 w-full rounded-md border border-ink-700/25 bg-parchment-50 px-3 py-2"
        />
      </label>

      <label className="block">
        <span className="block font-serif text-sm text-ink-900">The ask</span>
        <textarea
          value={ask}
          onChange={(e) => setAsk(e.target.value)}
          placeholder="What you're raising, what milestones it gets you to."
          rows={2}
          className="mt-1 w-full rounded-md border border-ink-700/25 bg-parchment-50 px-3 py-2"
        />
      </label>

      {error && <p className="text-sm text-compass-rose">{error}</p>}

      <button
        type="submit"
        disabled={busy}
        className="rounded-md bg-compass-rose px-5 py-2.5 font-serif text-parchment-50 shadow-compass hover:bg-compass-rose/90 disabled:opacity-60"
      >
        {busy ? "Synthesizing…" : regenerate ? "Regenerate" : "Synthesize memo"}
      </button>
    </form>
  );
}
