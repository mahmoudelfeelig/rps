export const TRAIT_INFO = {
  // Passive coin generators
  forager:      "Earns 3 extra coins whenever you claim resources.",
  naptime:      "Earns 2 extra coins whenever you claim resources.",
  luminous:     "Earns 5 extra coins whenever you claim resources.",

  // Boost overall generation
  resourceful:  "Boosts all resource gains by 50%.",
  hoarder:      "Adds +5 coins to every resource claim.",
  shinycoat:    "Boosts all resource gains by 20%.",
  glutton:      "Grants +1 of each food type on every resource claim.",

  // Affection modifiers
  cheerful:     "Increases affection gains from activities by +2.",
  snuggly:      "Increases affection gains from activities by +3.",
  patient:      "Increases affection gains from activities by +5.",
  bold:         "Increases affection gains from activities by +4.",

  // Mini-game EXP modifiers
  cunning:      "Boosts mini-game EXP gains by 10%.",
  mystic:       "Boosts mini-game EXP gains by 15%.",
  acrobat:      "Boosts mini-game EXP gains by 20%.",
  energetic:    "Boosts mini-game EXP gains by 30%.",
  precise:      "Boosts mini-game EXP gains by 25%.",

  // Mini-game score doublers
  splashy:      "Doubles your mini-game score on occasion.",
  sprinter:     "Doubles your mini-game score on occasion.",
  quickthinker: "Increases your mini-game score by 30%.",
  stalwart:     "Adds +1 to your mini-game score."
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
