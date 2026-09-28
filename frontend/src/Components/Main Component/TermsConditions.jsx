import React from "react";
import { Box, Container, Typography, Paper, Breadcrumbs, Link, Chip } from "@mui/material";
import Nav from "../Nav Component/Nav";
import Footer from "../Nav Component/Footer";

const sections = [
  {
    title: "1. Acceptance of terms",
    text:
      "By accessing or using MEDI FLOW, you agree to be bound by these Terms and Conditions and all applicable laws and regulations. If you do not agree with any part of these terms, you may not use our services.",
  },
  {
    title: "2. Services",
    text:
      "MEDI FLOW provides an online healthcare management platform including appointment scheduling, AI-assisted symptom guidance, medical record access, and role-based dashboards for patients, doctors, and staff. We reserve the right to modify or discontinue any part of the service at any time.",
  },
  {
    title: "3. User responsibilities",
    text:
      "You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to provide accurate and complete information during registration and to promptly update any changes.",
  },
  {
    title: "4. Medical disclaimer",
    text:
      "The symptom analysis and AI guidance features are for informational purposes only and do not constitute medical advice. Always consult a qualified healthcare professional for diagnosis and treatment. Do not disregard professional medical advice based on content from MEDI FLOW.",
  },
  {
    title: "5. Intellectual property",
    text:
      "All content, logos, graphics, and software on MEDI FLOW are the property of or licensed to MEDI FLOW and are protected by copyright, trademark, and other intellectual property laws. You may not reproduce or distribute any content without prior written consent.",
  },
  {
    title: "6. Limitation of liability",
    text:
      "To the fullest extent permitted by law, MEDI FLOW shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the service, including any errors or delays in content or information provided.",
  },
  {
    title: "7. Governing law",
    text:
      "These terms are governed by and construed in accordance with the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts located in Salem, Tamil Nadu.",
  },
  {
    title: "8. Changes to these terms",
    text:
      "We may update these Terms and Conditions from time to time. When we do, the revised version will be posted on this page with an updated effective date. Your continued use of the service constitutes acceptance of the new terms.",
  },
];

function TermsConditions() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f7f9fc]">
      <Nav />

      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 }, px: { xs: 2, sm: 3 } }}>
        <Breadcrumbs
          aria-label="breadcrumb"
          sx={{ mb: { xs: 2, md: 3 }, "& .MuiBreadcrumbs-separator": { opacity: 0.4 } }}
        >
          <Link href="/" className="text-sm text-[#2b2c6c] hover:text-[#2fb297]">
            Home
          </Link>
          <Typography variant="body2" sx={{ color: "#2b2c6c", fontWeight: 600 }}>
            Terms &amp; Conditions
          </Typography>
        </Breadcrumbs>

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
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: { xs: 2, md: 3 } }}>
            <Chip
              label="Legal"
              sx={{
                bgcolor: "rgba(47,178,151,0.12)",
                color: "#1d7f70",
                fontWeight: 700,
                height: 26,
              }}
            />
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                color: "#2b2c6c",
                fontSize: { xs: "2rem", md: "2.8rem" },
              }}
            >
              Terms &amp; Conditions
            </Typography>
          </Box>

          <Typography
            variant="body1"
            sx={{
              color: "#4b5563",
              lineHeight: 1.8,
              mb: { xs: 4, md: 5 },
              textAlign: { xs: "center", md: "left" },
              fontSize: { xs: "0.95rem", md: "1.05rem" },
            }}
          >
            These Terms and Conditions govern your access to and use of the MEDI FLOW healthcare
            platform. Please read them carefully before using our services.
          </Typography>

          <Box sx={{ display: "grid", gap: { xs: 2.5, md: 3 } }}>
            {sections.map((section) => (
              <Box key={section.title}>
                <Typography
                  variant="h6"
                  component="h2"
                  sx={{
                    fontWeight: 700,
                    color: "#1f2937",
                    mb: 1,
                    fontSize: { xs: "1.05rem", md: "1.15rem" },
                  }}
                >
                  {section.title}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: "#4b5563",
                    lineHeight: 1.8,
                    fontSize: { xs: "0.9rem", md: "1rem" },
                  }}
                >
                  {section.text}
                </Typography>
              </Box>
            ))}
          </Box>

          <Box
            sx={{
              mt: { xs: 4, md: 5 },
              pt: { xs: 3, md: 4 },
              borderTop: "1px solid rgba(43,44,108,0.08)",
              textAlign: { xs: "center", md: "left" },
            }}
          >
            <Typography variant="body2" sx={{ color: "#9ca3af" }}>
              Last updated: September 2026
            </Typography>
          </Box>
        </Paper>
      </Container>

      <Footer />
    </div>
  );
}

export default TermsConditions;
