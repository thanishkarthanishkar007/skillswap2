const express = require('express');
const router = express.Router();
const Exchange = require('../models/Exchange');
const User = require('../models/User');
const Skill = require('../models/Skill');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

// GET my exchanges
router.get('/my', protect, async (req, res) => {
  try {
    const { status, role } = req.query;
    let query = {};
    if (role === 'provider') query.provider = req.user._id;
    else if (role === 'learner') query.learner = req.user._id;
    else query.$or = [{ provider: req.user._id }, { learner: req.user._id }];
    if (status) query.status = status;

    const exchanges = await Exchange.find(query)
      .populate('skill', 'title category image')
      .populate('provider', 'name avatar')
      .populate('learner', 'name avatar')
      .sort('-createdAt');

    res.json({ success: true, exchanges });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST request an exchange
router.post('/request', protect, async (req, res) => {
  try {
    const { skillId, scheduledDate, duration, notes } = req.body;
    const skill = await Skill.findById(skillId).populate('provider');
    if (!skill) return res.status(404).json({ success: false, message: 'Skill not found' });
    if (skill.provider._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: "You can't request your own skill" });
    }

    const timeCreditsAmount = skill.timeCreditsPerHour * duration;
    const learner = await User.findById(req.user._id);
    if (learner.timeCredits < timeCreditsAmount) {
      return res.status(400).json({ success: false, message: 'Insufficient time credits' });
    }

    const exchange = await Exchange.create({
      skill: skillId,
      provider: skill.provider._id,
      learner: req.user._id,
      scheduledDate,
      duration,
      timeCreditsAmount,
      notes
    });

    // Notify provider
    await Notification.create({
      recipient: skill.provider._id,
      sender: req.user._id,
      type: 'exchange_request',
      title: 'New Skill Request!',
      message: `${learner.name} wants to learn "${skill.title}" from you`,
      link: `/exchanges/${exchange._id}`,
      data: { exchangeId: exchange._id }
    });

    res.status(201).json({ success: true, exchange, message: 'Exchange request sent!' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT accept/reject exchange
router.put('/:id/respond', protect, async (req, res) => {
  try {
    const { action, meetingLink } = req.body; // action: 'accepted' | 'rejected'
    const exchange = await Exchange.findById(req.params.id)
      .populate('skill', 'title')
      .populate('provider', 'name')
      .populate('learner', 'name');

    if (!exchange) return res.status(404).json({ success: false, message: 'Exchange not found' });
    if (exchange.provider._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    exchange.status = action;
    if (meetingLink) exchange.meetingLink = meetingLink;

    if (action === 'accepted') {
      // Deduct time credits from learner
      await User.findByIdAndUpdate(exchange.learner._id, { $inc: { timeCredits: -exchange.timeCreditsAmount } });

      await Notification.create({
        recipient: exchange.learner._id,
        sender: req.user._id,
        type: 'exchange_accepted',
        title: 'Request Accepted! 🎉',
        message: `Your request for "${exchange.skill.title}" has been accepted`,
        link: `/exchanges/${exchange._id}`
      });
    } else {
      await Notification.create({
        recipient: exchange.learner._id,
        sender: req.user._id,
        type: 'exchange_rejected',
        title: 'Request Update',
        message: `Your request for "${exchange.skill.title}" was not accepted`,
        link: `/exchanges`
      });
    }

    await exchange.save();
    res.json({ success: true, exchange, message: `Exchange ${action}` });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT complete exchange
router.put('/:id/complete', protect, async (req, res) => {
  try {
    const { rating, review } = req.body;
    const exchange = await Exchange.findById(req.params.id).populate('skill', 'title');
    if (!exchange) return res.status(404).json({ success: false, message: 'Exchange not found' });

    const isProvider = exchange.provider.toString() === req.user._id.toString();
    const isLearner = exchange.learner.toString() === req.user._id.toString();

    if (isProvider) {
      exchange.providerRating = rating;
      exchange.providerReview = review;
    } else if (isLearner) {
      exchange.learnerRating = rating;
      exchange.learnerReview = review;
    }

    if (exchange.learnerRating && exchange.providerRating) {
      exchange.status = 'completed';
      exchange.completedAt = new Date();
      // Award credits to provider
      await User.findByIdAndUpdate(exchange.provider, { 
        $inc: { timeCredits: exchange.timeCreditsAmount, totalExchanges: 1 } 
      });
      await User.findByIdAndUpdate(exchange.learner, { $inc: { totalExchanges: 1 } });

      await Notification.create({
        recipient: exchange.provider,
        type: 'credit_earned',
        title: 'Time Credits Earned! ⏰',
        message: `You earned ${exchange.timeCreditsAmount} time credits for teaching "${exchange.skill.title}"`,
        link: '/dashboard'
      });
    }

    await exchange.save();
    res.json({ success: true, exchange, message: 'Exchange updated' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// GET single exchange
router.get('/:id', protect, async (req, res) => {
  try {
    const exchange = await Exchange.findById(req.params.id)
      .populate('skill')
      .populate('provider', 'name avatar email')
      .populate('learner', 'name avatar email');
    if (!exchange) return res.status(404).json({ success: false, message: 'Exchange not found' });
    res.json({ success: true, exchange });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
