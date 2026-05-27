"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import type { StageField, RubricResult, StageRubric } from "@/lib/rubrics";
import { FeedbackPanel } from "./FeedbackPanel";

interface StageFormProps {
  projectId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rubric: StageRubric<any>;
  initialResponses?: Record<string, unknown>;
  initialFeedback?: RubricResult | null;
  alreadyPassed?: boolean;
}

function Field({
  field,
  value,
  onChange,
  disabled,
}: {
  field: StageField;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  const base =
    "w-full rounded-md border border-ink-700/25 bg-parchment-50/80 px-3 py-2 text-ink-900 focus:border-compass-rose focus:outline-none focus:ring-1 focus:ring-compass-rose/40";
  return (
    <div className="space-y-1.5">
      <label className="block font-serif text-base text-ink-900">
        {field.label}
        {field.required && <span className="text-compass-rose">*</span>}
      </label>
      {field.helper && (
        <p className="text-sm leading-snug text-ink-700/85">{field.helper}</p>
      )}
      {field.kind === "long_text" && (
        <textarea
          className={base}
          rows={field.rows ?? 4}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          disabled={disabled}
        />
      )}
      {field.kind === "short_text" && (
        <input
          className={base}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          disabled={disabled}
        />
      )}
      {field.kind === "radio" && (
        <div className="space-y-2">
          {field.options?.map((opt) => (
            <label
              key={opt.value}
              className="flex cursor-pointer items-start gap-2 rounded-md border border-ink-700/15 bg-parchment-50/60 px-3 py-2 hover:bg-parchment-100/80"
            >
              <input
                type="radio"
                name={field.key}
                value={opt.value}
                checked={value === opt.value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
              />
              <span className="text-sm text-ink-800">{opt.label}</span>
            </label>
          ))}
        </div>
      )}
      {field.kind === "select" && (
        <select
          className={base}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        >
          <option value="">Choose…</option>
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}

export function StageForm({
  projectId,
  rubric,
  initialResponses = {},
  initialFeedback = null,
  alreadyPassed = false,
}: StageFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string>>(() => {
    const base: Record<string, string> = {};
    for (const f of rubric.fields) {
      const v = initialResponses[f.key];
      base[f.key] = typeof v === "string" ? v : v != null ? String(v) : "";
    }
    return base;
  });
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<RubricResult | null>(initialFeedback);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/grade-stage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          stageNumber: rubric.stageNumber,
          responses: values,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Failed to grade.");
        return;
      }
      setFeedback(json.result as RubricResult);
      if (json.result?.passed) {
        // Refresh server-rendered project data so JourneyMap reflects the new state.
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-5">
        {rubric.fields.map((field) => (
          <Field
            key={field.key}
            field={field}
            value={values[field.key] ?? ""}
            onChange={(v) => setValues((prev) => ({ ...prev, [field.key]: v }))}
            disabled={alreadyPassed && !feedback}
          />
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={submit}
          disabled={submitting}
          className="rounded-md bg-compass-rose px-5 py-2.5 font-serif text-parchment-50 shadow-compass transition hover:bg-compass-rose/90 disabled:opacity-60"
        >
          {submitting
            ? "Grading…"
            : alreadyPassed
              ? "Re-submit for grading"
              : "Submit for grading"}
        </button>
        {error && <span className="text-sm text-compass-rose">{error}</span>}
      </div>

      {feedback && <FeedbackPanel feedback={feedback} />}
    </div>
  );
}
