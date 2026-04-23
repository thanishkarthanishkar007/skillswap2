# 🔄 SkillSwap – Local Skill Exchange Platform (Time Bank Model)

> Exchange Skills, Not Money — A community platform where your time is the currency.

---

## 📦 Project Structure

```
skillswap/
├── frontend/          ← React.js app (deploy to Vercel)
│   ├── public/
│   ├── src/
│   │   ├── components/    AppLayout (sidebar, topbar, notifications)
│   │   ├── context/       AuthContext (global auth state)
│   │   ├── pages/         All 8 pages
│   │   └── utils/         Axios API client
│   ├── .env.example
│   └── vercel.json
└── backend/           ← Node.js/Express API (deploy to Render)
    ├── models/        User, Skill, Exchange, Notification
    ├── routes/        auth, users, skills, exchanges, admin, notifications
    ├── middleware/    JWT auth, admin guard
    ├── .env.example
    ├── render.yaml
    └── server.js
```

---

## 🚀 Local Development Setup

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm run dev
# API running at http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env: REACT_APP_API_URL=http://localhost:5000/api
npm start
# App running at http://localhost:3000
```

---

## ☁️ Deployment Guide

### Backend → Render.com

1. Push `backend/` folder to a GitHub repo
2. Go to [render.com](https://render.com) → **New Web Service**
3. Connect your GitHub repo
4. Settings:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment:** Node
5. Add Environment Variables:
   | Key | Value |
   |-----|-------|
   | `MONGODB_URI` | Your MongoDB Atlas connection string |
   | `JWT_SECRET` | A random secret (e.g. `openssl rand -hex 32`) |
   | `FRONTEND_URL` | `https://mahendra-skillswap.vercel.app` |
   | `PORT` | `5000` |
6. Deploy → note your URL: `https://mahendra-skillswap.onrender.com`

### Frontend → Vercel.com

1. Push `frontend/` folder to a GitHub repo
2. Go to [vercel.com](https://vercel.com) → **New Project**
3. Import your repo
4. Add Environment Variable:
   | Key | Value |
   |-----|-------|
   | `REACT_APP_API_URL` | `https://mahendra-skillswap.onrender.com/api` |
5. Deploy → your app is live at `https://mahendra-skillswap.vercel.app`

### MongoDB Atlas

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a free cluster (M0)
3. Create a database user
4. Whitelist `0.0.0.0/0` (allow all IPs) for Render
5. Copy the connection string into Render's `MONGODB_URI`

---

## 🗺️ Pages & Routes

| Route | Page | Auth |
|-------|------|------|
| `/` | Landing Page | Public |
| `/login` | Login | Public only |
| `/register` | Register (2-step) | Public only |
| `/dashboard` | User Dashboard | Required |
| `/marketplace` | Skill Marketplace | Required |
| `/skills/:id` | Skill Detail | Required |
| `/request/:skillId` | Request Session | Required |
| `/exchanges` | Exchange Tracking | Required |
| `/profile` | User Profile | Required |
| `/admin` | Admin Dashboard | Admin only |

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |

### Skills
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/skills` | List skills (search, filter, paginate) |
| GET | `/api/skills/:id` | Get skill detail |
| POST | `/api/skills` | Create skill listing |
| PUT | `/api/skills/:id` | Update skill |
| DELETE | `/api/skills/:id` | Remove skill |

### Exchanges
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/exchanges/my` | Get my exchanges |
| POST | `/api/exchanges/request` | Request a session |
| PUT | `/api/exchanges/:id/respond` | Accept or reject |
| PUT | `/api/exchanges/:id/complete` | Complete + rate |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | Platform statistics |
| GET | `/api/admin/users` | All users |
| PUT | `/api/admin/users/:id/toggle` | Activate/deactivate user |
| GET | `/api/admin/skills` | All skills |
| DELETE | `/api/admin/skills/:id` | Remove skill |

---

## 💡 Features

- **Time Bank Model** – 1 hour taught = 1 time credit earned
- **New user bonus** – 10 free credits on signup
- **Skill Marketplace** – Browse, search, filter by category/credits/rating
- **Session Booking** – Request sessions with date, time, duration, notes
- **Credit Management** – Automatic deduction/award on accept/complete
- **Notifications** – Real-time in-app notifications for requests, accepts, completions
- **Ratings & Reviews** – Mutual rating system after session completion
- **Admin Panel** – Full user management, skill oversight, platform analytics
- **Mobile Responsive** – Full sidebar/topbar responsive design

---

## 🛠️ Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, React Router v6, Axios, react-hot-toast, react-icons |
| Backend | Node.js, Express.js, JWT auth, express-validator |
| Database | MongoDB with Mongoose ODM |
| Frontend Host | Vercel |
| Backend Host | Render |
| DB Host | MongoDB Atlas |

---

## 🔐 Demo Credentials (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@skillswap.app | admin123 |
| User | demo@skillswap.app | demo123 |

---

## 📝 License

MIT – built for Mahendra's SkillSwap project.
