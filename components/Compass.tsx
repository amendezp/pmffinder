"use client";

import { motion } from "framer-motion";

interface CompassProps {
  /** 1..7 — the active stage. */
  activeStage: number;
  /** Set of stage numbers that have been passed. */
  passedStages?: Set<number>;
  /** Click handler — receives the stage number. */
  onStageClick?: (stage: number) => void;
  /** Size in px. */
  size?: number;
  /** When true, hide labels (use for decorative background instance). */
  decorative?: boolean;
}

const STAGE_LABELS = [
  "Sourcing",
  "The What",
  "The Who",
  "The How",
  "Concept",
  "Implementation",
  "Metrics + Surprise",
];

const CYAN = "#00f0ff";
const CYAN_30 = "rgba(0,240,255,0.3)";
const CYAN_15 = "rgba(0,240,255,0.15)";
const PINK = "#ff0055";
const GREEN = "#00ff88";
const WHITE = "#ffffff";

/**
 * SVG <g> rotating around (cx, cy) via animateTransform. Reliable across
 * browsers and unaffected by CSS transform-origin quirks.
 */
function SpinG({
  cx,
  cy,
  duration,
  reverse = false,
  children,
}: {
  cx: number;
  cy: number;
  duration: number;
  reverse?: boolean;
  children: React.ReactNode;
}) {
  const from = reverse ? `360 ${cx} ${cy}` : `0 ${cx} ${cy}`;
  const to = reverse ? `0 ${cx} ${cy}` : `360 ${cx} ${cy}`;
  return (
    <g>
      <animateTransform
        attributeName="transform"
        attributeType="XML"
        type="rotate"
        from={from}
        to={to}
        dur={`${duration}s`}
        repeatCount="indefinite"
      />
      {children}
    </g>
  );
}

export function Compass({
  activeStage,
  passedStages = new Set(),
  onStageClick,
  size = 480,
  decorative = false,
}: CompassProps) {
  const cx = size / 2;
  const cy = size / 2;
  const innerR = size * 0.15;
  const ringR = size * 0.28; // waypoint ring
  const farR = size * 0.42;
  const outerR = size * 0.48;
  const waypointR = size * 0.014;

  const N = STAGE_LABELS.length;
  const waypoints = STAGE_LABELS.map((label, i) => {
    const stage = i + 1;
    const angle = (i / N) * Math.PI * 2 - Math.PI / 2;
    return {
      stage,
      label,
      angle,
      x: cx + Math.cos(angle) * ringR,
      y: cy + Math.sin(angle) * ringR,
      labelX: cx + Math.cos(angle) * (ringR + size * 0.06),
      labelY: cy + Math.sin(angle) * (ringR + size * 0.06),
    };
  });

  const needleAngle = ((activeStage - 1) / N) * 360;
  const needleLength = ringR - waypointR * 2;

  // Sweep beam wedge
  const wedgeAngle = (Math.PI * 2) / 18;
  const wedgeTip = {
    x: cx + farR * Math.sin(wedgeAngle),
    y: cy - farR * Math.cos(wedgeAngle),
  };
  const sweepPath = `M ${cx} ${cy} L ${cx} ${cy - farR} A ${farR} ${farR} 0 0 1 ${wedgeTip.x} ${wedgeTip.y} Z`;

  const bracketLen = size * 0.05;
  const bracketInset = size * 0.04;

  return (
    <div
      className="relative inline-block svg-glow"
      style={{ width: size, height: size }}
    >
      <svg
        viewBox={`0 0 ${size} ${size}`}
        width={size}
        height={size}
        className="overflow-visible"
      >
        <defs>
          <radialGradient id="radar-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={CYAN} stopOpacity="0.18" />
            <stop offset="50%" stopColor={CYAN} stopOpacity="0.05" />
            <stop offset="100%" stopColor={CYAN} stopOpacity="0" />
          </radialGradient>
          <pattern
            id="dot-grid"
            x="0"
            y="0"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="2" cy="2" r="0.8" fill={CYAN} opacity="0.25" />
          </pattern>
        </defs>

        {/* Radial glow */}
        <circle cx={cx} cy={cy} r={outerR} fill="url(#radar-glow)" />
        {/* Dot grid fill, gated to the outer ring */}
        <circle cx={cx} cy={cy} r={outerR - 2} fill="url(#dot-grid)" opacity="0.5" />

        {/* Crosshair + diagonals */}
        <g stroke={CYAN} strokeOpacity={0.28} strokeWidth={0.8}>
          <line x1={cx} y1={cy - outerR} x2={cx} y2={cy + outerR} />
          <line x1={cx - outerR} y1={cy} x2={cx + outerR} y2={cy} />
          <line
            x1={cx - outerR * 0.7}
            y1={cy - outerR * 0.7}
            x2={cx + outerR * 0.7}
            y2={cy + outerR * 0.7}
            strokeDasharray="3 6"
          />
          <line
            x1={cx - outerR * 0.7}
            y1={cy + outerR * 0.7}
            x2={cx + outerR * 0.7}
            y2={cy - outerR * 0.7}
            strokeDasharray="3 6"
          />
        </g>

        {/* Concentric rings */}
        <circle
          cx={cx}
          cy={cy}
          r={ringR}
          stroke={CYAN}
          strokeOpacity={0.25}
          strokeWidth={1}
          fill="none"
        />
        <circle
          cx={cx}
          cy={cy}
          r={farR}
          stroke={CYAN}
          strokeOpacity={0.18}
          strokeWidth={1}
          fill="none"
        />

        {/* Sweep beam */}
        <SpinG cx={cx} cy={cy} duration={28}>
          <path d={sweepPath} fill={CYAN} opacity="0.08" />
        </SpinG>

        {/* Mid ring dashed rotation */}
        <SpinG cx={cx} cy={cy} duration={22} reverse>
          <circle
            cx={cx}
            cy={cy}
            r={farR}
            stroke={CYAN}
            strokeWidth={1}
            strokeDasharray="2 12"
            fill="none"
          />
          {/* Moving targets on the mid ring */}
          <circle cx={cx} cy={cy - farR} r="5" fill={CYAN} />
          <circle
            cx={cx + farR * Math.sin((Math.PI * 2 * 3.4) / 7)}
            cy={cy - farR * Math.cos((Math.PI * 2 * 3.4) / 7)}
            r="3.5"
            fill={PINK}
          />
        </SpinG>

        {/* Outer dashed band */}
        <circle
          cx={cx}
          cy={cy}
          r={outerR}
          stroke={CYAN}
          strokeOpacity={0.35}
          strokeWidth={1}
          strokeDasharray={`${size * 0.1} ${size * 0.02}`}
          fill="none"
        />
        <circle
          cx={cx}
          cy={cy}
          r={outerR + 5}
          stroke={CYAN}
          strokeOpacity={0.1}
          strokeWidth={size * 0.025}
          fill="none"
        />

        {/* Inner partial arc rotating */}
        <SpinG cx={cx} cy={cy} duration={8}>
          <path
            d={`M ${cx} ${cy - innerR} A ${innerR} ${innerR} 0 0 1 ${cx + innerR} ${cy}`}
            stroke={CYAN}
            strokeWidth={3}
            fill="none"
          />
          <circle cx={cx + innerR} cy={cy} r="4" fill={WHITE} />
        </SpinG>

        {/* Inner ring boundary */}
        <circle
          cx={cx}
          cy={cy}
          r={innerR}
          stroke={CYAN}
          strokeOpacity={0.25}
          strokeWidth={1}
          fill="none"
        />

        {/* Center */}
        <circle
          cx={cx}
          cy={cy}
          r={size * 0.018}
          fill={WHITE}
        />
        <circle
          cx={cx}
          cy={cy}
          r={size * 0.05}
          stroke={CYAN}
          strokeWidth={1.5}
          fill="none"
        />
        <SpinG cx={cx} cy={cy} duration={10}>
          <circle
            cx={cx}
            cy={cy}
            r={size * 0.08}
            stroke={CYAN}
            strokeWidth={1}
            strokeDasharray="5 5"
            fill="none"
          />
        </SpinG>

        {/* Corner brackets */}
        <g stroke={CYAN} strokeOpacity={0.55} strokeWidth={1.5} fill="none">
          <path
            d={`M ${bracketInset + bracketLen} ${bracketInset} L ${bracketInset} ${bracketInset} L ${bracketInset} ${bracketInset + bracketLen}`}
          />
          <path
            d={`M ${size - bracketInset - bracketLen} ${bracketInset} L ${size - bracketInset} ${bracketInset} L ${size - bracketInset} ${bracketInset + bracketLen}`}
          />
          <path
            d={`M ${bracketInset + bracketLen} ${size - bracketInset} L ${bracketInset} ${size - bracketInset} L ${bracketInset} ${size - bracketInset - bracketLen}`}
          />
          <path
            d={`M ${size - bracketInset - bracketLen} ${size - bracketInset} L ${size - bracketInset} ${size - bracketInset} L ${size - bracketInset} ${size - bracketInset - bracketLen}`}
          />
        </g>

        {/* Needle */}
        <motion.g
          initial={false}
          animate={{ rotate: needleAngle }}
          transition={{ type: "spring", stiffness: 50, damping: 14 }}
          style={{ originX: `${cx}px`, originY: `${cy}px` }}
        >
          <line
            x1={cx}
            y1={cy}
            x2={cx}
            y2={cy - needleLength}
            stroke={WHITE}
            strokeWidth={1.5}
            strokeLinecap="round"
            opacity={0.9}
          />
          <circle
            cx={cx}
            cy={cy - needleLength}
            r={size * 0.012}
            fill={CYAN}
          />
        </motion.g>

        {/* Waypoints */}
        {waypoints.map((w) => {
          const isActive = w.stage === activeStage;
          const isPassed = passedStages.has(w.stage);
          const stroke = isPassed ? GREEN : isActive ? CYAN : CYAN_30;
          const fill = isPassed ? GREEN : isActive ? CYAN : "#050814";

          return (
            <g
              key={w.stage}
              className={onStageClick ? "cursor-pointer" : ""}
              onClick={() => onStageClick?.(w.stage)}
            >
              {isActive && (
                <circle cx={w.x} cy={w.y} r={waypointR * 4} fill={CYAN} opacity={0.12}>
                  <animate
                    attributeName="r"
                    values={`${waypointR * 2.5};${waypointR * 4.5};${waypointR * 2.5}`}
                    dur="2s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.18;0.04;0.18"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}
              <circle
                cx={w.x}
                cy={w.y}
                r={waypointR * (isActive ? 1.6 : 1.3)}
                fill={fill}
                stroke={stroke}
                strokeWidth={1.2}
              />
              {!decorative && (
                <text
                  x={w.labelX}
                  y={w.labelY}
                  textAnchor={
                    Math.abs(Math.cos(w.angle)) < 0.2
                      ? "middle"
                      : Math.cos(w.angle) > 0
                        ? "start"
                        : "end"
                  }
                  dominantBaseline="middle"
                  fontSize={Math.max(9, size * 0.022)}
                  fill={isPassed ? GREEN : isActive ? WHITE : CYAN_30}
                  fontFamily='"Space Mono", monospace'
                  style={{ letterSpacing: "0.1em" }}
                >
                  {`0${w.stage}`.slice(-2)} — {w.label.toUpperCase()}
                </text>
              )}
            </g>
          );
        })}

        {/* Decorative outer ticks */}
        <SpinG cx={cx} cy={cy} duration={45}>
          <g stroke={CYAN} strokeOpacity={0.6} strokeWidth={1}>
            <line x1={cx} y1={cy - outerR + 8} x2={cx} y2={cy - outerR - 2} />
            <line x1={cx + outerR - 2} y1={cy} x2={cx + outerR + 8} y2={cy} />
            <line x1={cx} y1={cy + outerR - 8} x2={cx} y2={cy + outerR + 2} />
            <line x1={cx - outerR + 2} y1={cy} x2={cx - outerR - 8} y2={cy} />
          </g>
        </SpinG>
      </svg>
    </div>
  );
}
