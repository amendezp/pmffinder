"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

export interface EvidenceItem {
  id: string;
  kind: "image" | "pdf" | "audio" | "note";
  caption: string | null;
  tag: string | null;
  body: string | null;
  storage_path: string | null;
}

interface EvidencePanelProps {
  projectId: string;
  stageNumber: number;
  items: EvidenceItem[];
  disabled?: boolean;
}

const TAGS = [
  "interview",
  "metric_screenshot",
  "transcript",
  "prior_attempt",
  "customer_quote",
  "other",
];

export function EvidencePanel({
  projectId,
  stageNumber,
  items,
  disabled,
}: EvidencePanelProps) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [tag, setTag] = useState("");
  const [noteBody, setNoteBody] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function uploadFile(file: File) {
    setUploading(true);
    setError(null);
    try {
      const kind = file.type.startsWith("image/")
        ? "image"
        : file.type === "application/pdf"
          ? "pdf"
          : file.type.startsWith("audio/")
            ? "audio"
            : "image";
      const fd = new FormData();
      fd.append("projectId", projectId);
      fd.append("stageNumber", String(stageNumber));
      fd.append("kind", kind);
      fd.append("file", file);
      if (caption) fd.append("caption", caption);
      if (tag) fd.append("tag", tag);
      const res = await fetch("/api/evidence/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Upload failed");
      setCaption("");
      setTag("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function addNote() {
    if (!noteBody.trim()) return;
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("projectId", projectId);
      fd.append("stageNumber", String(stageNumber));
      fd.append("kind", "note");
      fd.append("body", noteBody);
      if (caption) fd.append("caption", caption);
      if (tag) fd.append("tag", tag);
      const res = await fetch("/api/evidence/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Save failed");
      setNoteBody("");
      setCaption("");
      setTag("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setUploading(false);
    }
  }

  async function remove(id: string) {
    setError(null);
    try {
      const res = await fetch(`/api/evidence/upload?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Delete failed");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  return (
    <div className="space-y-4">
      <header>
        <h3 className="font-serif text-lg text-ink-900">Evidence</h3>
        <p className="text-sm text-ink-700/85">
          Screenshots, transcripts, notes. Images are passed to the grader so it can
          verify your claims.
        </p>
      </header>

      <div className="space-y-2 rounded-md border border-ink-700/20 bg-parchment-50/60 p-3">
        <div className="flex gap-2">
          <input
            className="flex-1 rounded border border-ink-700/20 bg-parchment-50 px-2 py-1 text-sm"
            placeholder="Caption (optional)"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            disabled={disabled}
          />
          <select
            className="rounded border border-ink-700/20 bg-parchment-50 px-2 py-1 text-sm"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            disabled={disabled}
          >
            <option value="">tag…</option>
            {TAGS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf,audio/*"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) uploadFile(f);
              if (fileInputRef.current) fileInputRef.current.value = "";
            }}
            disabled={disabled || uploading}
            className="text-sm"
          />
        </div>

        <div className="space-y-2 pt-2">
          <textarea
            className="w-full rounded border border-ink-700/20 bg-parchment-50 px-2 py-1 text-sm"
            rows={3}
            placeholder="Or paste a text note (interview transcript, customer quote, etc.)…"
            value={noteBody}
            onChange={(e) => setNoteBody(e.target.value)}
            disabled={disabled}
          />
          <button
            type="button"
            onClick={addNote}
            disabled={disabled || uploading || !noteBody.trim()}
            className="rounded-md bg-ink-700 px-3 py-1 text-xs text-parchment-50 disabled:opacity-60"
          >
            Save note
          </button>
        </div>

        {error && <p className="text-xs text-compass-rose">{error}</p>}
      </div>

      <ul className="space-y-2">
        {items.length === 0 && (
          <li className="rounded border border-dashed border-ink-700/20 px-3 py-4 text-center text-sm text-ink-700/60">
            No evidence yet. Upload screenshots, transcripts, or paste notes.
          </li>
        )}
        {items.map((it) => (
          <li
            key={it.id}
            className="flex items-start gap-3 rounded-md border border-ink-700/20 bg-parchment-50/80 px-3 py-2"
          >
            <span className="rounded bg-brass-500/20 px-2 py-0.5 text-xs text-ink-800">
              {it.kind}
            </span>
            <div className="flex-1">
              {it.caption && <div className="text-sm text-ink-900">{it.caption}</div>}
              {it.tag && (
                <div className="text-xs uppercase tracking-wide text-ink-700/70">
                  {it.tag}
                </div>
              )}
              {it.body && (
                <p className="mt-1 whitespace-pre-wrap text-sm text-ink-700">{it.body}</p>
              )}
              {it.storage_path && (
                <div className="mt-1 text-xs text-ink-700/60">{it.storage_path.split("/").pop()}</div>
              )}
            </div>
            <button
              type="button"
              onClick={() => remove(it.id)}
              className="text-xs text-compass-rose hover:underline"
            >
              remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
