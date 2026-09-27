import React, { useState, lazy, Suspense } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import RoleGuard from "./Components/RoleGuard";
import DashboardRedirect from "./Components/DashboardRedirect";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Box, CircularProgress } from "@mui/material";

const PageLoader = () => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    minHeight="40vh"
  >
    <CircularProgress sx={{ color: "#2b2c6c" }} />
  </Box>
);

const Home = lazy(() => import("./Components/Main Component/Home"));
const AboutUs = lazy(() => import("./Components/Main Component/AboutUs"));
const ContactUs = lazy(() => import("./Components/Main Component/ContactUs"));
const OurFacilities = lazy(() => import("./Components/Main Component/OurFacilities"));
const FindADoctor = lazy(() => import("./Components/Doctor Component/FindADoctor"));
const PatientDashboard = lazy(() => import("./Components/Patient Component/PatientDashboard"));
const OnlineResults = lazy(() => import("./Components/Patient Component/OnlineResults"));
const RequestConsultation = lazy(() => import("./Components/Patient Component/RequestConsultation"));
const PatientPortalWrapper = lazy(() => import("./Components/Patient Component/PatientPortalWrapper"));
const PatientPortalOrPublic = lazy(() => import("./Components/Patient Component/PatientPortalOrPublic"));

const UserManagement = lazy(() => import("./Components/User Component/UserAdmin/UserManagement"));
const MyAccount = lazy(() => import("./Components/User Component/UserProfile/MyAccount"));
const Login = lazy(() => import("./Components/User Component/Login"));
const Registration = lazy(() => import("./Components/User Component/Registration"));
const UDashboard = lazy(() => import("./Components/User Component/UserAdmin/UDashboard"));
const ForgotPassword = lazy(() => import("./Components/User Component/UserProfile/ForgotPassword"));
const AddNewUser = lazy(() => import("./Components/User Component/UserAdmin/AddNewUser"));
const DoctorApprovals = lazy(() => import("./Components/User Component/UserAdmin/DoctorApprovals"));

const PDashboard = lazy(() => import("./Components/Pharmacy Component/PDashboard"));
const StockAnalytics = lazy(() => import("./Components/Pharmacy Component/StockAnalytics"));
const OrderAnalytics = lazy(() => import("./Components/Pharmacy Component/OrderAnalytics"));
const StockAdding = lazy(() => import("./Components/Pharmacy Component/StockAdding"));
const RecentOrders = lazy(() => import("./Components/Prescription Component/RecentOrders"));

const ADashboard = lazy(() => import("./Components/Appointment Component/ADashboard"));
const BookAppointent = lazy(() => import("./Components/Appointment Component/BookAppointent"));
const AppoinmentDisplay = lazy(() => import("./Components/Appointment Component/DisplayAppoinment"));
const AppoinmentManagement = lazy(() => import("./Components/Appointment Component/AppoinmentAdmin/AppoinmentManagement"));
const RejectedAppoinment = lazy(() => import("./Components/Appointment Component/AppoinmentAdmin/RejectedAppoinmentPage"));

const DoctorLogin = lazy(() => import("./Components/Doctor Component/DoctorLogin"));
const DoctorRegistration = lazy(() => import("./Components/Doctor Component/DoctorRegistration"));
const DDashboard = lazy(() => import("./Components/Doctor Component/DDashboard"));
const ViewAppointments = lazy(() => import("./Components/Doctor Component/ViewAppoinments"));
const DoctorLeave = lazy(() => import("./Components/Doctor Component/DoctorLeave"));
const DoctorDiagnosis = lazy(() => import("./Components/Doctor Component/DoctorDiagnosis"));
const DiagnosisView = lazy(() => import("./Components/Doctor Component/DiagnosisView"));

const NoveltyComponent = lazy(() => import("./Components/Novelty Component/NoveltyComponent"));
const AnalysisHistory = lazy(() => import("./Components/Novelty Component/AnalysisHistory"));
const HealthTrends = lazy(() => import("./Components/Novelty Component/HealthTrends"));
const VitalsInputForm = lazy(() => import("./Components/Novelty Component/VitalsInputForm"));
const ChatbotLauncher = lazy(() => import("./Components/Novelty Component/ChatbotLauncher"));
const HealthChatBot = lazy(() => import("./Components/Novelty Component/HealthChatBot"));
import MedicalAssistantChat from "./Components/Novelty Component/MedicalAssistantChat";

function App() {
  const [chatOpen, setChatOpen] = useState(false);
  const location = useLocation();

  const hideChatbotOn = [
    "/login",
    "/registration",
    "/User-Management",
    "/Add-New-Patient",
    "/Pharmacy-Dashboard",
    "/Pharmacy-Stocks",
    "/Pharmacy-Orders",
    "/Stock-Adding",
    "/Appoinment-Management",
    "/Rijected-Appoinment",
    "/Doctor-Dashboard",
    "/Appointment-Dashboard",
    "/User-Dashboard",
    "/patient-dashboard",
    "/analysis-history",
    "/symptom-analysis",
    "/medical-assistant",
    "/enter-vitals",
    "/health-trends",
    "/online-results",
    "/Find-Doctor",
  ];
  const showChatbot = !hideChatbotOn.includes(location.pathname);

  return (
    <div>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/About-Us" element={<AboutUs />} />
          <Route path="/Contact-Us" element={<ContactUs />} />
          <Route path="/Our-Facilities" element={<OurFacilities />} />
          <Route
            path="/Find-Doctor"
            element={
              <PatientPortalOrPublic>
                <FindADoctor />
              </PatientPortalOrPublic>
            }
          />
          <Route path="/dashboard" element={<DashboardRedirect />} />

          <Route element={<PatientPortalWrapper />}>
            <Route path="/patient-dashboard" element={<PatientDashboard />} />
            <Route path="/online-results" element={<OnlineResults />} />
            <Route path="/symptom-analysis" element={<NoveltyComponent />} />
            <Route path="/medical-assistant" element={<MedicalAssistantChat />} />
            <Route path="/enter-vitals" element={<VitalsInputForm />} />
            <Route path="/analysis-history" element={<AnalysisHistory />} />
            <Route path="/health-trends" element={<HealthTrends />} />
          </Route>

          <Route
            path="/Book-Appointment"
            element={
              <PatientPortalOrPublic>
                <BookAppointent />
              </PatientPortalOrPublic>
            }
          />
          <Route
            path="/request-consultation"
            element={
              <PatientPortalOrPublic>
                <RequestConsultation />
              </PatientPortalOrPublic>
            }
          />
          <Route
            path="/User-Account"
            element={
              <RoleGuard allowedRoles={["patient"]}>
                <PatientPortalOrPublic>
                  <MyAccount />
                </PatientPortalOrPublic>
              </RoleGuard>
            }
          />

          <Route
            path="/User-Management"
            element={
              <RoleGuard allowedRoles={["user_admin"]}>
                <UserManagement />
              </RoleGuard>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/registration" element={<Registration />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route
            path="/User-Dashboard"
            element={
              <RoleGuard allowedRoles={["user_admin"]}>
                <UDashboard />
              </RoleGuard>
            }
          />
          <Route
            path="/Add-New-Patient"
            element={
              <RoleGuard allowedRoles={["user_admin"]}>
                <AddNewUser />
              </RoleGuard>
            }
          />
          <Route
            path="/Doctor-Approvals"
            element={
              <RoleGuard allowedRoles={["user_admin"]}>
                <DoctorApprovals />
              </RoleGuard>
            }
          />

          <Route
            path="/Pharmacy-Dashboard"
            element={
              <RoleGuard allowedRoles={["pharmacy_admin"]}>
                <PDashboard />
              </RoleGuard>
            }
          />
          <Route
            path="/Pharmacy-Stocks"
            element={
              <RoleGuard allowedRoles={["pharmacy_admin"]}>
                <StockAnalytics />
              </RoleGuard>
            }
          />
          <Route
            path="/Pharmacy-Orders"
            element={
              <RoleGuard allowedRoles={["pharmacy_admin"]}>
                <OrderAnalytics />
              </RoleGuard>
            }
          />
          <Route
            path="/Stock-Adding"
            element={
              <RoleGuard allowedRoles={["pharmacy_admin"]}>
                <StockAdding />
              </RoleGuard>
            }
          />
          <Route
            path="/recent-orders"
            element={
              <RoleGuard allowedRoles={["pharmacy_admin"]}>
                <RecentOrders />
              </RoleGuard>
            }
          />

          <Route path="/login-doctor" element={<DoctorLogin />} />
          <Route path="/register-doctor" element={<DoctorRegistration />} />
          <Route
            path="/Doctor-Dashboard"
            element={
              <RoleGuard allowedRoles={["doctor"]} loginPath="/login-doctor">
                <DDashboard />
              </RoleGuard>
            }
          />
          <Route
            path="/Doctor-Dashboard/View-Appointment"
            element={
              <RoleGuard allowedRoles={["doctor"]} loginPath="/login-doctor">
                <ViewAppointments />
              </RoleGuard>
            }
          />
          <Route
            path="/Doctor-Dashboard/Leave"
            element={
              <RoleGuard allowedRoles={["doctor"]} loginPath="/login-doctor">
                <DoctorLeave />
              </RoleGuard>
            }
          />
          <Route
            path="/Doctor-Dashboard/appointmnet/Diagnosis/:appointmentId"
            element={
              <RoleGuard allowedRoles={["doctor"]} loginPath="/login-doctor">
                <DoctorDiagnosis />
              </RoleGuard>
            }
          />
          <Route
            path="/Doctor-Dashboard/Diagnosis"
            element={
              <RoleGuard allowedRoles={["doctor"]} loginPath="/login-doctor">
                <DiagnosisView />
              </RoleGuard>
            }
          />

          <Route
            path="/Appoinment-Display"
            element={
              <RoleGuard allowedRoles={["appointment_admin"]}>
                <AppoinmentDisplay />
              </RoleGuard>
            }
          />
          <Route
            path="/Appointment-Dashboard"
            element={
              <RoleGuard allowedRoles={["appointment_admin"]}>
                <ADashboard />
              </RoleGuard>
            }
          />
          <Route
            path="/Appoinment-Management"
            element={
              <RoleGuard allowedRoles={["appointment_admin"]}>
                <AppoinmentManagement />
              </RoleGuard>
            }
          />
          <Route
            path="/Rijected-Appoinment"
            element={
              <RoleGuard allowedRoles={["appointment_admin"]}>
                <RejectedAppoinment />
              </RoleGuard>
            }
          />
        </Routes>
        {showChatbot && (
          <>
            <ChatbotLauncher onOpen={() => setChatOpen(true)} />
            <HealthChatBot open={chatOpen} onClose={() => setChatOpen(false)} />
          </>
        )}
      </Suspense>
    </div>
  );
}

export default App;
