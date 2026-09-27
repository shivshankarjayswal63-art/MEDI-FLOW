# MEDI FLOW — Demo guide

## 1. Database setup

1. Run migrations in Supabase SQL Editor (or `npm run supabase:migrate` with `DATABASE_URL` in `BACKEND/.env`):
   - `supabase/migrations/001_hcms_schema.sql`
   - `supabase/migrations/002_roles_and_notifications.sql`
2. Seed demo data:

```bash
cd BACKEND
npm run db:seed
```

## 2. Start servers

```bash
# Terminal 1
cd BACKEND && npm start

# Terminal 2
cd frontend && npm run start
```

Open http://localhost:5173/

Optional AI chatbot:

```bash
cd BACKEND/ai-model
pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8000
```

## 3. Demo accounts

| Role | Login page | Email | Password |
|------|------------|-------|----------|
| User admin | `/login` | useradmin@gmail.com | Admin@123 |
| Pharmacy admin | `/login` | pharmacyadmin@gmail.com | Admin@123 |
| Appointment admin | `/login` | appointmentadmin@gmail.com | Admin@123 |
| Patient | `/login` | patient1@demo.com … patient5@demo.com | Patient@123 |

### Full patient demo (use **patient1@demo.com**)

After `npm run db:seed`, this account includes:

| Feature | What you’ll see |
|---------|-----------------|
| Dashboard | Multiple appointments (`P1-*` and `DEMO-*`) |
| Health trends | 12 vitals readings (charts) |
| Analysis history | 10 AI symptom analyses |
| Online results | 5 lab report entries |
| Book / consultations | Works with seeded doctors |

Password: **Patient@123**
| Doctor | `/login-doctor` | doctoradmin@gmail.com | Admin@123 |

## 4. Quick test checklist

- [ ] Login each admin → dashboard shows non-zero stats
- [ ] Find Doctor → list loads, Book links work
- [ ] Patient login → `/patient-dashboard`
- [ ] Pharmacy stock page shows seeded medicines
- [ ] Appointment dashboard shows DEMO appointments
- [ ] Online Results (patient) shows seeded reports
