import React from "react";

import { Link } from "react-router-dom";

import { Box, Container, Grid, Typography, Divider, IconButton } from "@mui/material";

import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";

import LanguageOutlinedIcon from "@mui/icons-material/LanguageOutlined";

import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";

import FacebookIcon from "@mui/icons-material/Facebook";

import InstagramIcon from "@mui/icons-material/Instagram";

import LinkedInIcon from "@mui/icons-material/LinkedIn";

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

];



const ZAYA = {

  name: "ZAYA CODE HUB",

  tagline: "Software & digital solutions",

  site: "https://zayacodehub.in",

  email: "zayacodehub@gmail.com",

  location: "Salem, Tamil Nadu",

};



function Footer() {

  const year = new Date().getFullYear();



  return (

    <footer className="w-full mt-auto bg-[#1e1f52] text-white">

      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 }, px: { xs: 2, sm: 3 } }}>

        <Grid container spacing={{ xs: 3, md: 4 }}>

          <Grid item xs={12} md={4}>

            <Box display="flex" alignItems="center" gap={1.5} mb={2}>

              <img src="/Logo2.png" alt="MEDI FLOW" className="h-10 w-auto" />

              <Typography variant="h6" fontWeight={700} letterSpacing={0.5}>

                MEDI FLOW

              </Typography>

            </Box>

            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.78)", lineHeight: 1.7, maxWidth: 320 }}>

              Smart healthcare management — appointments, AI-assisted symptom guidance, and connected care for patients

              and clinicians.

            </Typography>

            <Box display="flex" gap={0.5} mt={2}>

              <IconButton

                size="small"

                aria-label="Facebook"

                sx={{ color: "#fff", "&:hover": { color: brand.success } }}

              >

                <FacebookIcon fontSize="small" />

              </IconButton>

              <IconButton

                size="small"

                aria-label="Instagram"

                sx={{ color: "#fff", "&:hover": { color: brand.success } }}

              >

                <InstagramIcon fontSize="small" />

              </IconButton>

              <IconButton

                component="a"

                href={ZAYA.site}

                target="_blank"

                rel="noopener noreferrer"

                size="small"

                aria-label="Zaya Code Hub website"

                sx={{ color: "#fff", "&:hover": { color: brand.success } }}

              >

                <LinkedInIcon fontSize="small" />

              </IconButton>

            </Box>

          </Grid>



          <Grid item xs={6} sm={4} md={2}>

            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5, color: brand.success }}>

              Explore

            </Typography>

            <Box component="nav" display="flex" flexDirection="column" gap={1}>

              {quickLinks.map((link) => (

                <Link

                  key={link.to}

                  to={link.to}

                  className="text-sm text-white/80 hover:text-[#2fb297] transition-colors no-underline"

                >

                  {link.label}

                </Link>

              ))}

            </Box>

          </Grid>



          <Grid item xs={6} sm={4} md={2}>

            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5, color: brand.success }}>

              Patient care

            </Typography>

            <Box component="nav" display="flex" flexDirection="column" gap={1}>

              {careLinks.map((link) => (

                <Link

                  key={link.to}

                  to={link.to}

                  className="text-sm text-white/80 hover:text-[#2fb297] transition-colors no-underline"

                >

                  {link.label}

                </Link>

              ))}

            </Box>

          </Grid>



          <Grid item xs={12} sm={8} md={4}>

            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5, color: brand.success }}>

              {ZAYA.name}

            </Typography>

            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.78)", mb: 2, lineHeight: 1.6 }}>

              Designed, built, and maintained by <strong>{ZAYA.name}</strong> — {ZAYA.tagline}.

            </Typography>

            <Box display="flex" flexDirection="column" gap={1.25}>

              <Box display="flex" alignItems="flex-start" gap={1}>

                <LanguageOutlinedIcon sx={{ fontSize: 18, mt: 0.25, color: brand.success }} />

                <a

                  href={ZAYA.site}

                  target="_blank"

                  rel="noopener noreferrer"

                  className="text-sm text-white/90 hover:text-[#2fb297] no-underline break-all"

                >

                  {ZAYA.site.replace("https://", "")}

                </a>

              </Box>

              <Box display="flex" alignItems="flex-start" gap={1}>

                <EmailOutlinedIcon sx={{ fontSize: 18, mt: 0.25, color: brand.success }} />

                <a

                  href={`mailto:${ZAYA.email}`}

                  className="text-sm text-white/90 hover:text-[#2fb297] no-underline break-all"

                >

                  {ZAYA.email}

                </a>

              </Box>

              <Box display="flex" alignItems="flex-start" gap={1}>

                <LocationOnOutlinedIcon sx={{ fontSize: 18, mt: 0.25, color: brand.success }} />

                <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.85)" }}>

                  {ZAYA.location}

                </Typography>

              </Box>

            </Box>

          </Grid>

        </Grid>



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

          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.65)", textAlign: { xs: "left", sm: "right" } }}>

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


