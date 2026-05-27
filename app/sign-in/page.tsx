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
      <div className="absolute right-8 top-8 text-right font-mono text-[10px] tracking-widest text-neon-cyan/70 no-print">
        <div className="mb-1">SYS // AUTH</div>
        <Link href="/" className="text-white hover:text-neon-cyan">
          ← PMFinder
        </Link>
      </div>

      <div className="relative z-10 w-full max-w-md fade-in-up">
        <div className="mb-6 flex items-center gap-3 font-mono text-xs uppercase tracking-widest text-neon-cyan">
          <div className="h-2 w-2 animate-pulse bg-neon-cyan" />
          <span>Identify // Operator</span>
          <div className="hud-line-decorator h-px flex-1 opacity-50" />
        </div>

        <div className="relative">
          <div className="absolute -left-8 top-0 bottom-0 w-[2px] bg-gradient-to-b from-neon-cyan/0 via-neon-cyan to-neon-cyan/0" />
          <h2 className="mb-1 font-mono text-sm text-white/70">Authenticate:</h2>
          <h1 className="font-serif text-5xl italic text-white text-glow-white">
            Sign in
          </h1>
        </div>
        <p className="mb-8 mt-3 font-mono text-sm text-white/70">
          A magic link will be transmitted to your email. No password required.
        </p>

        <form onSubmit={send} className="space-y-4">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="operator@example.com"
            className="w-full border-b border-neon-cyan/30 bg-transparent px-1 py-2 font-mono text-white placeholder:text-neon-cyan/40 focus:border-neon-cyan focus:outline-none"
          />
          <button
            type="submit"
            disabled={status === "sending"}
            className="w-full border border-neon-cyan bg-neon-cyan/10 py-3 font-mono text-xs uppercase tracking-widest text-neon-cyan shadow-cyber-glow transition hover:bg-neon-cyan hover:text-deep-blue disabled:opacity-60"
          >
            {status === "sending" ? "Transmitting…" : "Send magic link"}
          </button>
        </form>

        {status === "sent" && (
          <p className="mt-6 border-l-2 border-neon-cyan bg-neon-cyan/5 px-3 py-2 font-mono text-sm text-white">
            Check your inbox. Click the link to sign in.
          </p>
        )}
        {status === "error" && error && (
          <p className="mt-6 border-l-2 border-neon-pink bg-neon-pink/5 px-3 py-2 font-mono text-sm text-neon-pink">
            {error}
          </p>
        )}

        <div className="mt-10 font-mono text-[10px] uppercase tracking-widest text-neon-cyan/60">
          <Link href="/try" className="hover:text-white">
            Or run demo scan without authentication →
          </Link>
        </div>
      </div>
    </main>
  );
}
