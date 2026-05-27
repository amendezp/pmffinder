import { MEMO_SECTIONS, type MemoContent } from "@/lib/memo/template";

export function MemoTemplate({
  content,
  projectName,
}: {
  content: MemoContent;
  projectName: string;
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
          if (!text) return null;
          return (
            <section key={s.key} className="mb-5">
              <h2 className="mb-1 text-sm font-semibold uppercase tracking-wider text-compass-rose">
                {s.title}
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
