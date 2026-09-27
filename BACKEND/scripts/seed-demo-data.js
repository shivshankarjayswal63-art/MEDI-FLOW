/**
 * Demo data for MEDI FLOW (Supabase). Run 002_roles_and_notifications.sql first.
 * Usage: npm run db:seed
 */
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const bcrypt = require("bcryptjs");
const { getSupabase } = require("../config/supabase");

const ADMIN_PASS = "Admin@123";
const PATIENT_PASS = "Patient@123";
const DOCTOR_PASS = "Admin@123";

const DEMO_USER_EMAILS = [
  "useradmin@gmail.com",
  "pharmacyadmin@gmail.com",
  "appointmentadmin@gmail.com",
  "patient1@demo.com",
  "patient2@demo.com",
  "patient3@demo.com",
  "patient4@demo.com",
  "patient5@demo.com",
];

const DEMO_DOCTOR_EMAILS = [
  "doctoradmin@gmail.com",
  "dr.cardio@demo.com",
  "dr.gp@demo.com",
  "dr.peds@demo.com",
  "dr.derm@demo.com",
];

async function hash(pw) {
  return bcrypt.hash(pw, 10);
}

async function clearDemo(supabase) {
  const { data: users } = await supabase
    .from("users")
    .select("id")
    .in("email", DEMO_USER_EMAILS);
  const userIds = (users || []).map((u) => u.id);

  if (userIds.length) {
    await supabase.from("notifications").delete().in("user_id", userIds);
    await supabase.from("analyses").delete().in("user_id", userIds);
    await supabase.from("vitals").delete().in("user_id", userIds);
    await supabase.from("medical_reports").delete().in("user_id", userIds);
  }

  await supabase.from("appointments").delete().like("indexno", "DEMO-%");
  await supabase.from("rejected_appointments").delete().like("indexno", "DEMO-%");
  await supabase.from("stock").delete().like("batch_no", "DEMO-%");

  const { data: doctors } = await supabase
    .from("doctors")
    .select("id")
    .in("email", DEMO_DOCTOR_EMAILS);
  const doctorIds = (doctors || []).map((d) => d.id);

  if (doctorIds.length) {
    await supabase.from("prescriptions").delete().in("doctor_id", doctorIds);
    await supabase.from("diagnoses").delete().in("doctor_id", doctorIds);
    await supabase.from("doctor_leaves").delete().in("doctor_id", doctorIds);
  }

  await supabase.from("users").delete().in("email", DEMO_USER_EMAILS);
  await supabase.from("doctors").delete().in("email", DEMO_DOCTOR_EMAILS);
}

async function main() {
  const supabase = getSupabase();
  const adminHash = await hash(ADMIN_PASS);
  const patientHash = await hash(PATIENT_PASS);
  const doctorHash = await hash(DOCTOR_PASS);

  console.log("Clearing previous demo rows...");
  await clearDemo(supabase);

  const users = [
    { name: "User Admin", email: "useradmin@gmail.com", role: "user_admin", password: adminHash, mobile: "0711111111", blood_group: "O+", country: "Sri Lanka", city: "Colombo", gender: "Male" },
    { name: "Pharmacy Admin", email: "pharmacyadmin@gmail.com", role: "pharmacy_admin", password: adminHash, mobile: "0722222222", blood_group: "A+", country: "Sri Lanka", city: "Kandy", gender: "Female" },
    { name: "Appointment Admin", email: "appointmentadmin@gmail.com", role: "appointment_admin", password: adminHash, mobile: "0733333333", blood_group: "B+", country: "Sri Lanka", city: "Galle", gender: "Male" },
    { name: "Alice Perera", email: "patient1@demo.com", role: "patient", password: patientHash, mobile: "0744444444", blood_group: "O+", country: "Sri Lanka", city: "Colombo", gender: "Female", date_of_birth: "1995-03-12" },
    { name: "Bob Silva", email: "patient2@demo.com", role: "patient", password: patientHash, mobile: "0755555555", blood_group: "A+", country: "Sri Lanka", city: "Kandy", gender: "Male", date_of_birth: "1988-07-22" },
    { name: "Chitra Fernando", email: "patient3@demo.com", role: "patient", password: patientHash, mobile: "0766666666", blood_group: "B+", country: "Sri Lanka", city: "Negombo", gender: "Female", date_of_birth: "2001-11-05" },
    { name: "David Jay", email: "patient4@demo.com", role: "patient", password: patientHash, mobile: "0777777777", blood_group: "AB+", country: "Sri Lanka", city: "Matara", gender: "Male", date_of_birth: "1975-01-30" },
    { name: "Elena Dias", email: "patient5@demo.com", role: "patient", password: patientHash, mobile: "0788888888", blood_group: "O-", country: "Sri Lanka", city: "Jaffna", gender: "Female", date_of_birth: "1992-09-18" },
  ];

  let insertedUsers;
  let userRes = await supabase.from("users").insert(users).select();
  if (userRes.error && String(userRes.error.message).includes("role")) {
    console.warn("users.role column missing — run 002_roles_and_notifications.sql. Seeding without role.");
    userRes = await supabase
      .from("users")
      .insert(users.map(({ role, ...u }) => u))
      .select();
  }
  if (userRes.error) throw userRes.error;
  insertedUsers = userRes.data;

  const byEmail = (email) => insertedUsers.find((u) => u.email === email);

  const doctors = [
    { name: "Dr. Admin Kumar", email: "doctoradmin@gmail.com", password: doctorHash, phone: "0112000001", specialization: "General Practice", qualifications: ["MBBS", "MD"], experience: 15, address: "Colombo 03", availability: "Mon-Fri 9-17", gender: "Male", date_of_birth: "1980-04-10" },
    { name: "Dr. Nimal Cardio", email: "dr.cardio@demo.com", password: doctorHash, phone: "0112000002", specialization: "Cardiology", qualifications: ["MBBS", "FRCP"], experience: 12, address: "Colombo 07", availability: "Mon-Thu 8-16", gender: "Male", date_of_birth: "1978-06-15" },
    { name: "Dr. Sara GP", email: "dr.gp@demo.com", password: doctorHash, phone: "0112000003", specialization: "General Practice", qualifications: ["MBBS"], experience: 8, address: "Kandy", availability: "Tue-Sat 10-18", gender: "Female", date_of_birth: "1985-12-01" },
    { name: "Dr. Priya Peds", email: "dr.peds@demo.com", password: doctorHash, phone: "0112000004", specialization: "Pediatrics", qualifications: ["MBBS", "DCH"], experience: 10, address: "Galle", availability: "Mon-Fri 9-15", gender: "Female", date_of_birth: "1983-08-20" },
    { name: "Dr. Ravi Derm", email: "dr.derm@demo.com", password: doctorHash, phone: "0112000005", specialization: "Dermatology", qualifications: ["MBBS", "DVD"], experience: 9, address: "Colombo 05", availability: "Wed-Sun 11-19", gender: "Male", date_of_birth: "1987-02-28" },
  ];

  const { data: insertedDoctors, error: docErr } = await supabase.from("doctors").insert(doctors).select();
  if (docErr) throw docErr;

  const docByEmail = (email) => insertedDoctors.find((d) => d.email === email);
  const p1 = byEmail("patient1@demo.com");
  const p2 = byEmail("patient2@demo.com");
  const dAdmin = docByEmail("doctoradmin@gmail.com");
  const dCardio = docByEmail("dr.cardio@demo.com");

  const patientsOnly = insertedUsers.filter(
    (u) => u.role === "patient" || String(u.email).includes("@demo.com")
  );
  const statuses = ["Pending", "Accepted", "Completed", "Accepted", "Pending"];
  const appointments = [];
  for (let i = 1; i <= 15; i++) {
    const patient = patientsOnly[i % patientsOnly.length];
    const doc = insertedDoctors[i % insertedDoctors.length];
    appointments.push({
      indexno: `DEMO-${String(i).padStart(4, "0")}`,
      name: patient.name,
      address: `${patient.city}, Sri Lanka`,
      phone: patient.mobile,
      email: patient.email,
      doctor_name: doc.name,
      doctor_id: doc.id,
      specialization: doc.specialization,
      date: new Date(Date.now() + i * 86400000).toISOString(),
      time: `${9 + (i % 6)}:00`,
      user_id: patient.id,
      status: statuses[i % statuses.length],
    });
  }
  const { data: appts, error: apptErr } = await supabase.from("appointments").insert(appointments).select();
  if (apptErr) throw apptErr;

  await supabase.from("rejected_appointments").insert([
    {
      indexno: "DEMO-R001",
      name: p2.name,
      address: "Kandy",
      phone: p2.mobile,
      email: p2.email,
      doctor_name: dCardio.name,
      doctor_id: dCardio.id,
      specialization: dCardio.specialization,
      date: new Date().toISOString(),
      time: "14:00",
      patient_id: p2.id,
      rejection_reason: "Doctor on emergency leave",
      original_appointment_id: appts[0].id,
    },
    {
      indexno: "DEMO-R002",
      name: p1.name,
      address: "Colombo",
      phone: p1.mobile,
      email: p1.email,
      doctor_name: dAdmin.name,
      doctor_id: dAdmin.id,
      specialization: dAdmin.specialization,
      date: new Date().toISOString(),
      time: "11:00",
      patient_id: p1.id,
      rejection_reason: "Slot unavailable",
      original_appointment_id: appts[1].id,
    },
  ]);

  const stockTypes = ["Tablet", "Syrup", "Capsule", "Injection"];
  const stock = [];
  for (let i = 1; i <= 20; i++) {
    const days = 30 + i * 15;
    stock.push({
      name: `Demo Medicine ${i}`,
      type: stockTypes[i % stockTypes.length],
      company: "MediPharma",
      quantity: i === 3 ? 5 : 40 + i,
      expire_date: new Date(Date.now() + days * 86400000).toISOString(),
      batch_no: `DEMO-B${String(i).padStart(4, "0")}`,
      pack_size: 10,
      location: `Shelf ${String.fromCharCode(65 + (i % 5))}-${i % 10}`,
    });
  }
  await supabase.from("stock").insert(stock);

  const prescriptions = appts.slice(0, 8).map((a, idx) => ({
    patient_id: a.user_id,
    doctor_id: a.doctor_id,
    appointment_id: a.id,
    medicine: JSON.stringify([
      { medicineName: "Paracetamol", dosage: "500mg", description: "After meals" },
      { medicineName: "Vitamin C", dosage: "1 tab", description: "Morning" },
    ]),
    notes: `Demo prescription ${idx + 1}`,
  }));
  await supabase.from("prescriptions").insert(
    prescriptions.map((p) => ({
      ...p,
      medicine: JSON.parse(p.medicine),
    }))
  );

  const diagnoses = appts.slice(0, 6).map((a, idx) => ({
    appointment_id: a.id,
    patient_id: a.user_id,
    doctor_id: a.doctor_id,
    symptoms: ["fever", "fatigue", "headache"].slice(0, (idx % 3) + 1),
    assumed_illness: "Common Cold",
    diagnosis_description: "Rest and fluids",
    status: idx % 2 === 0 ? "Diagnosed" : "Pending",
  }));
  await supabase.from("diagnoses").insert(diagnoses);

  const vitals = [];
  for (const patient of insertedUsers.filter((u) => u.role === "patient")) {
    for (let v = 0; v < 5; v++) {
      vitals.push({
        user_id: patient.id,
        bp: 115 + v * 2,
        pulse: 70 + v,
        sugar: 90 + v * 3,
        created_at: new Date(Date.now() - v * 7 * 86400000).toISOString(),
      });
    }
  }
  await supabase.from("vitals").insert(vitals);

  await supabase.from("analyses").insert(
    insertedUsers.filter((u) => u.role === "patient").slice(0, 5).map((u, i) => ({
      user_id: u.id,
      symptoms: ["cough", "fever"],
      prediction: i % 2 === 0 ? "Common Cold" : "Allergy",
    }))
  );

  await supabase.from("medical_reports").insert([
    { user_id: p1.id, file_name: "blood-test.pdf", file_path: "uploads/demo-blood-test.pdf", file_type: "application/pdf" },
    { user_id: p1.id, file_name: "xray-chest.pdf", file_path: "uploads/demo-xray.pdf", file_type: "application/pdf" },
    { user_id: p2.id, file_name: "lipid-panel.pdf", file_path: "uploads/demo-lipid.pdf", file_type: "application/pdf" },
  ]);

  const notifs = [];
  for (const u of insertedUsers) {
    notifs.push(
      { user_id: u.id, title: "Welcome to MEDI FLOW", body: "Your demo account is ready.", read: false },
      { user_id: u.id, title: "Appointment reminder", body: "You have upcoming appointments in the demo data.", read: false }
    );
  }
  const notifRes = await supabase.from("notifications").insert(notifs);
  if (notifRes.error) {
    console.warn("Skipping notifications:", notifRes.error.message);
  }

  console.log("Demo seed complete.");
  console.log("Admins: useradmin / pharmacyadmin / appointmentadmin @gmail.com — password:", ADMIN_PASS);
  console.log("Patients: patient1@demo.com … patient5@demo.com — password:", PATIENT_PASS);
  console.log("Doctor login: doctoradmin@gmail.com — password:", DOCTOR_PASS);
}

main().catch((e) => {
  console.error("Seed failed:", e.message);
  if (e.message?.includes("role") || e.code === "PGRST204") {
    console.error("Run supabase/migrations/002_roles_and_notifications.sql in Supabase SQL Editor first.");
  }
  process.exit(1);
});
