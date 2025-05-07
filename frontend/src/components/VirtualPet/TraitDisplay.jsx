import React from 'react';

const TRAIT_INFO = {
  forager: "Earns coins passively every 15 mins.",
  resourceful: "Boosts resource gains by 50%.",
  cheerful: "Gets extra affection from play.",
  snuggly: "Increases affection from all sources.",
  naptime: "Gains passive EXP.",
  splashy: "Sometimes doubles mini-game score.",
};

export default function TraitDisplay({ traits }) {
  return (
    <div className="mt-4">
      <h4 className="font-semibold mb-2">🌟 Traits</h4>
      <div className="flex flex-wrap gap-2">
        {traits.map(trait => (
          <span
            key={trait}
            className="px-3 py-1 bg-purple-700 text-xs rounded-full hover:bg-purple-600 transition cursor-help"
            title={TRAIT_INFO[trait] || "No description yet"}
          >
            {trait}
          </span>
        ))}
      </div>
    </div>
  );
}
