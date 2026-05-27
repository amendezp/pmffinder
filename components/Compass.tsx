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

export function Compass({
  activeStage,
  passedStages = new Set(),
  onStageClick,
  size = 480,
  decorative = false,
}: CompassProps) {
  const cx = size / 2;
  const cy = size / 2;
  const ringR = size * 0.36; // ring waypoints sit on
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

        {/* Far dashed sweep — slowly counter-rotates */}
        <g
          className="origin-center animate-spin-reverse-slow"
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        >
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
        </g>

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

        {/* Dashed mid-ring slowly rotates */}
        <g
          className="origin-center animate-spin-medium"
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        >
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
        </g>

        {/* Faint sweep beam — a barely-visible pie slice rotating */}
        <motion.path
          d={`M ${cx} ${cy} L ${cx} ${cy - outerR} A ${outerR} ${outerR} 0 0 1 ${cx + outerR * Math.sin((Math.PI * 2) / 36)} ${cy - outerR * Math.cos((Math.PI * 2) / 36)} Z`}
          fill={COLORS.light}
          fillOpacity={0.08}
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        />

        {/* Tick marks — sparse, only every 30° */}
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
        <g
          className="origin-center animate-spin-fast"
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        >
          <circle
            cx={cx}
            cy={cy}
            r={size * 0.05}
            stroke={COLORS.accent}
            strokeWidth={0.5}
            strokeDasharray="2 6"
            fill="none"
          />
        </g>

        {/* Needle */}
        <motion.g
          initial={false}
          animate={{ rotate: needleAngle }}
          transition={{ type: "spring", stiffness: 50, damping: 14 }}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
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
                <motion.circle
                  cx={w.x}
                  cy={w.y}
                  r={waypointR * 3.2}
                  fill={COLORS.text}
                  opacity={0.06}
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ repeat: Infinity, duration: 3.2, ease: "easeInOut" }}
                  style={{ transformOrigin: `${w.x}px ${w.y}px` }}
                />
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
                <>
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
                </>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
