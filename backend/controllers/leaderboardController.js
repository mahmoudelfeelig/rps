const User = require('../models/User');
const Group = require('../models/Group');

exports.getTopUsers = async (req, res) => {
  const sortBy = req.query.sort || 'balance';
  const sortOptions = { balance: -1, wins: -1, achievements: -1 };
  try {
    const users = await User.find().sort(sortOptions[sortBy] ? { [sortBy]: -1 } : { balance: -1 }).limit(10);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getTopGroups = async (req, res) => {
  try {
    const groups = await Group.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'members',
          foreignField: '_id',
          as: 'memberData'
        }
      },
      {
        $addFields: {
          totalBalance: { $sum: "$memberData.balance" }
        }
      },
      { $sort: { totalBalance: -1 } },
      { $limit: 10 }
    ]);
    res.json(groups);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
