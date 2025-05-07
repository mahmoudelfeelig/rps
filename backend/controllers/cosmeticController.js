const CosmeticItem = require('../models/CosmeticItem');

exports.getAllCosmetics = async (req, res) => {
  const items = await CosmeticItem.find();
  res.json(items);
};
