const mongoose = require('mongoose');

const exchangeSchema = new mongoose.Schema({
  skill: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill', required: true },
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  learner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  scheduledDate: { type: Date, required: true },
  duration: { type: Number, required: true, min: 1 }, // in hours
  timeCreditsAmount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'rejected', 'active', 'completed', 'cancelled'],
    default: 'pending'
  },
  meetingLink: { type: String, default: '' },
  notes: { type: String, default: '' },
  learnerRating: { type: Number, min: 1, max: 5 },
  learnerReview: { type: String, default: '' },
  providerRating: { type: Number, min: 1, max: 5 },
  providerReview: { type: String, default: '' },
  completedAt: { type: Date },
  cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  cancelReason: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Exchange', exchangeSchema);
