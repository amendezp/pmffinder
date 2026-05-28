import { MEMO_SECTIONS, type MemoContent } from "@/lib/memo/template";
import type { SectionStatus } from "@/lib/memo/draftFromStages";
import { rubrics } from "@/lib/rubrics";

export function MemoTemplate({
  content,
  projectName,
  sectionStatuses,
}: {
  content: MemoContent;
  projectName: string;
  /**
   * When provided, sections marked "pending" render as dim placeholder cards
   * pointing at the source stage(s). Ready sections get a small "Ready" tag.
   */
  sectionStatuses?: Record<string, SectionStatus>;
}) {
  const companyName = content.meta?.company_name || projectName;
  return (
    <article className="memo-page mx-auto max-w-[820px] rounded-md border border-ink-700/15 px-10 py-10 font-serif shadow-xl print:max-w-full print:rounded-none print:border-0 print:px-0 print:py-0 print:shadow-none">
      <header className="mb-6 border-b border-ink-700/20 pb-3">
        <h1 className="font-display text-3xl text-ink-900">{companyName}</h1>
        {content.meta?.one_liner && (
          <p className="mt-1 text-base italic text-ink-700">{content.meta.one_liner}</p>
        )}
      </header>

      <div className="columns-1 gap-8 md:columns-2 [&>section]:break-inside-avoid">
        {MEMO_SECTIONS.map((s) => {
          const text = content.sections?.[s.key];
          const status = sectionStatuses?.[s.key];
          const isPending = !text || status === "pending";

          if (isPending) {
            const sourceLabels = s.sourceStages.length
              ? s.sourceStages
                  .map((n) => `Stage ${n} (${rubrics[n as 1 | 2 | 3 | 4 | 5 | 6 | 7].title})`)
                  .join(" + ")
              : "Filled at memo generation";
            return (
              <section key={s.key} className="mb-5">
                <h2 className="mb-1 text-sm font-semibold uppercase tracking-wider text-compass-rose/40">
                  {s.title}
                </h2>
                <div className="rounded-md border border-dashed border-ink-700/15 px-3 py-3 text-sm italic text-ink-700/50 no-print">
                  Pending — {sourceLabels}
                </div>
              </section>
            );
          }

          return (
            <section key={s.key} className="mb-5">
              <h2 className="mb-1 flex items-baseline gap-2 text-sm font-semibold uppercase tracking-wider text-compass-rose">
                <span>{s.title}</span>
                {status === "ready" && (
                  <span className="rounded border border-neon-green/40 bg-neon-green/10 px-1.5 py-0 text-[9px] text-neon-green not-italic no-print">
                    READY
                  </span>
                )}
                {status === "draft" && (
                  <span className="rounded border border-neon-cyan/40 bg-neon-cyan/10 px-1.5 py-0 text-[9px] text-neon-cyan not-italic no-print">
                    DRAFT
                  </span>
                )}
              </h2>
              <p className="whitespace-pre-wrap text-[0.95rem] leading-snug text-ink-800">
                {text}
              </p>
            </section>
          );
        })}
      </div>

      {content.meta?.generated_at && (
        <footer className="mt-6 border-t border-ink-700/20 pt-2 text-xs text-ink-700/70">
          Generated {new Date(content.meta.generated_at).toLocaleDateString()} — PMFinder
        </footer>
      )}
    </article>
  );
}
