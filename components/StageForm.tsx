"use client";

import { useState } from "react";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import type { StageField, RubricResult, StageRubric } from "@/lib/rubrics";
import { FeedbackPanel } from "./FeedbackPanel";

interface StageFormProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rubric: StageRubric<any>;
  initialResponses?: Record<string, unknown>;
  initialFeedback?: RubricResult | null;
  alreadyPassed?: boolean;
  onGrade: (responses: Record<string, string>) => Promise<RubricResult>;
  onSaveResponses?: (
    responses: Record<string, string>,
    feedback: RubricResult
  ) => void;
  belowFormNotice?: React.ReactNode;
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
    "w-full border border-neon-cyan/25 bg-neon-cyan/5 px-3 py-2 font-mono text-sm text-white placeholder:text-neon-cyan/40 focus:border-neon-cyan focus:outline-none focus:ring-1 focus:ring-neon-cyan/40 transition-colors";
  return (
    <div className="space-y-2">
      <label className="block font-mono text-[10px] uppercase tracking-widest text-neon-cyan/80">
        {field.label}
        {field.required && <span className="text-neon-pink"> *</span>}
      </label>
      {field.helper && (
        <p className="font-mono text-xs leading-snug text-white/65">
          {field.helper}
        </p>
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
          {field.options?.map((opt) => {
            const selected = value === opt.value;
            return (
              <label
                key={opt.value}
                className={[
                  "flex cursor-pointer items-start gap-3 border px-3 py-2 transition-colors",
                  selected
                    ? "border-neon-cyan bg-neon-cyan/10"
                    : "border-neon-cyan/20 bg-neon-cyan/[0.03] hover:border-neon-cyan/60",
                ].join(" ")}
              >
                <input
                  type="radio"
                  name={field.key}
                  value={opt.value}
                  checked={selected}
                  onChange={(e) => onChange(e.target.value)}
                  disabled={disabled}
                  className="mt-0.5 accent-neon-cyan"
                />
                <span className="font-mono text-xs text-white">{opt.label}</span>
              </label>
            );
          })}
          {(() => {
            const sel = field.options?.find((o) => o.value === value);
            return sel?.notice ? (
              <p className="border-l-2 border-neon-pink bg-neon-pink/5 px-3 py-2 font-mono text-xs text-white/85">
                <span className="mr-2 text-neon-pink">!</span>
                {sel.notice}
              </p>
            ) : null;
          })()}
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
  rubric,
  initialResponses = {},
  initialFeedback = null,
  alreadyPassed = false,
  onGrade,
  onSaveResponses,
  belowFormNotice,
}: StageFormProps) {
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
      const result = await onGrade(values);
      setFeedback(result);
      onSaveResponses?.(values, result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to grade.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-7">
      <div className="space-y-6">
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

      {belowFormNotice}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={submit}
          disabled={submitting}
          className="border border-neon-cyan bg-neon-cyan/10 px-6 py-2.5 font-mono text-xs uppercase tracking-widest text-neon-cyan shadow-cyber-glow transition hover:bg-neon-cyan hover:text-deep-blue disabled:opacity-60"
        >
          {submitting
            ? "Transmitting…"
            : alreadyPassed
              ? "Re-submit for analysis"
              : "Submit for analysis"}
        </button>
        {error && (
          <span className="font-mono text-xs text-neon-pink">{error}</span>
        )}
      </div>

      {feedback && <FeedbackPanel feedback={feedback} />}
    </div>
  );
}
