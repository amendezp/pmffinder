"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface ShareMemoDialogProps {
  memoId: string;
  isPublic: boolean;
  shareToken: string;
  viewCount: number;
  appUrl: string;
}

export function ShareMemoDialog({
  memoId,
  isPublic,
  shareToken,
  viewCount,
  appUrl,
}: ShareMemoDialogProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [token, setToken] = useState(shareToken);
  const [publicState, setPublicState] = useState(isPublic);
  const [copied, setCopied] = useState(false);

  const url = `${appUrl.replace(/\/$/, "")}/m/${token}`;

  async function call(action: "toggle_public" | "rotate_token") {
    setBusy(true);
    try {
      const res = await fetch("/api/memo-share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memoId, action }),
      });
      const json = await res.json();
      if (res.ok && json.memo) {
        setPublicState(json.memo.is_public);
        setToken(json.memo.share_token);
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-md border border-ink-700/20 bg-parchment-100/80 p-4 no-print">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-lg text-ink-900">Share this memo</h3>
        <span className="text-xs text-ink-700/70">Views: {viewCount}</span>
      </div>
      <p className="mb-3 text-sm text-ink-700/85">
        Toggle public to share the read-only link. Rotate the token to invalidate old links.
      </p>

      <div className="space-y-3">
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={publicState}
            onChange={() => call("toggle_public")}
            disabled={busy}
          />
          {publicState ? "Public — anyone with the link can read" : "Private"}
        </label>

        {publicState && (
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              readOnly
              value={url}
              className="min-w-[260px] flex-1 rounded border border-ink-700/20 bg-parchment-50 px-2 py-1 font-mono text-xs text-ink-800"
            />
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(url);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
              className="rounded-md bg-ink-700 px-3 py-1 text-xs text-parchment-50"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
            <button
              type="button"
              onClick={() => call("rotate_token")}
              disabled={busy}
              className="rounded-md border border-ink-700/30 px-3 py-1 text-xs text-ink-800"
            >
              Rotate token
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
