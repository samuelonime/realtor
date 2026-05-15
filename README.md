# RealEstate CRM — Production Ready

A full-stack CRM system for real estate agencies. Built with **Next.js 14** (frontend) and **Node.js/Express + Sequelize** (backend), backed by **PostgreSQL**.

## Features

### Core Modules
- **Leads** — Pipeline management with 7 stages, auto-assignment, notes, follow-up scheduling, bulk operations
- **Properties** — Inventory with images, status tracking (available/reserved/sold), multi-filter
- **Deals** — Sales pipeline linking leads to properties with stage tracking and payment balance
- **Payments** — Installment tracking with auto-close when fully paid
- **Documents** — Property document management with verification workflow (C of O, Survey Plans, Deeds)
- **Users** — Role-based access control: Admin, Manager, Agent

### Production Additions (v1.1)
- **Reports & Analytics** — Monthly revenue trends, lead funnel, agent leaderboard, property performance
- **Notification Bell** — Real-time follow-up reminders, overdue alerts, pending document badges
- **Profile Page** — Account info + password change
- **Rate Limiting** — Global (500 req/15min) + auth endpoint (20 req/15min)
- **Security** — Helmet.js headers, CORS allowlist, JWT expiry, bcrypt password hashing
- **Compression** — Gzip/brotli via compression middleware
- **Graceful Shutdown** — SIGTERM/SIGINT handlers with DB connection cleanup
- **Structured Logging** — morgan access logs + internal logger utility
- **Docker** — Multi-stage Dockerfiles for backend and frontend
- **Docker Compose** — Full stack deployment with health checks

## Quick Start (Development)

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### Backend
```bash
cd backend
cp .env.example .env          # edit DB credentials and JWT secret
npm install
createdb realestate_crm       # or via psql: CREATE DATABASE realestate_crm;
npm run seed                   # creates admin@crm.com / password123
npm run dev
```

### Frontend
```bash
cd frontend
cp .env.local.example .env.local  # set NEXT_PUBLIC_API_URL
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

**Default credentials:** `admin@crm.com` / `password123`
> ⚠️ Change the password immediately after first login.

---

## Docker Deployment

```bash
cp .env.example .env
# Edit .env with strong secrets

docker compose up -d --build
```

The app will be available at:
- Frontend: `http://your-server:3000`
- API: `http://your-server:5000/api`
- Health: `http://your-server:5000/api/health`

### Run database seed after first launch:
```bash
docker compose exec backend node db/seed.js
```

---

## Render Deployment (Free Tier)

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
# Create repo on GitHub, then:
git remote add origin https://github.com/yourusername/realtor-crm.git
git push -u origin main
```

### Step 2: Create PostgreSQL Database
1. Go to [dashboard.render.com](https://dashboard.render.com) → **New +** → **PostgreSQL**
2. Name: `realtor-crm-db`, Free plan
3. After creation, copy the **Internal Database URL**

### Step 3: Deploy Backend Web Service
1. **New +** → **Web Service** → Connect your GitHub repo
2. Configure:

| Field | Value |
|---|---|
| **Name** | `realtor-crm-api` |
| **Root Directory** | `backend` |
| **Runtime** | Node |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Plan** | Free |

3. Add **Environment Variables**:
   - `DATABASE_URL` → paste the Internal Database URL from Step 2
   - `JWT_SECRET` → run `openssl rand -hex 32` to generate
   - `JWT_EXPIRES_IN` → `7d`

4. Click **Create Web Service**

### Step 4: Seed the Database
After deploy completes → Render dashboard → **Shell** tab → run:
```bash
node db/seed.js
```

### Step 5: Deploy Frontend
Deploy on Vercel (recommended for Next.js):
1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com) → Import repo
3. Root Directory: `frontend`
4. Add env var: `NEXT_PUBLIC_API_URL=https://realtor-crm-api.onrender.com/api`
5. Deploy

**Your API URL:** `https://realtor-crm-api.onrender.com/api`

---

## Environment Variables

### Backend (`.env`)
| Variable | Description | Default |
|---|---|---|
| `NODE_ENV` | Environment | `development` |
| `PORT` | API port | `5000` |
| `DATABASE_URL` | Full connection URL (Render) | — |
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_NAME` | Database name | `realestate_crm` |
| `DB_USER` | DB user | `postgres` |
| `DB_PASSWORD` | DB password | — |
| `JWT_SECRET` | JWT signing secret (min 32 chars) | — |
| `JWT_EXPIRES_IN` | Token expiry | `7d` |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins | `http://localhost:3000` |
| `LOG_LEVEL` | Logging level | `info` |

### Frontend (`.env.local`)
| Variable | Description | Default |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:5000/api` |

---

## API Endpoints

| Resource | Endpoints |
|---|---|
| Auth | `POST /auth/login`, `GET /auth/me`, `PUT /auth/change-password` |
| Leads | Full CRUD + notes, bulk-assign, follow-ups |
| Properties | Full CRUD + image upload |
| Deals | Full CRUD |
| Payments | Full CRUD |
| Documents | Full CRUD + verification |
| Users | Full CRUD + agents list |
| Dashboard | `GET /dashboard` |
| Reports | Monthly revenue, lead funnel, agent leaderboard, property performance |
| Notifications | `GET /notifications` |
| Health | `GET /health` |

---

## Roles & Permissions

| Feature | Admin | Manager | Agent |
|---|---|---|---|
| View own leads/deals | ✅ | ✅ | ✅ |
| View all leads/deals | ✅ | ✅ | — |
| Delete leads/properties | ✅ | ✅ | — |
| Bulk assign leads | ✅ | ✅ | — |
| View reports | ✅ | ✅ | — |
| Manage users | ✅ | — | — |
| Verify documents | ✅ | ✅ | — |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, React 18, Tailwind CSS, Chart.js |
| Backend | Node.js, Express 4, Sequelize 6 |
| Database | PostgreSQL 14 |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Security | Helmet, express-rate-limit, CORS |
| DevOps | Docker, Docker Compose |
