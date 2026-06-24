export const critterFallbackByRarity = {
  Common: '/assets/critters/common.svg',
  Uncommon: '/assets/critters/uncommon.svg',
  Rare: '/assets/critters/rare.svg',
  Legendary: '/assets/critters/legendary.svg',
  Mythical: '/assets/critters/mythical.svg',
};

export const cosmeticFallbackBySlot = {
  hat: '/assets/cosmetics/hat.svg',
  accessory: '/assets/cosmetics/accessory.svg',
  body: '/assets/cosmetics/body.svg',
  tail: '/assets/cosmetics/tail.svg',
};

export function critterImage(species) {
  return `/assets/critters/${String(species || '').toLowerCase()}.png`;
}

export function critterFallback(rarity = 'Common') {
  return critterFallbackByRarity[rarity] || critterFallbackByRarity.Common;
}

export function cosmeticFallback(slot = 'accessory') {
  return cosmeticFallbackBySlot[slot] || cosmeticFallbackBySlot.accessory;
}

export function applyFallbackImage(e, fallback) {
  if (e.currentTarget.src.endsWith(fallback)) return;
  e.currentTarget.src = fallback;
}
