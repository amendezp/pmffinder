import Link from "next/link";
import { Compass } from "@/components/Compass";
import { getCurrentUser } from "@/lib/supabase/server";

const SIGNAL_CARDS = [
  {
    n: "01",
    title: "Unique Insight",
    signal: "Right + Non-consensus",
    status: "STRONG",
    bars: [85],
    accent: "cyan" as const,
  },
  {
    n: "02",
    title: "Technological Inflection",
    signal: "Durability Vector",
    status: "STABILIZING",
    bars: [40, 60, 80, 100, 100],
    accent: "cyan" as const,
  },
  {
    n: "03",
    title: "Desperate Customers",
    signal: "Behavior > Intent",
    status: "MAPPING…",
    bars: [20, 40, 30, 60, 80, 50],
    accent: "cyan" as const,
    chart: true,
  },
  {
    n: "04",
    title: "Friction Zones",
    signal: "Pivot Vector",
    status: "HIGH",
    bars: [90],
    accent: "pink" as const,
  },
];

export default async function Landing() {
  const user = await getCurrentUser().catch(() => null);
  return (
    <main className="relative min-h-screen w-full overflow-hidden">
      {/* Off-canvas decorative radar */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-[-22%] top-1/2 z-0 hidden -translate-y-1/2 lg:block"
      >
        <Compass activeStage={1} size={900} decorative />
      </div>

      {/* HUD — top-right */}
      <div className="absolute right-8 top-8 z-30 text-right font-mono text-[10px] tracking-widest text-neon-cyan/70 no-print">
        <div className="mb-1 flex items-center justify-end gap-3">
          <span>POS_X</span>
          <span className="w-[60px] text-white">{user ? "AUTH" : "GUEST"}</span>
        </div>
        <div className="mb-1 flex items-center justify-end gap-3">
          <span>SYS</span>
          <span className="w-[60px] text-white">v0.1.0</span>
        </div>
        <div className="mt-3 flex items-center justify-end gap-3 text-neon-pink">
          <span>MODE</span>
          <span className="animate-pulse border border-neon-pink/30 px-2 py-1">
            CALIBRATING
          </span>
        </div>
      </div>

      <section className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-8 py-16 md:px-16">
        {/* System tag */}
        <div className="mb-8 flex items-center gap-4 font-mono text-xs uppercase tracking-widest opacity-80 fade-in-up">
          <div className="h-2 w-2 animate-pulse bg-neon-cyan" />
          <span>Sys.Scan // Locating Pattern</span>
          <div className="hud-line-decorator h-px flex-1 opacity-50" />
        </div>

        {/* Hero */}
        <div
          className="relative mb-12 max-w-xl fade-in-up"
          style={{ animationDelay: "0.05s" }}
        >
          <div className="absolute -left-8 top-0 bottom-0 w-[2px] bg-gradient-to-b from-neon-cyan/0 via-neon-cyan to-neon-cyan/0" />
          <h2 className="mb-2 font-mono text-sm text-white/70">Target Objective:</h2>
          <h1 className="bg-gradient-to-br from-white to-neon-cyan bg-clip-text pb-2 font-serif text-7xl italic leading-none text-transparent text-glow md:text-8xl">
            Market Fit
          </h1>
          <p className="mt-6 max-w-lg text-base font-mono leading-relaxed text-white/70">
            A guided journey that gates your progress through the scientific PMF
            process — until each waypoint is genuinely earned. Then exports a
            Sequoia-style 2-pager memo.
          </p>
        </div>

        {/* Signal cards */}
        <div
          className="flex max-w-md flex-col gap-5 fade-in-up"
          style={{ animationDelay: "0.1s" }}
        >
          {SIGNAL_CARDS.map((c) => {
            const isPink = c.accent === "pink";
            const lineColor = isPink ? "border-neon-pink/50" : "border-neon-cyan/30";
            const lineHover = isPink ? "hover:border-neon-pink" : "hover:border-neon-cyan";
            const bg = isPink
              ? "hover:bg-neon-pink/5"
              : "bg-gradient-to-r from-neon-cyan/5 to-transparent";
            const dotBorder = isPink ? "border-neon-pink" : "border-neon-cyan";
            const dotGlow = isPink
              ? "group-hover:bg-neon-pink group-hover:shadow-cyber-pink-glow"
              : "group-hover:bg-neon-cyan group-hover:shadow-cyber-glow";
            const titleHover = isPink
              ? "group-hover:text-neon-pink text-glow-pink"
              : "group-hover:text-neon-cyan";
            const chipColors = isPink
              ? "border-neon-pink/20 bg-neon-pink/10 text-neon-pink"
              : "border-neon-cyan/20 bg-neon-cyan/10 text-neon-cyan/80";
            const signalText = isPink ? "text-neon-pink/70" : "text-neon-cyan/70";
            const statusText = isPink
              ? "text-white text-glow-pink animate-pulse"
              : "text-white";

            return (
              <div
                key={c.n}
                className={[
                  "group relative cursor-crosshair border-l py-3 pl-6 backdrop-blur-sm transition-colors duration-300",
                  lineColor,
                  lineHover,
                  bg,
                ].join(" ")}
              >
                <div
                  className={`absolute -left-[5px] top-1/2 h-[9px] w-[9px] -translate-y-1/2 rounded-full border bg-deep-blue transition-all ${dotBorder} ${dotGlow}`}
                />
                <div className="mb-1 flex items-baseline justify-between">
                  <h3
                    className={`font-serif text-2xl italic text-white transition-colors ${titleHover}`}
                  >
                    {c.title}
                  </h3>
                  <span
                    className={`rounded border px-2 py-0.5 font-mono text-[10px] tracking-widest ${chipColors}`}
                  >
                    {c.n}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-widest">
                  <span className={signalText}>{c.signal}</span>
                  <span className={`font-bold ${statusText}`}>{c.status}</span>
                </div>

                {!c.chart ? (
                  <div
                    className={`mt-3 h-[3px] w-full overflow-hidden rounded-sm ${isPink ? "bg-neon-pink/20" : "bg-neon-cyan/20"}`}
                  >
                    <div
                      className={`relative h-full ${isPink ? "bg-neon-pink" : "bg-neon-cyan"}`}
                      style={{ width: `${c.bars[0] ?? 50}%` }}
                    >
                      {isPink ? (
                        <div
                          className="absolute inset-0"
                          style={{
                            backgroundImage:
                              "repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(0,0,0,0.3) 5px, rgba(0,0,0,0.3) 10px)",
                          }}
                        />
                      ) : (
                        <div className="absolute top-0 right-0 h-full w-8 animate-pulse-fast bg-white/50" />
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 flex h-[22px] items-end gap-[2px] border border-neon-cyan/20 px-1">
                    {c.bars.map((h, i) => (
                      <div
                        key={i}
                        className={[
                          "flex-1",
                          i === c.bars.length - 1
                            ? "bg-white animate-pulse-fast"
                            : "bg-neon-cyan",
                        ].join(" ")}
                        style={{
                          height: `${h}%`,
                          opacity: i === c.bars.length - 1 ? 1 : 0.3 + (h / 100) * 0.7,
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div
          className="mt-10 flex flex-wrap items-center gap-4 fade-in-up"
          style={{ animationDelay: "0.2s" }}
        >
          <Link
            href={user ? "/projects" : "/try"}
            className="border border-neon-cyan bg-neon-cyan/10 px-6 py-3 font-mono text-xs uppercase tracking-widest text-neon-cyan shadow-cyber-glow transition hover:bg-neon-cyan hover:text-deep-blue"
          >
            {user ? "Open your projects →" : "Initiate scan →"}
          </Link>
          {!user && (
            <Link
              href="/sign-in"
              className="border border-neon-cyan/40 px-6 py-3 font-mono text-xs uppercase tracking-widest text-white/80 transition hover:border-neon-cyan hover:text-white"
            >
              Authenticate →
            </Link>
          )}
        </div>

        {!user && (
          <p
            className="mt-4 max-w-md font-mono text-[11px] text-neon-cyan/60 fade-in-up"
            style={{ animationDelay: "0.25s" }}
          >
            No account required to demo. Authenticate to save progress, upload
            evidence, and export your memo.
          </p>
        )}
      </section>

      {/* Bottom telemetry bar */}
      <div className="fixed bottom-0 left-0 z-30 flex w-full items-center justify-between border-t border-neon-cyan/20 bg-deep-blue/60 px-4 py-3 font-mono text-[10px] backdrop-blur-md no-print md:px-8">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-2 text-white">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-neon-cyan" />
            TELEMETRY ONLINE
          </span>
          <span className="hidden text-neon-cyan/60 md:inline-block">
            v0.1.0 // PMF-RADAR
          </span>
        </div>
        <div className="mx-8 hidden max-w-md flex-1 items-center gap-2 sm:flex">
          <span className="text-neon-cyan/60">SCAN</span>
          <div className="relative h-[2px] flex-1 overflow-hidden bg-neon-cyan/10">
            <div className="absolute top-0 left-0 h-full w-1/4 animate-scan-line bg-neon-cyan" />
          </div>
        </div>
        <div className="text-neon-cyan/60">
          “Market wins.”
        </div>
      </div>
    </main>
  );
}
