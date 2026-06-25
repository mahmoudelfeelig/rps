import React from 'react';


export const TRAIT_INFO = {
  forager:       { desc: 'Earns +3 coins whenever you claim resources.',          rarity: 'common'   },
  naptime:       { desc: 'Earns +2 coins whenever you claim resources.',          rarity: 'common'   },
  luminous:      { desc: 'Earns +5 coins whenever you claim resources.',          rarity: 'rare'     },
  celestial:     { desc: 'Earns +8 coins and +1 random food every claim.',        rarity: 'mythical' },

  resourceful:   { desc: 'Boosts all resource gains by 50 %.',                    rarity: 'epic'     },
  hoarder:       { desc: 'Adds +5 coins to every resource claim.',                rarity: 'uncommon' },
  shinycoat:     { desc: 'Boosts all resource gains by 20 %.',                    rarity: 'uncommon' },
  glutton:       { desc: 'Grants +1 of each food type on every resource claim.',  rarity: 'rare'     },
  geothermal:    { desc: 'Coins from claims are doubled once a day.',             rarity: 'legendary'},
  stormborn:     { desc: '25 % chance to triple a claim’s coins.',                rarity: 'legendary'},

  cheerful:      { desc: 'Increases affection gains by +2.',                      rarity: 'common'   },
  snuggly:       { desc: 'Increases affection gains by +3.',                      rarity: 'uncommon' },
  patient:       { desc: 'Increases affection gains by +5.',                      rarity: 'epic'     },
  bold:          { desc: 'Increases affection gains by +4.',                      rarity: 'rare'     },
  moonlight:     { desc: 'Affection gains are doubled during nighttime.',         rarity: 'uncommon' },

  cunning:       { desc: 'Boosts mini‑game EXP by 10 %.',                          rarity: 'common'   },
  mystic:        { desc: 'Boosts mini‑game EXP by 15 %.',                          rarity: 'uncommon' },
  acrobat:       { desc: 'Boosts mini‑game EXP by 20 %.',                          rarity: 'rare'     },
  energetic:     { desc: 'Boosts mini‑game EXP by 30 %.',                          rarity: 'epic'     },
  precise:       { desc: 'Boosts mini‑game EXP by 25 %.',                          rarity: 'rare'     },
  quantumLeap:   { desc: 'First mini‑game each day grants +100 % EXP.',            rarity: 'legendary'},

  splashy:       { desc: 'Occasionally doubles mini‑game score.',                 rarity: 'epic'     },
  sprinter:      { desc: 'Occasionally doubles mini‑game score.',                 rarity: 'epic'     },
  quickthinker:  { desc: 'Increases mini‑game score by 30 %.',                    rarity: 'rare'     },
  stalwart:      { desc: 'Adds +1 to mini‑game score.',                            rarity: 'uncommon' },
  shadowmeld:    { desc: '10 % chance to quadruple score on stealth games.',       rarity: 'mythical'},

  prismatic:     { desc: 'Cosmetics change color every day.',                     rarity: 'mythical' },
  voidwalker:    { desc: 'Negates one cooldown per day for feeding or play.',     rarity: 'mythical' },
  phoenixFlame:  { desc: 'Revives from faint state instantly once per week.',     rarity: 'mythical' }
};

const rarityColors = {
  common:    'border-slate-200/15 bg-slate-300/10 text-slate-100',
  uncommon:  'border-emerald-200/20 bg-emerald-300/10 text-emerald-100',
  rare:      'border-cyan-200/20 bg-cyan-300/10 text-cyan-100',
  epic:      'border-violet-200/20 bg-violet-300/10 text-violet-100',
  legendary: 'border-amber-200/20 bg-amber-300/10 text-amber-100',
  mythical:  'border-rose-200/20 bg-rose-300/10 text-rose-100'
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
      <h4 className="mb-2 font-semibold">Traits</h4>
      <div className="flex flex-wrap gap-2">
        {safeTraits.map(t => {
          const info  = TRAIT_INFO[t] || {};
          const color = rarityColors[info.rarity] || rarityColors.common;
          return (
            <span
              key={t}
              className={`cursor-help rounded-full border px-3 py-1 text-xs transition ${color}`}
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
