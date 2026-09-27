-- Doctor verification: platform admin must approve before patients can see/book doctors
ALTER TABLE doctors
  ADD COLUMN IF NOT EXISTS approval_status TEXT NOT NULL DEFAULT 'approved'
    CHECK (approval_status IN ('pending', 'approved', 'rejected'));

ALTER TABLE doctors
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

ALTER TABLE doctors
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

ALTER TABLE doctors
  ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES users(id) ON DELETE SET NULL;

-- Existing rows stay visible (default approved). New self-registrations set pending in API.
