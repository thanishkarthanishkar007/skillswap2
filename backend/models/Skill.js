const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    required: true,
    enum: ['Technology', 'Arts & Crafts', 'Music', 'Language', 'Cooking', 'Fitness', 'Education', 'Business', 'Design', 'Other']
  },
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  timeCreditsPerHour: { type: Number, required: true, min: 1, max: 10 },
  tags: [String],
  availability: [{
    day: { type: String, enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
    from: String,
    to: String
  }],
  isOnline: { type: Boolean, default: true },
  location: { type: String, default: '' },
  maxStudentsPerSession: { type: Number, default: 1 },
  rating: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 },
  totalSessions: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  image: { type: String, default: '' }
}, { timestamps: true });

skillSchema.index({ title: 'text', description: 'text', tags: 'text' });

skillSchema.methods.getAverageRating = function() {
  return this.totalRatings > 0 ? (this.rating / this.totalRatings).toFixed(1) : 0;
};

module.exports = mongoose.model('Skill', skillSchema);
