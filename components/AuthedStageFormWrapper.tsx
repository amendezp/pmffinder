"use client";

import { useRouter } from "next/navigation";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import type { RubricResult, StageRubric } from "@/lib/rubrics";
import { StageForm } from "./StageForm";

interface AuthedStageFormWrapperProps {
  projectId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rubric: StageRubric<any>;
  initialResponses?: Record<string, unknown>;
  initialFeedback?: RubricResult | null;
  alreadyPassed?: boolean;
}

export function AuthedStageFormWrapper({
  projectId,
  rubric,
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
        stageNumber: rubric.stageNumber,
        responses,
      }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed to grade.");
    const result = json.result as RubricResult;
    if (result.passed) router.refresh();
    return result;
  }

  const nextN = rubric.stageNumber + 1;
  const nextHref =
    nextN <= 9
      ? `/projects/${projectId}/stage/${nextN}`
      : `/projects/${projectId}/memo`;

  return (
    <StageForm
      rubric={rubric}
      initialResponses={initialResponses}
      initialFeedback={initialFeedback}
      alreadyPassed={alreadyPassed}
      onGrade={onGrade}
      nextStageHref={nextHref}
      nextStageNumber={nextN <= 9 ? nextN : 10}
    />
  );
}
