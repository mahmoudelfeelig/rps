exports.getUserBuffs = (user, types) =>
    user.activeEffects.filter(e =>
      (!e.expiresAt || e.expiresAt > Date.now()) &&
      types.includes(e.effectType)
    );
  
  exports.consumeOneShot = async (user, types, session) => {
    user.activeEffects = user.activeEffects.filter(e =>
      !(types.includes(e.effectType) && !e.expiresAt)
    );
    await user.save({ session });
  };