-- MEDI FLOW demo data snapshot
-- Prefer: cd BACKEND && npm run db:seed (generates bcrypt hashes and full dataset)
-- This file documents demo accounts; run 002_roles_and_notifications.sql before seeding.

-- Demo passwords (when using npm run db:seed):
--   Admin@123  — useradmin@gmail.com, pharmacyadmin@gmail.com, appointmentadmin@gmail.com, doctoradmin@gmail.com
--   Patient@123 — patient1@demo.com through patient5@demo.com

SELECT 'Use npm run db:seed in BACKEND folder for idempotent demo data' AS instruction;
