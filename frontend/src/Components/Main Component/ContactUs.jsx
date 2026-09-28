import React, { useState } from "react";
import { TextField, Button, Typography, Box, Paper, Grid } from "@mui/material";
import Nav from "../Nav Component/Nav";
import Footer from "../Nav Component/Footer";

function ContactUs() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate form submission
    setSuccessMessage("Thank you for contacting us! We will get back to you soon.");
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <div className="mf-page flex flex-col min-h-screen">
      <Nav />
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f9fafc",
          px: { xs: 2, sm: 3 },
          py: { xs: 3, sm: 4 },
          width: "100%",
          minWidth: 0,
        }}
      >
        <Paper
          elevation={6}
          sx={{
            p: { xs: 2.5, sm: 4 },
            borderRadius: 3,
            maxWidth: 600,
            width: "100%",
            minWidth: 0,
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              mb: { xs: 2, sm: 3 },
              textAlign: "center",
              color: "#2b2c6c",
              fontSize: { xs: "1.5rem", sm: "2rem" },
            }}
          >
            Contact Us
          </Typography>
          <Typography
            variant="body1"
            sx={{
              marginBottom: 3,
              textAlign: "center",
              color: "#71717d",
            }}
          >
            Have questions or need help? Fill out the form below, and we’ll get back to you as soon as possible.
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              margin="normal"
              multiline
              rows={4}
              required
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{
                marginTop: 2,
                backgroundColor: "#2b2c6c",
                "&:hover": { backgroundColor: "#1e1f4b" },
              }}
            >
              Submit
            </Button>
          </form>
          {successMessage && (
            <Typography
              variant="body2"
              sx={{
                marginTop: 2,
                textAlign: "center",
                color: "#2fb297",
              }}
            >
              {successMessage}
            </Typography>
          )}
        </Paper>
      </Box>
      <Footer />
    </div>
  );
}

export default ContactUs;
