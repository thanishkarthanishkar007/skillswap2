# ⚡ SkillSwap Quick Start Guide

---

## 🟢 Option 1: Run Frontend Only (No Backend Needed)

This works immediately — no MongoDB, no Node.js backend required.
Data is saved in your browser's localStorage.

```bash
cd frontend
npm install
# .env already has REACT_APP_MOCK_MODE=true
npm start
```

Open http://localhost:3000

**Demo accounts ready to use:**
| Role  | Email                  | Password  |
|-------|------------------------|-----------|
| User  | demo@skillswap.app     | demo123   |
| Admin | admin@skillswap.app    | admin123  |

**Or register a brand new account** — it works completely offline!

---

## 🔵 Option 2: Full Stack (Frontend + Backend + MongoDB)

### Step 1 — Set up MongoDB

**Option A: MongoDB Atlas (Free Cloud)**
1. Go to https://cloud.mongodb.com
2. Create free account → New Project → Build a Database → Free (M0)
3. Create user: username + password
4. Network Access → Add IP Address → `0.0.0.0/0` (allow all)
5. Connect → Drivers → Copy the connection string

**Option B: Local MongoDB**
```bash
# Install MongoDB locally, then it runs at:
# mongodb://localhost:27017/skillswap
```

### Step 2 — Configure Backend

```bash
cd backend
npm install
```

Edit `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb+srv://YOUR_USER:YOUR_PASS@cluster0.xxxxx.mongodb.net/skillswap
JWT_SECRET=any_random_secret_string_here
FRONTEND_URL=http://localhost:3000
```

### Step 3 — Seed Demo Data

```bash
cd backend
npm run seed
```

You'll see:
```
✅ Connected to MongoDB
🗑️  Cleared existing data
👥 Created 5 users
🎓 Created 8 skills
✅ Seed complete!
```

### Step 4 — Start Backend

```bash
npm run dev
# Backend running at http://localhost:5000
# Test: http://localhost:5000/api/health
```

### Step 5 — Configure Frontend

Edit `frontend/.env`:
```env
# Comment out mock mode:
# REACT_APP_MOCK_MODE=true

# Add your backend URL:
REACT_APP_API_URL=http://localhost:5000/api
```

### Step 6 — Start Frontend

```bash
cd frontend
npm install
npm start
# App running at http://localhost:3000
```

---

## 🚀 Option 3: Deploy to Production

### Backend → Render.com

1. Push `backend/` to a GitHub repository
2. Go to https://render.com → New → Web Service
3. Connect your repo
4. Settings:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Environment Variables (add all of these):
   ```
   MONGODB_URI  = your MongoDB Atlas URI
   JWT_SECRET   = a strong random string
   FRONTEND_URL = https://mahendra-skillswap.vercel.app
   PORT         = 5000
   ```
6. Click Deploy → wait ~2 minutes
7. Your API URL: `https://mahendra-skillswap.onrender.com`

### Frontend → Vercel.com

1. Push `frontend/` to a GitHub repository
2. Go to https://vercel.com → New Project → Import repo
3. Framework: **Create React App**
4. Environment Variables:
   ```
   REACT_APP_API_URL = https://mahendra-skillswap.onrender.com/api
   ```
   *(Remove REACT_APP_MOCK_MODE or set it to false)*
5. Click Deploy
6. Your app: `https://mahendra-skillswap.vercel.app`

### After Deployment — Seed Production Data

In Render dashboard → your service → Shell:
```bash
node seed.js
```

---

## 🛠️ Troubleshooting

| Problem | Fix |
|---------|-----|
| "Registration failed" | Backend not running. Use mock mode: set `REACT_APP_MOCK_MODE=true` in frontend `.env` |
| "Cannot connect to server" | Start backend: `cd backend && npm run dev` |
| MongoDB connection error | Check MONGODB_URI in `backend/.env` — ensure IP is whitelisted in Atlas |
| Blank page on Vercel | Check `vercel.json` exists in frontend root (it does) |
| CORS error | Set `FRONTEND_URL` in backend `.env` to your exact frontend URL |
| Port 5000 already in use | Change `PORT=5001` in `backend/.env` and update `REACT_APP_API_URL` |

---

## 📁 Project Structure

```
skillswap/
├── frontend/               React app → deploy to Vercel
│   ├── src/
│   │   ├── pages/          LandingPage, Login, Register, Dashboard...
│   │   ├── components/     AppLayout (sidebar + topbar)
│   │   ├── context/        AuthContext
│   │   └── utils/
│   │       ├── api.js      Axios client
│   │       └── mockData.js Built-in demo data (no backend needed)
│   ├── .env                ← Edit this first!
│   └── vercel.json
│
└── backend/                Node.js API → deploy to Render
    ├── models/             User, Skill, Exchange, Notification
    ├── routes/             auth, skills, exchanges, admin, notifications
    ├── middleware/         JWT auth
    ├── .env                ← Edit this for backend!
    ├── seed.js             Run to populate demo data
    └── server.js
```
