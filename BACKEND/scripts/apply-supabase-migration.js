/**
 * Applies supabase/migrations/001_hcms_schema.sql using DATABASE_URL.
 * Get DATABASE_URL from Supabase Dashboard → Project Settings → Database → URI (Session mode).
 */
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error(
      "Missing DATABASE_URL in BACKEND/.env.\n" +
        "Supabase → Settings → Database → Connection string (URI).\n" +
        "Or run the SQL file manually in Supabase → SQL Editor:\n" +
        "  supabase/migrations/001_hcms_schema.sql"
    );
    process.exit(1);
  }

  const migrationsDir = path.join(__dirname, "..", "..", "supabase", "migrations");
  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  const client = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  try {
    for (const file of files) {
      const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
      await client.query(sql);
      console.log(`Applied ${file}`);
    }
    console.log("Supabase schema applied successfully.");
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error("Migration failed:", err.message);
  process.exit(1);
});
