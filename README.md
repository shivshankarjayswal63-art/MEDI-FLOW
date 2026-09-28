# MEDI FLOW — Smart Healthcare Management System

**Live website:** [https://mediflow.zayacodehub.in/](https://mediflow.zayacodehub.in/)

MEDI FLOW is a full-stack healthcare platform: separate **role-based portals** for patients, doctors, pharmacy staff, appointment staff, and platform admins. It includes **AI symptom screening**, an **in-app medical assistant** (chat + appointment booking), **doctor verification**, vitals, lab reports, and operational dashboards.

**Repository:** [github.com/shivshankarjayswal63-art/MEDI-FLOW](https://github.com/shivshankarjayswal63-art/MEDI-FLOW)

| Environment | URL |
|-------------|-----|
| **Production app** | [https://mediflow.zayacodehub.in/](https://mediflow.zayacodehub.in/) |
| **API (direct)** | `https://medi-flow-api.vercel.app` |
| **API (via app)** | `https://mediflow.zayacodehub.in/api/*` (proxied on Vercel) |

---

## Table of contents

1. [How the system works](#how-the-system-works)
2. [Portals, roles & demo logins](#portals-roles--demo-logins)
3. [Feature guide by role](#feature-guide-by-role)
4. [Key workflows](#key-workflows)
5. [AI & medical assistant](#ai--medical-assistant)
6. [Doctor verification](#doctor-verification)
7. [Database & migrations](#database--migrations)
8. [Tech stack](#tech-stack)
9. [Local development](#local-development)
10. [Deployment & custom domain](#deployment--custom-domain)
11. [Symptom ML model (optional)](#symptom-ml-model-optional)
12. [Project structure](#project-structure)

---

## How the system works

```mermaid
flowchart LR
  subgraph browser [Browser]
    UI[React SPA on mediflow.zayacodehub.in]
  end
  subgraph vercel [Vercel]
    FE[Frontend static + /api proxy]
    API[Express API medi-flow-api]
  end
  subgraph data [Data]
    SB[(Supabase PostgreSQL)]
  end
  UI --> FE
  FE -->|/api/* rewrite| API
  UI -->|optional VITE_API_URL| API
  API --> SB
```

1. **Frontend** (Vite + React) is hosted on Vercel at your custom domain. Most API calls go to **`/api/...` on the same domain**, which Vercel forwards to the backend (avoids CORS issues for the floating health chat).
2. **Backend** (Node.js + Express) runs as a separate Vercel project (`BACKEND/`). It uses **JWT** auth and **Supabase** (PostgreSQL) via the service role key—not Supabase Auth for portal login.
3. **Roles** are stored on `users.role` and enforced in the UI (`RoleGuard`) and on APIs (`requireRole`, dashboard portal checks). Staff demo emails are also mapped in code so the correct portal wins even if the DB role is stale.
4. **Doctors** live in the `doctors` table and sign in only at **`/login-doctor`**. New self-registrations stay **pending** until a **platform admin** approves them.

---

## Portals, roles & demo logins

**Prerequisite:** `cd BACKEND && npm run db:seed` (same Supabase project as production API).

### Patients & staff → [https://mediflow.zayacodehub.in/login](https://mediflow.zayacodehub.in/login)

| Portal | Dashboard | Email | Password |
|--------|-----------|-------|----------|
| **Patient** | `/patient-dashboard` | `patient1@demo.com` | `Patient@123` |
| Patient | `/patient-dashboard` | `patient2@demo.com` | `Patient@123` |
| Patient | `/patient-dashboard` | `patient3@demo.com` | `Patient@123` |
| Patient | `/patient-dashboard` | `patient4@demo.com` | `Patient@123` |
| Patient | `/patient-dashboard` | `patient5@demo.com` | `Patient@123` |
| **Platform admin** | `/User-Dashboard` | `useradmin@gmail.com` | `Admin@123` |
| **Pharmacy admin** | `/Pharmacy-Dashboard` | `pharmacyadmin@gmail.com` | `Admin@123` |
| **Appointment admin** | `/Appointment-Dashboard` | `appointmentadmin@gmail.com` | `Admin@123` |

### Doctors → [https://mediflow.zayacodehub.in/login-doctor](https://mediflow.zayacodehub.in/login-doctor) only

| Portal | Dashboard | Email | Password |
|--------|-----------|-------|----------|
| **Doctor (admin demo)** | `/Doctor-Dashboard` | `doctoradmin@gmail.com` | `Admin@123` |
| Doctor (cardiology) | `/Doctor-Dashboard` | `dr.cardio@demo.com` | `Admin@123` |
| Doctor (general practice) | `/Doctor-Dashboard` | `dr.gp@demo.com` | `Admin@123` |
| Doctor (pediatrics) | `/Doctor-Dashboard` | `dr.peds@demo.com` | `Admin@123` |
| Doctor (dermatology) | `/Doctor-Dashboard` | `dr.derm@demo.com` | `Admin@123` |

> **Demo only** — change passwords in production. Do not commit real secrets.

### Login rules

| Account type | Must use |
|--------------|----------|
| Patient, platform admin, pharmacy admin, appointment admin | **`/login`** only |
| Doctor (and approved doctor registrations) | **`/login-doctor`** only |

- Doctor emails **cannot** use `/login` (API returns a message to use doctor login).
- Staff emails **cannot** use `/login-doctor`.
- Wrong portal or wrong role → redirect to the correct dashboard or a clear error.

### Custom platform admin

```bash
cd BACKEND
# In .env (never commit):
# PLATFORM_ADMIN_EMAIL=your@gmail.com
# PLATFORM_ADMIN_PASSWORD=YourSecurePassword
npm run admin:ensure
```

Then sign in at **`/login`** → **`/User-Dashboard`**.

`zayacodehub@gmail.com` is treated as platform admin when that user exists (via `admin:ensure` or email map).

### Quick links on production

| Page | URL |
|------|-----|
| Home | [https://mediflow.zayacodehub.in/](https://mediflow.zayacodehub.in/) |
| Patient login | [https://mediflow.zayacodehub.in/login](https://mediflow.zayacodehub.in/login) |
| Doctor login | [https://mediflow.zayacodehub.in/login-doctor](https://mediflow.zayacodehub.in/login-doctor) |
| Register (patient) | `/registration` |
| Register (doctor) | `/register-doctor` |
| Find a doctor | `/Find-Doctor` |

---

## Feature guide by role

### Patient (`patient`)

- **Dashboard** — appointments, vitals trend, recent analyses, lab reports, prescriptions, notifications.
- **Medical assistant** (`/medical-assistant`) — conversational help, remembers chat (DB + browser), **in-app booking** (doctor → date → time → visit mode → confirm).
- **Floating AI Health Assistant** — on most public pages; same backend chat API; chips for quick prompts.
- **Symptom analysis** — structured symptom flow + history (`/symptom-analysis`, `/analysis-history`).
- **Vitals** — log BP, pulse, sugar (`/enter-vitals`, `/health-trends`).
- **Online results** — upload medical reports (PDF/images); AI can use summaries for doctor matching.
- **Find a doctor** — only **admin-approved** doctors.
- **Book appointment** — `/Book-Appointment` (approved doctors only).
- **Profile** — `/User-Account` (patient-only).

### Platform admin (`user_admin`)

- **User Administration Dashboard** — patient counts, appointments today, **pending doctor approvals**.
- **Registered patients** — `/User-Management`.
- **Add patients** — `/Add-New-Patient`.
- **Doctor verification** — `/Doctor-Approvals` (approve / reject / revoke).

### Pharmacy admin (`pharmacy_admin`)

- Pharmacy dashboard, stock analytics, orders, stock adding, recent prescriptions.

### Appointment admin (`appointment_admin`)

- Appointment dashboard, booking management, rejected appointments.

### Doctor (`doctor`)

- Doctor dashboard, view appointments, leave management, diagnosis & prescriptions (approved doctors only can sign in).

---

## Key workflows

### 1. Patient registration & login

1. `/registration` → creates `users` row with `role: patient`.
2. `/login` → JWT + redirect to `/patient-dashboard`.

### 2. Medical assistant & booking (patient)

1. Open **Medical assistant** from the patient menu or send **“Book appointment”** from the floating chat.
2. Assistant suggests **approved** doctors (optionally personalized from vitals/reports).
3. Wizard: doctor → date → time → in-person / video → confirm.
4. `POST /api/medical-assistant/book` creates appointment (patient JWT required).

### 3. Doctor self-registration & approval

1. Doctor fills **`/register-doctor`** → status **`pending`**, no login until approved.
2. Platform admin opens **`/Doctor-Approvals`** → **Approve** or **Reject** (with reason).
3. **Approved** → doctor can use **`/login-doctor`** and appears in `/api/doctor/public`, booking, and assistant.
4. **Rejected** → login blocked with rejection message.

### 4. Symptom AI (novelty)

1. Patient uses **Symptom analysis** with symptom list.
2. Backend may use trained sklearn model (`/api/novelty/analyze`) when the Python stack is available; otherwise screening/FAQ paths still respond.

### 5. Staff / doctor login separation

- Frontend: `RoleGuard` on every portal route; `setAuthSession` clears cross-portal state.
- Backend: `attachUserFromJwt` resolves role from JWT + staff email map on every protected request.

---

## How our AI works

MEDI FLOW uses **several AI layers**. They are independent—you can use one without the others.

### 1. Medical assistant (main product AI)

**Where:** Patient menu → **Medical assistant** (`/medical-assistant`), plus the **floating AI Health Assistant** on public pages.

**API:** `POST /api/medical-assistant/chat` · `POST /api/medical-assistant/book` · `GET /api/medical-assistant/session`

**Pipeline** (`BACKEND/lib/medicalAssistant.js`):

1. **Intent routing** — Greetings, off-topic guard, “summarize my health history”, and **appointment booking** are handled by dedicated logic (`appointmentAssistant.js`) before any LLM call.
2. **Symptom extraction** — Free text is normalized (synonyms like “SOB” → shortness of breath) and passed to **`symptomAnalyzer.js`** (rule-based screening with urgency flags and condition rankings).
3. **Patient context** (when logged in as patient) — Vitals, past analyses, allergies, and uploaded report summaries from Supabase (`patientHealthContext.js`, migration `004`) are added to the prompt so answers and doctor suggestions are personalized.
4. **NVIDIA Nemotron** (optional) — If `NVIDIA_API_KEY` is set on the **backend**, the assistant calls Nemotron via NVIDIA’s API with symptom/context JSON. On Vercel, a **~7s timeout** applies; if the LLM is slow or unavailable, the system **falls back automatically**.
5. **Rules fallback** — Curated condition blurbs, screening results, and FAQ-style replies always work **without** any API key.
6. **In-app booking** — Detects booking intent → wizard (approved doctors only) → `POST /api/medical-assistant/book` creates a real appointment in PostgreSQL.

Guests can chat for general health info; **booking, consultation requests, and full health summaries require patient login**.

### 2. Symptom analysis page (Novelty / ML)

**Where:** `/symptom-analysis`, `/analysis-history`

**API:** `POST /api/novelty/analyze`, `POST /api/analysis/save`

Uses the **Python sklearn** stack in `BACKEND/ai-model/` (Random Forest on Kaggle-style symptom data, ~43 disease classes). Training is **local or separate host**—not on Vercel serverless. If the Python service is not running, the medical assistant rules engine still answers symptom questions.

### 3. Report upload insights

When patients upload labs/imaging metadata (migration `004`), the backend can store **AI tags / report summaries** used by the medical assistant and **doctor recommendation** logic (`doctorRecommendation.js`, `reportInsights.js`).

### Environment (operators)

| Variable | Purpose |
|----------|---------|
| `NVIDIA_API_KEY` | Nemotron for medical assistant (backend only) |
| `NVIDIA_NEMOTRON_MODEL` | Optional model id (default Nemotron 3 Ultra) |
| `AI_API_URL` | Optional external URL for Python symptom ML service |

### Quick reference

| Component | Behavior |
|-----------|----------|
| **Chat** | Optional JWT — richer context when patient is signed in |
| **Session** | Server-side chat history when migration `003` is applied |
| **Book** | Patient role only; approved doctors only |
| **Floating widget** | Same chat API via `/api/...` on the live site |

---

## Doctor verification

| Status | Patient visibility | Doctor login |
|--------|-------------------|--------------|
| `pending` | Hidden | Blocked |
| `approved` | Visible | Allowed |
| `rejected` | Hidden | Blocked (reason shown) |

**SQL:** run `supabase/migrations/005_doctor_approval.sql` in the Supabase SQL editor.

Demo seed doctors are inserted with `approval_status: approved`.

---

## Database & migrations

Run in order in **Supabase → SQL**:

| File | Purpose |
|------|---------|
| `001_hcms_schema.sql` | Core tables (users, doctors, appointments, …) |
| `002_roles_and_notifications.sql` | `users.role`, notifications |
| `003_medical_assistant_chat.sql` | Server-side chat history |
| `004_patient_health_profile.sql` | Allergies, report AI fields |
| `005_doctor_approval.sql` | Doctor `approval_status`, reject reason |

Seed demo users, doctors, appointments:

```bash
cd BACKEND
npm run db:seed
```

Fix staff roles in DB if needed: `npm run fix:staff-roles`

---

## Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, React Router, MUI, Tailwind |
| Backend | Node.js, Express |
| Database | **Supabase (PostgreSQL)** — all users, doctors, appointments, vitals, reports, chat |
| Auth | JWT (custom login via `/api/auth/login` and `/api/auth/login-doctor`) |
| Hosting | Vercel (frontend + API projects) |
| AI | Nemotron + rules (assistant), optional Python sklearn (`BACKEND/ai-model/`) for symptom page |

**Not used in this project:** MongoDB, Mongoose, Firebase Auth/Firestore for portal login. Older docs or forks may mention them; the live app reads/writes **only Supabase** through `BACKEND/lib/supabaseModel.js`.

---

## Local development

### Prerequisites

- Node.js 18+
- Supabase project + keys in `BACKEND/.env` and `frontend/.env`

### Backend

```bash
cd BACKEND
npm install
cp .env.example .env   # fill SUPABASE_*, JWT_SECRET, FRONTEND01=http://localhost:5173
npm start              # http://localhost:5000
```

### Frontend

```bash
cd frontend
npm install
# .env: VITE_API_URL=http://localhost:5000  (or omit — Vite proxies /api to :5000)
npm run dev            # http://localhost:5173
```

### Demo logins locally

Same emails/passwords as [Portals, roles & demo logins](#portals-roles--demo-logins) after `npm run db:seed`.

---

## Deployment & custom domain

Detailed steps: **[docs/SUBDOMAIN_AND_BACKEND.md](./docs/SUBDOMAIN_AND_BACKEND.md)**, **[BACKEND/DEPLOY.md](./BACKEND/DEPLOY.md)**, **[VERCEL.md](./VERCEL.md)**.

**Production checklist for [mediflow.zayacodehub.in](https://mediflow.zayacodehub.in/):**

| Step | Action |
|------|--------|
| Frontend Vercel | Root = `frontend`; domain = `mediflow.zayacodehub.in` |
| API Vercel | Root = `BACKEND`; domain = `api.mediflow.zayacodehub.in` (optional but recommended) |
| API env | `SUPABASE_*`, `JWT_SECRET`, `FRONTEND01=https://mediflow.zayacodehub.in`, `CORS_ORIGIN_SUFFIX=zayacodehub.in` |
| Frontend env | `VITE_API_URL=https://api.mediflow.zayacodehub.in` (or `https://medi-flow-api.vercel.app`) → **Redeploy frontend** |
| Health check | `https://api.mediflow.zayacodehub.in/api/health` → JSON (not HTML) |

Shorter login reference: **[PORTAL_LOGINS.md](./PORTAL_LOGINS.md)**

---

## Symptom ML model (optional)

Trained on Kaggle-style symptom data in `BACKEND/ai-model/datasets/`.

```bash
cd BACKEND/ai-model
pip install -r requirements.txt
python train_model.py
```

| Model | Algorithm | Notes |
|-------|-----------|--------|
| Disease prediction | Random Forest | 43 conditions from 134 symptoms |
| Heart risk | Random Forest | Cardiovascular risk |

API examples (when AI service is wired):

- `POST /api/novelty/analyze`
- `GET /api/model/status`

On Vercel serverless, long-running Python is not on the same host; use a separate AI host via `AI_API_URL` or rely on the medical assistant screening engine.

---

## Project structure

```
MEDI-FLOW/
├── frontend/                 # React SPA (Vercel root: frontend)
│   ├── src/Components/     # Patient, Doctor, Pharmacy, Appointment, User Admin, Novelty
│   └── vercel.json           # SPA + /api proxy to medi-flow-api
├── BACKEND/                  # Express API (Vercel root: BACKEND)
│   ├── Controllers/
│   ├── Routes/
│   ├── lib/                  # roles, doctorApproval, appointmentAssistant, …
│   └── ai-model/             # Optional Python ML
├── supabase/migrations/      # SQL migrations 001–005
├── README.md                 # This file
├── PORTAL_LOGINS.md
├── BACKEND/DEPLOY.md
└── VERCEL.md
```

---

## Design system

| Token | Hex | Use |
|-------|-----|-----|
| Primary blue | `#2b2c6c` | Headers, nav |
| Accent pink | `#e6317d` | CTAs |
| Secondary green | `#2fb297` | Success, assistant |

---

## Contributors

ITPM_Y3S1_WE_91 Group · [Zaya Code Hub](https://zayacodehub.in)

---

## License

All rights reserved — MEDI FLOW.
