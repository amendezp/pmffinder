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

  // Seed all 8 stages as "in_progress" so every waypoint is reachable from
  // the start. The UI marks them green once passed.
  await supabase.from("stages").insert(
    Array.from({ length: 8 }).map((_, i) => ({
      project_id: data.id,
      stage_number: i + 1,
      status: "in_progress",
    }))
  );

  redirect(`/projects/${data.id}`);
}

export default function NewProjectPage() {
  return (
    <main className="relative mx-auto min-h-screen max-w-2xl px-8 py-12 md:px-12">
      <header className="mb-10 flex items-center gap-4 font-mono text-xs uppercase tracking-widest text-neon-cyan/80">
        <div className="h-2 w-2 animate-pulse bg-neon-cyan" />
        <Link href="/projects" className="hover:text-neon-cyan">
          ← All projects
        </Link>
        <div className="hud-line-decorator h-px flex-1 opacity-50" />
      </header>

      <div className="relative mb-8 fade-in-up">
        <div className="absolute -left-8 top-0 bottom-0 w-[2px] bg-gradient-to-b from-neon-cyan/0 via-neon-cyan to-neon-cyan/0" />
        <h2 className="mb-2 font-mono text-sm uppercase tracking-widest text-neon-cyan/70">
          Start a new journey
        </h2>
        <h1 className="font-serif text-5xl italic text-white text-glow-white">
          Name your project
        </h1>
        <p className="mt-3 font-mono text-sm leading-relaxed text-white/75">
          Each journey runs through all 8 stages. You can rename it later.
        </p>
      </div>

      <form action={createProject} className="space-y-6">
        <div>
          <label className="block font-mono text-[10px] uppercase tracking-widest text-neon-cyan/70">
            Project name
          </label>
          <input
            name="name"
            required
            maxLength={120}
            className="mt-2 w-full border-b border-neon-cyan/30 bg-transparent px-1 py-2 font-serif text-2xl italic text-white placeholder:text-neon-cyan/40 focus:border-neon-cyan focus:outline-none"
            placeholder="e.g., InsightForge"
          />
        </div>
        <button
          type="submit"
          className="border border-neon-cyan bg-neon-cyan/15 px-6 py-3 font-mono text-xs uppercase tracking-widest text-neon-cyan shadow-cyber-glow hover:bg-neon-cyan hover:text-deep-blue"
        >
          Begin stage 1 →
        </button>
      </form>
    </main>
  );
}
