const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Skill = require('../models/Skill');
const Exchange = require('../models/Exchange');
const { protect, adminOnly } = require('../middleware/auth');

// GET dashboard stats
router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const [totalUsers, totalSkills, totalExchanges, completedExchanges, pendingExchanges] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Skill.countDocuments({ isActive: true }),
      Exchange.countDocuments(),
      Exchange.countDocuments({ status: 'completed' }),
      Exchange.countDocuments({ status: 'pending' })
    ]);

    const recentExchanges = await Exchange.find()
      .populate('skill', 'title')
      .populate('provider', 'name')
      .populate('learner', 'name')
      .sort('-createdAt').limit(10);

    const recentUsers = await User.find({ role: 'user' }).sort('-createdAt').limit(10).select('-password');

    const creditStats = await User.aggregate([
      { $group: { _id: null, totalCredits: { $sum: '$timeCredits' }, avgCredits: { $avg: '$timeCredits' } } }
    ]);

    const categoryStats = await Skill.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      stats: { totalUsers, totalSkills, totalExchanges, completedExchanges, pendingExchanges },
      creditStats: creditStats[0] || { totalCredits: 0, avgCredits: 0 },
      categoryStats,
      recentExchanges,
      recentUsers
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET all users
router.get('/users', protect, adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = {};
    if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
    
    const users = await User.find(query).select('-password').sort('-createdAt')
      .skip((page - 1) * limit).limit(Number(limit));
    const total = await User.countDocuments(query);
    res.json({ success: true, users, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT toggle user status
router.put('/users/:id/toggle', protect, adminOnly, async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  user.isActive = !user.isActive;
  await user.save();
  res.json({ success: true, user, message: `User ${user.isActive ? 'activated' : 'deactivated'}` });
});

// GET all skills (admin)
router.get('/skills', protect, adminOnly, async (req, res) => {
  try {
    const skills = await Skill.find().populate('provider', 'name email').sort('-createdAt').limit(50);
    res.json({ success: true, skills });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE skill (admin)
router.delete('/skills/:id', protect, adminOnly, async (req, res) => {
  await Skill.findByIdAndUpdate(req.params.id, { isActive: false });
  res.json({ success: true, message: 'Skill removed' });
});

module.exports = router;
