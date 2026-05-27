import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

async function createProject(formData: FormData) {
  "use server";
  const name = (formData.get("name") ?? "").toString().trim();
  if (!name) return;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data, error } = await supabase
    .from("projects")
    .insert({ user_id: user.id, name })
    .select("id")
    .single();
  if (error || !data) throw new Error(error?.message ?? "Failed to create project");

  // Seed the first stage as in_progress so the journey starts unlocked.
  await supabase.from("stages").insert({
    project_id: data.id,
    stage_number: 1,
    status: "in_progress",
  });

  redirect(`/projects/${data.id}`);
}

export default function NewProjectPage() {
  return (
    <main className="mx-auto max-w-xl px-6 py-12">
      <Link href="/projects" className="text-sm text-ink-700 underline-offset-4 hover:underline">
        ← Back to projects
      </Link>
      <h1 className="mt-4 font-display text-3xl text-ink-900">Start a new journey</h1>
      <p className="mt-1 text-sm text-ink-700/85">
        Give your idea a name. You can rename it later. Each journey runs through all
        seven stages.
      </p>

      <form action={createProject} className="mt-6 space-y-3">
        <label className="block">
          <span className="block font-serif text-base text-ink-900">Project name</span>
          <input
            name="name"
            required
            maxLength={120}
            className="mt-1 w-full rounded-md border border-ink-700/25 bg-parchment-50 px-3 py-2 text-ink-900 focus:border-compass-rose focus:outline-none"
            placeholder="e.g., InsightForge — for technical PM founders"
          />
        </label>
        <button
          type="submit"
          className="rounded-md bg-compass-rose px-5 py-2.5 font-serif text-parchment-50 shadow-compass hover:bg-compass-rose/90"
        >
          Begin the journey
        </button>
      </form>
    </main>
  );
}
