const express = require('express');
const router  = express.Router();
const User    = require('../models/User');
const { protect } = require('../middleware/auth');

// GET /api/users — search community members by name, skill, location, bio
router.get('/', async (req, res) => {
  try {
    const { search = '', skill, page = 1, limit = 24 } = req.query;
    const query = { isActive: true, role: 'user' };

    if (search.trim()) {
      query.$or = [
        { name:                 { $regex: search, $options: 'i' } },
        { location:             { $regex: search, $options: 'i' } },
        { bio:                  { $regex: search, $options: 'i' } },
        { 'skillsOffered.name': { $regex: search, $options: 'i' } },
        { 'skillsWanted.name':  { $regex: search, $options: 'i' } },
      ];
    }
    if (skill) {
      query['skillsOffered.name'] = { $regex: skill, $options: 'i' };
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password -email')
      .sort('-totalExchanges -createdAt')
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({ success: true, users, total, pages: Math.ceil(total / Number(limit)), currentPage: Number(page) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/users/:id — single user public profile
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -email');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/users/profile/update — own profile (authenticated)
router.put('/profile/update', protect, async (req, res) => {
  try {
    const { name, bio, location, skillsOffered, skillsWanted, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, bio, location, skillsOffered, skillsWanted, avatar },
      { new: true, runValidators: true }
    ).select('-password');
    res.json({ success: true, user });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;
