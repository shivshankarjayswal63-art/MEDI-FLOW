const express = require("express");
const cors = require("cors");
require("dotenv").config(); // Load environment variables
const { connectDatabase } = require("./config/database");
const { useSupabase } = require("./config/supabase");

// Import Routes
const userRoutes = require("./Routes/UserRoutes"); // User Management Routes
const authRoutes = require("./Routes/authRoutes"); // Authentication Routes
const appointmentRoute = require("./Routes/AppoinmentRoutes"); // Appointment Route
const rejectedAppointmentRoutes = require("./Routes/RejectAppoinmentRoutes");
const doctorRoute = require("./Routes/DoctorManagement/doctorRoute"); // Doctor Route
const stockRoute = require("./Routes/StockRoutes"); // Stock Route
const forgotPasswordRoute = require("./Routes/ForgotPasswordRoutes"); // Forgot Password Routes
const prescriptionRoute = require("./Routes/DoctorManagement/prescriptionRoute"); // Prescription Route
const doctorLeaveRoutes = require("./Routes/DoctorManagement/doctorLeaveRoutes"); // Doctor Leave Route
const diagnosisRoute = require("./Routes/DoctorManagement/diagnosisRoute"); // Diagnosis Route
const noveltyRoutes = require("./Routes/NoveltyRoutes"); // Import Novelty Routes

const app = express(); // initialize express application
const analysisRoutes = require("./Routes/AnalysisRoutes");
const vitalsRoutes = require("./Routes/VitalsRoutes");

// Middleware
const allowedOrigins = [
  process.env.FRONTEND01,
  process.env.FRONTEND_URL,
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
  "https://mediflow.zayacodehub.in",
  "https://www.mediflow.zayacodehub.in",
  "https://medi-flow-ten-theta.vercel.app",
  "http://localhost:5173",
  "http://localhost:5174",
  ...(process.env.CORS_EXTRA_ORIGINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
].filter(Boolean);

function isAllowedCorsOrigin(origin) {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;
  if (origin.endsWith(".vercel.app")) return true;
  const suffix = (process.env.CORS_ORIGIN_SUFFIX || "zayacodehub.in").trim();
  if (suffix) {
    try {
      const host = new URL(origin).hostname;
      if (host === suffix || host.endsWith(`.${suffix}`)) return true;
    } catch {
      /* ignore */
    }
  }
  return false;
}

app.use(cors({
  origin: function (origin, callback) {
    if (isAllowedCorsOrigin(origin)) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true // if you use cookies/auth
}));
app.use(express.json({ limit: "12mb" }));

app.get("/", (_req, res) => {
  res.json({
    service: "MEDI-FLOW API",
    health: "/api/health",
    doctors: "/api/doctor/public",
  });
});

app.get("/api/health", async (_req, res) => {
  const missing = [];
  if (!process.env.SUPABASE_URL) missing.push("SUPABASE_URL");
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) missing.push("SUPABASE_SERVICE_ROLE_KEY");
  if (!process.env.JWT_SECRET) missing.push("JWT_SECRET");
  if (missing.length) {
    return res.status(503).json({
      ok: false,
      message: "Set missing environment variables on Vercel (medi-flow-api project).",
      missing,
    });
  }
  try {
    await connectDatabase();
    res.json({ ok: true, database: useSupabase() ? "supabase" : "mongodb" });
  } catch (err) {
    res.status(503).json({ ok: false, message: err.message });
  }
});

// API Routes
app.use("/api/auth", authRoutes); // Routes for Login/Register
app.use("/api/users", userRoutes); // Routes for User CRUD
app.use("/api/appoinment", appointmentRoute); // Routes for Appointment Management
app.use("/api/rejected-appointments", rejectedAppointmentRoutes);
app.use("/api/doctor", doctorRoute); // Routes for Doctor Management
app.use("/api/admin/doctors", require("./Routes/adminDoctorRoutes"));
app.use("/api/stock", stockRoute); // Routes for Stock Management
app.use("/api/prescription", prescriptionRoute); // Routes for Prescription Management
app.use("/api/prescriptions", require("./Routes/DoctorManagement/prescriptionRoute")); // Register prescription routes
app.use("/api/doctorLeave", doctorLeaveRoutes); // Routes for Doctor Leave Management
app.use("/api/diagnosis", diagnosisRoute); // Routes for Diagnosis Management

// Forgot Password Routes
app.use("/api/auth/forgot-password", forgotPasswordRoute); // Routes for Forgot Password functionality

// Use Novelty Routes for analyzing symptoms
app.use("/api/novelty", noveltyRoutes); // This links the API to the Novelty Routes
app.use("/api/analysis", analysisRoutes);
app.use("/api/vitals", vitalsRoutes);

//Medical Report Routes
const medicalReportRoutes = require("./Routes/medicalReportRoutes");
app.use("/api/reports", medicalReportRoutes);
app.use("/api/dashboard", require("./Routes/DashboardRoutes"));
app.use("/api/medical-assistant", require("./Routes/medicalAssistantRoutes"));
app.use("/api/notifications", require("./Routes/NotificationRoutes"));
app.use("/api/search", require("./Routes/SearchRoutes"));

const path = require("path");
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use((err, req, res, _next) => {
  console.error("API error:", err.message || err);
  if (res.headersSent) return;
  const status = err.code === "LIMIT_FILE_SIZE" ? 413 : 400;
  res.status(status).json({
    message: err.message || "Request failed",
  });
});

connectDatabase()
  .then(() => {
    if (process.env.NODE_ENV !== "production") {
      const PORT = process.env.PORT || 5000;
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    }
  })
  .catch((err) => console.error("Database connection error:", err));

module.exports = app;

