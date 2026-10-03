# Unfazed

Unfazed is a therapist practice management SaaS platform built for mental health professionals to manage patient/client workflows, bookings, billing, notes, chat, subscriptions, and secure client portals.

This repository is organized as a monorepo with:
- frontend: React + Vite app for the public website, therapist dashboard and client portal
- backend: Node.js + Express REST API with MongoDB and Socket.IO

## Tech Stack

Frontend
- React 19
- Vite
- React Router
- Axios
- Tailwind CSS
- Recharts
- Lucide React
- Socket.IO client

Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT authentication
- Socket.IO
- Cloudinary
- Razorpay integration
- Brevo transactional email integration
- Helmet, CORS, rate limiting

## Core Features

- Therapist registration and login
- Client booking portal and public profile pages
- Appointment scheduling and calendar workflows
- Client records and intake data
- Clinical notes and SOAP-style documentation
- Secure client portal for invited patients
- Payment and subscription management
- Analytics dashboard
- Chat and notifications
- Email verification and password reset flows
- Role-based access for therapist and client users

## Repository Structure

```text
Unfazed/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── constants/
│   │   ├── controllers/
│   │   ├── emails/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── sockets/
│   │   ├── validators/
│   │   ├── app.js
│   │   ├── server.js
│   │   └── ...
│   ├── .env.example
│   ├── package.json
│   └── package-lock.json
├── frontend/
│   ├── src/
│   ├── public/
│   ├── .env.example
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── ...
├── package.json
├── .gitignore
└── README.md
```

## Prerequisites

Before running the app locally, install:
- Node.js 18+
- npm
- MongoDB instance (local or remote)

## Environment Setup

### Backend

Create a `.env` file inside `backend/` based on `.env.example`:

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
RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
BREVO_API_KEY=your_brevo_key
FROM_EMAIL=noreply@unfazed.in
FROM_NAME=Unfazed
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Frontend

Create a `.env` file inside `frontend/` based on `.env.example`:

```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_RAZORPAY_KEY=your_key
```

## Local Development

From the repository root:

```bash
npm install
npm run dev:backend
npm run dev:frontend
```

Or run the frontend and backend separately:

```bash
cd backend
npm install
npm run dev
```

```bash
cd frontend
npm install
npm run dev
```

## Available Scripts

Root-level scripts:

```bash
npm run dev            # starts backend server only
npm run dev:backend    # starts backend in development mode
npm run dev:frontend   # starts frontend in development mode
npm run build:frontend # builds frontend production bundle
```

Backend scripts:

```bash
cd backend
npm run dev
npm start
npm test
```

Frontend scripts:

```bash
cd frontend
npm run dev
npm run build
npm run preview
```

## Production Notes

- Frontend is intended to be deployed with Vercel or similar static hosting.
- Backend should be deployed on a Node.js host such as Render, Railway, or similar.
- Make sure environment variables are set in the deployment environment.
- Use a real MongoDB Atlas or managed MongoDB service in production.
- Keep JWT secrets and payment credentials stored in environment variables only.

## Important Security Notes

- Never commit real `.env` files.
- Never share JWT secrets or API keys.
- Ensure all production URLs and credentials are configured correctly before deployment.
- Use HTTPS in production.

## License

This project is currently configured without a formal public license file. If you plan to open source or distribute it externally, consider adding a LICENSE file and choosing an appropriate OSS license.

## Maintainer

This project is maintained by the Unfazed development team.

## Future Improvements

- Add automated tests for API routes and auth flows
- Add CI/CD pipeline for linting and build checks
- Add a central email configuration module
- Add production deployment documentation
- Add Docker support for local development and deployment
