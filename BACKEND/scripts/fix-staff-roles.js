/**
 * Fix demo staff users whose role column is still "patient".
 * Usage: node scripts/fix-staff-roles.js
 */
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { getSupabase } = require("../config/supabase");
const { EMAIL_ROLE_MAP } = require("../lib/roles");

async function main() {
  const supabase = getSupabase();
  for (const [email, role] of Object.entries(EMAIL_ROLE_MAP)) {
    const { error } = await supabase.from("users").update({ role }).eq("email", email);
    if (error && !String(error.message).includes("role")) {
      console.warn(email, error.message);
    } else {
      console.log(`Updated ${email} → ${role}`);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
