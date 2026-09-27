-- Patient health profile + report AI metadata
ALTER TABLE users ADD COLUMN IF NOT EXISTS allergies TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS chronic_conditions TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS health_notes TEXT;

ALTER TABLE medical_reports ADD COLUMN IF NOT EXISTS report_summary TEXT;
ALTER TABLE medical_reports ADD COLUMN IF NOT EXISTS ai_tags TEXT[] DEFAULT '{}';
ALTER TABLE medical_reports ADD COLUMN IF NOT EXISTS patient_notes TEXT;
