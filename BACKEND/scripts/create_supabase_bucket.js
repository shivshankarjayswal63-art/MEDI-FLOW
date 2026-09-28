const { createClient } = require('@supabase/supabase-js');

async function main() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_REPORTS_BUCKET || 'medical-reports';

  if (!url || !key) {
    console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in environment.');
    process.exit(1);
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } });

  try {
    const { data: existing } = await supabase.storage.listBuckets();
    if (existing && existing.find((b) => b.name === bucket)) {
      console.log('Bucket already exists:', bucket);
      return;
    }
    const { data, error } = await supabase.storage.createBucket(bucket, { public: false });
    if (error) {
      console.error('Failed to create bucket:', error.message || error);
      process.exit(1);
    }
    console.log('Created bucket:', data.name);
  } catch (err) {
    console.error('Error creating bucket:', err.message || err);
    process.exit(1);
  }
}

if (require.main === module) main();
