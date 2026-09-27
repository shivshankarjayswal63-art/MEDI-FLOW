# MEDI FLOW — portal logins

All staff accounts use **`/login`**. Doctors use **`/login-doctor`** only.

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

### Dashboard paths

- Patient → `/patient-dashboard`
- Platform admin → `/User-Dashboard`
- Pharmacy → `/Pharmacy-Dashboard`
- Appointments → `/Appointment-Dashboard`
- Doctor → `/Doctor-Dashboard`
