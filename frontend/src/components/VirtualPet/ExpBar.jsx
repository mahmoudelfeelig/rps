import React from 'react';

export default function ExpBar({ experience, level }) {
  // Compute thresholds
  const prevThresh = 50 * Math.pow(level - 1, 2);
  const nextThresh = 50 * Math.pow(level, 2);
  const gained     = experience - prevThresh;
  const span       = nextThresh - prevThresh;
  const pct        = Math.min(1, Math.max(0, gained / span)) * 100;

  return (
    <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden mt-2">
      <div
        className="h-full bg-green-400"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
