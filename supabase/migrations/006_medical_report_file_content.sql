-- Store uploaded report bytes for serverless (Vercel) where local disk is not durable
ALTER TABLE medical_reports ADD COLUMN IF NOT EXISTS file_content_base64 TEXT;
