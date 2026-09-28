# Deploy MEDI-FLOW backend only

Your **frontend** is static (e.g. [medi-flow-ten-theta.vercel.app](https://medi-flow-ten-theta.vercel.app)).  
The **backend** is Express in this folder. Deploy it once, then point the frontend at its URL.

---

## Required environment variables (every host)

Copy values from your local `BACKEND/.env` (never commit `.env`).

| Variable | Purpose |
|----------|---------|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side DB access |
| `JWT_SECRET` | Same secret you use locally |
| `FRONTEND01` | **Exact** frontend URL, no trailing slash — e.g. `https://medi-flow-ten-theta.vercel.app` |

Optional: `AI_API_URL`, `EMAIL_USER`, `EMAIL_PASS`, `DATABASE_URL` (for migrations only).

### Medical assistant (NVIDIA Nemotron)

| Variable | Purpose |
|----------|---------|
| `NVIDIA_API_KEY` | From [build.nvidia.com](https://build.nvidia.com) (`nvapi-…`). **Backend only** — never expose in the frontend. |
| `NVIDIA_NEMOTRON_MODEL` | Default `nvidia/nemotron-3-ultra-550b-a55b` if unset |

Without `NVIDIA_API_KEY`, `/api/medical-assistant/chat` still works using the built-in symptom screening + FAQ replies.

**Medical assistant not working?**

1. Patient must be **logged in** → side menu **☰ → Medical assistant** or `/medical-assistant`.
2. Frontend `VITE_API_URL` must point at this API (e.g. `https://medi-flow-api.vercel.app`) — redeploy frontend after changing.
3. Test API: `POST /api/medical-assistant/chat` with body `{"message":"what is asthma"}`.
4. **Local dev:** run `npm start` in `BACKEND` and set `frontend/.env` `VITE_API_URL=http://localhost:5000`.
5. On Vercel free tier, slow Nemotron calls fall back to the **screening engine** after ~7s (still returns an answer).

---

## Common Vercel mistake

If build looks for `BACKEND/ai-model/frontend/package.json`, the **frontend** project’s **Root Directory** is wrong. Set it to **`frontend`** only. The **API** project must use Root Directory **`BACKEND`** only.

---

## Option A — Vercel (second project, same GitHub repo)

1. Go to [vercel.com/new](https://vercel.com/new) → import **MEDI-FLOW** repo again (second project).
2. **Project name**: e.g. `medi-flow-api`.
3. **Root Directory** → **Edit** → set to **`BACKEND`** (important).
4. Framework: Other / Node (Vercel uses `BACKEND/vercel.json`).
5. **Environment Variables** → add the table above. Set `NODE_ENV` = `production` if offered.
6. **Deploy**.
7. Copy the deployment URL, e.g. `https://medi-flow-api.vercel.app` (no `/` at end).

### Connect frontend

1. Open your **frontend** Vercel project → **Settings** → **Environment Variables**.
2. Add or update:
   - `VITE_API_URL` = `https://medi-flow-api.vercel.app` (your backend URL)
   - `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (same as local `frontend/.env`)
3. **Deployments** → **Redeploy** the frontend (env vars are baked in at build time).

### Test backend

Open in browser:

`https://YOUR-BACKEND-URL/api/doctor/public`

You should see JSON (doctor list), not HTML.

### Demo data (patient dashboard)

From your machine (with `BACKEND/.env` pointing at the **same** Supabase project as production):

```bash
cd BACKEND
npm run db:seed
```

Then log in as **`patient1@demo.com`** / **`Patient@123`**. The patient dashboard should show appointments, vitals chart, AI history, lab reports, prescriptions, and notifications.

### Platform admin (User Dashboard)

MEDI FLOW login uses the **`users`** table (Express `/api/auth/login`), **not** Supabase → Authentication users.

To promote an email to **user admin** (User Dashboard):

```bash
cd BACKEND
# Add to .env locally only (never commit passwords):
# PLATFORM_ADMIN_EMAIL=zayacodehub@gmail.com
# PLATFORM_ADMIN_PASSWORD=your-secure-password
npm run admin:ensure
```

Log in on the site at **/login** — you should land on **/User-Dashboard**.

### Portal roles (separate logins & routes)

| Role | Login URL | Dashboard |
|------|-----------|-----------|
| Patient | `/login` | `/patient-dashboard` |
| Platform admin | `/login` | `/User-Dashboard` |
| Pharmacy admin | `/login` | `/Pharmacy-Dashboard` |
| Appointment admin | `/login` | `/Appointment-Dashboard` |
| Doctor | `/login-doctor` | `/Doctor-Dashboard` |

Doctor emails cannot use `/login`; staff emails cannot use `/login-doctor`. JWT `role` is enforced on dashboard APIs and key patient routes.

**Medical assistant booking:** patient must be logged in; chat uses `POST /api/medical-assistant/book` with JWT.

**Medical assistant chat history (optional):** run `supabase/migrations/003_medical_assistant_chat.sql` on Supabase so signed-in patients get server-side saved chats (`GET /api/medical-assistant/session`). Without it, chats still persist in the browser.

**Patient health profile + report AI tags (optional):** run `supabase/migrations/004_patient_health_profile.sql` for allergies/chronic conditions on `users` and `report_summary` / `ai_tags` on `medical_reports`.

**Lab report file storage (Vercel):** run `supabase/migrations/006_medical_report_file_content.sql` so uploaded PDFs are stored in the database and **View PDF** works after deploy.

**Doctor verification (recommended):** run `supabase/migrations/005_doctor_approval.sql` so new doctor sign-ups stay **pending** until a platform admin approves them under **User Admin → Doctor verification** (`/Doctor-Approvals`). Only **approved** doctors appear in `/api/doctor/public`, booking, and the medical assistant.

### Custom subdomain + backend (recommended)

Full guide: **[docs/SUBDOMAIN_AND_BACKEND.md](../docs/SUBDOMAIN_AND_BACKEND.md)**

1. **Backend Vercel project** → Domains → add `api.mediflow.zayacodehub.in` (DNS `CNAME` `api.mediflow` → Vercel).
2. **Frontend Vercel** → `VITE_API_URL=https://api.mediflow.zayacodehub.in` → redeploy frontend.
3. **API env:** `FRONTEND01=https://mediflow.zayacodehub.in` and/or `CORS_ORIGIN_SUFFIX=zayacodehub.in`.

The site calls the API host directly (CORS). Same-domain `/api` rewrite in `frontend/vercel.json` is optional and may not work for all POST routes on custom domains.

---

## Option B — Render (good for long-running Express)

1. [render.com](https://render.com) → **New** → **Web Service** → connect GitHub repo.
2. **Root Directory**: `BACKEND`
3. **Runtime**: Node
4. **Build Command**: `npm install`
5. **Start Command**: `npm start`
6. Add the same env vars as in the table (including `FRONTEND01`).
7. Create service → copy URL like `https://medi-flow-api.onrender.com`.
8. Set frontend `VITE_API_URL` to that URL and **redeploy** frontend on Vercel.

---

## Option C — Railway

1. New project → deploy from GitHub → set root to **`BACKEND`**.
2. Start: `npm start`, add env vars.
3. Use the generated public URL as `VITE_API_URL`.

---

## After deploy checklist

| Step | Done? |
|------|--------|
| Backend URL returns `/api/doctor/public` JSON | |
| `FRONTEND01` matches live frontend URL | |
| `VITE_API_URL` set on Vercel frontend + redeploy | |
| Supabase keys set on both (service role on backend, anon on frontend) | |

## Limitations on serverless (Vercel)

- **File uploads** (`/uploads`) are not persistent on Vercel; medical report files may not survive redeploys. Use Render/Railway if you need reliable uploads.
- **Python AI** (`npm run` / local `model.py`) does not run on Vercel; use `AI_API_URL` pointing to a separate FastAPI host or skip AI in production.

## Local parity

```bash
cd BACKEND
npm install
npm start
# frontend .env: VITE_API_URL=http://localhost:5000
```
