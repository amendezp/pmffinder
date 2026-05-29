"use client";

import { useRouter } from "next/navigation";
import type { RubricResult, StageField } from "@/lib/rubrics";
import { StageForm } from "./StageForm";

/**
 * Client wrapper around StageForm. Receives only plain serializable props
 * from the Server Component — never the full `rubric` object, because that
 * carries a `formatUserMessage` function and a Zod schema with methods that
 * Next.js refuses to cross the Server→Client boundary.
 */
interface AuthedStageFormWrapperProps {
  projectId: string;
  stageNumber: number;
  fields: StageField[];
  initialResponses?: Record<string, unknown>;
  initialFeedback?: RubricResult | null;
  alreadyPassed?: boolean;
}

export function AuthedStageFormWrapper({
  projectId,
  stageNumber,
  fields,
  initialResponses,
  initialFeedback,
  alreadyPassed,
}: AuthedStageFormWrapperProps) {
  const router = useRouter();

  async function onGrade(responses: Record<string, string>): Promise<RubricResult> {
    const res = await fetch("/api/grade-stage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId,
        stageNumber,
        responses,
      }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed to grade.");
    const result = json.result as RubricResult;
    if (result.passed) router.refresh();
    return result;
  }

  const nextN = stageNumber + 1;
  const nextHref =
    nextN <= 7
      ? `/projects/${projectId}/stage/${nextN}`
      : `/projects/${projectId}/memo`;

  return (
    <StageForm
      fields={fields}
      initialResponses={initialResponses}
      initialFeedback={initialFeedback}
      alreadyPassed={alreadyPassed}
      onGrade={onGrade}
      nextStageHref={nextHref}
      nextStageNumber={nextN <= 7 ? nextN : 8}
    />
  );
}
