import { MEMO_SECTIONS, type MemoContent } from "@/lib/memo/template";
import type { SectionStatus } from "@/lib/memo/draftFromStages";
import { rubrics } from "@/lib/rubrics";

/**
 * Renders the investment memo. Dark cyber theme on screen, flips to white
 * paper on print via CSS variables defined in globals.css under `.memo-page`.
 *
 * Structure follows the classic top-level investor cover-memo: a header
 * block (To/From/Re/Date), then nine sections in narrative order.
 */
export function MemoTemplate({
  content,
  projectName,
  sectionStatuses,
}: {
  content: MemoContent;
  projectName: string;
  /**
   * When provided, sections marked "pending" render as dim placeholder cards
   * pointing at the source stage(s). Ready/draft sections get small tags.
   */
  sectionStatuses?: Record<string, SectionStatus>;
}) {
  const companyName = content.meta?.company_name || projectName;
  const oneLiner = content.meta?.one_liner;
  const fromLabel = content.meta?.from || "Founders";
  const generatedAt = content.meta?.generated_at
    ? new Date(content.meta.generated_at)
    : new Date();
  const dateLabel = generatedAt.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <article
      className="memo-page mx-auto max-w-[820px] px-10 py-10 shadow-2xl print:max-w-full print:rounded-none print:border-0 print:px-0 print:py-0 print:shadow-none"
      style={{ fontFamily: '"Instrument Serif", Georgia, serif' }}
    >
      {/* Header block: To / From / Re / Date */}
      <header
        className="mb-8 border-b pb-4"
        style={{ borderColor: "var(--memo-header-rule)" }}
      >
        <div
          className="grid grid-cols-1 gap-y-1 font-mono text-xs sm:grid-cols-2"
          style={{ color: "var(--memo-fg-muted)" }}
        >
          <div>
            <span style={{ color: "var(--memo-eyebrow)" }}>To:</span> Investors
          </div>
          <div className="sm:text-right">
            <span style={{ color: "var(--memo-eyebrow)" }}>Date:</span>{" "}
            {dateLabel}
          </div>
          <div>
            <span style={{ color: "var(--memo-eyebrow)" }}>From:</span>{" "}
            {fromLabel}
          </div>
          <div className="sm:text-right">
            <span style={{ color: "var(--memo-eyebrow)" }}>Re:</span>{" "}
            {companyName}
          </div>
        </div>

        <h1
          className="mt-5 text-4xl italic leading-tight"
          style={{ color: "var(--memo-fg)" }}
        >
          {companyName}
        </h1>
        {oneLiner && (
          <p
            className="mt-1 text-base italic"
            style={{ color: "var(--memo-fg-muted)" }}
          >
            {oneLiner}
          </p>
        )}
      </header>

      {/* Sections — single column, narrative flow */}
      <div className="space-y-7">
        {MEMO_SECTIONS.map((s) => {
          const text = content.sections?.[s.key];
          const status = sectionStatuses?.[s.key];
          const isPending = !text || status === "pending";

          if (isPending) {
            const sourceLabels = s.sourceStages.length
              ? s.sourceStages
                  .map(
                    (n) =>
                      `Stage ${n} (${rubrics[n as 1 | 2 | 3 | 4 | 5 | 6 | 7].title})`
                  )
                  .join(" + ")
              : "Founder-provided at memo polish";
            return (
              <section key={s.key}>
                <h2
                  className="mb-2 font-mono text-xs font-semibold uppercase tracking-widest"
                  style={{ color: "var(--memo-section-title-pending)" }}
                >
                  {s.title}
                </h2>
                <div
                  className="border border-dashed px-3 py-3 text-sm italic no-print"
                  style={{
                    borderColor: "var(--memo-pending-border)",
                    color: "var(--memo-pending-text)",
                  }}
                >
                  Pending — {sourceLabels}
                </div>
              </section>
            );
          }

          return (
            <section key={s.key}>
              <h2
                className="mb-3 flex items-baseline gap-2 font-mono text-xs font-semibold uppercase tracking-widest"
                style={{ color: "var(--memo-section-title)" }}
              >
                <span>{s.title}</span>
                {status === "ready" && (
                  <span
                    className="rounded border px-1.5 py-0 text-[9px] not-italic no-print"
                    style={{
                      borderColor: "var(--memo-ready-border)",
                      background: "var(--memo-ready-bg)",
                      color: "var(--memo-ready-text)",
                    }}
                  >
                    READY
                  </span>
                )}
                {status === "draft" && (
                  <span
                    className="rounded border px-1.5 py-0 text-[9px] not-italic no-print"
                    style={{
                      borderColor: "var(--memo-draft-border)",
                      background: "var(--memo-draft-bg)",
                      color: "var(--memo-draft-text)",
                    }}
                  >
                    DRAFT
                  </span>
                )}
              </h2>
              <div
                className="space-y-3 text-[1.05rem] leading-relaxed"
                style={{ color: "var(--memo-fg)" }}
              >
                {renderProse(text)}
              </div>
            </section>
          );
        })}
      </div>

      <footer
        className="mt-10 border-t pt-3 font-mono text-[10px] uppercase tracking-widest"
        style={{
          borderColor: "var(--memo-border-soft)",
          color: "var(--memo-fg-faint)",
        }}
      >
        Generated {dateLabel} — PMFinder
      </footer>
    </article>
  );
}

/**
 * Splits the section text into paragraphs and renders inline bold (`**...**`)
 * so the Key Risks section's sub-headers come through cleanly.
 */
function renderProse(text: string): React.ReactNode {
  const paragraphs = text.split(/\n\n+/);
  return paragraphs.map((p, i) => (
    <p key={i} className="whitespace-pre-wrap">
      {renderInline(p)}
    </p>
  ));
}

function renderInline(text: string): React.ReactNode {
  // Bold `**word**` segments; italic `_word_` segments.
  const parts: Array<{ kind: "text" | "bold" | "italic"; value: string }> = [];
  const regex = /\*\*([^*]+)\*\*|_([^_]+)_/g;
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > lastIndex) {
      parts.push({ kind: "text", value: text.slice(lastIndex, m.index) });
    }
    if (m[1]) parts.push({ kind: "bold", value: m[1] });
    else if (m[2]) parts.push({ kind: "italic", value: m[2] });
    lastIndex = m.index + m[0].length;
  }
  if (lastIndex < text.length) {
    parts.push({ kind: "text", value: text.slice(lastIndex) });
  }
  return parts.map((p, i) => {
    if (p.kind === "bold")
      return (
        <strong key={i} className="font-semibold">
          {p.value}
        </strong>
      );
    if (p.kind === "italic") return <em key={i}>{p.value}</em>;
    return <span key={i}>{p.value}</span>;
  });
}
