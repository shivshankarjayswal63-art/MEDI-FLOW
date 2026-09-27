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

## Backend (optional second Vercel project)

1. New Vercel project, **Root Directory**: `BACKEND`.
2. Set env: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`, `FRONTEND01` = your Vercel frontend URL (e.g. `https://medi-flow.vercel.app`).
3. Use `BACKEND/vercel.json` (serverless Express).

## Local check before push

```bash
cd frontend
npm ci
npm run build
```
