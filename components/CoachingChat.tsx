"use client";

import { useState, useRef, useEffect } from "react";

interface ChatMsg {
  role: "user" | "assistant";
  content: string;
}

interface CoachingChatProps {
  projectId: string;
  stageNumber: number;
  initialMessages?: ChatMsg[];
}

export function CoachingChat({
  projectId,
  stageNumber,
  initialMessages = [],
}: CoachingChatProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [streaming, setStreaming] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send() {
    const text = draft.trim();
    if (!text || streaming) return;
    setDraft("");
    setStreaming(true);
    const next: ChatMsg[] = [...messages, { role: "user", content: text }, { role: "assistant", content: "" }];
    setMessages(next);
    try {
      const res = await fetch("/api/stage-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, stageNumber, message: text }),
      });
      if (!res.ok || !res.body) {
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "assistant", content: `[error: ${res.status}]` };
          return copy;
        });
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "assistant", content: buffer };
          return copy;
        });
      }
    } finally {
      setStreaming(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="fixed right-4 top-1/2 z-30 -translate-y-1/2 rotate-180 rounded-l-md bg-ink-800 px-3 py-3 font-serif text-parchment-50 shadow-lg [writing-mode:vertical-rl] hover:bg-ink-700"
        aria-label="Toggle coaching chat"
      >
        {open ? "Close coach" : "Coach"}
      </button>

      <aside
        className={[
          "fixed right-0 top-0 z-20 flex h-screen w-full max-w-md flex-col border-l border-ink-700/20 bg-parchment-50 shadow-2xl transition-transform",
          open ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
        aria-hidden={!open}
      >
        <header className="border-b border-ink-700/15 px-4 py-3">
          <h3 className="font-serif text-lg text-ink-900">Stage {stageNumber} coach</h3>
          <p className="text-xs text-ink-700/80">
            A Socratic helper that uses the same rubric the grader uses. Doesn't grade.
          </p>
        </header>

        <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
          {messages.length === 0 && (
            <p className="rounded-md border border-dashed border-ink-700/20 px-3 py-4 text-center text-sm text-ink-700/60">
              Ask anything about your current draft — "is my inflection point really
              technological?", "does my Who feel desperate?", etc.
            </p>
          )}
          {messages.map((m, i) => (
            <div
              key={i}
              className={[
                "rounded-md px-3 py-2 text-sm whitespace-pre-wrap",
                m.role === "user"
                  ? "ml-6 bg-parchment-200/80 text-ink-900"
                  : "mr-6 bg-ink-800 text-parchment-50",
              ].join(" ")}
            >
              {m.content || (streaming && i === messages.length - 1 ? "…" : "")}
            </div>
          ))}
          <div ref={endRef} />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className="flex gap-2 border-t border-ink-700/15 p-3"
        >
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            rows={2}
            placeholder="Ask your coach…"
            className="flex-1 resize-none rounded-md border border-ink-700/20 bg-parchment-50 px-3 py-2 text-sm text-ink-900 focus:border-compass-rose focus:outline-none"
            disabled={streaming}
          />
          <button
            type="submit"
            disabled={streaming || !draft.trim()}
            className="rounded-md bg-compass-rose px-3 py-2 text-sm text-parchment-50 disabled:opacity-60"
          >
            {streaming ? "…" : "Send"}
          </button>
        </form>
      </aside>
    </>
  );
}
