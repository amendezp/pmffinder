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

export function Compass({
  activeStage,
  passedStages = new Set(),
  onStageClick,
  size = 480,
}: CompassProps) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.42;
  const waypointR = size * 0.07;

  // 7 waypoints evenly spaced around the circle, top = stage 1
  const waypoints = STAGE_LABELS.map((label, i) => {
    const stage = i + 1;
    const angle = (i / 7) * Math.PI * 2 - Math.PI / 2;
    return {
      stage,
      label,
      x: cx + Math.cos(angle) * r,
      y: cy + Math.sin(angle) * r,
      angleDeg: (i / 7) * 360,
    };
  });

  // Needle angle = points toward the active stage's waypoint
  const needleAngle = ((activeStage - 1) / 7) * 360;

  return (
    <div className="relative inline-block" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
        {/* Outer ring — engraved brass look */}
        <defs>
          <radialGradient id="dial" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f4ecd6" />
            <stop offset="70%" stopColor="#e8d8ab" />
            <stop offset="100%" stopColor="#caa14a" />
          </radialGradient>
          <radialGradient id="dial-shadow" cx="50%" cy="50%" r="55%">
            <stop offset="80%" stopColor="rgba(0,0,0,0)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.35)" />
          </radialGradient>
          <filter id="needle-shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.35" />
          </filter>
        </defs>

        <circle cx={cx} cy={cy} r={r + size * 0.06} fill="#7d5a1c" opacity="0.25" />
        <circle cx={cx} cy={cy} r={r + size * 0.05} fill="url(#dial)" />
        <circle cx={cx} cy={cy} r={r + size * 0.05} fill="url(#dial-shadow)" />

        {/* Tick marks every 1/56 turn = 360/56 ≈ 6.43° */}
        {Array.from({ length: 56 }).map((_, i) => {
          const a = (i / 56) * Math.PI * 2 - Math.PI / 2;
          const inner = r - size * 0.005;
          const outer = i % 8 === 0 ? r + size * 0.03 : r + size * 0.015;
          const x1 = cx + Math.cos(a) * inner;
          const y1 = cy + Math.sin(a) * inner;
          const x2 = cx + Math.cos(a) * outer;
          const y2 = cy + Math.sin(a) * outer;
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#5e4a30"
              strokeWidth={i % 8 === 0 ? 1.6 : 0.8}
              opacity={i % 8 === 0 ? 0.85 : 0.55}
            />
          );
        })}

        {/* Compass-rose star in the center */}
        <g opacity="0.45">
          <polygon
            points={[
              [cx, cy - r * 0.35],
              [cx + r * 0.08, cy],
              [cx, cy + r * 0.35],
              [cx - r * 0.08, cy],
            ]
              .map((p) => p.join(","))
              .join(" ")}
            fill="#8a3324"
          />
          <polygon
            points={[
              [cx - r * 0.35, cy],
              [cx, cy + r * 0.08],
              [cx + r * 0.35, cy],
              [cx, cy - r * 0.08],
            ]
              .map((p) => p.join(","))
              .join(" ")}
            fill="#5e4a30"
          />
        </g>

        {/* Waypoints */}
        {waypoints.map((w) => {
          const isActive = w.stage === activeStage;
          const isPassed = passedStages.has(w.stage);
          const fill = isPassed ? "#7d5a1c" : isActive ? "#8a3324" : "#caa14a";
          const stroke = isActive ? "#221b10" : "#5e4a30";
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
                  r={waypointR * 1.6}
                  fill="#8a3324"
                  opacity={0.18}
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
                  style={{ transformOrigin: `${w.x}px ${w.y}px` }}
                />
              )}
              <circle
                cx={w.x}
                cy={w.y}
                r={waypointR}
                fill={fill}
                stroke={stroke}
                strokeWidth={isActive ? 2.5 : 1.5}
              />
              <text
                x={w.x}
                y={w.y + 4}
                textAnchor="middle"
                fontSize={waypointR * 0.9}
                fill={isPassed || isActive ? "#fbf7ee" : "#221b10"}
                fontWeight="600"
                fontFamily="ui-serif, Georgia, serif"
              >
                {w.stage}
              </text>
              <text
                x={w.x}
                y={w.y + waypointR + 18}
                textAnchor="middle"
                fontSize={Math.max(10, size * 0.024)}
                fill="#221b10"
                fontFamily="ui-serif, Georgia, serif"
                opacity={isActive ? 1 : 0.75}
              >
                {w.label}
              </text>
            </g>
          );
        })}

        {/* Needle */}
        <motion.g
          filter="url(#needle-shadow)"
          initial={false}
          animate={{ rotate: needleAngle }}
          transition={{ type: "spring", stiffness: 60, damping: 14 }}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        >
          <polygon
            points={`${cx},${cy - r * 0.78} ${cx - r * 0.04},${cy} ${cx},${cy + r * 0.18} ${cx + r * 0.04},${cy}`}
            fill="#1f1a14"
          />
          <polygon
            points={`${cx},${cy - r * 0.05} ${cx - r * 0.04},${cy} ${cx},${cy + r * 0.18} ${cx + r * 0.04},${cy}`}
            fill="#a87d2c"
            opacity={0.85}
          />
          <circle cx={cx} cy={cy} r={r * 0.045} fill="#1f1a14" />
          <circle cx={cx} cy={cy} r={r * 0.022} fill="#a87d2c" />
        </motion.g>
      </svg>
    </div>
  );
}
