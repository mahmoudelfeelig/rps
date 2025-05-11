/**
 * Returns a flat list of active buff objects for the given effect types.
 *
 * @param {Object} user  – a Mongoose user document (populated or lean)
 * @param {string[]} types – array of effectType strings to filter on
 * @returns {Array<{effectType:string,effectValue:number,expiresAt:Date|null}>}
 */
function getUserBuffs(user, types) {
  const buffs = [];

  // 1) timed buffs (legacy / expiring)
  if (Array.isArray(user.activeEffects)) {
    for (let e of user.activeEffects) {
      if (
        types.includes(e.effectType) &&
        (!e.expiresAt || e.expiresAt > Date.now())
      ) {
        buffs.push({
          effectType:  e.effectType,
          effectValue: Number(e.effectValue) || 0,
          expiresAt:   e.expiresAt || null
        });
      }
    }
  }

  // 2) permanent buffs from inventory (badges & consumables)
  if (Array.isArray(user.inventory)) {
    for (let { item, quantity } of user.inventory) {
      if (
        quantity > 0 &&
        item &&
        types.includes(item.effectType)
      ) {
        buffs.push({
          effectType:  item.effectType,
          effectValue: Number(item.effectValue) || 0,
          expiresAt:   item.duration
                        ? new Date(Date.now() + item.duration * 1000)
                        : null
        });
      }
    }
  }

  return buffs;
}

/**
 * Consumes the first one-shot buff of a given type from the user's inventory.
 */
async function consumeOneShot(user, types, session) {
  if (!Array.isArray(user.inventory)) return;
  for (let entry of user.inventory) {
    const item = entry.item;
    if (
      entry.quantity > 0 &&
      item &&
      item.consumable &&
      types.includes(item.effectType)
    ) {
      entry.quantity -= 1;
      if (entry.quantity === 0) user.inventory.pull(entry);
      await user.save({ session });
      return;
    }
  }
}

module.exports = {
  getUserBuffs,
  consumeOneShot
};