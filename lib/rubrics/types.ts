import { z } from "zod";

export type StageNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7;

/**
 * A single criterion the AI grader evaluates. Listed in the rubric so the
 * grader returns one entry per criterion. The UI displays met/unmet alongside
 * the grader's feedback for each — this is how the user sees what to fix.
 */
export interface Criterion {
  id: string;
  name: string;
  /** What it means to satisfy this criterion. */
  description: string;
}

/**
 * Result returned by /api/grade-stage. `passed` is true iff every criterion in
 * `criteria` has `met: true` (the grader is instructed to be strict).
 */
export interface RubricResult {
  passed: boolean;
  criteria: Array<{
    id: string;
    name: string;
    met: boolean;
    feedback: string;
  }>;
  overall_feedback: string;
  suggested_revisions: string[];
}

export interface StageRubric<TInput> {
  stageNumber: StageNumber;
  /** Short title shown on the compass waypoint. */
  title: string;
  /** One-line description shown above the stage form. */
  blurb: string;
  /**
   * Zod schema for the structured inputs. Uses ZodTypeAny so schemas with
   * `.default()` (which makes input optional but output required) work without
   * fighting the type system.
   */
  schema: z.ZodTypeAny;
  /** Field definitions used by StageForm to render the inputs. */
  fields: StageField[];
  /** The criteria the AI grader evaluates. */
  criteria: Criterion[];
  /**
   * System prompt for the grader. Encodes the bar for this stage and
   * instructs the AI grader to return the RubricResult JSON via tool use.
   */
  systemPrompt: string;
  /**
   * Format the user's responses (and optionally prior attempts) into a user
   * message for the grader. Evidence attachments are added separately by the
   * API route.
   */
  formatUserMessage(input: TInput, context?: { priorFeedback?: RubricResult }): string;
}

export type StageFieldKind =
  | "short_text"
  | "long_text"
  | "select"
  | "radio"
  | "tag_list";

export interface StageField {
  key: string;
  label: string;
  helper?: string;
  kind: StageFieldKind;
  /** For select / radio. `notice` renders below the field when that option is selected. */
  options?: Array<{ value: string; label: string; notice?: string }>;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  rows?: number;
  /**
   * Optional best-in-class example shown in a collapsible "Show example"
   * disclosure. Helps users calibrate without polluting the placeholder.
   */
  example?: string;
}
