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
    <main className="mx-auto max-w-3xl px-6 py-12">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <Link href="/" className="font-display text-2xl text-ink-900">
            PMFinder
          </Link>
          <p className="text-sm text-ink-700/85">Your PMF journeys.</p>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/projects/new"
            className="rounded-md bg-compass-rose px-4 py-2 font-serif text-parchment-50 shadow-compass hover:bg-compass-rose/90"
          >
            + New project
          </Link>
          <form action="/auth/sign-out" method="post">
            <button className="text-sm text-ink-700 underline-offset-4 hover:underline">
              Sign out
            </button>
          </form>
        </div>
      </header>

      <ImportGuestBanner />

      <ul className="space-y-3">
        {(projects ?? []).length === 0 && (
          <li className="rounded-md border border-dashed border-ink-700/25 px-4 py-12 text-center text-ink-700/70">
            No journeys yet. Start your first one.
          </li>
        )}
        {(projects ?? []).map((p) => (
          <li key={p.id}>
            <Link
              href={`/projects/${p.id}`}
              className="flex items-center justify-between rounded-md border border-ink-700/20 bg-parchment-100/70 px-4 py-3 hover:bg-parchment-100"
            >
              <div>
                <div className="font-serif text-lg text-ink-900">{p.name}</div>
                <div className="text-xs text-ink-700/70">
                  Updated {new Date(p.updated_at).toLocaleDateString()}
                </div>
              </div>
              <span className="text-ink-700">→</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
