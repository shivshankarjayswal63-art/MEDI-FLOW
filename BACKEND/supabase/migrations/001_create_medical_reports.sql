-- Create medical_reports table for Supabase
CREATE TABLE IF NOT EXISTS public.medical_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_type text,
  report_summary text,
  ai_tags text[],
  patient_notes text,
  file_content_base64 text,
  uploaded_at timestamptz DEFAULT now()
);

-- Index for user_id
CREATE INDEX IF NOT EXISTS idx_medical_reports_user_id ON public.medical_reports (user_id);
