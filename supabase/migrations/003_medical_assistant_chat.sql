-- Medical assistant chat persistence (per patient)
CREATE TABLE IF NOT EXISTS medical_assistant_threads (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  booking_state JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS medical_assistant_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  meta JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_medical_assistant_messages_user_created
  ON medical_assistant_messages (user_id, created_at);
