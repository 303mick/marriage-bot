# Validata backend

Node/Express + Postgres API: real accounts (email/password + JWT) and real
per-user persistence for idea validations. Scoring itself is still the same
deterministic placeholder the frontend mockup uses — see `src/scoring.js` for
where to plug in real AI-assisted research later.

## Endpoints

- `GET  /api/health` — liveness check
- `POST /api/auth/signup` `{ email, password }` → `{ token, user }`
- `POST /api/auth/login` `{ email, password }` → `{ token, user }`
- `GET  /api/auth/me` (Bearer token) → `{ user }`
- `POST /api/validations` `{ idea }` (Bearer token) → scores and saves it, enforcing the plan's monthly scan limit (Explorer 3, Founder 40, Scale unlimited)
- `GET  /api/validations` (Bearer token) → the caller's own validations, newest first

## Local setup

```bash
cd backend
npm install
cp .env.example .env   # then fill in DATABASE_URL and JWT_SECRET
npm run migrate         # creates the users/validations tables
npm run dev
```

## Deploying on Railway

1. In your Railway project (the one with the Postgres service), click
   **New → GitHub Repo** and pick this repo, root directory `backend`.
2. In that new service's **Variables** tab, add:
   - `DATABASE_URL` — click "Add Reference" and pick the Postgres service's `DATABASE_URL` (keeps it in sync automatically)
   - `JWT_SECRET` — a long random string (`node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`)
   - `CORS_ORIGIN` — the URL your frontend is served from
3. Under **Settings → Deploy**, set the **Start Command** to `npm run migrate && npm start` (runs migrations once on every deploy, safe to repeat).
4. Deploy. Railway gives you a public URL for the API — point the frontend's fetch calls at it.
