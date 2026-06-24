
function getUserBuffs(user, types) {
  const buffs = [];

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

  return buffs;
}


async function consumeOneShot(user, types, session) {
  if (!Array.isArray(user.activeEffects)) return;
  const now = Date.now();
  for (let entry of user.activeEffects) {
    if (
      types.includes(entry.effectType) &&
      (!entry.expiresAt || entry.expiresAt.getTime() > now)
    ) {
      if (entry.consumable !== false) user.activeEffects.pull(entry);
      await user.save({ session });
      return;
    }
  }
}

module.exports = {
  getUserBuffs,
  consumeOneShot
};
