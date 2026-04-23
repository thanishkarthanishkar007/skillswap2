// ============================================================
// MOCK DATA LAYER — works without a backend server
// Enable by setting REACT_APP_MOCK_MODE=true in .env
// or it auto-enables when backend is unreachable
// ============================================================

export const isMockMode = () =>
  process.env.REACT_APP_MOCK_MODE === 'true' ||
  process.env.REACT_APP_API_URL === undefined ||
  process.env.REACT_APP_API_URL === '';

// ── Storage helpers ──────────────────────────────────────────
const STORAGE_KEYS = {
  USERS: 'ss_mock_users',
  SKILLS: 'ss_mock_skills',
  EXCHANGES: 'ss_mock_exchanges',
  NOTIFICATIONS: 'ss_mock_notifications',
};

const load = (key) => {
  try { return JSON.parse(localStorage.getItem(key)) || null; }
  catch { return null; }
};
const save = (key, data) => localStorage.setItem(key, JSON.stringify(data));

// ── Seed data ─────────────────────────────────────────────────
const SEED_USERS = [
  {
    _id: 'user_admin_001',
    id: 'user_admin_001',
    name: 'Admin User',
    email: 'admin@skillswap.app',
    password: 'admin123',
    role: 'admin',
    avatar: '',
    bio: 'Platform administrator',
    location: 'Chennai, Tamil Nadu',
    timeCredits: 100,
    skillsOffered: [{ name: 'Platform Management', category: 'Technology', description: 'Managing SkillSwap', timeCreditsPerHour: 2 }],
    skillsWanted: [],
    rating: 50, totalRatings: 10, totalExchanges: 12,
    isActive: true, createdAt: new Date('2024-01-01').toISOString(),
  },
  {
    _id: 'user_demo_002',
    id: 'user_demo_002',
    name: 'Demo User',
    email: 'demo@skillswap.app',
    password: 'demo123',
    role: 'user',
    avatar: '',
    bio: 'I am a college student and Java developer',
    location: 'Salem, Tamil Nadu',
    timeCredits: 10,
    skillsOffered: [
      { name: 'Python Programming', category: 'Technology', description: 'Beginner to intermediate Python', timeCreditsPerHour: 2 },
      { name: 'Guitar Basics', category: 'Music', description: 'Acoustic guitar for beginners', timeCreditsPerHour: 1 },
    ],
    skillsWanted: [{ name: 'Spanish', category: 'Language' }, { name: 'Yoga', category: 'Fitness' }],
    rating: 45, totalRatings: 9, totalExchanges: 7,
    isActive: true, createdAt: new Date('2024-02-15').toISOString(),
  },
  {
    _id: 'user_003',
    id: 'user_003',
    name: 'Priya Sharma',
    email: 'priya@example.com',
    password: 'pass123',
    role: 'user',
    avatar: '',
    bio: 'Yoga instructor and language enthusiast',
    location: 'Bangalore, Karnataka',
    timeCredits: 25,
    skillsOffered: [
      { name: 'Yoga & Meditation', category: 'Fitness', description: 'Hatha yoga for all levels', timeCreditsPerHour: 2 },
      { name: 'Spanish Language', category: 'Language', description: 'Conversational Spanish', timeCreditsPerHour: 3 },
    ],
    skillsWanted: [{ name: 'Python', category: 'Technology' }],
    rating: 48, totalRatings: 10, totalExchanges: 14,
    isActive: true, createdAt: new Date('2024-03-01').toISOString(),
  },
  {
    _id: 'user_004',
    id: 'user_004',
    name: 'Arjun Patel',
    email: 'arjun@example.com',
    password: 'pass123',
    role: 'user',
    avatar: '',
    bio: 'Full-stack developer, love teaching',
    location: 'Mumbai, Maharashtra',
    timeCredits: 18,
    skillsOffered: [
      { name: 'React.js Development', category: 'Technology', description: 'Build modern web apps', timeCreditsPerHour: 3 },
      { name: 'UI/UX Design', category: 'Design', description: 'Figma and design principles', timeCreditsPerHour: 2 },
    ],
    skillsWanted: [{ name: 'Guitar', category: 'Music' }],
    rating: 47, totalRatings: 10, totalExchanges: 9,
    isActive: true, createdAt: new Date('2024-03-15').toISOString(),
  },
  {
    _id: 'user_005',
    id: 'user_005',
    name: 'Meera Nair',
    email: 'meera@example.com',
    password: 'pass123',
    role: 'user',
    avatar: '',
    bio: 'Chef and cooking enthusiast from Kerala',
    location: 'Kochi, Kerala',
    timeCredits: 30,
    skillsOffered: [
      { name: 'South Indian Cooking', category: 'Cooking', description: 'Authentic Kerala recipes', timeCreditsPerHour: 1 },
      { name: 'Baking & Pastry', category: 'Cooking', description: 'Bread, cakes, pastries', timeCreditsPerHour: 2 },
    ],
    skillsWanted: [{ name: 'Excel', category: 'Technology' }],
    rating: 50, totalRatings: 10, totalExchanges: 18,
    isActive: true, createdAt: new Date('2024-04-01').toISOString(),
  },
];

const SEED_SKILLS = [
  {
    _id: 'skill_001', title: 'Python Programming', category: 'Technology',
    description: 'Learn Python from scratch! Covers variables, loops, functions, OOP, and building real projects. Great for beginners to intermediate learners.',
    provider: { _id: 'user_demo_002', name: 'Demo User', avatar: '', bio: 'Java & Python developer', totalExchanges: 7 },
    timeCreditsPerHour: 2, tags: ['python', 'coding', 'beginner'], isOnline: true, isActive: true,
    rating: 45, totalRatings: 9, totalSessions: 7, createdAt: new Date('2024-02-20').toISOString(),
  },
  {
    _id: 'skill_002', title: 'Yoga & Meditation', category: 'Fitness',
    description: 'Hatha yoga for all levels. Includes breathing techniques, asanas, and mindfulness meditation. Sessions are calming and rejuvenating.',
    provider: { _id: 'user_003', name: 'Priya Sharma', avatar: '', bio: 'Certified yoga instructor', totalExchanges: 14 },
    timeCreditsPerHour: 2, tags: ['yoga', 'meditation', 'wellness'], isOnline: true, isActive: true,
    rating: 48, totalRatings: 10, totalSessions: 14, createdAt: new Date('2024-03-05').toISOString(),
  },
  {
    _id: 'skill_003', title: 'React.js Development', category: 'Technology',
    description: 'Build modern, responsive web apps with React 18. Covers hooks, state management, routing, and real project deployment.',
    provider: { _id: 'user_004', name: 'Arjun Patel', avatar: '', bio: 'Full-stack developer', totalExchanges: 9 },
    timeCreditsPerHour: 3, tags: ['react', 'javascript', 'frontend'], isOnline: true, isActive: true,
    rating: 47, totalRatings: 10, totalSessions: 9, createdAt: new Date('2024-03-20').toISOString(),
  },
  {
    _id: 'skill_004', title: 'South Indian Cooking', category: 'Cooking',
    description: 'Learn authentic Kerala and Tamil cuisine — from dosas and sambar to biryani and payasam. Step-by-step with traditional recipes.',
    provider: { _id: 'user_005', name: 'Meera Nair', avatar: '', bio: 'Chef from Kerala', totalExchanges: 18 },
    timeCreditsPerHour: 1, tags: ['cooking', 'indian food', 'kerala'], isOnline: true, isActive: true,
    rating: 50, totalRatings: 10, totalSessions: 18, createdAt: new Date('2024-04-05').toISOString(),
  },
  {
    _id: 'skill_005', title: 'Spanish Language', category: 'Language',
    description: 'Conversational Spanish for travellers and beginners. Focus on real-life dialogues, vocabulary, and pronunciation. Interactive and fun sessions.',
    provider: { _id: 'user_003', name: 'Priya Sharma', avatar: '', bio: 'Language enthusiast', totalExchanges: 14 },
    timeCreditsPerHour: 3, tags: ['spanish', 'language', 'conversation'], isOnline: true, isActive: true,
    rating: 48, totalRatings: 10, totalSessions: 12, createdAt: new Date('2024-03-10').toISOString(),
  },
  {
    _id: 'skill_006', title: 'Guitar Basics', category: 'Music',
    description: 'Acoustic guitar for absolute beginners. Learn chords, strumming patterns, and your first 10 songs. Patient and structured teaching.',
    provider: { _id: 'user_demo_002', name: 'Demo User', avatar: '', bio: 'Guitar hobbyist', totalExchanges: 7 },
    timeCreditsPerHour: 1, tags: ['guitar', 'music', 'beginners'], isOnline: true, isActive: true,
    rating: 45, totalRatings: 9, totalSessions: 6, createdAt: new Date('2024-02-25').toISOString(),
  },
  {
    _id: 'skill_007', title: 'UI/UX Design', category: 'Design',
    description: 'Design beautiful interfaces with Figma. Covers design principles, wireframing, prototyping, and user research basics.',
    provider: { _id: 'user_004', name: 'Arjun Patel', avatar: '', bio: 'UI designer', totalExchanges: 9 },
    timeCreditsPerHour: 2, tags: ['design', 'figma', 'ux'], isOnline: true, isActive: true,
    rating: 46, totalRatings: 8, totalSessions: 8, createdAt: new Date('2024-03-25').toISOString(),
  },
  {
    _id: 'skill_008', title: 'Baking & Pastry', category: 'Cooking',
    description: 'Learn to bake bread, cakes, muffins, and croissants from scratch. Detailed techniques for perfect results every time.',
    provider: { _id: 'user_005', name: 'Meera Nair', avatar: '', bio: 'Baker', totalExchanges: 18 },
    timeCreditsPerHour: 2, tags: ['baking', 'pastry', 'cooking'], isOnline: true, isActive: true,
    rating: 50, totalRatings: 10, totalSessions: 10, createdAt: new Date('2024-04-10').toISOString(),
  },
];

const SEED_EXCHANGES = [
  {
    _id: 'exc_001',
    skill: { _id: 'skill_002', title: 'Yoga & Meditation', category: 'Fitness' },
    provider: { _id: 'user_003', name: 'Priya Sharma', avatar: '' },
    learner: { _id: 'user_demo_002', name: 'Demo User', avatar: '' },
    scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    duration: 1, timeCreditsAmount: 2, status: 'pending',
    notes: 'I am a complete beginner, looking to reduce stress.',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'exc_002',
    skill: { _id: 'skill_003', title: 'React.js Development', category: 'Technology' },
    provider: { _id: 'user_004', name: 'Arjun Patel', avatar: '' },
    learner: { _id: 'user_demo_002', name: 'Demo User', avatar: '' },
    scheduledDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    duration: 2, timeCreditsAmount: 6, status: 'completed',
    notes: 'Want to learn hooks and context API.',
    meetingLink: 'https://meet.google.com/demo',
    learnerRating: 5, learnerReview: 'Excellent teaching!',
    providerRating: 5, providerReview: 'Very enthusiastic student',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const SEED_NOTIFICATIONS = [
  {
    _id: 'notif_001',
    recipient: 'user_demo_002',
    sender: { _id: 'user_003', name: 'Priya Sharma', avatar: '' },
    type: 'exchange_request',
    title: 'Session Request Incoming!',
    message: 'Priya Sharma wants to learn Python from you',
    isRead: false,
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'notif_002',
    recipient: 'user_demo_002',
    type: 'credit_earned',
    title: '🎉 Welcome Bonus!',
    message: 'You received 10 free time credits to get started on SkillSwap',
    isRead: true,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// ── Initialize storage with seed data ───────────────────────
const initMockStorage = () => {
  if (!load(STORAGE_KEYS.USERS)) save(STORAGE_KEYS.USERS, SEED_USERS);
  if (!load(STORAGE_KEYS.SKILLS)) save(STORAGE_KEYS.SKILLS, SEED_SKILLS);
  if (!load(STORAGE_KEYS.EXCHANGES)) save(STORAGE_KEYS.EXCHANGES, SEED_EXCHANGES);
  if (!load(STORAGE_KEYS.NOTIFICATIONS)) save(STORAGE_KEYS.NOTIFICATIONS, SEED_NOTIFICATIONS);
};

initMockStorage();

// ── Token helpers ─────────────────────────────────────────────
const encodeToken = (userId) => btoa(`mock_${userId}_${Date.now()}`);
const decodeToken = (token) => {
  try {
    const decoded = atob(token);
    const parts = decoded.split('_');
    return parts[1]; // userId
  } catch { return null; }
};

// ── Auth functions ────────────────────────────────────────────
export const mockLogin = (email, password) => {
  const users = load(STORAGE_KEYS.USERS) || SEED_USERS;
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) throw { response: { data: { message: 'No account found with this email address.' } } };
  if (user.password !== password) throw { response: { data: { message: 'Incorrect password. Please try again.' } } };
  if (!user.isActive) throw { response: { data: { message: 'This account has been deactivated.' } } };

  const { password: _, ...safeUser } = user;
  const token = encodeToken(user._id);
  return { token, user: { ...safeUser, id: user._id } };
};

export const mockRegister = (formData) => {
  const users = load(STORAGE_KEYS.USERS) || SEED_USERS;

  // Validate
  if (!formData.name || formData.name.trim().length < 2)
    throw { response: { data: { message: 'Name must be at least 2 characters.' } } };
  if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email))
    throw { response: { data: { message: 'Please enter a valid email address.' } } };
  if (!formData.password || formData.password.length < 6)
    throw { response: { data: { message: 'Password must be at least 6 characters.' } } };

  const existing = users.find(u => u.email.toLowerCase() === formData.email.toLowerCase());
  if (existing) throw { response: { data: { message: 'An account with this email already exists. Try logging in instead.' } } };

  const newId = `user_${Date.now()}`;
  const newUser = {
    _id: newId,
    id: newId,
    name: formData.name.trim(),
    email: formData.email.toLowerCase().trim(),
    password: formData.password,
    role: 'user',
    avatar: '',
    bio: formData.bio || '',
    location: formData.location || '',
    skillsOffered: formData.skillsOffered || [],
    skillsWanted: formData.skillsWanted || [],
    skillProof: formData.skillProof || '',
    skillProofOriginalName: formData.skillProofOriginalName || '',
    skillProofMimeType: formData.skillProofMimeType || '',
    isVerified: !!formData.skillProof,
    timeCredits: 10, // welcome bonus
    rating: 0, totalRatings: 0, totalExchanges: 0,
    isActive: true,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  save(STORAGE_KEYS.USERS, users);

  // Add welcome notification
  const notifs = load(STORAGE_KEYS.NOTIFICATIONS) || [];
  notifs.push({
    _id: `notif_${Date.now()}`,
    recipient: newId,
    type: 'system',
    title: '🎉 Welcome to SkillSwap!',
    message: `Hi ${newUser.name}! You have 10 free time credits to start learning. Browse the marketplace to book your first session!`,
    isRead: false,
    createdAt: new Date().toISOString(),
  });
  save(STORAGE_KEYS.NOTIFICATIONS, notifs);

  const { password: _, ...safeUser } = newUser;
  const token = encodeToken(newId);
  return { token, user: safeUser, message: 'Account created successfully' };
};

export const mockGetMe = (token) => {
  // Try localStorage user first (fastest)
  const cached = load('ss_user');
  if (cached) return { ...cached, id: cached._id || cached.id };

  const userId = decodeToken(token);
  if (!userId) return null;
  const users = load(STORAGE_KEYS.USERS) || SEED_USERS;
  const user = users.find(u => u._id === userId || u.id === userId);
  if (!user) return null;
  const { password: _, ...safeUser } = user;
  return { ...safeUser, id: user._id };
};

export const mockUpdateUser = (userId, updates) => {
  const users = load(STORAGE_KEYS.USERS) || SEED_USERS;
  const idx = users.findIndex(u => u._id === userId || u.id === userId);
  if (idx === -1) throw new Error('User not found');
  users[idx] = { ...users[idx], ...updates };
  save(STORAGE_KEYS.USERS, users);
  const { password: _, ...safeUser } = users[idx];
  return safeUser;
};

// ── Skills functions ──────────────────────────────────────────
export const mockGetSkills = ({ search, category, sort = '-createdAt', page = 1, limit = 12 }) => {
  let skills = load(STORAGE_KEYS.SKILLS) || SEED_SKILLS;
  skills = skills.filter(s => s.isActive);

  if (search) {
    const q = search.toLowerCase();
    skills = skills.filter(s =>
      s.title.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.tags?.some(t => t.toLowerCase().includes(q))
    );
  }
  if (category && category !== 'All') skills = skills.filter(s => s.category === category);

  // Sort
  if (sort === '-createdAt') skills = skills.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  else if (sort === 'timeCreditsPerHour') skills = skills.sort((a, b) => a.timeCreditsPerHour - b.timeCreditsPerHour);
  else if (sort === '-timeCreditsPerHour') skills = skills.sort((a, b) => b.timeCreditsPerHour - a.timeCreditsPerHour);
  else if (sort === '-rating') skills = skills.sort((a, b) => (b.rating / (b.totalRatings||1)) - (a.rating / (a.totalRatings||1)));

  const total = skills.length;
  const pages = Math.ceil(total / limit);
  const paginated = skills.slice((page - 1) * limit, page * limit);
  return { skills: paginated, total, pages, currentPage: page };
};

export const mockGetSkill = (id) => {
  const skills = load(STORAGE_KEYS.SKILLS) || SEED_SKILLS;
  return skills.find(s => s._id === id) || null;
};

export const mockCreateSkill = (userId, skillData) => {
  const skills = load(STORAGE_KEYS.SKILLS) || SEED_SKILLS;
  const users = load(STORAGE_KEYS.USERS) || SEED_USERS;
  const user = users.find(u => u._id === userId || u.id === userId);
  const newSkill = {
    _id: `skill_${Date.now()}`,
    ...skillData,
    provider: { _id: user?._id, name: user?.name, avatar: user?.avatar || '', bio: user?.bio || '', totalExchanges: user?.totalExchanges || 0 },
    rating: 0, totalRatings: 0, totalSessions: 0,
    isActive: true, createdAt: new Date().toISOString(),
  };
  skills.push(newSkill);
  save(STORAGE_KEYS.SKILLS, skills);
  return newSkill;
};

// ── Exchange functions ────────────────────────────────────────
export const mockGetExchanges = (userId) => {
  const exchanges = load(STORAGE_KEYS.EXCHANGES) || SEED_EXCHANGES;
  return exchanges.filter(e => e.provider?._id === userId || e.learner?._id === userId);
};

export const mockCreateExchange = (userId, { skillId, scheduledDate, duration, notes }) => {
  const skills = load(STORAGE_KEYS.SKILLS) || SEED_SKILLS;
  const users = load(STORAGE_KEYS.USERS) || SEED_USERS;
  const skill = skills.find(s => s._id === skillId);
  if (!skill) throw { response: { data: { message: 'Skill not found' } } };

  const learner = users.find(u => u._id === userId || u.id === userId);
  const timeCreditsAmount = skill.timeCreditsPerHour * duration;
  if ((learner?.timeCredits || 0) < timeCreditsAmount)
    throw { response: { data: { message: `Insufficient credits. Need ${timeCreditsAmount}, have ${learner?.timeCredits || 0}.` } } };

  const exchanges = load(STORAGE_KEYS.EXCHANGES) || SEED_EXCHANGES;
  const newExchange = {
    _id: `exc_${Date.now()}`,
    skill: { _id: skill._id, title: skill.title, category: skill.category },
    provider: { _id: skill.provider._id, name: skill.provider.name, avatar: skill.provider.avatar || '' },
    learner: { _id: learner._id, name: learner.name, avatar: learner.avatar || '' },
    scheduledDate, duration, timeCreditsAmount, notes, status: 'pending',
    createdAt: new Date().toISOString(),
  };
  exchanges.push(newExchange);
  save(STORAGE_KEYS.EXCHANGES, exchanges);

  // Add notification to provider
  const notifs = load(STORAGE_KEYS.NOTIFICATIONS) || [];
  notifs.push({
    _id: `notif_${Date.now()}`,
    recipient: skill.provider._id,
    sender: { _id: learner._id, name: learner.name, avatar: '' },
    type: 'exchange_request',
    title: 'New Skill Request!',
    message: `${learner.name} wants to learn "${skill.title}" from you`,
    isRead: false, createdAt: new Date().toISOString(),
  });
  save(STORAGE_KEYS.NOTIFICATIONS, notifs);

  return newExchange;
};

export const mockRespondExchange = (exchangeId, action, userId) => {
  const exchanges = load(STORAGE_KEYS.EXCHANGES) || [];
  const idx = exchanges.findIndex(e => e._id === exchangeId);
  if (idx === -1) throw { response: { data: { message: 'Exchange not found' } } };

  exchanges[idx].status = action;
  if (action === 'accepted') {
    // Deduct credits from learner
    const users = load(STORAGE_KEYS.USERS) || SEED_USERS;
    const lIdx = users.findIndex(u => u._id === exchanges[idx].learner._id || u.id === exchanges[idx].learner._id);
    if (lIdx !== -1) {
      users[lIdx].timeCredits = (users[lIdx].timeCredits || 0) - exchanges[idx].timeCreditsAmount;
      save(STORAGE_KEYS.USERS, users);
    }
  }
  save(STORAGE_KEYS.EXCHANGES, exchanges);
  return exchanges[idx];
};

export const mockCompleteExchange = (exchangeId, { rating, review }, userId) => {
  const exchanges = load(STORAGE_KEYS.EXCHANGES) || [];
  const idx = exchanges.findIndex(e => e._id === exchangeId);
  if (idx === -1) throw { response: { data: { message: 'Exchange not found' } } };

  const isProvider = exchanges[idx].provider._id === userId;
  if (isProvider) { exchanges[idx].providerRating = rating; exchanges[idx].providerReview = review; }
  else { exchanges[idx].learnerRating = rating; exchanges[idx].learnerReview = review; }

  if (exchanges[idx].learnerRating && exchanges[idx].providerRating) {
    exchanges[idx].status = 'completed';
    exchanges[idx].completedAt = new Date().toISOString();
    // Award credits to provider
    const users = load(STORAGE_KEYS.USERS) || SEED_USERS;
    const pIdx = users.findIndex(u => u._id === exchanges[idx].provider._id);
    if (pIdx !== -1) {
      users[pIdx].timeCredits = (users[pIdx].timeCredits || 0) + exchanges[idx].timeCreditsAmount;
      users[pIdx].totalExchanges = (users[pIdx].totalExchanges || 0) + 1;
      save(STORAGE_KEYS.USERS, users);
    }
  }
  save(STORAGE_KEYS.EXCHANGES, exchanges);
  return exchanges[idx];
};

// ── Notification functions ────────────────────────────────────
export const mockGetNotifications = (userId) => {
  const all = load(STORAGE_KEYS.NOTIFICATIONS) || SEED_NOTIFICATIONS;
  const userNotifs = all.filter(n => n.recipient === userId);
  const unreadCount = userNotifs.filter(n => !n.isRead).length;
  return { notifications: userNotifs.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)), unreadCount };
};

export const mockMarkAllRead = (userId) => {
  const all = load(STORAGE_KEYS.NOTIFICATIONS) || [];
  const updated = all.map(n => n.recipient === userId ? { ...n, isRead: true } : n);
  save(STORAGE_KEYS.NOTIFICATIONS, updated);
};

// ── Admin functions ───────────────────────────────────────────
export const mockAdminStats = () => {
  const users = load(STORAGE_KEYS.USERS) || SEED_USERS;
  const skills = load(STORAGE_KEYS.SKILLS) || SEED_SKILLS;
  const exchanges = load(STORAGE_KEYS.EXCHANGES) || SEED_EXCHANGES;

  const catMap = {};
  skills.filter(s => s.isActive).forEach(s => { catMap[s.category] = (catMap[s.category] || 0) + 1; });

  return {
    stats: {
      totalUsers: users.filter(u => u.role === 'user').length,
      totalSkills: skills.filter(s => s.isActive).length,
      totalExchanges: exchanges.length,
      completedExchanges: exchanges.filter(e => e.status === 'completed').length,
      pendingExchanges: exchanges.filter(e => e.status === 'pending').length,
    },
    categoryStats: Object.entries(catMap).map(([_id, count]) => ({ _id, count })).sort((a,b) => b.count - a.count),
    recentExchanges: exchanges.slice(-10).reverse(),
    recentUsers: users.slice(-10).reverse(),
    creditStats: {
      totalCredits: users.reduce((s, u) => s + (u.timeCredits || 0), 0),
      avgCredits: Math.round(users.reduce((s, u) => s + (u.timeCredits || 0), 0) / (users.length || 1)),
    },
  };
};

export const mockAdminGetUsers = () => {
  const users = load(STORAGE_KEYS.USERS) || SEED_USERS;
  return users.map(({ password: _, ...u }) => u);
};

export const mockAdminToggleUser = (userId) => {
  const users = load(STORAGE_KEYS.USERS) || SEED_USERS;
  const idx = users.findIndex(u => u._id === userId);
  if (idx === -1) throw new Error('User not found');
  users[idx].isActive = !users[idx].isActive;
  save(STORAGE_KEYS.USERS, users);
  const { password: _, ...safe } = users[idx];
  return { user: safe, message: `User ${users[idx].isActive ? 'activated' : 'deactivated'}` };
};

export const mockAdminDeleteSkill = (skillId) => {
  const skills = load(STORAGE_KEYS.SKILLS) || SEED_SKILLS;
  const idx = skills.findIndex(s => s._id === skillId);
  if (idx !== -1) { skills[idx].isActive = false; save(STORAGE_KEYS.SKILLS, skills); }
};

export const mockGetUsers = (search = '') => {
  const users = load(STORAGE_KEYS.USERS) || SEED_USERS;
  const q = search.trim().toLowerCase();
  let results = users.filter(u => u.role !== 'admin' && u.isActive);
  if (q) {
    results = results.filter(u =>
      u.name?.toLowerCase().includes(q) ||
      u.location?.toLowerCase().includes(q) ||
      u.bio?.toLowerCase().includes(q) ||
      u.skillsOffered?.some(s => s.name?.toLowerCase().includes(q)) ||
      u.skillsWanted?.some(s => s.name?.toLowerCase().includes(q))
    );
  }
  results.sort((a, b) => (b.totalExchanges || 0) - (a.totalExchanges || 0));
  return results.map(({ password: _, ...u }) => ({ ...u, id: u._id }));
};
