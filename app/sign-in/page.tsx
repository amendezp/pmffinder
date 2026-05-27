"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError(null);
    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=/projects`;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });
    if (error) {
      setStatus("error");
      setError(error.message);
    } else {
      setStatus("sent");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md rounded-lg border border-ink-700/20 bg-parchment-50/95 p-8 shadow-compass">
        <h1 className="mb-1 font-display text-2xl text-ink-900">Sign in</h1>
        <p className="mb-6 text-sm text-ink-700/85">
          A magic link will be sent to your email. No password.
        </p>
        <form onSubmit={send} className="space-y-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-md border border-ink-700/25 bg-parchment-50 px-3 py-2 text-ink-900 focus:border-compass-rose focus:outline-none"
          />
          <button
            type="submit"
            disabled={status === "sending"}
            className="w-full rounded-md bg-compass-rose py-2.5 font-serif text-parchment-50 shadow-compass transition hover:bg-compass-rose/90 disabled:opacity-60"
          >
            {status === "sending" ? "Sending…" : "Send magic link"}
          </button>
        </form>

        {status === "sent" && (
          <p className="mt-4 rounded-md border border-brass-500/30 bg-parchment-100 px-3 py-2 text-sm text-ink-800">
            Check your inbox. Click the link to sign in.
          </p>
        )}
        {status === "error" && error && (
          <p className="mt-4 text-sm text-compass-rose">{error}</p>
        )}
      </div>
    </main>
  );
}
