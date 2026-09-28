import React, { useState, Suspense } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import RoleGuard from "./Components/RoleGuard";
import DashboardRedirect from "./Components/DashboardRedirect";
import PatientPortalWrapper from "./Components/Patient Component/PatientPortalWrapper";
import PatientPortalOrPublic from "./Components/Patient Component/PatientPortalOrPublic";
import { lazyWithRetry } from "./utils/lazyWithRetry";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { PageLoader } from "./Components/Loading/MediflowLoader";

const Home = lazyWithRetry(() => import("./Components/Main Component/Home"));
const AboutUs = lazyWithRetry(() => import("./Components/Main Component/AboutUs"));
const ContactUs = lazyWithRetry(() => import("./Components/Main Component/ContactUs"));
const OurFacilities = lazyWithRetry(() => import("./Components/Main Component/OurFacilities"));
const FAQPage = lazyWithRetry(() => import("./Components/Main Component/FAQPage"));
const PrivacyPolicy = lazyWithRetry(() => import("./Components/Main Component/PrivacyPolicy"));
const TermsConditions = lazyWithRetry(() => import("./Components/Main Component/TermsConditions"));
const FindADoctor = lazyWithRetry(() => import("./Components/Doctor Component/FindADoctor"));
const PatientDashboard = lazyWithRetry(() => import("./Components/Patient Component/PatientDashboard"));
const OnlineResults = lazyWithRetry(() => import("./Components/Patient Component/OnlineResults"));
const RequestConsultation = lazyWithRetry(() => import("./Components/Patient Component/RequestConsultation"));
const UserManagement = lazyWithRetry(() => import("./Components/User Component/UserAdmin/UserManagement"));
const MyAccount = lazyWithRetry(() => import("./Components/User Component/UserProfile/MyAccount"));
const Login = lazyWithRetry(() => import("./Components/User Component/Login"));
const Registration = lazyWithRetry(() => import("./Components/User Component/Registration"));
const UDashboard = lazyWithRetry(() => import("./Components/User Component/UserAdmin/UDashboard"));
const ForgotPassword = lazyWithRetry(() => import("./Components/User Component/UserProfile/ForgotPassword"));
const AddNewUser = lazyWithRetry(() => import("./Components/User Component/UserAdmin/AddNewUser"));
const DoctorApprovals = lazyWithRetry(() => import("./Components/User Component/UserAdmin/DoctorApprovals"));

const PDashboard = lazyWithRetry(() => import("./Components/Pharmacy Component/PDashboard"));
const StockAnalytics = lazyWithRetry(() => import("./Components/Pharmacy Component/StockAnalytics"));
const OrderAnalytics = lazyWithRetry(() => import("./Components/Pharmacy Component/OrderAnalytics"));
const StockAdding = lazyWithRetry(() => import("./Components/Pharmacy Component/StockAdding"));
const RecentOrders = lazyWithRetry(() => import("./Components/Prescription Component/RecentOrders"));

const ADashboard = lazyWithRetry(() => import("./Components/Appointment Component/ADashboard"));
const BookAppointent = lazyWithRetry(() => import("./Components/Appointment Component/BookAppointent"));
const AppoinmentDisplay = lazyWithRetry(() => import("./Components/Appointment Component/DisplayAppoinment"));
const AppoinmentManagement = lazyWithRetry(() => import("./Components/Appointment Component/AppoinmentAdmin/AppoinmentManagement"));
const RejectedAppoinment = lazyWithRetry(() => import("./Components/Appointment Component/AppoinmentAdmin/RejectedAppoinmentPage"));

const DoctorLogin = lazyWithRetry(() => import("./Components/Doctor Component/DoctorLogin"));
const DoctorRegistration = lazyWithRetry(() => import("./Components/Doctor Component/DoctorRegistration"));
const DDashboard = lazyWithRetry(() => import("./Components/Doctor Component/DDashboard"));
const ViewAppointments = lazyWithRetry(() => import("./Components/Doctor Component/ViewAppoinments"));
const DoctorLeave = lazyWithRetry(() => import("./Components/Doctor Component/DoctorLeave"));
const DoctorDiagnosis = lazyWithRetry(() => import("./Components/Doctor Component/DoctorDiagnosis"));
const DiagnosisView = lazyWithRetry(() => import("./Components/Doctor Component/DiagnosisView"));

const NoveltyComponent = lazyWithRetry(() => import("./Components/Novelty Component/NoveltyComponent"));
const AnalysisHistory = lazyWithRetry(() => import("./Components/Novelty Component/AnalysisHistory"));
const HealthTrends = lazyWithRetry(() => import("./Components/Novelty Component/HealthTrends"));
const VitalsInputForm = lazyWithRetry(() => import("./Components/Novelty Component/VitalsInputForm"));
const ChatbotLauncher = lazyWithRetry(() => import("./Components/Novelty Component/ChatbotLauncher"));
const HealthChatBot = lazyWithRetry(() => import("./Components/Novelty Component/HealthChatBot"));
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
    <div className="mf-app-shell">
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/About-Us" element={<AboutUs />} />
          <Route path="/Contact-Us" element={<ContactUs />} />
          <Route path="/Our-Facilities" element={<OurFacilities />} />
          <Route path="/FAQ" element={<FAQPage />} />
          <Route path="/Privacy-Policy" element={<PrivacyPolicy />} />
          <Route path="/Terms-Conditions" element={<TermsConditions />} />
          <Route
            path="/Find-Doctor"
            element={
              <PatientPortalOrPublic>
                <FindADoctor />
              </PatientPortalOrPublic>
            }
          />
          <Route path="/dashboard" element={<DashboardRedirect />} />

          <Route
            path="/symptom-analysis"
            element={
              <PatientPortalOrPublic>
                <NoveltyComponent />
              </PatientPortalOrPublic>
            }
          />

          <Route element={<PatientPortalWrapper />}>
            <Route path="/patient-dashboard" element={<PatientDashboard />} />
            <Route path="/online-results" element={<OnlineResults />} />
            <Route path="/medical-assistant" element={<MedicalAssistantChat />} />
            <Route path="/enter-vitals" element={<VitalsInputForm />} />
            <Route path="/analysis-history" element={<AnalysisHistory />} />
            <Route path="/health-trends" element={<HealthTrends />} />
          </Route>

          <Route
            path="/Book-Appointment"
            element={
              <PatientPortalOrPublic
                requirePatientAuth
                gateTitle="Sign in to book an appointment"
                gateMessage="Create a patient account or log in to schedule appointments with verified MEDI FLOW doctors."
              >
                <BookAppointent />
              </PatientPortalOrPublic>
            }
          />
          <Route
            path="/request-consultation"
            element={
              <PatientPortalOrPublic
                requirePatientAuth
                gateTitle="Sign in to request a consultation"
                gateMessage="Create a patient account or log in to request a consultation. We need your profile to match you with the right doctor."
              >
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
