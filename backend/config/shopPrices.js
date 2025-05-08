/**
 * Centralised price table
 * ───────────────────────
 * • `petPrices`  →   rarity‑based prices for adoptable pets
 *                    + flat prices for foods & toys
 * • `cosmeticPrices` → rarity‑based prices for shop cosmetics
 */

module.exports = {
  /* ───── Pet adoption & consumables ──── */
  petPrices: {
    /* pets / eggs */
    Common:     1_000,
    Uncommon:  10_000,
    Rare:      50_000,
    Legendary: 500_000,
    Mythical: 2_000_000,

    /* consumables (flat) */
    food: 200,          // every food item costs 200 pet‑coins
    toy:  250           // every toy item costs 250 pet‑coins
  },

  /* ───── Cosmetics (shop unlock) ──── */
  cosmeticPrices: {
    Common:     500,
    Uncommon:  2_000,
    Rare:     10_000,
    Epic:     50_000,
    Legendary:100_000,
    Mythical: 250_000
  }
};