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
  "Value Hypothesis",
  "Concept",
  "Implementation",
  "MVP Metrics",
  "Surprise",
  "Decision",
];

const COLORS = {
  line: "#E0E0E0",
  light: "#95A5A6",
  text: "#2C3E50",
  accent: "#7F8C8D",
};

/**
 * SVG-native rotating <g>. animateTransform is supported in every modern
 * browser and avoids the CSS transform-origin quirks of SMIL+SVG hybrids.
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
  const ringR = size * 0.36;
  const outerR = size * 0.46;
  const farR = size * 0.48;
  const waypointR = size * 0.018;

  const waypoints = STAGE_LABELS.map((label, i) => {
    const stage = i + 1;
    const angle = (i / 7) * Math.PI * 2 - Math.PI / 2;
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

  const needleAngle = ((activeStage - 1) / 7) * 360;
  const needleLength = ringR - waypointR - size * 0.005;

  // Sweep beam — a thin wedge that rotates slowly around the dial.
  const wedgeAngle = (Math.PI * 2) / 20; // ~18°
  const wedgeTip = {
    x: cx + outerR * Math.sin(wedgeAngle),
    y: cy - outerR * Math.cos(wedgeAngle),
  };
  const sweepPath = `M ${cx} ${cy} L ${cx} ${cy - outerR} A ${outerR} ${outerR} 0 0 1 ${wedgeTip.x} ${wedgeTip.y} Z`;

  return (
    <div className="relative inline-block" style={{ width: size, height: size }}>
      <svg
        viewBox={`0 0 ${size} ${size}`}
        width={size}
        height={size}
        className="overflow-visible"
      >
        {/* Outer hairline ring */}
        <circle
          cx={cx}
          cy={cy}
          r={farR}
          stroke={COLORS.line}
          strokeWidth={0.5}
          fill="none"
        />

        {/* Far dashed sweep — counter-rotates */}
        <SpinG cx={cx} cy={cy} duration={25} reverse>
          <circle
            cx={cx}
            cy={cy}
            r={farR - 2}
            stroke={COLORS.light}
            strokeOpacity={0.55}
            strokeWidth={0.5}
            strokeDasharray="1 14"
            fill="none"
          />
          {/* Two markers traveling on the far ring */}
          <circle cx={cx} cy={cy - (farR - 2)} r={2} fill={COLORS.accent} />
          <circle
            cx={cx + (farR - 2) * Math.sin((Math.PI * 2 * 4.3) / 7)}
            cy={cy - (farR - 2) * Math.cos((Math.PI * 2 * 4.3) / 7)}
            r={1.5}
            fill={COLORS.accent}
          />
        </SpinG>

        {/* Crosshair */}
        <g stroke={COLORS.line} strokeWidth={0.5}>
          <line x1={cx} y1={cy - farR} x2={cx} y2={cy + farR} />
          <line x1={cx - farR} y1={cy} x2={cx + farR} y2={cy} />
        </g>

        {/* Inner ring (waypoint orbit) */}
        <circle
          cx={cx}
          cy={cy}
          r={ringR}
          stroke={COLORS.line}
          strokeWidth={0.5}
          fill="none"
        />

        {/* Sweep beam — slow rotation */}
        <SpinG cx={cx} cy={cy} duration={28}>
          <path d={sweepPath} fill={COLORS.light} fillOpacity={0.09} />
        </SpinG>

        {/* Dashed mid-ring rotates */}
        <SpinG cx={cx} cy={cy} duration={18}>
          <circle
            cx={cx}
            cy={cy}
            r={outerR}
            stroke={COLORS.light}
            strokeOpacity={0.5}
            strokeWidth={0.5}
            strokeDasharray="2 16"
            fill="none"
          />
        </SpinG>

        {/* Tick marks every 30° */}
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
          const inner = farR - 4;
          const outer = farR + 4;
          return (
            <line
              key={i}
              x1={cx + Math.cos(a) * inner}
              y1={cy + Math.sin(a) * inner}
              x2={cx + Math.cos(a) * outer}
              y2={cy + Math.sin(a) * outer}
              stroke={COLORS.line}
              strokeWidth={0.6}
            />
          );
        })}

        {/* Center marker */}
        <circle cx={cx} cy={cy} r={2.5} fill={COLORS.text} />
        <circle
          cx={cx}
          cy={cy}
          r={size * 0.03}
          stroke={COLORS.line}
          strokeWidth={0.5}
          fill="none"
        />
        <SpinG cx={cx} cy={cy} duration={12}>
          <circle
            cx={cx}
            cy={cy}
            r={size * 0.05}
            stroke={COLORS.accent}
            strokeWidth={0.5}
            strokeDasharray="2 6"
            fill="none"
          />
        </SpinG>

        {/* Needle — framer-motion handles the spring on stage change */}
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
            stroke={COLORS.text}
            strokeWidth={1}
            strokeLinecap="round"
          />
          <circle
            cx={cx}
            cy={cy - needleLength}
            r={size * 0.012}
            fill={COLORS.text}
          />
        </motion.g>

        {/* Waypoints */}
        {waypoints.map((w) => {
          const isActive = w.stage === activeStage;
          const isPassed = passedStages.has(w.stage);

          return (
            <g
              key={w.stage}
              className={onStageClick ? "cursor-pointer" : ""}
              onClick={() => onStageClick?.(w.stage)}
            >
              {isActive && (
                <>
                  {/* Pulse halo via SMIL — works without framer's CSS handling */}
                  <circle
                    cx={w.x}
                    cy={w.y}
                    r={waypointR * 3.2}
                    fill={COLORS.text}
                    opacity={0.08}
                  >
                    <animate
                      attributeName="r"
                      values={`${waypointR * 2.4};${waypointR * 4};${waypointR * 2.4}`}
                      dur="3.2s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.12;0.04;0.12"
                      dur="3.2s"
                      repeatCount="indefinite"
                    />
                  </circle>
                </>
              )}
              <circle
                cx={w.x}
                cy={w.y}
                r={waypointR * (isActive ? 1.4 : 1)}
                fill={isPassed || isActive ? COLORS.text : "#FFFFFF"}
                stroke={isPassed || isActive ? COLORS.text : COLORS.light}
                strokeWidth={0.8}
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
                  fill={isActive ? COLORS.text : COLORS.light}
                  fontFamily='"Inter", sans-serif'
                  style={{ letterSpacing: "0.15em" }}
                >
                  {`0${w.stage}`.slice(-2)} · {w.label.toUpperCase()}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
