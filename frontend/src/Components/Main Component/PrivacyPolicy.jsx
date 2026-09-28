import React from "react";
import { Box, Container, Typography, Paper } from "@mui/material";
import Nav from "../Nav Component/Nav";
import Footer from "../Nav Component/Footer";

const sections = [
  {
    title: "1. Information we collect",
    text:
      "We may collect personal and health-related information such as your name, contact information, appointment details, symptoms, and account profile data needed to provide healthcare services through MEDI FLOW.",
  },
  {
    title: "2. How we use your information",
    text:
      "Your information helps us manage appointments, support medical consultations, provide dashboards for doctors and staff, improve service quality, and deliver secure patient experiences across the platform.",
  },
  {
    title: "3. Data security",
    text:
      "We use secure authentication, protected storage practices, and access controls to reduce the risk of unauthorized access or disclosure. Only authorized personnel and role-based systems can view specific information.",
  },
  {
    title: "4. Sharing information",
    text:
      "We do not sell your personal data. Information may be shared only with healthcare personnel, service providers, or authorized administrative users who need it to deliver treatment, support, or platform operations.",
  },
  {
    title: "5. Cookies and website analytics",
    text:
      "The platform may use cookies and analytics tools to improve usability, maintain session information, and understand how visitors use the website. These tools help us optimize the experience for mobile and desktop users.",
  },
  {
    title: "6. Your rights",
    text:
      "You may request access to your account information, update personal details, or ask for information about your data handling practices. Please contact our support team for assistance.",
  },
  {
    title: "7. Updates to this policy",
    text:
      "This privacy policy may be updated as needed to reflect improving security practices, legal requirements, or new features. Updated versions will be reflected on this page.",
  },
];

function PrivacyPolicy() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f7f9fc]">
      <Nav />

      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 }, px: { xs: 2, sm: 3 } }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, md: 4 },
            borderRadius: 3,
            border: "1px solid rgba(43,44,108,0.08)",
            background: "#ffffff",
            boxShadow: "0 16px 40px rgba(31,41,55,0.05)",
          }}
        >
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              color: "#2b2c6c",
              fontSize: { xs: "2rem", md: "2.8rem" },
              mb: 1,
            }}
          >
            Privacy Policy
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: "#4b5563",
              lineHeight: 1.8,
              mb: 3,
            }}
          >
            MEDI FLOW is committed to protecting the privacy and security of the personal and healthcare information we receive from patients, doctors, and staff.
          </Typography>

          <Box sx={{ display: "grid", gap: 3 }}>
            {sections.map((section) => (
              <Box key={section.title}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "#1f2937", mb: 1 }}>
                  {section.title}
                </Typography>
                <Typography variant="body1" sx={{ color: "#4b5563", lineHeight: 1.8 }}>
                  {section.text}
                </Typography>
              </Box>
            ))}
          </Box>
        </Paper>
      </Container>

      <Footer />
    </div>
  );
}

export default PrivacyPolicy;
