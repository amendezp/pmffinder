import { MEMO_SECTIONS, type MemoContent } from "@/lib/memo/template";
import type { SectionStatus } from "@/lib/memo/draftFromStages";
import { rubrics } from "@/lib/rubrics";

// Explicit colors so the white memo paper stays readable regardless of the
// surrounding dark UI theme. Legacy Tailwind tokens (text-ink-*,
// text-compass-rose, etc.) were remapped to the neon-cyan palette and would
// render cyan-on-white here — unusable. These literals are also print-safe.
const C = {
  paper: "#ffffff",
  border: "#cbd5e1",
  borderSoft: "#e2e8f0",
  borderDashed: "#cbd5e1",
  headline: "#0a0f24",
  body: "#1e293b",
  sectionTitle: "#1e3a8a",
  sectionTitlePending: "#94a3b8",
  oneLiner: "#475569",
  muted: "#64748b",
  pendingText: "#475569",
};

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
    <article
      className="memo-page mx-auto max-w-[820px] rounded-md px-10 py-10 font-serif shadow-xl print:max-w-full print:rounded-none print:border-0 print:px-0 print:py-0 print:shadow-none"
      style={{
        background: C.paper,
        color: C.body,
        border: `1px solid ${C.border}`,
      }}
    >
      <header
        className="mb-6 border-b pb-3"
        style={{ borderColor: C.border }}
      >
        <h1
          className="font-display text-3xl"
          style={{ color: C.headline }}
        >
          {companyName}
        </h1>
        {content.meta?.one_liner && (
          <p
            className="mt-1 text-base italic"
            style={{ color: C.oneLiner }}
          >
            {content.meta.one_liner}
          </p>
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
                <h2
                  className="mb-1 text-sm font-semibold uppercase tracking-wider"
                  style={{ color: C.sectionTitlePending }}
                >
                  {s.title}
                </h2>
                <div
                  className="rounded-md border border-dashed px-3 py-3 text-sm italic no-print"
                  style={{ borderColor: C.borderDashed, color: C.pendingText }}
                >
                  Pending — {sourceLabels}
                </div>
              </section>
            );
          }

          return (
            <section key={s.key} className="mb-5">
              <h2
                className="mb-1 flex items-baseline gap-2 text-sm font-semibold uppercase tracking-wider"
                style={{ color: C.sectionTitle }}
              >
                <span>{s.title}</span>
                {status === "ready" && (
                  <span
                    className="rounded border px-1.5 py-0 text-[9px] not-italic no-print"
                    style={{
                      borderColor: "#10b981",
                      background: "#d1fae5",
                      color: "#065f46",
                    }}
                  >
                    READY
                  </span>
                )}
                {status === "draft" && (
                  <span
                    className="rounded border px-1.5 py-0 text-[9px] not-italic no-print"
                    style={{
                      borderColor: "#0891b2",
                      background: "#cffafe",
                      color: "#155e75",
                    }}
                  >
                    DRAFT
                  </span>
                )}
              </h2>
              <p
                className="whitespace-pre-wrap text-[0.95rem] leading-snug"
                style={{ color: C.body }}
              >
                {text}
              </p>
            </section>
          );
        })}
      </div>

      {content.meta?.generated_at && (
        <footer
          className="mt-6 border-t pt-2 text-xs"
          style={{ borderColor: C.borderSoft, color: C.muted }}
        >
          Generated {new Date(content.meta.generated_at).toLocaleDateString()} — PMFinder
        </footer>
      )}
    </article>
  );
}
