const { getSupabase } = require("../config/supabase");
const { useSupabase } = require("../lib/supabaseModel");
const User = require("../Models/UserModel");

exports.globalSearch = async (req, res) => {
  const q = (req.query.q || "").trim();
  if (!q || q.length < 2) {
    return res.json({ patients: [], appointments: [] });
  }
  try {
    if (useSupabase()) {
      const supabase = getSupabase();
      const { data: patients } = await supabase
        .from("users")
        .select("id, name, email, mobile, role")
        .or(`name.ilike.%${q}%,email.ilike.%${q}%`)
        .limit(10);
      const { data: appointments } = await supabase
        .from("appointments")
        .select("id, indexno, name, email, status, doctor_name, date")
        .or(`indexno.ilike.%${q}%,name.ilike.%${q}%,email.ilike.%${q}%`)
        .limit(10);
      return res.json({
        patients: (patients || []).map((p) => ({
          _id: p.id,
          name: p.name,
          email: p.email,
          mobile: p.mobile,
          role: p.role,
        })),
        appointments: (appointments || []).map((a) => ({
          _id: a.id,
          indexno: a.indexno,
          name: a.name,
          email: a.email,
          status: a.status,
          doctorName: a.doctor_name,
          date: a.date,
        })),
      });
    }
    const users = await User.find();
    const patients = users
      .filter(
        (u) =>
          (u.name && u.name.toLowerCase().includes(q.toLowerCase())) ||
          (u.email && u.email.toLowerCase().includes(q.toLowerCase()))
      )
      .slice(0, 10);
    res.json({ patients, appointments: [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};
