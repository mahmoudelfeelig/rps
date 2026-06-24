const MEMBER_TIERS = {
  S: ['safwat', 'effat', 'feel', 'sameh'],
  A: ['yehia', 'tofy', 'zabady', 'ceo', 'curls'],
  B: ['mohanad', 'hamed', 'aly', 'lepookie', 'nour'],
  C: ['surreal', 'othman', 'fam'],
  D: ['mindo', 'freeze', 'yaseen'],
  E: ['hassan', 'hatem', 'justice'],
  F: ['zaghloul', 'azab', 'zoair', 'khaled'],
  Z: ['fancy']
};

const TIER_META = {
  S: { rarity: 'mythic', weight: 1, power: 96, dividendBoost: 0.035 },
  A: { rarity: 'legendary', weight: 3, power: 86, dividendBoost: 0.028 },
  B: { rarity: 'epic', weight: 7, power: 74, dividendBoost: 0.022 },
  C: { rarity: 'rare', weight: 12, power: 62, dividendBoost: 0.017 },
  D: { rarity: 'uncommon', weight: 18, power: 50, dividendBoost: 0.013 },
  E: { rarity: 'common', weight: 24, power: 40, dividendBoost: 0.01 },
  F: { rarity: 'common', weight: 30, power: 32, dividendBoost: 0.008 },
  Z: { rarity: 'anomaly', weight: 1, power: 99, dividendBoost: 0.04 }
};

function memberCards() {
  return Object.entries(MEMBER_TIERS).flatMap(([tier, names]) =>
    names.map((name, index) => {
      const meta = TIER_META[tier];
      return {
        key: `${tier}-${name}`,
        name,
        tier,
        rarity: meta.rarity,
        basePower: meta.power + index,
        dividendBoost: meta.dividendBoost,
        packWeight: meta.weight,
        styleSeed: `${tier}-${index}`
      };
    })
  );
}

module.exports = {
  MEMBER_TIERS,
  TIER_META,
  memberCards
};
