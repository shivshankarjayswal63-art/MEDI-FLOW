/**
 * Upsert platform user admin in public.users (MEDI FLOW login — not Supabase Auth).
 * Usage:
 *   PLATFORM_ADMIN_EMAIL=zayacodehub@gmail.com PLATFORM_ADMIN_PASSWORD='your-password' npm run admin:ensure
 */
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const bcrypt = require("bcryptjs");
const { getSupabase } = require("../config/supabase");

const EMAIL = (process.env.PLATFORM_ADMIN_EMAIL || "zayacodehub@gmail.com").toLowerCase();
const PASSWORD = process.env.PLATFORM_ADMIN_PASSWORD;
const NAME = process.env.PLATFORM_ADMIN_NAME || "Platform Admin";

function roleColumnMissing(err) {
  const msg = String(err?.message || err || "");
  return (
    msg.includes("role") &&
    (msg.includes("does not exist") ||
      msg.includes("PGRST204") ||
      msg.includes("Could not find the 'role' column"))
  );
}

async function main() {
  if (!PASSWORD) {
    console.error("Set PLATFORM_ADMIN_PASSWORD in BACKEND/.env (do not commit passwords).");
    process.exit(1);
  }

  const supabase = getSupabase();
  const passwordHash = await bcrypt.hash(PASSWORD, 10);

  let existing = null;
  {
    const { data, error } = await supabase.from("users").select("id, email").eq("email", EMAIL).maybeSingle();
    if (error) {
      console.error("Lookup failed:", error.message);
      process.exit(1);
    }
    existing = data;
  }

  const baseUpdate = {
    name: NAME,
    password: passwordHash,
    updated_at: new Date().toISOString(),
  };

  if (existing) {
    let { error } = await supabase
      .from("users")
      .update({ ...baseUpdate, role: "user_admin" })
      .eq("id", existing.id);

    if (error && roleColumnMissing(error)) {
      ({ error } = await supabase.from("users").update(baseUpdate).eq("id", existing.id));
      console.warn("users.role column missing — role comes from email map at login. Run 002_roles_and_notifications.sql.");
    }

    if (error) {
      console.error("Update failed:", error.message);
      process.exit(1);
    }
    console.log(`Updated admin login: ${EMAIL} (id ${existing.id})`);
    return;
  }

  const baseInsert = {
    name: NAME,
    email: EMAIL,
    password: passwordHash,
    mobile: "0700000000",
    country: "Tamil Nadu",
    city: "Colombo",
    gender: "Not Specified",
    blood_group: "O+",
  };

  let { data: inserted, error: insertErr } = await supabase
    .from("users")
    .insert({ ...baseInsert, role: "user_admin" })
    .select("id")
    .single();

  if (insertErr && roleColumnMissing(insertErr)) {
    console.warn("users.role column missing — run 002_roles_and_notifications.sql when you can.");
    ({ data: inserted, error: insertErr } = await supabase
      .from("users")
      .insert(baseInsert)
      .select("id")
      .single());
  }

  if (insertErr) {
    console.error("Insert failed:", insertErr.message);
    process.exit(1);
  }
  console.log(`Created admin login: ${EMAIL} (id ${inserted.id})`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
