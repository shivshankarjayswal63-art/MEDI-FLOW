-- HCMS / MEDI FLOW schema for Supabase (PostgreSQL)
-- Run via: npm run supabase:migrate (requires DATABASE_URL in BACKEND/.env)

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  mobile TEXT,
  reg_date TIMESTAMPTZ DEFAULT NOW(),
  blood_group TEXT DEFAULT 'Not Specified',
  country TEXT,
  city TEXT,
  gender TEXT DEFAULT 'Not Specified',
  date_of_birth TIMESTAMPTZ,
  reset_password_token TEXT,
  reset_password_expires TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  phone TEXT NOT NULL,
  specialization TEXT NOT NULL,
  qualifications TEXT[] NOT NULL DEFAULT '{}',
  experience INTEGER NOT NULL,
  address TEXT NOT NULL,
  availability TEXT NOT NULL,
  gender TEXT NOT NULL,
  date_of_birth TIMESTAMPTZ NOT NULL,
  reg_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  indexno TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  nic TEXT,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  doctor_name TEXT NOT NULL,
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  specialization TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  time TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'Pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rejected_appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  indexno TEXT NOT NULL,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  nic TEXT,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  doctor_name TEXT NOT NULL,
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  specialization TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  time TEXT NOT NULL,
  patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'Rejected',
  rejection_reason TEXT NOT NULL,
  rejected_at TIMESTAMPTZ DEFAULT NOW(),
  original_appointment_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS stock (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  company TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  expire_date TIMESTAMPTZ NOT NULL,
  batch_no TEXT NOT NULL UNIQUE,
  pack_size INTEGER NOT NULL,
  location TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES users(id) ON DELETE SET NULL,
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  medicine JSONB NOT NULL DEFAULT '[]',
  date_issued TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  is_voided BOOLEAN DEFAULT FALSE,
  void_reason TEXT,
  corrected_by UUID REFERENCES prescriptions(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS diagnoses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES users(id) ON DELETE SET NULL,
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  symptoms TEXT[] DEFAULT '{}',
  assumed_illness TEXT,
  diagnosis_description TEXT,
  status TEXT DEFAULT 'Pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS doctor_leaves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  leave_type TEXT,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  reason TEXT,
  status TEXT DEFAULT 'Plan',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  symptoms TEXT[] DEFAULT '{}',
  prediction TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  bp NUMERIC,
  pulse NUMERIC,
  sugar NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS medical_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_doctor_id ON prescriptions(doctor_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient_id ON prescriptions(patient_id);
