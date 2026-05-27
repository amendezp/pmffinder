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
      <div className="relative z-10 w-full max-w-md fade-in-up">
        <header className="mb-8 flex items-center gap-3 font-mono text-xs uppercase tracking-widest text-neon-cyan/80">
          <div className="h-2 w-2 animate-pulse bg-neon-cyan" />
          <Link href="/" className="hover:text-white">
            ← PMFinder
          </Link>
          <div className="hud-line-decorator h-px flex-1 opacity-50" />
        </header>

        <div className="relative">
          <div className="absolute -left-8 top-0 bottom-0 w-[2px] bg-gradient-to-b from-neon-cyan/0 via-neon-cyan to-neon-cyan/0" />
          <h2 className="mb-2 font-mono text-sm uppercase tracking-widest text-neon-cyan/70">
            Sign in
          </h2>
          <h1 className="font-serif text-5xl italic text-white text-glow-white">
            Welcome back
          </h1>
        </div>
        <p className="mb-8 mt-3 font-mono text-sm text-white/75">
          We&rsquo;ll email you a magic link. No password.
        </p>

        <form onSubmit={send} className="space-y-4">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full border-b border-neon-cyan/30 bg-transparent px-1 py-2 font-mono text-white placeholder:text-neon-cyan/40 focus:border-neon-cyan focus:outline-none"
          />
          <button
            type="submit"
            disabled={status === "sending"}
            className="w-full border border-neon-cyan bg-neon-cyan/15 py-3 font-mono text-xs uppercase tracking-widest text-neon-cyan shadow-cyber-glow transition hover:bg-neon-cyan hover:text-deep-blue disabled:opacity-60"
          >
            {status === "sending" ? "Sending…" : "Send magic link"}
          </button>
        </form>

        {status === "sent" && (
          <p className="mt-6 border-l-2 border-neon-cyan bg-neon-cyan/5 px-3 py-2 font-mono text-sm text-white">
            Check your inbox — click the link to sign in.
          </p>
        )}
        {status === "error" && error && (
          <p className="mt-6 border-l-2 border-neon-pink bg-neon-pink/5 px-3 py-2 font-mono text-sm text-neon-pink">
            {error}
          </p>
        )}

        <div className="mt-10 font-mono text-[11px] uppercase tracking-widest text-neon-cyan/60">
          <Link href="/try" className="hover:text-white">
            Or try the demo without signing in →
          </Link>
        </div>
      </div>
    </main>
  );
}
