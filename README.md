# MicroFinance Core Banking ERP

A full-stack microfinance core banking platform with secure authentication, role-based access, member profiles, and a responsive operations dashboard.

## Features

- Login and account registration
- JWT-based authentication with bcrypt password hashing
- Role support for administrators, loan officers, and customers
- Persistent or session-only sign-in options
- Responsive dashboard with account status and activity timeline
- Profile editing for name and phone number
- MongoDB Atlas health status indicator
- Next.js frontend and Express REST API

## Technology

- **Frontend:** Next.js App Router, React, CSS Modules
- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose
- **Security:** JWT and bcrypt

## Project Structure

```text
backend/     Express API, authentication, models, and routes
frontend/    Next.js web application
```

## Getting Started

### Prerequisites

- Node.js 20 or newer
- MongoDB Atlas account or a local MongoDB instance

### 1. Configure the backend

Create `backend/.env` using the following variables:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
JWT_EXPIRE=7d
```

### 2. Configure the frontend

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 3. Install dependencies and run

From the repository root:

```bash
cd backend
npm install
npm run dev
```

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000` to use the application. The API runs on `http://localhost:5000` by default.

## API Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/auth/register` | Create an account and return a JWT |
| POST | `/api/auth/login` | Authenticate a user and return a JWT |
| GET | `/api/auth/me` | Return the authenticated user profile |
| PUT | `/api/auth/profile` | Update the authenticated user profile |
| GET | `/api/health` | Check API and database status |

## Production Build

```bash
cd frontend
npm run lint
npm run build
```

## License

This project is intended for education and internal development. Add an appropriate license before distributing it publicly.
