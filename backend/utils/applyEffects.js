function safeBuffArray(user) {
  return Array.isArray(user.activeEffects) ? user.activeEffects : [];
}

exports.getUserBuffs = (user, types) =>
  safeBuffArray(user).filter(
    e => (!e.expiresAt || e.expiresAt > Date.now()) && types.includes(e.effectType)
  );

exports.consumeOneShot = async (user, types, session) => {
  user.activeEffects = safeBuffArray(user).filter(
    e => !(types.includes(e.effectType) && !e.expiresAt)
  );
  await user.save({ session });
};
