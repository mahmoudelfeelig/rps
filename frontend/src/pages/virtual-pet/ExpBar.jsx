import React from 'react';

export default function ExpBar({ experience, level }) {
  const prevThresh = 50 * Math.pow(level - 1, 2);
  const nextThresh = 50 * Math.pow(level, 2);
  const gained     = experience - prevThresh;
  const span       = nextThresh - prevThresh;
  const pct        = Math.min(1, Math.max(0, gained / span)) * 100;

  return (
    <div className="mt-2 h-2 w-full overflow-hidden rounded-full border border-white/10 bg-white/[0.08]">
      <div
        className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-emerald-300 to-lime-200 shadow-[0_0_18px_rgba(34,211,238,0.35)] transition-[width] duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
