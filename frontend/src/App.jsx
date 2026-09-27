import React, { useState, lazy, Suspense } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
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

const UserManagement = lazy(() => import("./Components/User Component/UserAdmin/UserManagement"));
const MyAccount = lazy(() => import("./Components/User Component/UserProfile/MyAccount"));
const Login = lazy(() => import("./Components/User Component/Login"));
const Registration = lazy(() => import("./Components/User Component/Registration"));
const UDashboard = lazy(() => import("./Components/User Component/UserAdmin/UDashboard"));
const ForgotPassword = lazy(() => import("./Components/User Component/UserProfile/ForgotPassword"));
const AddNewUser = lazy(() => import("./Components/User Component/UserAdmin/AddNewUser"));

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
          <Route path="/Find-Doctor" element={<FindADoctor />} />
          <Route path="/patient-dashboard" element={<PatientDashboard />} />
          <Route path="/online-results" element={<OnlineResults />} />
          <Route path="/request-consultation" element={<RequestConsultation />} />

          <Route path="/User-Management" element={<UserManagement />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registration" element={<Registration />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/User-Dashboard" element={<UDashboard />} />
          <Route path="/User-Account" element={<MyAccount />} />
          <Route path="/Add-New-Patient" element={<AddNewUser />} />

          <Route path="/symptom-analysis" element={<NoveltyComponent />} />
          <Route path="/enter-vitals" element={<VitalsInputForm />} />
          <Route path="/analysis-history" element={<AnalysisHistory />} />
          <Route path="/health-trends" element={<HealthTrends />} />

          <Route path="/Pharmacy-Dashboard" element={<PDashboard />} />
          <Route path="/Pharmacy-Stocks" element={<StockAnalytics />} />
          <Route path="/Pharmacy-Orders" element={<OrderAnalytics />} />
          <Route path="/Stock-Adding" element={<StockAdding />} />
          <Route path="/recent-orders" element={<RecentOrders />} />

          <Route path="/login-doctor" element={<DoctorLogin />} />
          <Route path="/register-doctor" element={<DoctorRegistration />} />
          <Route path="/Doctor-Dashboard" element={<DDashboard />} />
          <Route
            path="/Doctor-Dashboard/View-Appointment"
            element={<ViewAppointments />}
          />
          <Route path="/Doctor-Dashboard/Leave" element={<DoctorLeave />} />
          <Route
            path="/Doctor-Dashboard/appointmnet/Diagnosis/:appointmentId"
            element={<DoctorDiagnosis />}
          />
          <Route path="/Doctor-Dashboard/Diagnosis" element={<DiagnosisView />} />

          <Route path="/Book-Appointment" element={<BookAppointent />} />
          <Route path="/Appoinment-Display" element={<AppoinmentDisplay />} />
          <Route path="/Appointment-Dashboard" element={<ADashboard />} />
          <Route
            path="/Appoinment-Management"
            element={<AppoinmentManagement />}
          />
          <Route path="Rijected-Appoinment" element={<RejectedAppoinment />} />
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
