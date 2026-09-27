const { getSupabase } = require("../config/supabase");
const User = require("../Models/UserModel");
const { useSupabase } = require("../lib/supabaseModel");

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

async function countTable(table, filterFn) {
  if (useSupabase()) {
    const supabase = getSupabase();
    let q = supabase.from(table).select("*", { count: "exact", head: true });
    if (filterFn) q = filterFn(q);
    const { count, error } = await q;
    if (error) throw error;
    return count ?? 0;
  }
  return 0;
}

exports.getSummary = async (req, res) => {
  const portal = req.query.portal || "user";
  try {
    if (useSupabase()) {
      const supabase = getSupabase();
      const today = startOfToday();

      if (portal === "user") {
        const { count: totalPatients } = await supabase
          .from("users")
          .select("*", { count: "exact", head: true })
          .eq("role", "patient");
        const { count: appointmentsToday } = await supabase
          .from("appointments")
          .select("*", { count: "exact", head: true })
          .gte("date", today);
        const { count: totalDoctors } = await supabase
          .from("doctors")
          .select("*", { count: "exact", head: true });
        return res.json({
          totalPatients: totalPatients ?? 0,
          newPatients: Math.min(totalPatients ?? 0, 5),
          appointmentsToday: appointmentsToday ?? 0,
          criticalCases: 2,
          totalDoctors: totalDoctors ?? 0,
        });
      }

      if (portal === "pharmacy") {
        const { data: items } = await supabase.from("stock").select("*");
        const list = items || [];
        const now = Date.now();
        const in30 = now + 30 * 86400000;
        const lowStockItems = list.filter((i) => i.quantity < 15).length;
        const expiringItems = list.filter((i) => new Date(i.expire_date).getTime() < in30).length;
        const types = new Set(list.map((i) => i.type));
        return res.json({
          totalItems: list.length,
          lowStockItems,
          expiringItems,
          categories: types.size,
          recentStock: list.slice(-5).reverse(),
        });
      }

      if (portal === "appointment") {
        const { data: appts } = await supabase.from("appointments").select("status");
        const list = appts || [];
        const pending = list.filter((a) => a.status === "Pending").length;
        return res.json({
          total: list.length,
          pending,
          accepted: list.filter((a) => a.status === "Accepted").length,
          completed: list.filter((a) => a.status === "Completed").length,
          estimatedWaitMinutes: pending * 12,
        });
      }

      if (portal === "doctor") {
        const { count: todayAppts } = await supabase
          .from("appointments")
          .select("*", { count: "exact", head: true })
          .gte("date", today);
        const { count: pendingDx } = await supabase
          .from("diagnoses")
          .select("*", { count: "exact", head: true })
          .eq("status", "Pending");
        return res.json({
          appointmentsToday: todayAppts ?? 0,
          pendingDiagnoses: pendingDx ?? 0,
        });
      }
    }

    const users = await User.find();
    res.json({
      totalPatients: users.length,
      newPatients: 0,
      appointmentsToday: 0,
      criticalCases: 0,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};
