const express = require("express");
const router = express.Router();
const { getTopUsers, getTopGroups } = require('../controllers/leaderboardController');

router.get('/users', getTopUsers);
router.get('/groups', getTopGroups);

module.exports = router;
