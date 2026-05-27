import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ImportGuestBanner } from "@/components/ImportGuestBanner";

export default async function ProjectsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, created_at, updated_at")
    .order("updated_at", { ascending: false });

  return (
    <main className="relative mx-auto max-w-4xl px-8 py-12 md:px-12">
      <div className="absolute right-8 top-8 text-right text-[10px] uppercase tracking-widest text-zen-light no-print">
        <div className="mb-1">System // Projects</div>
        <form action="/auth/sign-out" method="post">
          <button className="text-zen-text hover:underline">Sign out →</button>
        </form>
      </div>

      <header className="mb-12 flex items-center gap-4 text-[10px] uppercase tracking-widest text-zen-light">
        <Link href="/" className="hover:text-zen-text">
          ← PMFinder
        </Link>
        <div className="h-px w-8 bg-zen-line" />
        <span>Your Journeys</span>
      </header>

      <div className="mb-12 flex items-end justify-between fade-in-up">
        <div>
          <h2 className="mb-3 text-[11px] uppercase tracking-widest text-zen-light">
            Current State
          </h2>
          <h1 className="font-serif text-5xl font-light tracking-wide text-zen-text">
            Projects
          </h1>
        </div>
        <Link
          href="/projects/new"
          className="rounded-sm border border-zen-text bg-zen-text px-4 py-2.5 text-xs uppercase tracking-widest text-zen-bg hover:bg-zen-deep"
        >
          + New journey
        </Link>
      </div>

      <ImportGuestBanner />

      <ol className="flex flex-col">
        {(projects ?? []).length === 0 && (
          <li className="border-y border-zen-line/60 px-1 py-12 text-center text-sm text-zen-light">
            No journeys yet. Start your first one.
          </li>
        )}
        {(projects ?? []).map((p, idx) => (
          <li key={p.id}>
            <Link
              href={`/projects/${p.id}`}
              className="group flex items-baseline justify-between border-b border-zen-line/60 py-4 transition-colors duration-500 hover:border-zen-text/40"
            >
              <div className="flex items-baseline gap-5">
                <span className="font-mono text-[10px] uppercase tracking-widest text-zen-light">
                  {`0${idx + 1}`.slice(-2)}
                </span>
                <div>
                  <h3 className="font-serif text-xl text-zen-text leading-tight">
                    {p.name}
                  </h3>
                  <p className="mt-0.5 text-xs text-zen-light">
                    Updated {new Date(p.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <span className="text-[10px] uppercase tracking-widest text-zen-accent group-hover:text-zen-text">
                Open →
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </main>
  );
}
