# Connect your subdomain to the MEDI FLOW backend

Use **two hostnames** (recommended for [mediflow.zayacodehub.in](https://mediflow.zayacodehub.in/)):

| Purpose | Example hostname | Vercel project | Root directory |
|--------|------------------|----------------|----------------|
| **Website (React)** | `mediflow.zayacodehub.in` | `medi-flow` (frontend) | `frontend` |
| **API (Express)** | `api.mediflow.zayacodehub.in` | `medi-flow-api` | `BACKEND` |

You can keep the default API URL `https://medi-flow-api.vercel.app` instead of a custom API subdomain — the steps below add a branded API hostname.

---

## 1. DNS (at your domain registrar / Cloudflare)

Add records **exactly as Vercel shows** after you add each domain in step 2. Typical pattern:

| Type | Name / host | Value |
|------|-------------|--------|
| `CNAME` | `mediflow` | `cname.vercel-dns.com` (or the target Vercel gives you) |
| `CNAME` | `api.mediflow` | `cname.vercel-dns.com` (for `api.mediflow.zayacodehub.in`) |

- No `https://` in DNS values.
- Wait for DNS to propagate (minutes to a few hours).
- In Vercel, wait until each domain shows **Valid**.

**Alternative API hostname:** `api.zayacodehub.in` — add that domain on the **backend** project and create the matching `CNAME` for `api`.

---

## 2. Vercel — backend project (`medi-flow-api`)

1. Open the API project → **Settings** → **Domains**.
2. Add: `api.mediflow.zayacodehub.in` (or your chosen API host).
3. **Settings** → **General** → **Root Directory** must be **`BACKEND`**.
4. **Settings** → **Environment Variables** (Production):

| Variable | Example value |
|----------|----------------|
| `SUPABASE_URL` | From Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | From Supabase |
| `JWT_SECRET` | Long random secret (same as local) |
| `FRONTEND01` | `https://mediflow.zayacodehub.in` (no trailing `/`) |
| `CORS_ORIGIN_SUFFIX` | `zayacodehub.in` (allows all `*.zayacodehub.in` sites) |
| `NVIDIA_API_KEY` | Optional — AI assistant |

5. **Deployments** → **Redeploy** the API after env changes.

### Test the API subdomain

In a browser or terminal:

```text
https://api.mediflow.zayacodehub.in/api/health
```

Expected: JSON like `{"ok":true,"database":"supabase"}` — **not** HTML.

```text
https://api.mediflow.zayacodehub.in/api/doctor/public
```

Expected: JSON array of doctors.

---

## 3. Vercel — frontend project (custom site)

1. **Settings** → **Domains** → `mediflow.zayacodehub.in` (and `www` if you use it).
2. **Settings** → **Environment Variables** → **Production**:

| Variable | Value |
|----------|--------|
| `VITE_API_URL` | `https://api.mediflow.zayacodehub.in` (no trailing slash) |
| `VITE_SUPABASE_URL` | Your Supabase URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key |

3. **Deployments** → **Redeploy** frontend (required — Vite bakes `VITE_*` at build time).

The app uses `frontend/src/utils/apiBase.js`: on custom domains it calls `VITE_API_URL` when set, otherwise `https://medi-flow-api.vercel.app`.

---

## 4. Do not rely on `/api` on the website domain alone

`frontend/vercel.json` can proxy `/api/*` to the API host, but on some custom-domain setups **POST** requests return **405** or the SPA HTML. The supported approach is:

- Set **`VITE_API_URL`** to your API subdomain (step 3).
- Keep **`FRONTEND01`** / **`CORS_ORIGIN_SUFFIX`** on the backend (step 2).

Then login, Find a Doctor, and the floating AI assistant call the API host directly with CORS allowed.

---

## 5. Quick verification after deploy

1. Open [https://mediflow.zayacodehub.in](https://mediflow.zayacodehub.in) → hard refresh (`Ctrl+Shift+R`).
2. DevTools → **Network** → try **Login** or open the chatbot.
3. Requests should go to `https://api.mediflow.zayacodehub.in/api/...` (or your `VITE_API_URL`) with status **200**.

If you see CORS errors, set `FRONTEND01=https://mediflow.zayacodehub.in` on the API project and redeploy the API.

---

## 6. Local development

`frontend/.env`:

```env
VITE_API_URL=http://localhost:5000
```

Run `npm start` in `BACKEND`. CORS already allows `localhost:5173`.

---

## Summary checklist

- [ ] DNS: `mediflow` → frontend Vercel project  
- [ ] DNS: `api.mediflow` → backend Vercel project  
- [ ] Backend domain valid in Vercel + env vars + redeploy  
- [ ] Frontend `VITE_API_URL` = API subdomain + redeploy  
- [ ] `/api/health` on API host returns JSON  
- [ ] Login works on `mediflow.zayacodehub.in`

Built by **ZAYA CODE HUB** — [zayacodehub.in](https://zayacodehub.in)
