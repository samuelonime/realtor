# RealEstate CRM

A simple, production-ready Real Estate CRM Web Application built for Nigerian real estate companies. Replaces scattered WhatsApp chats and Excel sheets with a clean, structured SaaS platform.

## Tech Stack

- **Frontend:** Next.js 14 (Pages Router), Tailwind CSS, Chart.js
- **Backend:** Node.js, Express.js, Sequelize ORM
- **Database:** MySQL 8+
- **Auth:** JWT (JSON Web Tokens), bcrypt password hashing

## Modules

1. **Lead Management** — Capture, assign, and track leads through a sales pipeline
2. **Property Management** — List and manage property inventory with image support
3. **Sales Pipeline (Deals)** — Track deals from inspection to closing
4. **Payments & Installments** — Record payments and track installment plans
5. **Document Tracking** — Upload and verify property documents (C of O, Survey Plan, etc.)

## Quick Start

### Prerequisites

- Node.js 18+
- MySQL 8+
- npm

### 1. Clone & Install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Database Setup

```bash
# Create the database
mysql -u root -p < backend/db/schema.sql

# Or run the seed script (creates tables + sample data)
cd backend
npm run seed
```

### 3. Configure Environment

```bash
# Backend (backend/.env)
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=realestate_crm
DB_USER=root
DB_PASSWORD=yourpassword
JWT_SECRET=your-secret-key-change-this
JWT_EXPIRES_IN=7d
```

### 4. Run the Application

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 5. Login

Open http://localhost:3000 and login with:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@crm.com | password123 |
| Agent | agent@crm.com | password123 |

## Default Users

After seeding, the following users are created:
- **Admin** - admin@crm.com / password123
- **Agent** - agent@crm.com / password123

Lead sources are also pre-seeded: Facebook Ads, Referral, WhatsApp, Walk-in, Instagram, Website, Phone Call, Email, Other.

## Project Structure

```
realtor/
├── backend/
│   ├── config/          # DB configuration
│   ├── controllers/     # Route handlers
│   ├── middleware/       # Auth, audit logging
│   ├── models/          # Sequelize models
│   ├── routes/          # Express routes
│   ├── db/              # Schema & seed scripts
│   ├── uploads/         # File uploads
│   ├── server.js        # Entry point
│   └── package.json
├── frontend/
│   ├── components/      # Shared components (Layout, Sidebar)
│   ├── context/         # Auth context
│   ├── lib/             # API client
│   ├── pages/           # Next.js pages
│   │   ├── index.js     # Login page
│   │   ├── dashboard.js # Admin dashboard
│   │   ├── leads/       # Lead management
│   │   ├── properties/  # Property management
│   │   ├── deals/       # Deal pipeline
│   │   ├── payments/    # Payment tracking
│   │   ├── documents/   # Document management
│   │   └── users/       # User management (admin)
│   └── styles/          # Global CSS
└── README.md
```

## API Endpoints

### Auth
- `POST /api/auth/login` — Login
- `GET /api/auth/me` — Get current user
- `PUT /api/auth/change-password` — Change password

### Dashboard
- `GET /api/dashboard` — Dashboard statistics

### Leads
- `GET /api/leads` — List leads (with filters)
- `GET /api/leads/:id` — Get lead details
- `POST /api/leads` — Create lead
- `PUT /api/leads/:id` — Update lead
- `DELETE /api/leads/:id` — Delete lead
- `POST /api/leads/:id/notes` — Add note to lead
- `POST /api/leads/bulk-assign` — Bulk assign leads
- `GET /api/leads/followups` — Get follow-up reminders

### Properties
- `GET /api/properties` — List properties
- `GET /api/properties/:id` — Get property details
- `POST /api/properties` — Create property
- `PUT /api/properties/:id` — Update property
- `DELETE /api/properties/:id` — Delete property

### Deals
- `GET /api/deals` — List deals
- `GET /api/deals/:id` — Get deal with payments
- `POST /api/deals` — Create deal
- `PUT /api/deals/:id` — Update deal stage
- `DELETE /api/deals/:id` — Delete deal

### Payments
- `GET /api/payments` — List payments
- `GET /api/payments/:id` — Get payment
- `POST /api/payments` — Record payment
- `DELETE /api/payments/:id` — Delete payment

### Documents
- `GET /api/documents` — List documents
- `GET /api/documents/:id` — Get document
- `POST /api/documents` — Upload document
- `PUT /api/documents/:id` — Verify/flag document
- `DELETE /api/documents/:id` — Delete document

### Users
- `GET /api/users` — List users (admin/manager)
- `GET /api/users/agents` — List agents
- `POST /api/users` — Create user (admin)
- `PUT /api/users/:id` — Update user (admin)
- `DELETE /api/users/:id` — Deactivate user (admin)

### Sources
- `GET /api/sources` — List lead sources

## Role-Based Access

| Feature | Admin | Manager | Agent |
|---------|-------|---------|-------|
| Dashboard | Full | Full | Own |
| Leads | All | All | Assigned |
| Properties | All | All | Assigned |
| Deals | All | All | Own |
| Payments | All | All | View |
| Documents | Manage | Manage | Upload |
| Users | Manage | View | No |

## Deployment

### VPS Deployment (Ubuntu 22.04)

```bash
# 1. Install dependencies
sudo apt update && sudo apt install -y nginx mysql-server certbot nodejs npm

# 2. Clone and setup backend
git clone <repo> /var/www/realtor
cd /var/www/realtor/backend
npm install --production

# 3. Setup MySQL database
sudo mysql -e "CREATE DATABASE realestate_crm;"
sudo mysql realestate_crm < db/schema.sql

# 4. Setup PM2
sudo npm install -g pm2
pm2 start server.js --name realestate-crm-api
pm2 save && pm2 startup

# 5. Build frontend
cd /var/www/realtor/frontend
npm install && npm run build

# 6. Configure Nginx
sudo nano /etc/nginx/sites-available/realtor-crm
```

Nginx config:
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Uploads
    location /uploads/ {
        proxy_pass http://localhost:5000;
    }
}
```

## License

MIT
