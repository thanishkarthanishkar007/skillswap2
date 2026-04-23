/**
 * SkillSwap Database Seed Script
 * Run: node seed.js
 * Seeds demo users, skills, and sample exchanges into MongoDB
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/skillswap';

// ── Inline models to avoid import issues ─────────────────────
const userSchema = new mongoose.Schema({
  name: String, email: { type: String, unique: true, lowercase: true },
  password: String, avatar: { type: String, default: '' },
  bio: { type: String, default: '' }, location: { type: String, default: '' },
  skillsOffered: [{ name: String, category: String, description: String, timeCreditsPerHour: { type: Number, default: 1 } }],
  skillsWanted: [{ name: String, category: String }],
  timeCredits: { type: Number, default: 10 }, rating: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 }, totalExchanges: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }, role: { type: String, default: 'user' },
}, { timestamps: true });

const skillSchema = new mongoose.Schema({
  title: String, description: String, category: String,
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  timeCreditsPerHour: Number, tags: [String], isOnline: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true }, rating: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 }, totalSessions: { type: Number, default: 0 },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Skill = mongoose.model('Skill', skillSchema);

const seedData = async () => {
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  // Clear existing
  await User.deleteMany({});
  await Skill.deleteMany({});
  console.log('🗑️  Cleared existing data');

  // Hash password helper
  const hash = (p) => bcrypt.hash(p, 12);

  // Create users
  const users = await User.insertMany([
    {
      name: 'Admin User', email: 'admin@skillswap.app', password: await hash('admin123'),
      role: 'admin', bio: 'Platform administrator', location: 'Chennai, Tamil Nadu',
      timeCredits: 100, totalExchanges: 12, rating: 50, totalRatings: 10,
      skillsOffered: [{ name: 'Platform Management', category: 'Technology', timeCreditsPerHour: 2 }],
    },
    {
      name: 'Demo User', email: 'demo@skillswap.app', password: await hash('demo123'),
      bio: 'I am a college student and Java developer', location: 'Salem, Tamil Nadu',
      timeCredits: 10, totalExchanges: 7, rating: 45, totalRatings: 9,
      skillsOffered: [
        { name: 'Python Programming', category: 'Technology', description: 'Python from scratch', timeCreditsPerHour: 2 },
        { name: 'Guitar Basics', category: 'Music', description: 'Acoustic guitar for beginners', timeCreditsPerHour: 1 },
      ],
      skillsWanted: [{ name: 'Spanish', category: 'Language' }, { name: 'Yoga', category: 'Fitness' }],
    },
    {
      name: 'Priya Sharma', email: 'priya@example.com', password: await hash('pass123'),
      bio: 'Yoga instructor and language enthusiast', location: 'Bangalore, Karnataka',
      timeCredits: 25, totalExchanges: 14, rating: 48, totalRatings: 10,
      skillsOffered: [
        { name: 'Yoga & Meditation', category: 'Fitness', description: 'Hatha yoga for all levels', timeCreditsPerHour: 2 },
        { name: 'Spanish Language', category: 'Language', description: 'Conversational Spanish', timeCreditsPerHour: 3 },
      ],
      skillsWanted: [{ name: 'Python', category: 'Technology' }],
    },
    {
      name: 'Arjun Patel', email: 'arjun@example.com', password: await hash('pass123'),
      bio: 'Full-stack developer, love teaching', location: 'Mumbai, Maharashtra',
      timeCredits: 18, totalExchanges: 9, rating: 47, totalRatings: 10,
      skillsOffered: [
        { name: 'React.js Development', category: 'Technology', description: 'Build modern web apps', timeCreditsPerHour: 3 },
        { name: 'UI/UX Design', category: 'Design', description: 'Figma and design principles', timeCreditsPerHour: 2 },
      ],
      skillsWanted: [{ name: 'Guitar', category: 'Music' }],
    },
    {
      name: 'Meera Nair', email: 'meera@example.com', password: await hash('pass123'),
      bio: 'Chef and cooking enthusiast from Kerala', location: 'Kochi, Kerala',
      timeCredits: 30, totalExchanges: 18, rating: 50, totalRatings: 10,
      skillsOffered: [
        { name: 'South Indian Cooking', category: 'Cooking', description: 'Authentic Kerala recipes', timeCreditsPerHour: 1 },
        { name: 'Baking & Pastry', category: 'Cooking', description: 'Bread, cakes, pastries', timeCreditsPerHour: 2 },
      ],
      skillsWanted: [{ name: 'Excel', category: 'Technology' }],
    },
  ]);

  console.log(`👥 Created ${users.length} users`);

  // Map emails to user objects
  const userMap = {};
  users.forEach(u => { userMap[u.email] = u; });

  // Create skills
  const skills = await Skill.insertMany([
    {
      title: 'Python Programming', description: 'Learn Python from scratch! Variables, loops, functions, OOP, and real projects. Great for beginners to intermediate.',
      category: 'Technology', provider: userMap['demo@skillswap.app']._id,
      timeCreditsPerHour: 2, tags: ['python','coding','beginner'], rating: 45, totalRatings: 9, totalSessions: 7,
    },
    {
      title: 'Yoga & Meditation', description: 'Hatha yoga for all levels. Breathing techniques, asanas, and mindfulness meditation. Calming and rejuvenating sessions.',
      category: 'Fitness', provider: userMap['priya@example.com']._id,
      timeCreditsPerHour: 2, tags: ['yoga','meditation','wellness'], rating: 48, totalRatings: 10, totalSessions: 14,
    },
    {
      title: 'React.js Development', description: 'Build modern responsive web apps with React 18. Hooks, state management, routing, and deployment.',
      category: 'Technology', provider: userMap['arjun@example.com']._id,
      timeCreditsPerHour: 3, tags: ['react','javascript','frontend'], rating: 47, totalRatings: 10, totalSessions: 9,
    },
    {
      title: 'South Indian Cooking', description: 'Authentic Kerala and Tamil cuisine — dosas, sambar, biryani, payasam. Traditional recipes step-by-step.',
      category: 'Cooking', provider: userMap['meera@example.com']._id,
      timeCreditsPerHour: 1, tags: ['cooking','indian food','kerala'], rating: 50, totalRatings: 10, totalSessions: 18,
    },
    {
      title: 'Spanish Language', description: 'Conversational Spanish for travellers. Real-life dialogues, vocabulary, and pronunciation. Interactive and fun!',
      category: 'Language', provider: userMap['priya@example.com']._id,
      timeCreditsPerHour: 3, tags: ['spanish','language','conversation'], rating: 48, totalRatings: 10, totalSessions: 12,
    },
    {
      title: 'Guitar Basics', description: 'Acoustic guitar for absolute beginners. Chords, strumming patterns, and your first 10 songs. Patient teaching.',
      category: 'Music', provider: userMap['demo@skillswap.app']._id,
      timeCreditsPerHour: 1, tags: ['guitar','music','beginners'], rating: 45, totalRatings: 9, totalSessions: 6,
    },
    {
      title: 'UI/UX Design', description: 'Design beautiful interfaces with Figma. Design principles, wireframing, prototyping, and user research basics.',
      category: 'Design', provider: userMap['arjun@example.com']._id,
      timeCreditsPerHour: 2, tags: ['design','figma','ux'], rating: 46, totalRatings: 8, totalSessions: 8,
    },
    {
      title: 'Baking & Pastry', description: 'Bake bread, cakes, muffins, and croissants from scratch. Detailed techniques for perfect results every time.',
      category: 'Cooking', provider: userMap['meera@example.com']._id,
      timeCreditsPerHour: 2, tags: ['baking','pastry','cooking'], rating: 50, totalRatings: 10, totalSessions: 10,
    },
  ]);

  console.log(`🎓 Created ${skills.length} skills`);
  console.log('\n✅ Seed complete! Demo accounts:');
  console.log('   Admin  → admin@skillswap.app / admin123');
  console.log('   User   → demo@skillswap.app  / demo123');
  console.log('\n🚀 Run: npm run dev  to start the server');

  await mongoose.disconnect();
  process.exit(0);
};

seedData().catch(err => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
