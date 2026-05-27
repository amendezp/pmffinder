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

  await supabase.from("stages").insert({
    project_id: data.id,
    stage_number: 1,
    status: "in_progress",
  });

  redirect(`/projects/${data.id}`);
}

export default function NewProjectPage() {
  return (
    <main className="relative mx-auto max-w-2xl px-8 py-12 md:px-12">
      <header className="mb-12 flex items-center gap-4 text-[10px] uppercase tracking-widest text-zen-light">
        <Link href="/projects" className="hover:text-zen-text">
          ← Back to projects
        </Link>
        <div className="h-px w-8 bg-zen-line" />
        <span>New Journey</span>
      </header>

      <div className="mb-2 text-[11px] uppercase tracking-widest text-zen-light">
        Begin
      </div>
      <h1 className="mb-3 font-serif text-5xl font-light tracking-wide text-zen-text">
        Start a new journey
      </h1>
      <p className="mb-10 text-base font-light leading-relaxed text-zen-accent">
        Give your idea a name. You can rename it later. Each journey runs through
        all seven stages.
      </p>

      <form action={createProject} className="space-y-6">
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-zen-light">
            Project name
          </label>
          <input
            name="name"
            required
            maxLength={120}
            className="mt-2 w-full border-b border-zen-line bg-transparent px-1 py-2 font-serif text-2xl text-zen-text placeholder:text-zen-light focus:border-zen-text focus:outline-none"
            placeholder="e.g., InsightForge"
          />
        </div>
        <button
          type="submit"
          className="rounded-sm border border-zen-text bg-zen-text px-6 py-3 text-xs uppercase tracking-widest text-zen-bg hover:bg-zen-deep"
        >
          Begin the journey →
        </button>
      </form>
    </main>
  );
}
