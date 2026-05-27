import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { MemoTemplate } from "@/components/MemoTemplate";
import type { MemoContent } from "@/lib/memo/template";

export const dynamic = "force-dynamic";

export default async function PublicMemoPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const service = createServiceClient();

  const { data: memo } = await service
    .from("memos")
    .select("id, content, is_public, view_count, project_id, projects!inner(name)")
    .eq("share_token", token)
    .maybeSingle();

  // Defense in depth: even though RLS allows public read when is_public=true,
  // the service-role client bypasses RLS entirely, so we re-check here.
  if (!memo || !memo.is_public) notFound();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const projectName = (memo as any).projects?.name ?? "Memo";

  // Fire-and-forget view increment.
  service
    .from("memos")
    .update({
      view_count: (memo.view_count ?? 0) + 1,
      last_viewed_at: new Date().toISOString(),
    })
    .eq("id", memo.id)
    .then(() => {});

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <MemoTemplate
        content={memo.content as MemoContent}
        projectName={projectName}
      />
      <p className="mt-8 text-center text-xs text-ink-700/60 no-print">
        Shared via PMFinder
      </p>
    </main>
  );
}
