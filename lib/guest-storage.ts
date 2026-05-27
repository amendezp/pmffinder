/**
 * localStorage-backed state for guest (signed-out) journeys.
 *
 * Versioned so we can migrate or clear gracefully. Keep the shape minimal —
 * heavy assets (image evidence) are not persisted in guest mode.
 */

import type { RubricResult } from "@/lib/rubrics";

export interface GuestStageState {
  status: "in_progress" | "passed";
  responses: Record<string, string>;
  last_feedback: RubricResult | null;
  attempts: number;
}

export interface GuestChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface GuestState {
  version: 1;
  startedAt: string;
  stages: Partial<Record<number, GuestStageState>>;
  chats: Partial<Record<number, GuestChatMessage[]>>;
}

const KEY = "pmf_guest_v1";

export function isBrowser() {
  return typeof window !== "undefined";
}

export function emptyGuestState(): GuestState {
  return {
    version: 1,
    startedAt: new Date().toISOString(),
    stages: {},
    chats: {},
  };
}

export function readGuestState(): GuestState {
  if (!isBrowser()) return emptyGuestState();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptyGuestState();
    const parsed = JSON.parse(raw) as GuestState;
    if (parsed.version !== 1) return emptyGuestState();
    return parsed;
  } catch {
    return emptyGuestState();
  }
}

export function writeGuestState(state: GuestState) {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Quota or disabled storage — silently drop. The grading still works in
    // the current session; nothing crashes.
  }
}

export function clearGuestState() {
  if (!isBrowser()) return;
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* noop */
  }
}

/**
 * True if the guest has made meaningful progress worth importing on sign-in
 * (at least one stage has saved responses, even if not passed).
 */
export function guestHasProgress(state: GuestState = readGuestState()): boolean {
  return Object.values(state.stages).some(
    (s) => !!s && Object.keys(s.responses).length > 0
  );
}

export function activeStageNumber(state: GuestState = readGuestState()): number {
  for (let i = 1; i <= 9; i++) {
    if (state.stages[i]?.status !== "passed") return i;
  }
  return 7;
}

export function passedStages(state: GuestState = readGuestState()): Set<number> {
  return new Set(
    Object.entries(state.stages)
      .filter(([, s]) => s?.status === "passed")
      .map(([n]) => Number(n))
  );
}

export function setStage(stageNumber: number, partial: GuestStageState) {
  const state = readGuestState();
  state.stages[stageNumber] = partial;
  writeGuestState(state);
}

export function setChat(stageNumber: number, messages: GuestChatMessage[]) {
  const state = readGuestState();
  state.chats[stageNumber] = messages;
  writeGuestState(state);
}
