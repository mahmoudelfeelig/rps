import React from 'react';

export const TRAIT_INFO = {
  // Passive coin generators
  forager:      { desc: "Earns 3 extra coins whenever you claim resources.", rarity: "common" },
  naptime:      { desc: "Earns 2 extra coins whenever you claim resources.", rarity: "common" },
  luminous:     { desc: "Earns 5 extra coins whenever you claim resources.", rarity: "rare" },

  // Boost overall generation
  resourceful:  { desc: "Boosts all resource gains by 50%.", rarity: "epic" },
  hoarder:      { desc: "Adds +5 coins to every resource claim.", rarity: "uncommon" },
  shinycoat:    { desc: "Boosts all resource gains by 20%.", rarity: "uncommon" },
  glutton:      { desc: "Grants +1 of each food type on every resource claim.", rarity: "rare" },

  // Affection modifiers
  cheerful:     { desc: "Increases affection gains from activities by +2.", rarity: "common" },
  snuggly:      { desc: "Increases affection gains from activities by +3.", rarity: "uncommon" },
  patient:      { desc: "Increases affection gains from activities by +5.", rarity: "epic" },
  bold:         { desc: "Increases affection gains from activities by +4.", rarity: "rare" },

  // Mini-game EXP modifiers
  cunning:      { desc: "Boosts mini-game EXP gains by 10%.", rarity: "common" },
  mystic:       { desc: "Boosts mini-game EXP gains by 15%.", rarity: "uncommon" },
  acrobat:      { desc: "Boosts mini-game EXP gains by 20%.", rarity: "rare" },
  energetic:    { desc: "Boosts mini-game EXP gains by 30%.", rarity: "epic" },
  precise:      { desc: "Boosts mini-game EXP gains by 25%.", rarity: "rare" },

  // Mini-game score doublers
  splashy:      { desc: "Doubles your mini-game score on occasion.", rarity: "epic" },
  sprinter:     { desc: "Doubles your mini-game score on occasion.", rarity: "epic" },
  quickthinker: { desc: "Increases your mini-game score by 30%.", rarity: "rare" },
  stalwart:     { desc: "Adds +1 to your mini-game score.", rarity: "uncommon" }
};

const rarityColors = {
  common:   "bg-gray-600",
  uncommon: "bg-green-600",
  rare:     "bg-blue-600",
  epic:     "bg-purple-600"
};

export default function TraitDisplay({ traits }) {
  // if traits is an object, extract its keys; if array, use it; else empty
  const safeTraits = Array.isArray(traits)
    ? traits
    : (traits && typeof traits === 'object')
      ? Object.keys(traits)
      : [];

  if (safeTraits.length === 0) return null;

  return (
    <div className="mt-4">
      <h4 className="font-semibold mb-2">🌟 Traits</h4>
      <div className="flex flex-wrap gap-2">
        {safeTraits.map(trait => {
          const info = TRAIT_INFO[trait] || {};
          const color = rarityColors[info.rarity] || "bg-gray-700";
          return (
            <span
              key={trait}
              className={`px-3 py-1 text-xs rounded-full cursor-help transition ${color}`}
              title={info.desc || "No description yet"}
            >
              {trait}
            </span>
          );
        })}
      </div>
    </div>
  );
}
