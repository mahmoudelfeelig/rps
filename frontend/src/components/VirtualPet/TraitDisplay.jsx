import React from 'react';

/** Front‑end descriptions / rarity metadata **/
export const TRAIT_INFO = {
  /* Passive coin generators */
  forager:       { desc: 'Earns +3 coins whenever you claim resources.',          rarity: 'common'   },
  naptime:       { desc: 'Earns +2 coins whenever you claim resources.',          rarity: 'common'   },
  luminous:      { desc: 'Earns +5 coins whenever you claim resources.',          rarity: 'rare'     },
  celestial:     { desc: 'Earns +8 coins and +1 random food every claim.',        rarity: 'mythical' },

  /* Boost overall generation */
  resourceful:   { desc: 'Boosts all resource gains by 50 %.',                    rarity: 'epic'     },
  hoarder:       { desc: 'Adds +5 coins to every resource claim.',                rarity: 'uncommon' },
  shinycoat:     { desc: 'Boosts all resource gains by 20 %.',                    rarity: 'uncommon' },
  glutton:       { desc: 'Grants +1 of each food type on every resource claim.',  rarity: 'rare'     },
  geothermal:    { desc: 'Coins from claims are doubled once a day.',             rarity: 'legendary'},
  stormborn:     { desc: '25 % chance to triple a claim’s coins.',                rarity: 'legendary'},

  /* Affection modifiers */
  cheerful:      { desc: 'Increases affection gains by +2.',                      rarity: 'common'   },
  snuggly:       { desc: 'Increases affection gains by +3.',                      rarity: 'uncommon' },
  patient:       { desc: 'Increases affection gains by +5.',                      rarity: 'epic'     },
  bold:          { desc: 'Increases affection gains by +4.',                      rarity: 'rare'     },
  moonlight:     { desc: 'Affection gains are doubled during nighttime.',         rarity: 'uncommon' },

  /* Mini‑game EXP modifiers */
  cunning:       { desc: 'Boosts mini‑game EXP by 10 %.',                          rarity: 'common'   },
  mystic:        { desc: 'Boosts mini‑game EXP by 15 %.',                          rarity: 'uncommon' },
  acrobat:       { desc: 'Boosts mini‑game EXP by 20 %.',                          rarity: 'rare'     },
  energetic:     { desc: 'Boosts mini‑game EXP by 30 %.',                          rarity: 'epic'     },
  precise:       { desc: 'Boosts mini‑game EXP by 25 %.',                          rarity: 'rare'     },
  quantumLeap:   { desc: 'First mini‑game each day grants +100 % EXP.',            rarity: 'legendary'},

  /* Mini‑game score modifiers */
  splashy:       { desc: 'Occasionally doubles mini‑game score.',                 rarity: 'epic'     },
  sprinter:      { desc: 'Occasionally doubles mini‑game score.',                 rarity: 'epic'     },
  quickthinker:  { desc: 'Increases mini‑game score by 30 %.',                    rarity: 'rare'     },
  stalwart:      { desc: 'Adds +1 to mini‑game score.',                            rarity: 'uncommon' },
  shadowmeld:    { desc: '10 % chance to quadruple score on stealth games.',       rarity: 'mythical'},

  /* Misc thematic traits */
  prismatic:     { desc: 'Cosmetics change color every day.',                     rarity: 'mythical' },
  voidwalker:    { desc: 'Negates one cooldown per day for feeding or play.',     rarity: 'mythical' },
  phoenixFlame:  { desc: 'Revives from faint state instantly once per week.',     rarity: 'mythical' }
};

const rarityColors = {
  common:    'bg-gray-600',
  uncommon:  'bg-green-600',
  rare:      'bg-blue-600',
  epic:      'bg-purple-600',
  legendary: 'bg-yellow-600',
  mythical:  'bg-pink-600'
};

export default function TraitDisplay({ traits }) {
  const safeTraits = Array.isArray(traits)
    ? traits
    : traits && typeof traits === 'object'
      ? Object.keys(traits)
      : [];

  if (!safeTraits.length) return null;

  return (
    <div className="mt-4">
      <h4 className="font-semibold mb-2">🌟 Traits</h4>
      <div className="flex flex-wrap gap-2">
        {safeTraits.map(t => {
          const info  = TRAIT_INFO[t] || {};
          const color = rarityColors[info.rarity] || 'bg-gray-700';
          return (
            <span
              key={t}
              className={`px-3 py-1 text-xs rounded-full cursor-help transition ${color}`}
              title={info.desc || 'No description yet'}
            >
              {t}
            </span>
          );
        })}
      </div>
    </div>
  );
}
