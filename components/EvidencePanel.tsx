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

const inputCx =
  "w-full border border-neon-cyan/25 bg-neon-cyan/5 px-3 py-2 font-mono text-sm text-white placeholder:text-neon-cyan/40 focus:border-neon-cyan focus:outline-none focus:ring-1 focus:ring-neon-cyan/40 transition-colors";

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
  const [pickedFileName, setPickedFileName] = useState<string | null>(null);
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
      setPickedFileName(null);
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
        <div className="mb-1 font-mono text-[10px] uppercase tracking-widest text-neon-cyan/70">
          Evidence
        </div>
        <h3 className="font-serif text-2xl italic text-white">Artifacts</h3>
        <p className="mt-2 font-mono text-xs leading-relaxed text-white/70">
          Screenshots, transcripts, notes. Images are passed to the grader so it
          can verify your claims.
        </p>
      </header>

      <div className="space-y-3 border border-neon-cyan/20 bg-neon-cyan/[0.02] p-3">
        <div className="grid gap-2 sm:grid-cols-[1fr_140px]">
          <input
            className={inputCx}
            placeholder="Caption (optional)"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            disabled={disabled}
          />
          <select
            className={`${inputCx} appearance-none bg-[length:14px_14px] bg-[right_0.6rem_center] bg-no-repeat pr-7`}
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12'><path fill='%2300f0ff' d='M2 4l4 4 4-4z'/></svg>\")",
            }}
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            disabled={disabled}
          >
            <option value="" className="bg-deep-blue text-neon-cyan/60">
              tag…
            </option>
            {TAGS.map((t) => (
              <option key={t} value={t} className="bg-deep-blue text-white">
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* File picker — native input hidden, wrapped by a themed label */}
        <div className="flex flex-wrap items-center gap-3">
          <label
            className={[
              "cursor-pointer border border-neon-cyan bg-neon-cyan/10 px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-neon-cyan transition hover:bg-neon-cyan hover:text-deep-blue",
              uploading || disabled ? "pointer-events-none opacity-60" : "",
            ].join(" ")}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf,audio/*"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) {
                  setPickedFileName(f.name);
                  uploadFile(f);
                }
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              disabled={disabled || uploading}
              className="hidden"
            />
            + Upload file
          </label>
          <span className="font-mono text-[11px] text-neon-cyan/60">
            {pickedFileName ??
              (uploading ? "Uploading…" : "Image, PDF, or audio")}
          </span>
        </div>

        <div className="space-y-2 border-t border-neon-cyan/15 pt-3">
          <textarea
            className={inputCx}
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
            className="border border-neon-cyan bg-neon-cyan/15 px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-neon-cyan transition hover:bg-neon-cyan hover:text-deep-blue disabled:opacity-60 disabled:hover:bg-neon-cyan/15 disabled:hover:text-neon-cyan"
          >
            {uploading ? "Saving…" : "Save note"}
          </button>
        </div>

        {error && (
          <p className="border-l-2 border-neon-pink bg-neon-pink/5 px-3 py-2 font-mono text-xs text-neon-pink">
            {error}
          </p>
        )}
      </div>

      <ul className="space-y-2">
        {items.length === 0 && (
          <li className="border border-dashed border-neon-cyan/25 px-3 py-6 text-center font-mono text-xs text-neon-cyan/60">
            No evidence yet. Upload screenshots, transcripts, or paste notes.
          </li>
        )}
        {items.map((it) => (
          <li
            key={it.id}
            className="flex items-start gap-3 border-l border-neon-cyan/30 bg-neon-cyan/[0.03] px-3 py-2"
          >
            <span className="border border-neon-cyan/30 bg-neon-cyan/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-neon-cyan/85">
              {it.kind}
            </span>
            <div className="flex-1 min-w-0">
              {it.caption && (
                <div className="font-mono text-sm text-white">{it.caption}</div>
              )}
              {it.tag && (
                <div className="font-mono text-[10px] uppercase tracking-widest text-neon-cyan/70">
                  {it.tag}
                </div>
              )}
              {it.body && (
                <p className="mt-1 whitespace-pre-wrap font-mono text-xs text-white/80">
                  {it.body}
                </p>
              )}
              {it.storage_path && (
                <div className="mt-1 truncate font-mono text-[10px] text-neon-cyan/55">
                  {it.storage_path.split("/").pop()}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => remove(it.id)}
              className="font-mono text-[10px] uppercase tracking-widest text-neon-pink/80 hover:text-neon-pink"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
