import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Container,
  Grid,
  Typography,
  Divider,
  IconButton,
  TextField,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  EmailOutlined,
  LanguageOutlined,
  LocationOnOutlined,
  PhoneOutlined,
  Facebook,
  Instagram,
  LinkedIn,
  ExpandMore,
  Send,
} from "@mui/icons-material";
import { brand } from "../../theme/brand";

const quickLinks = [
  { to: "/", label: "Home" },
  { to: "/Find-Doctor", label: "Find a doctor" },
  { to: "/Our-Facilities", label: "Our facilities" },
  { to: "/About-Us", label: "About us" },
  { to: "/Contact-Us", label: "Contact" },
  { to: "/login", label: "Patient login" },
];

const careLinks = [
  { to: "/Book-Appointment", label: "Book appointment" },
  { to: "/request-consultation", label: "Request consultation" },
  { to: "/symptom-analysis", label: "Symptom AI" },
  { to: "/FAQ", label: "FAQ" },
  { to: "/Privacy-Policy", label: "Privacy policy" },
  { to: "/Terms-Conditions", label: "Terms & conditions" },
];

const contactInfo = [
  {
    icon: <EmailOutlined sx={{ fontSize: 18 }} />,
    label: "Email",
    value: "support@medi-flow.in",
    href: "mailto:support@medi-flow.in",
  },
  {
    icon: <PhoneOutlined sx={{ fontSize: 18 }} />,
    label: "Phone",
    value: "+91 98765 43210",
    href: "tel:+919876543210",
  },
  {
    icon: <LocationOnOutlined sx={{ fontSize: 18 }} />,
    label: "Location",
    value: "Salem, Tamil Nadu, India",
    href: null,
  },
];

const socialLinks = [
  {
    icon: <Facebook fontSize="small" />,
    label: "Facebook",
    href: "https://facebook.com/medi-flow",
  },
  {
    icon: <Instagram fontSize="small" />,
    label: "Instagram",
    href: "https://instagram.com/medi-flow",
  },
  {
    icon: <LinkedIn fontSize="small" />,
    label: "LinkedIn",
    href: "https://linkedin.com/company/medi-flow",
  },
];

const ZAYA = {
  name: "ZAYA CODE HUB",
  tagline: "Software & digital solutions",
  site: "https://zayacodehub.in",
  email: "zayacodehub@gmail.com",
  location: "Salem, Tamil Nadu",
};

function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [openSection, setOpenSection] = useState(null);

  const year = new Date().getFullYear();

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail("");
  };

  const toggleSection = (section) => {
    setOpenSection((prev) => (prev === section ? null : section));
  };

  const linkClass =
    "text-sm text-white/80 hover:text-[#2fb297] transition-colors no-underline";

  const renderLinkList = (links) =>
    links.map((link) => (
      <Link
        key={link.to}
        to={link.to}
        className={linkClass}
        onClick={isMobile ? () => {} : undefined}
      >
        {link.label}
      </Link>
    ));

  const renderContactLinks = (links) =>
    links.map((item, idx) => (
      <Box key={idx} display="flex" alignItems="flex-start" gap={1} mb={1.5}>
        <Box sx={{ color: brand.success, mt: 0.25 }}>{item.icon}</Box>
        <Box>
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.6)" }}>
            {item.label}
          </Typography>
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.85)" }}>
            {item.href ? (
              <a
                href={item.href}
                className="text-white/90 hover:text-[#2fb297] no-underline"
              >
                {item.value}
              </a>
            ) : (
              item.value
            )}
          </Typography>
        </Box>
      </Box>
    ));

  return (
    <footer className="w-full mt-auto bg-[#1e1f52] text-white">
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 }, px: { xs: 2, sm: 3 } }}>
        {/* Desktop grid layout */}
        <Grid container spacing={{ xs: 3, md: 4 }} sx={{ display: { xs: "none", md: "flex" } }}>
          <Grid item xs={12} md={4}>
            <Box display="flex" alignItems="center" gap={1.5} mb={2}>
              <img src="/Logo2.png" alt="MEDI FLOW" className="h-10 w-auto" />
              <Typography variant="h6" fontWeight={700} letterSpacing={0.5}>
                MEDI FLOW
              </Typography>
            </Box>

            <Typography
              variant="body2"
              sx={{ color: "rgba(255,255,255,0.78)", lineHeight: 1.7, maxWidth: 320, mb: 3 }}
            >
              Smart healthcare management — appointments, AI-assisted symptom guidance, and connected care
              for patients and clinicians.
            </Typography>

            <Box display="flex" gap={0.5} mb={3}>
              {socialLinks.map((social) => (
                <IconButton
                  key={social.label}
                  component="a"
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  size="small"
                  aria-label={social.label}
                  sx={{ color: "#fff", "&:hover": { color: brand.success } }}
                >
                  {social.icon}
                </IconButton>
              ))}
            </Box>

            <Box>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5, color: brand.success }}>
                Contact
              </Typography>
              {renderContactLinks(contactInfo)}
            </Box>
          </Grid>

          <Grid item xs={6} sm={4} md={2}>
            <Typography
              variant="subtitle2"
              fontWeight={700}
              sx={{ mb: 1.5, color: brand.success }}
            >
              Explore
            </Typography>
            <Box component="nav" display="flex" flexDirection="column" gap={1}>
              {renderLinkList(quickLinks)}
            </Box>
          </Grid>

          <Grid item xs={6} sm={4} md={2}>
            <Typography
              variant="subtitle2"
              fontWeight={700}
              sx={{ mb: 1.5, color: brand.success }}
            >
              Patient care
            </Typography>
            <Box component="nav" display="flex" flexDirection="column" gap={1}>
              {renderLinkList(careLinks)}
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography
              variant="subtitle2"
              fontWeight={700}
              sx={{ mb: 1.5, color: brand.success }}
            >
              Stay in the loop
            </Typography>
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)", mb: 2, lineHeight: 1.6 }}>
              Subscribe with your email for the latest health tips, feature updates, and news from MEDI
              FLOW.
            </Typography>

            {subscribed ? (
              <Typography variant="body2" sx={{ color: brand.success, fontWeight: 600 }}>
                🎉 Thanks! Check your inbox for a confirmation.
              </Typography>
            ) : (
              <form onSubmit={handleSubscribe}>
                <Box display="flex" gap={1}>
                  <TextField
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    size="small"
                    variant="outlined"
                    sx={{
                      flex: 1,
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "rgba(255,255,255,0.08)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        color: "#fff",
                      },
                      "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.5)" },
                      "& fieldset": { border: "none" },
                    }}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    size="small"
                    aria-label="Subscribe"
                    sx={{
                      backgroundColor: brand.success,
                      color: "#1e1f52",
                      fontWeight: 700,
                      "&:hover": { backgroundColor: "#289d87" },
                    }}
                  >
                    <Send fontSize="small" />
                  </Button>
                </Box>
              </form>
            )}
          </Grid>
        </Grid>

        {/* Mobile accordion layout */}
        <Box sx={{ display: { md: "none" } }}>
          <Accordion
            expanded={openSection === "explore"}
            onChange={() => toggleSection("explore")}
            sx={{
              bgcolor: "rgba(255,255,255,0.05)",
              borderRadius: 2,
              mb: 1,
              "&:before": { display: "none" },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMore sx={{ color: "#fff" }} />}
              sx={{ py: 1.5 }}
            >
              <Typography fontWeight={700}>Explore</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ pb: 1.5 }}>
              <Box component="nav" display="flex" flexDirection="column" gap={1.25}>
                {renderLinkList(quickLinks)}
              </Box>
            </AccordionDetails>
          </Accordion>

          <Accordion
            expanded={openSection === "care"}
            onChange={() => toggleSection("care")}
            sx={{
              bgcolor: "rgba(255,255,255,0.05)",
              borderRadius: 2,
              mb: 1,
              "&:before": { display: "none" },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMore sx={{ color: "#fff" }} />}
              sx={{ py: 1.5 }}
            >
              <Typography fontWeight={700}>Patient care</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ pb: 1.5 }}>
              <Box component="nav" display="flex" flexDirection="column" gap={1.25}>
                {renderLinkList(careLinks)}
              </Box>
            </AccordionDetails>
          </Accordion>

          <Accordion
            expanded={openSection === "contact"}
            onChange={() => toggleSection("contact")}
            sx={{
              bgcolor: "rgba(255,255,255,0.05)",
              borderRadius: 2,
              mb: 1,
              "&:before": { display: "none" },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMore sx={{ color: "#fff" }} />}
              sx={{ py: 1.5 }}
            >
              <Typography fontWeight={700}>Contact</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ pb: 1.5 }}>
              {renderContactLinks(contactInfo)}
              <Box display="flex" gap={0.5} mt={1.5}>
                {socialLinks.map((social) => (
                  <IconButton
                    key={social.label}
                    component="a"
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    size="small"
                    aria-label={social.label}
                    sx={{ color: "#fff", "&:hover": { color: brand.success } }}
                  >
                    {social.icon}
                  </IconButton>
                ))}
              </Box>
            </AccordionDetails>
          </Accordion>

          <Accordion
            expanded={openSection === "newsletter"}
            onChange={() => toggleSection("newsletter")}
            sx={{
              bgcolor: "rgba(255,255,255,0.05)",
              borderRadius: 2,
              mb: 1,
              "&:before": { display: "none" },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMore sx={{ color: "#fff" }} />}
              sx={{ py: 1.5 }}
            >
              <Typography fontWeight={700}>Stay in the loop</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ pb: 1.5 }}>
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)", mb: 2, lineHeight: 1.6 }}>
                Subscribe with your email for the latest health tips and feature updates.
              </Typography>
              {subscribed ? (
                <Typography variant="body2" sx={{ color: brand.success, fontWeight: 600 }}>
                  🎉 Thanks! Check your inbox for a confirmation.
                </Typography>
              ) : (
                <form onSubmit={handleSubscribe}>
                  <Box display="flex" gap={1}>
                    <TextField
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      size="small"
                      variant="outlined"
                      sx={{
                        flex: 1,
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "rgba(255,255,255,0.08)",
                          border: "1px solid rgba(255,255,255,0.2)",
                          color: "#fff",
                        },
                        "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.5)" },
                        "& fieldset": { border: "none" },
                      }}
                    />
                    <Button
                      type="submit"
                      variant="contained"
                      size="small"
                      aria-label="Subscribe"
                      sx={{
                        backgroundColor: brand.success,
                        color: "#1e1f52",
                        fontWeight: 700,
                        "&:hover": { backgroundColor: "#289d87" },
                      }}
                    >
                      <Send fontSize="small" />
                    </Button>
                  </Box>
                </form>
              )}
            </AccordionDetails>
          </Accordion>

          {/* Brand card for mobile */}
          <Box display="flex" alignItems="center" gap={1.5} mt={2} pt={2} borderTop="1px solid rgba(255,255,255,0.12)">
            <img src="/Logo2.png" alt="MEDI FLOW" className="h-9 w-auto" />
            <Typography variant="h6" fontWeight={700} letterSpacing={0.5}>
              MEDI FLOW
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ borderColor: "rgba(255,255,255,0.12)", my: { xs: 3, md: 4 } }} />

        <Box
          display="flex"
          flexDirection={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
          gap={1.5}
        >
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.65)", lineHeight: 1.6 }}>
            © {year} MEDI FLOW. All rights reserved.
          </Typography>
          <Box display="flex" gap={3} sx={{ flexWrap: "wrap" }}>
            <Link to="/Privacy-Policy" className={linkClass}>
              Privacy Policy
            </Link>
            <Link to="/Terms-Conditions" className={linkClass}>
              Terms &amp; Conditions
            </Link>
            <Link to="/FAQ" className={linkClass}>
              FAQ
            </Link>
          </Box>
          <Typography
            variant="caption"
            sx={{ color: "rgba(255,255,255,0.65)", textAlign: { xs: "left", sm: "right" } }}
          >
            Developed by{" "}
            <a
              href={ZAYA.site}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#2fb297] font-semibold hover:underline no-underline"
            >
              {ZAYA.name}
            </a>
          </Typography>
        </Box>
      </Container>
    </footer>
  );
}

export default Footer;
