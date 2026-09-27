const mongoose = require("mongoose");
const { getSupabase, useSupabase } = require("./supabase");

async function connectDatabase() {
  if (useSupabase()) {
    const supabase = getSupabase();
    const { error } = await supabase.from("users").select("id").limit(1);
    if (error) {
      if (error.code === "PGRST205" || error.message?.includes("schema cache")) {
        throw new Error(
          "Supabase tables are missing. Run: npm run supabase:migrate (set DATABASE_URL in .env first), or paste supabase/migrations/001_hcms_schema.sql into the Supabase SQL Editor."
        );
      }
      throw error;
    }
    console.log("Connected to Supabase");
    return;
  }

  if (!process.env.MONGO_URI) {
    throw new Error(
      "Set SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY or MONGO_URI in .env"
    );
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");
}

module.exports = { connectDatabase };
