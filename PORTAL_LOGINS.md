# MEDI FLOW — portal logins

**Live site:** [https://mediflow.zayacodehub.in/](https://mediflow.zayacodehub.in/)

All staff accounts use **`/login`**. Doctors use **`/login-doctor`** only.

The app enforces this on both **frontend** (role guards + login pages) and **API** (JWT role resolved from email + portal rules). Wrong portal → clear error or redirect to the correct dashboard.

After **`npm run db:seed`** in `BACKEND` (with Supabase configured):

| Portal | Login URL | Email | Password |
|--------|-----------|-------|----------|
| Patient | `/login` | `patient1@demo.com` | `Patient@123` |
| Patient (alt) | `/login` | `patient2@demo.com` … `patient5@demo.com` | `Patient@123` |
| Platform admin | `/login` | `useradmin@gmail.com` | `Admin@123` |
| Pharmacy admin | `/login` | `pharmacyadmin@gmail.com` | `Admin@123` |
| Appointment admin | `/login` | `appointmentadmin@gmail.com` | `Admin@123` |
| Doctor | `/login-doctor` | `doctoradmin@gmail.com` | `Admin@123` |

### Custom platform admin

```bash
cd BACKEND
# .env: PLATFORM_ADMIN_EMAIL=you@example.com  PLATFORM_ADMIN_PASSWORD=YourPassword
npm run admin:ensure
```

Then sign in at **`/login`** → **`/User-Dashboard`**.

`zayacodehub@gmail.com` is mapped to platform admin when that user exists (via `admin:ensure`).

### Doctor verification (new registrations)

Self-registered doctors are **pending** until a platform admin approves them at **`/Doctor-Approvals`** (sidebar: **Doctor verification**). Until approved they **cannot sign in** and do **not** appear to patients. Demo seed doctors are pre-approved.

Run `supabase/migrations/005_doctor_approval.sql` in Supabase if you have not already.

### Dashboard paths

- Patient → `/patient-dashboard`
- Platform admin → `/User-Dashboard`
- Pharmacy → `/Pharmacy-Dashboard`
- Appointments → `/Appointment-Dashboard`
- Doctor → `/Doctor-Dashboard`
