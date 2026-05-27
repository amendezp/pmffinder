"use client";

import { useState } from "react";
import Link from "next/link";
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
    <main className="relative flex min-h-screen items-center justify-center px-6">
      <div className="absolute right-8 top-8 text-right text-[10px] uppercase tracking-widest text-zen-light no-print">
        <div className="mb-1">System // Auth</div>
        <Link href="/" className="text-zen-text hover:underline">
          ← PMFinder
        </Link>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-6 flex items-center gap-3 text-[10px] uppercase tracking-widest text-zen-light">
          <span>Identify yourself</span>
          <div className="h-px flex-1 bg-zen-line" />
        </div>
        <h1 className="mb-2 font-serif text-4xl font-light tracking-wide text-zen-text">
          Sign in
        </h1>
        <p className="mb-8 text-sm text-zen-accent">
          A magic link will be sent to your email. No password required.
        </p>

        <form onSubmit={send} className="space-y-4">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full border-b border-zen-line bg-transparent px-1 py-2 text-zen-text placeholder:text-zen-light focus:border-zen-text focus:outline-none"
          />
          <button
            type="submit"
            disabled={status === "sending"}
            className="w-full rounded-sm border border-zen-text bg-zen-text py-3 text-xs uppercase tracking-widest text-zen-bg transition hover:bg-zen-deep disabled:opacity-60"
          >
            {status === "sending" ? "Sending…" : "Send magic link"}
          </button>
        </form>

        {status === "sent" && (
          <p className="mt-6 border-l-2 border-zen-text bg-white px-3 py-2 text-sm text-zen-text">
            Check your inbox. Click the link to sign in.
          </p>
        )}
        {status === "error" && error && (
          <p className="mt-6 text-sm text-zen-text">{error}</p>
        )}

        <div className="mt-10 text-[10px] uppercase tracking-widest text-zen-light">
          <Link href="/try" className="hover:text-zen-text">
            Or try the demo without signing in →
          </Link>
        </div>
      </div>
    </main>
  );
}
