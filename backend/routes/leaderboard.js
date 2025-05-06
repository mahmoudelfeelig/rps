const express = require("express");
const router = express.Router();
const { getTopUsers } = require('../controllers/leaderboardController');

router.get('/users', getTopUsers);

module.exports = router;
