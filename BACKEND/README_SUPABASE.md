Supabase setup for MEDI-FLOW backend

1) Create a Supabase project
- Go to https://app.supabase.com and create a project.

2) Set environment variables
- Add the following to your env (see `.env.example`):
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY` (service role key required for server-side storage operations)
  - `SUPABASE_REPORTS_BUCKET` (optional, defaults to `medical-reports`)

3) Run SQL migration
- Use Supabase SQL editor or `psql` to run the migration in `supabase/migrations/001_create_medical_reports.sql`.

4) Create storage bucket
- Locally: run `node scripts/create_supabase_bucket.js` (with env vars set)
- Or create a bucket via Supabase dashboard named `medical-reports` (or your chosen bucket name).

5) Notes
- Backend expects `SUPABASE_SERVICE_ROLE_KEY` to be set when using Supabase.
- Files are uploaded to storage and `file_path` saved as `storage://<bucket>/<objectPath>`.
- Download endpoint will fetch from storage when `file_path` uses `storage://`.

6) Optional: Make bucket public or generate signed URLs for frontend access
- Current code keeps bucket private; the backend serves files via `downloadReport` endpoint which streams data.
- To allow direct public access, make the bucket public in the Supabase dashboard, or change code to return signed URLs (`supabase.storage.from(bucket).createSignedUrl`).
