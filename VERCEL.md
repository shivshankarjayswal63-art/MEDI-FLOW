# Deploy MEDI-FLOW on Vercel

## Frontend (recommended)

1. Import the GitHub repo in [Vercel](https://vercel.com).
2. **Root Directory**: leave empty (repo root) **or** set to `frontend` (both work; root uses `vercel.json` at repo root).
3. **Framework Preset**: Vite (auto-detected if root is `frontend`).
4. **Environment variables** (Project → Settings → Environment Variables):

   | Name | Example |
   |------|---------|
   | `VITE_API_URL` | `https://your-backend.onrender.com` |
   | `VITE_SUPABASE_URL` | From Supabase dashboard |
   | `VITE_SUPABASE_ANON_KEY` | From Supabase dashboard |

5. Deploy. Build command: `npm run build`, output: `dist` (when root is `frontend`).

The API does **not** run on the same static frontend deployment. Host `BACKEND/` on Render, Railway, or a separate Vercel project (see below).

## Backend (second Vercel project — required for login/API)

Full steps: **[BACKEND/DEPLOY.md](./BACKEND/DEPLOY.md)**

Quick version:

1. **New** Vercel project → same repo → **Root Directory = `BACKEND`**.
2. Env: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`, `FRONTEND01=https://medi-flow-ten-theta.vercel.app`
3. Deploy → copy backend URL → set **`VITE_API_URL`** on the **frontend** project → **Redeploy frontend**.

## Local check before push

```bash
cd frontend
npm ci
npm run build
```
