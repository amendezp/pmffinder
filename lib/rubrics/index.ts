import { stage1Rubric } from "./stage-1-sourcing";
import { stage2Rubric } from "./stage-2-value-hypothesis";
import { stage3Rubric } from "./stage-3-problem-validation";
import { stage4Rubric } from "./stage-4-implementation";
import { stage5Rubric } from "./stage-5-mvp-metrics";
import { stage6Rubric } from "./stage-6-savor-surprise";
import { stage7Rubric } from "./stage-7-decision-tree";
import type { StageNumber, StageRubric } from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const rubrics: Record<StageNumber, StageRubric<any>> = {
  1: stage1Rubric,
  2: stage2Rubric,
  3: stage3Rubric,
  4: stage4Rubric,
  5: stage5Rubric,
  6: stage6Rubric,
  7: stage7Rubric,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getRubric(stageNumber: number): StageRubric<any> {
  if (stageNumber < 1 || stageNumber > 7) {
    throw new Error(`Invalid stage number: ${stageNumber}`);
  }
  return rubrics[stageNumber as StageNumber];
}

export * from "./types";
export {
  stage1Rubric,
  stage2Rubric,
  stage3Rubric,
  stage4Rubric,
  stage5Rubric,
  stage6Rubric,
  stage7Rubric,
};
