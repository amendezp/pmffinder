"use client";

import { useState } from "react";
import type { StageField, RubricResult } from "@/lib/rubrics";
import { FeedbackPanel } from "./FeedbackPanel";

interface StageFormProps {
  /**
   * Field definitions for the current stage. Plain serializable array — no
   * functions or class instances. Used to be `rubric: StageRubric<any>` but
   * StageRubric includes a `formatUserMessage` function and a Zod `schema`
   * that can't cross the Server→Client component boundary.
   */
  fields: StageField[];
  initialResponses?: Record<string, unknown>;
  initialFeedback?: RubricResult | null;
  alreadyPassed?: boolean;
  onGrade: (responses: Record<string, string>) => Promise<RubricResult>;
  onSaveResponses?: (
    responses: Record<string, string>,
    feedback: RubricResult
  ) => void;
  belowFormNotice?: React.ReactNode;
  nextStageHref?: string;
  nextStageNumber?: number;
}

/**
 * True when a field's showWhen condition is satisfied (or there isn't one).
 * Hidden fields are skipped during validation and aren't rendered.
 */
function isFieldVisible(
  field: StageField,
  values: Record<string, string>
): boolean {
  if (!field.showWhen) return true;
  const actual = values[field.showWhen.key] ?? "";
  const equals = field.showWhen.equals;
  return Array.isArray(equals) ? equals.includes(actual) : actual === equals;
}

/**
 * Validate a single field against its rubric definition. Returns an error
 * message or null. Mirrors the server-side Zod checks so users never burn an
 * API call on an incomplete submission.
 */
function validateField(field: StageField, value: string): string | null {
  const v = (value ?? "").trim();
  if (field.required && v.length === 0) return "Please fill this in.";
  if (field.minLength && v.length < field.minLength) {
    return `Aim for at least ${field.minLength} characters (you have ${v.length}).`;
  }
  if (
    field.kind === "radio" &&
    field.required &&
    v.length === 0
  ) {
    return "Please pick one.";
  }
  return null;
}

function Field({
  field,
  value,
  onChange,
  disabled,
  error,
}: {
  field: StageField;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  error?: string | null;
}) {
  const baseBorder = error ? "border-neon-pink" : "border-neon-cyan/25";
  const baseFocus = error ? "focus:border-neon-pink" : "focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan/40";
  const base = `w-full border ${baseBorder} bg-neon-cyan/5 px-3 py-2 font-mono text-sm text-white placeholder:text-neon-cyan/40 ${baseFocus} focus:outline-none transition-colors`;

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
      {field.example && (
        <details className="font-mono text-xs text-neon-cyan/60">
          <summary className="cursor-pointer select-none uppercase tracking-widest text-[10px] hover:text-neon-cyan">
            Show example
          </summary>
          <p className="mt-1 border-l border-neon-cyan/30 pl-3 italic text-white/55">
            {field.example}
          </p>
        </details>
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
      {error && (
        <p className="font-mono text-xs text-neon-pink">
          <span className="mr-1">!</span>
          {error}
        </p>
      )}
    </div>
  );
}

export function StageForm({
  fields,
  initialResponses = {},
  initialFeedback = null,
  alreadyPassed = false,
  onGrade,
  onSaveResponses,
  belowFormNotice,
  nextStageHref,
  nextStageNumber,
}: StageFormProps) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const base: Record<string, string> = {};
    for (const f of fields) {
      const v = initialResponses[f.key];
      base[f.key] = typeof v === "string" ? v : v != null ? String(v) : "";
    }
    return base;
  });
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<RubricResult | null>(initialFeedback);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  // Only show errors after the user has tried to submit once.
  const [showErrors, setShowErrors] = useState(false);

  function validateAll(): Record<string, string> {
    const errs: Record<string, string> = {};
    for (const f of fields) {
      if (!isFieldVisible(f, values)) continue;
      const e = validateField(f, values[f.key] ?? "");
      if (e) errs[f.key] = e;
    }
    return errs;
  }

  function setVal(key: string, v: string) {
    setValues((prev) => ({ ...prev, [key]: v }));
    if (showErrors) {
      // Re-validate as the user types after a failed attempt.
      const f = fields.find((x) => x.key === key);
      if (f) {
        const e = validateField(f, v);
        setFieldErrors((prev) => {
          const next = { ...prev };
          if (e) next[key] = e;
          else delete next[key];
          return next;
        });
      }
    }
  }

  async function submit() {
    setError(null);
    const errs = validateAll();
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      setShowErrors(true);
      // Scroll the first error into view.
      requestAnimationFrame(() => {
        const firstKey = Object.keys(errs)[0];
        const el = document.querySelector(
          `[name="${firstKey}"], textarea[placeholder], input[placeholder]`
        );
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
      return;
    }

    setSubmitting(true);
    try {
      const result = await onGrade(values);
      setFeedback(result);
      onSaveResponses?.(values, result);
      if (result.passed && typeof window !== "undefined") {
        requestAnimationFrame(() => {
          window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to grade.");
    } finally {
      setSubmitting(false);
    }
  }

  const errorCount = Object.keys(fieldErrors).length;

  return (
    <div className="space-y-7">
      <div className="space-y-6">
        {fields.map((field) => {
          if (!isFieldVisible(field, values)) return null;
          return (
            <Field
              key={field.key}
              field={field}
              value={values[field.key] ?? ""}
              onChange={(v) => setVal(field.key, v)}
              disabled={alreadyPassed && !feedback}
              error={showErrors ? fieldErrors[field.key] : undefined}
            />
          );
        })}
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
            ? "Grading…"
            : alreadyPassed
              ? "Re-submit"
              : "Submit for grading"}
        </button>
        {showErrors && errorCount > 0 && (
          <span className="font-mono text-xs text-neon-pink">
            {errorCount} field{errorCount === 1 ? "" : "s"} need{errorCount === 1 ? "s" : ""} attention above.
          </span>
        )}
        {error && (
          <span className="font-mono text-xs text-neon-pink">{error}</span>
        )}
      </div>

      {feedback && (
        <FeedbackPanel
          feedback={feedback}
          nextStageHref={nextStageHref}
          nextStageNumber={nextStageNumber}
        />
      )}
    </div>
  );
}
