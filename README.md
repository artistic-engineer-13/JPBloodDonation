# JP Blood Donation (MERN)

A role-based MERN blood donation application with Admin, Hospital, Donor, and Blood Requester flows.

## Prerequisites

- Node.js 18+ (LTS recommended)
- npm 9+
- One MongoDB option:
  - Local MongoDB service, or
  - MongoDB Atlas connection string

## 1) Clone and Install

```bash
git clone https://github.com/artistic-engineer-13/JPBloodDonation.git
cd JPBloodDonation
npm --prefix backend install
npm --prefix frontend install
```

## 2) Environment Setup

### Backend env

Create backend env file from template:

```bash
cp backend/.env.example backend/.env
```

For Windows PowerShell:

```powershell
Copy-Item backend/.env.example backend/.env
```

Then update backend/.env:

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

### Frontend env

Create frontend env file from template:

```bash
cp frontend/.env.example frontend/.env
```

For Windows PowerShell:

```powershell
Copy-Item frontend/.env.example frontend/.env
```

Expected value:

```env
VITE_API_BASE_URL=http://localhost:5001/api
```

## 3) Run the App

Open 2 terminals from project root:

Terminal 1 (backend):

```bash
npm --prefix backend run dev
```

Terminal 2 (frontend):

```bash
npm --prefix frontend run dev
```

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
