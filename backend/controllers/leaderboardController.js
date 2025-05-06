const User = require('../models/User');

exports.getTopUsers = async (req, res) => {
  const sortBy = req.query.sort || 'balance';
  const sortOptions = { 
    balance: -1, 
    wins: -1, 
    achievements: -1 
  };

  try {
    const users = await User.find()
      .sort(sortOptions[sortBy] ? { [sortBy]: -1 } : { balance: -1 })
      .limit(10)
      .select('username balance profileImage betsWon achievements')
      .populate('achievements', 'title');

    res.json(users);
  } catch (err) {
    console.error("🔥 Leaderboard Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getTopUsers = async (req, res) => {
  try {
    const sort = req.query.sort || 'balance';
    const sortOptions = {
      balance: { balance: -1 },
      wins: { betsWon: -1 },
      achievements: { achievementsCount: -1 },
    };

    const users = await User.aggregate([
      {
        $addFields: {
          achievementsCount: { $size: { $ifNull: ['$achievements', []] } }
        }
      },
      { $sort: sortOptions[sort] || { balance: -1 } },
      { $limit: 50 },
    ]);

    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch leaderboard users' });
  }
};
