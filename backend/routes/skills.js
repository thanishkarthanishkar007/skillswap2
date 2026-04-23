const express = require('express');
const router = express.Router();
const Skill = require('../models/Skill');
const { protect } = require('../middleware/auth');

// GET all skills (with search, filter, pagination)
router.get('/', async (req, res) => {
  try {
    const { search, category, minCredits, maxCredits, page = 1, limit = 12, sort = '-createdAt' } = req.query;
    const query = { isActive: true };

    if (search) query.$text = { $search: search };
    if (category) query.category = category;
    if (minCredits || maxCredits) {
      query.timeCreditsPerHour = {};
      if (minCredits) query.timeCreditsPerHour.$gte = Number(minCredits);
      if (maxCredits) query.timeCreditsPerHour.$lte = Number(maxCredits);
    }

    const total = await Skill.countDocuments(query);
    const skills = await Skill.find(query)
      .populate('provider', 'name avatar rating totalRatings')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, skills, total, pages: Math.ceil(total / limit), currentPage: Number(page) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET single skill
router.get('/:id', async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id).populate('provider', 'name avatar bio rating totalRatings totalExchanges');
    if (!skill) return res.status(404).json({ success: false, message: 'Skill not found' });
    res.json({ success: true, skill });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST create skill
router.post('/', protect, async (req, res) => {
  try {
    const skill = await Skill.create({ ...req.body, provider: req.user._id });
    res.status(201).json({ success: true, skill });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT update skill
router.put('/:id', protect, async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);
    if (!skill) return res.status(404).json({ success: false, message: 'Skill not found' });
    if (skill.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    const updated = await Skill.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, skill: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE skill
router.delete('/:id', protect, async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);
    if (!skill) return res.status(404).json({ success: false, message: 'Skill not found' });
    if (skill.provider.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await Skill.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Skill removed' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET skill categories
router.get('/meta/categories', (req, res) => {
  const categories = ['Technology', 'Arts & Crafts', 'Music', 'Language', 'Cooking', 'Fitness', 'Education', 'Business', 'Design', 'Other'];
  res.json({ success: true, categories });
});

module.exports = router;
