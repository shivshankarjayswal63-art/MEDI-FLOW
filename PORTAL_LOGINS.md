# MEDI FLOW — portal logins

**Live site:** [https://mediflow.zayacodehub.in/](https://mediflow.zayacodehub.in/)

All staff and patients use **`/login`**. Doctors use **`/login-doctor`** only.

After **`npm run db:seed`** in `BACKEND` (with Supabase configured):

## `/login` — patients & staff

| Portal | Email | Password |
|--------|-------|----------|
| Patient | `patient1@demo.com` | `Patient@123` |
| Patient | `patient2@demo.com` | `Patient@123` |
| Patient | `patient3@demo.com` | `Patient@123` |
| Patient | `patient4@demo.com` | `Patient@123` |
| Patient | `patient5@demo.com` | `Patient@123` |
| Platform admin | `useradmin@gmail.com` | `Admin@123` |
| Pharmacy admin | `pharmacyadmin@gmail.com` | `Admin@123` |
| Appointment admin | `appointmentadmin@gmail.com` | `Admin@123` |

## `/login-doctor` — doctors only

| Doctor | Email | Password |
|--------|-------|----------|
| Dr. Admin Kumar | `doctoradmin@gmail.com` | `Admin@123` |
| Dr. Nimal Cardio | `dr.cardio@demo.com` | `Admin@123` |
| Dr. Sara GP | `dr.gp@demo.com` | `Admin@123` |
| Dr. Priya Peds | `dr.peds@demo.com` | `Admin@123` |
| Dr. Ravi Derm | `dr.derm@demo.com` | `Admin@123` |

### Custom platform admin

```bash
cd BACKEND
# .env: PLATFORM_ADMIN_EMAIL=you@example.com  PLATFORM_ADMIN_PASSWORD=YourPassword
npm run admin:ensure
```

Then sign in at **`/login`** → **`/User-Dashboard`**.

`zayacodehub@gmail.com` is mapped to platform admin when that user exists (via `admin:ensure`).

### Doctor verification (new registrations)

Self-registered doctors are **pending** until a platform admin approves them at **`/Doctor-Approvals`**. Until approved they **cannot sign in** and do **not** appear to patients. Demo seed doctors are pre-approved.

Run `supabase/migrations/005_doctor_approval.sql` in Supabase if you have not already.

### Dashboard paths

- Patient → `/patient-dashboard`
- Platform admin → `/User-Dashboard`
- Pharmacy → `/Pharmacy-Dashboard`
- Appointments → `/Appointment-Dashboard`
- Doctor → `/Doctor-Dashboard`
