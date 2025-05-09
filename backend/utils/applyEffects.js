// utils/applyEffects.js

/**
 * Always returns an array of active buff objects:
 *  – First tries `user.activeEffects` (legacy/timed buffs).
 *  – Otherwise falls back to any permanent buffs in `user.inventory`.
 */
exports.getUserBuffs = (user, types) => {
  // 1) If you’ve still got an activeEffects field (timed buffs), use that:
  if (Array.isArray(user.activeEffects)) {
    return user.activeEffects
      .filter(e =>
        (!e.expiresAt || e.expiresAt > Date.now()) &&
        types.includes(e.effectType)
      );
  }

  // 2) Otherwise, look in the populated inventory for permanent buffs (badges):
  if (Array.isArray(user.inventory)) {
    return user.inventory
      // only items you actually have
      .filter(({ item, quantity }) =>
        quantity > 0 &&
        item &&
        types.includes(item.effectType)
      )
      // map them into the same buff‐shape your code expects
      .map(({ item }) => ({
        effectType:  item.effectType,
        effectValue: item.effectValue,
        // no expiresAt for permanent badges; but if you did have durations:
        expiresAt:   item.duration
                      ? new Date(Date.now() + item.duration * 1000)
                      : null
      }));
  }

  // 3) Nothing to buff
  return [];
};


/**
 * Finds the first consumable buff of the given types in inventory,
 * decrements its quantity by one, and saves.
 */
exports.consumeOneShot = async (user, types, session) => {
  if (!Array.isArray(user.inventory)) {
    return; // nothing to do
  }

  for (let entry of user.inventory) {
    const item = entry.item;
    // must be consumed, must match type, must have stock
    if (
      entry.quantity > 0 &&
      item &&
      item.consumable &&
      types.includes(item.effectType)
    ) {
      entry.quantity -= 1;
      if (entry.quantity === 0) {
        user.inventory.pull(entry);
      }
      await user.save({ session });
      return;
    }
  }
};
