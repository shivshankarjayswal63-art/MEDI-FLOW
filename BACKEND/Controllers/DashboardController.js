const { getSupabase } = require("../config/supabase");
const User = require("../Models/UserModel");
const { useSupabase } = require("../lib/supabaseModel");

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

async function patientCount(supabase, table, column, userId) {
  const { count, error } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true })
    .eq(column, userId);
  if (error) {
    console.warn(`patient dashboard count ${table}:`, error.message);
    return 0;
  }
  return count ?? 0;
}

async function patientList(supabase, table, column, userId, orderBy, limit) {
  const { data, error } = await supabase
    .from(table)
    .select("*")
    .eq(column, userId)
    .order(orderBy, { ascending: false })
    .limit(limit);
  if (error) {
    console.warn(`patient dashboard list ${table}:`, error.message);
    return [];
  }
  return data || [];
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

const { canAccessPortal } = require("../lib/roles");

exports.getSummary = async (req, res) => {
  const portal = req.query.portal || "user";
  const role = req.user?.role;

  if (portal !== "patient" && !canAccessPortal(role, portal)) {
    return res.status(403).json({
      message: "You do not have access to this dashboard.",
      portal,
      role: role || null,
    });
  }

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

      if (portal === "patient") {
        const userId = req.user?.id;
        if (!userId) {
          return res.status(401).json({ message: "Unauthorized" });
        }

        const [
          appointments,
          vitalsList,
          analyses,
          reports,
          prescriptions,
          notifications,
          userRow,
          totalAppointments,
          totalVitals,
          totalAnalyses,
          totalReports,
          totalPrescriptions,
          apptStatusRows,
        ] = await Promise.all([
          patientList(supabase, "appointments", "user_id", userId, "date", 50),
          patientList(supabase, "vitals", "user_id", userId, "created_at", 30),
          patientList(supabase, "analyses", "user_id", userId, "created_at", 20),
          patientList(supabase, "medical_reports", "user_id", userId, "uploaded_at", 20),
          patientList(supabase, "prescriptions", "patient_id", userId, "date_issued", 10),
          patientList(supabase, "notifications", "user_id", userId, "created_at", 15),
          supabase
            .from("users")
            .select("name, email, blood_group, city, gender, mobile")
            .eq("id", userId)
            .maybeSingle()
            .then((r) => (r.error ? null : r.data)),
          patientCount(supabase, "appointments", "user_id", userId),
          patientCount(supabase, "vitals", "user_id", userId),
          patientCount(supabase, "analyses", "user_id", userId),
          patientCount(supabase, "medical_reports", "user_id", userId),
          patientCount(supabase, "prescriptions", "patient_id", userId),
          supabase
            .from("appointments")
            .select("status, date")
            .eq("user_id", userId)
            .then((r) => (r.error ? [] : r.data || [])),
        ]);
        const pending = apptStatusRows.filter((a) => a.status === "Pending").length;
        const completed = apptStatusRows.filter((a) => a.status === "Completed").length;
        const upcoming = apptStatusRows.filter(
          (a) => new Date(a.date).getTime() >= Date.now() && a.status !== "Completed"
        ).length;
        const unread = notifications.filter((n) => !n.read).length;
        const latestVitals = vitalsList[0]
          ? {
              bp: vitalsList[0].bp,
              pulse: vitalsList[0].pulse,
              sugar: vitalsList[0].sugar,
              createdAt: vitalsList[0].created_at,
            }
          : null;

        const vitalsTrend = vitalsList
          .slice(0, 12)
          .reverse()
          .map((v) => ({
            date: v.created_at,
            bp: Number(v.bp),
            pulse: Number(v.pulse),
            sugar: Number(v.sugar),
          }));

        const mapAppt = (a) => ({
          _id: a.id,
          id: a.id,
          indexno: a.indexno,
          doctorName: a.doctor_name,
          doctor_name: a.doctor_name,
          specialization: a.specialization,
          date: a.date,
          time: a.time,
          status: a.status,
        });

        const mapAnalysis = (a) => ({
          _id: a.id,
          id: a.id,
          symptoms: a.symptoms,
          prediction: a.prediction,
          createdAt: a.created_at,
        });

        const mapReport = (r) => ({
          _id: r.id,
          id: r.id,
          fileName: r.file_name,
          file_name: r.file_name,
          uploadedAt: r.uploaded_at,
        });

        const mapRx = (p) => ({
          _id: p.id,
          id: p.id,
          medicine: p.medicine,
          notes: p.notes,
          dateIssued: p.date_issued,
        });

        const mapNotif = (n) => ({
          _id: n.id,
          id: n.id,
          title: n.title,
          body: n.body,
          read: n.read,
          createdAt: n.created_at,
        });

        return res.json({
          profile: userRow
            ? {
                name: userRow.name,
                email: userRow.email,
                bloodGroup: userRow.blood_group,
                city: userRow.city,
                gender: userRow.gender,
                mobile: userRow.mobile,
              }
            : {},
          counts: {
            appointments: totalAppointments,
            pendingAppointments: pending,
            upcomingAppointments: upcoming,
            completedAppointments: completed,
            vitals: totalVitals,
            analyses: totalAnalyses,
            labReports: totalReports,
            prescriptions: totalPrescriptions,
            unreadNotifications: unread,
          },
          latestVitals,
          vitalsTrend,
          recentAppointments: appointments.slice(0, 10).map(mapAppt),
          recentAnalyses: analyses.slice(0, 6).map(mapAnalysis),
          recentReports: reports.slice(0, 6).map(mapReport),
          recentPrescriptions: prescriptions.slice(0, 5).map(mapRx),
          recentNotifications: notifications.slice(0, 6).map(mapNotif),
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
