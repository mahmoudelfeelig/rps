const express = require('express');
const router = express.Router();
const BetRequest = require('../models/BetRequest');
const { authenticate, authorize } = require('../middleware/auth');

router.post('/bets', authenticate, async (req, res) => {
  try {
    const doc = await BetRequest.create({ userId: req.user._id, ...req.body });
    res.json(doc);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

router.get('/', authenticate, async (req, res) => {
  const list = await BetRequest.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.json(list);
});

router.get('/all', authenticate, authorize('admin'), async (_req, res) => {
  const list = await BetRequest.find({}).sort({ createdAt: -1 }).populate('userId', 'username');
  res.json(list);
});

router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
  const doc = await BetRequest.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(doc);
});

router.post('/:id/accept', authenticate, authorize('admin'), async (req, res) => {
  const doc = await BetRequest.findByIdAndUpdate(
    req.params.id,
    { status: 'accepted', adminNotes: req.body.adminNotes || '' },
    { new: true }
  );
  res.json(doc);
});

router.post('/:id/reject', authenticate, authorize('admin'), async (req, res) => {
  const doc = await BetRequest.findByIdAndUpdate(
    req.params.id,
    { status: 'rejected', adminNotes: req.body.adminNotes || '' },
    { new: true }
  );
  res.json(doc);
});

module.exports = router;
