<div align="center">

<img src="frontend/public/favicon.svg" alt="Unfazed Logo" width="72" height="72" />

# Unfazed

**Practice management platform for mental health professionals**

*Streamline bookings, client records, billing, notes, and communication — all in one place.*

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://mongoosejs.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Razorpay](https://img.shields.io/badge/Payments-Razorpay-002970?style=flat-square&logo=razorpay&logoColor=white)](https://razorpay.com)
[![License](https://img.shields.io/badge/License-Private-red?style=flat-square)](#license)

</div>

---

## Overview

Unfazed is a full-stack SaaS platform built for therapists and mental health practitioners. It covers the complete client lifecycle — from public slot booking and therapist approval, to secure client portal activation, session management, clinical notes, and subscription billing.

---

## Features

### For Therapists
- **Client management** — Add, edit, and delete clients; assign tags and intake data; generate activation invite links
- **Booking approval** — Review and approve or reject incoming booking requests before confirming slots
- **Calendar & sessions** — Manage appointments, mark session status, view history
- **Clinical notes** — SOAP-style session documentation with per-client note history
- **Analytics dashboard** — Revenue, session counts, and client growth charts
- **Subscription billing** — Tiered plan management via Razorpay with entitlement enforcement
- **Real-time chat** — Socket.IO-powered messaging with clients
- **Profile & availability** — Public therapist profile with customisable slug and booking availability

### For Clients
- **Public booking** — Book a slot on a therapist's public page without needing an account first
- **Secure portal activation** — Receive an email invite link upon therapist approval to set up a password
- **Bookings portal** — View upcoming and past sessions, withdraw pending requests, complete payments
- **Real-time chat** — Communicate with the therapist directly in the portal

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 19, Vite, React Router v7, Tailwind CSS, Axios, Sonner (toasts), Recharts, Lucide React, Socket.IO client |
| **Backend** | Node.js, Express.js, MongoDB + Mongoose, JWT (access + refresh tokens), Socket.IO |
| **Payments** | Razorpay (session payments & subscription plans) |
| **Email** | Brevo (Sendinblue) transactional email |
| **Storage** | Cloudinary (profile images & uploads) |
| **Security** | Helmet, CORS, express-rate-limit, bcrypt, role-based access control |

---

## Repository Structure

```
Unfazed/
├── backend/
│   └── src/
│       ├── config/          # DB and JWT config
│       ├── constants/       # Plans, roles
│       ├── controllers/     # Route handlers
│       ├── emails/          # Email templates
│       ├── middleware/       # Auth, RBAC, upload, error handling
│       ├── models/          # Mongoose schemas
│       ├── routes/          # Express routers
│       ├── services/        # Email, payment, upload services
│       ├── sockets/         # Socket.IO handlers
│       ├── validators/      # Input validation
│       ├── app.js
│       └── server.js
├── frontend/
│   └── src/
│       ├── components/      # Shared UI components
│       ├── context/         # Auth context
│       ├── layouts/         # Page shells (public, therapist, client)
│       ├── pages/           # Route-level pages
│       └── routes/          # Route definitions and guards
├── .gitignore
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- MongoDB instance (local or [MongoDB Atlas](https://www.mongodb.com/atlas))

### 1. Clone the repository

```bash
git clone https://github.com/Wajid-901/Unfazed.git
cd Unfazed
```

### 2. Configure environment variables

**Backend** — create `backend/.env` from the example:

```bash
cp backend/.env.example backend/.env
```

Fill in the values:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/unfazed
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=your_refresh_secret
REFRESH_TOKEN_EXPIRES_IN=30d
CLIENT_URL=http://localhost:5173
FRONTEND_URL=http://localhost:5173

# Razorpay (https://dashboard.razorpay.com)
RAZORPAY_KEY_ID=rzp_test_xxxx
RAZORPAY_KEY_SECRET=your_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Brevo transactional email (https://app.brevo.com)
BREVO_API_KEY=xkeysib-xxxx
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=Unfazed

# Cloudinary (https://cloudinary.com)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Frontend** — create `frontend/.env` from the example:

```bash
cp frontend/.env.example frontend/.env
```

```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_RAZORPAY_KEY=rzp_test_xxxx
```

### 3. Install dependencies and run

```bash
# Install all dependencies
npm install

# Start backend (development)
npm run dev:backend

# Start frontend (development) — in a separate terminal
npm run dev:frontend
```

The frontend runs on `http://localhost:5173` and the backend API on `http://localhost:5000`.

---

## Available Scripts

**Root level**

| Script | Description |
|--------|-------------|
| `npm run dev:backend` | Start backend in development mode (nodemon) |
| `npm run dev:frontend` | Start frontend dev server (Vite) |
| `npm run build:frontend` | Build frontend for production |

**Backend (`cd backend`)**

| Script | Description |
|--------|-------------|
| `npm run dev` | Start with nodemon |
| `npm start` | Start in production mode |

**Frontend (`cd frontend`)**

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build locally |

---

## Deployment

| Service | Recommended |
|---------|-------------|
| **Frontend** | [Vercel](https://vercel.com) or [Netlify](https://netlify.com) |
| **Backend** | [Render](https://render.com) or [Railway](https://railway.app) |
| **Database** | [MongoDB Atlas](https://www.mongodb.com/atlas) |

Set all environment variables in your hosting platform's dashboard. Never commit `.env` files.

---

## Security Notes

- All `.env` files are gitignored — never commit secrets
- JWT access tokens expire in 15 minutes with refresh token rotation
- Passwords hashed with bcrypt
- Rate limiting on auth and payment endpoints
- Role-based access control (`THERAPIST` / `CLIENT`) enforced on every protected route
- HTTPS required in production

---

## Roadmap

- [ ] Automated tests for API routes and auth flows
- [ ] CI/CD pipeline with lint and build checks
- [ ] Docker support for local development
- [ ] Two-factor authentication
- [ ] Group session support
- [ ] Client progress tracking and mood journaling

---

## License

This project is privately maintained. All rights reserved. Contact the maintainer for licensing enquiries.

---

<div align="center">

Built with care for mental health professionals.

</div>
