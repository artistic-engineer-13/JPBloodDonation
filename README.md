# JP Blood Donation (MERN)

A role-based MERN blood donation application with Admin, Hospital, Donor, and Blood Requester flows.

## Prerequisites

- Node.js 18+ (LTS recommended)
- npm 9+
- One MongoDB option:
  - Local MongoDB service, or
  - MongoDB Atlas connection string

## 1) Clone

```bash
git clone https://github.com/artistic-engineer-13/JPBloodDonation.git
cd JPBloodDonation
```

## 2) Environment Setup

Backend env is committed as backend/.env and frontend env is committed as frontend/.env.

If you need custom values, edit backend/.env:

- `PORT=5001`
- `CLIENT_URL=http://localhost:5174`
- `JWT_SECRET=<any long random secret>`
- `MONGODB_URI=<choose one>`

Local MongoDB:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/jp_blood_donation
```

MongoDB Atlas:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/jp_blood_donation?retryWrites=true&w=majority&appName=Cluster0
```

Frontend uses frontend/.env with this default value:

```env
VITE_API_BASE_URL=http://localhost:5001/api
```

## 3) Run the App

Run this single command from project root:

```bash
npm run dev
```

It automatically installs backend and frontend dependencies first (on first run), then starts both servers.

Frontend usually starts on:

- `http://localhost:5174`

## 4) Quick Health Check

Open in browser:

- `http://localhost:5001/api/health`

Expected JSON response includes `success: true`.

## Common DB Connection Issues

1. `MongoDB connection failed`
- Check `backend/.env` has correct `MONGODB_URI`
- For local MongoDB, ensure MongoDB service is running
- For Atlas, verify username/password, IP allowlist, and cluster URI
- If external DB is unavailable, backend falls back to in-memory MongoDB automatically (data resets on backend restart)

2. `Route not found` or API not reachable
- Ensure frontend `.env` points to `http://localhost:5001/api`
- Ensure backend is running on port `5001`

3. CORS blocked
- Ensure `CLIENT_URL` in backend `.env` matches frontend URL exactly

## Scripts

Backend:

- `npm --prefix backend run dev`
- `npm --prefix backend start`

Frontend:

- `npm --prefix frontend run dev`
- `npm --prefix frontend run build`
- `npm --prefix frontend run preview`
