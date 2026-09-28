import React from "react";
import { Box, Container, Typography, Accordion, AccordionSummary, AccordionDetails, Chip } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Nav from "../Nav Component/Nav";
import Footer from "../Nav Component/Footer";

const faqItems = [
  {
    question: "How do I book an appointment with a doctor?",
    answer:
      "You can visit the Book Appointment page, choose a doctor or clinic, select your preferred slot, and complete the booking request. Our team will confirm the appointment status after reviewing your request.",
  },
  {
    question: "Can I use MEDI FLOW without creating an account?",
    answer:
      "Yes, you can explore services such as doctor discovery, facility information, and general website content without signing in. However, appointment booking and personal dashboard access require an account.",
  },
  {
    question: "What is symptom analysis and how does it help?",
    answer:
      "Symptom analysis helps users understand common health signals by collecting symptoms and generating guidance. It supports early awareness and helps you decide whether to book a consultation or speak with a clinician.",
  },
  {
    question: "Is my medical information secure?",
    answer:
      "MEDI FLOW follows secure access practices and stores healthcare-related data responsibly. We recommend using strong credentials and keeping your profile details up to date.",
  },
  {
    question: "How do I contact support?",
    answer:
      "You can reach us through the Contact Us page or use the support channels listed in the footer. Our team will guide you through appointments, account access, and healthcare queries.",
  },
  {
    question: "Can doctors and staff access different dashboards?",
    answer:
      "Yes. Each role has a dedicated dashboard with tools and permissions based on patient, doctor, pharmacy, or administrative access. Role-based access keeps the platform organized and secure.",
  },
];

function FAQPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f7f9fc]">
      <Nav />

      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 }, px: { xs: 2, sm: 3 } }}>
        <Box sx={{ mb: 4, textAlign: "center" }}>
          <Chip
            label="Support Center"
            sx={{
              bgcolor: "rgba(47,178,151,0.12)",
              color: "#1d7f70",
              fontWeight: 700,
              mb: 2,
            }}
          />
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              color: "#2b2c6c",
              fontSize: { xs: "2rem", md: "3rem" },
              mb: 1.5,
            }}
          >
            Frequently Asked Questions
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "#4b5563",
              maxWidth: 700,
              mx: "auto",
              lineHeight: 1.7,
            }}
          >
            Everything you need to know about appointments, patient access, healthcare guidance, and MEDI FLOW support.
          </Typography>
        </Box>

        <Box sx={{ display: "grid", gap: 2 }}>
          {faqItems.map((item, index) => (
            <Accordion
              key={item.question}
              defaultExpanded={index === 0}
              sx={{
                borderRadius: "16px !important",
                boxShadow: "0 10px 30px rgba(43,44,108,0.06)",
                overflow: "hidden",
                border: "1px solid rgba(43,44,108,0.08)",
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  px: { xs: 2, md: 3 },
                  py: 1,
                  ".MuiAccordionSummary-content": { my: 1 },
                }}
              >
                <Typography sx={{ fontWeight: 700, color: "#1f2937" }}>{item.question}</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ px: { xs: 2, md: 3 }, pb: 2.5, color: "#4b5563", lineHeight: 1.8 }}>
                {item.answer}
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </Container>

      <Footer />
    </div>
  );
}

export default FAQPage;
