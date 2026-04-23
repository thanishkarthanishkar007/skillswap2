const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  avatar: { type: String, default: '' },
  bio: { type: String, default: '', maxlength: 300 },
  location: { type: String, default: '' },
  skillsOffered: [{ 
    name: String, 
    category: String, 
    description: String,
    timeCreditsPerHour: { type: Number, default: 1 }
  }],
  skillsWanted: [{ name: String, category: String }],

  // Certificate / Proof of Skill
  skillProof: { type: String, default: '' },
  skillProofOriginalName: { type: String, default: '' },
  skillProofMimeType: { type: String, default: '' },
  isVerified: { type: Boolean, default: false },

  timeCredits: { type: Number, default: 10 },
  rating: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 },
  totalExchanges: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  joinedAt: { type: Date, default: Date.now },
  lastActive: { type: Date, default: Date.now }
}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Get average rating
userSchema.methods.getAverageRating = function() {
  return this.totalRatings > 0 ? (this.rating / this.totalRatings).toFixed(1) : 0;
};

module.exports = mongoose.model('User', userSchema);
