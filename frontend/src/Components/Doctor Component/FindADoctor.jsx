import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Nav from "../Nav Component/Nav";
import { usePatientPortal } from "../Patient Component/PatientPortalContext";
import { fetchPublicDoctors } from "../../utils/doctorsApi";
import Footer from "../Nav Component/Footer";
import { Box, Container, Grid, Card, CardContent, Typography, Chip, Button, TextField, Avatar } from "@mui/material";
import { brand } from "../../theme/brand";
import EmptyState from "../EmptyState";

function FindADoctor() {
  const inPortal = usePatientPortal();
  const [doctors, setDoctors] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    fetchPublicDoctors()
      .then((list) => {
        setDoctors(list);
        setLoadError("");
      })
      .catch(() => {
        setDoctors([]);
        setLoadError("We could not load doctors right now. Please refresh or try again shortly.");
      })
      .finally(() => setLoading(false));
  }, []);

  const list = doctors.filter(
    (d) =>
      !filter ||
      d.name?.toLowerCase().includes(filter.toLowerCase()) ||
      d.specialization?.toLowerCase().includes(filter.toLowerCase())
  );

  const content = (
      <Container maxWidth="lg" sx={{ py: inPortal ? 0 : 6 }}>
        <Typography variant="h4" fontWeight={700} sx={{ color: brand.primary, mb: 1 }}>
          Find a Doctor
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Search by name or specialization and book an appointment in one click.
        </Typography>
        <TextField
          fullWidth
          placeholder="Search doctors..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          sx={{ mb: 4, maxWidth: 480 }}
        />
        {loadError && (
          <Typography color="error" sx={{ mb: 2 }}>
            {loadError}
          </Typography>
        )}
        {loading ? (
          <Typography>Loading doctors...</Typography>
        ) : list.length === 0 ? (
          <EmptyState
            title="No doctors found"
            message={
              loadError ||
              "No verified doctors match your search yet. Try another name or specialization."
            }
          />
        ) : (
          <Grid container spacing={3}>
            {list.map((doc) => (
              <Grid item xs={12} sm={6} md={4} key={doc._id || doc.id}>
                <Card sx={{ borderRadius: 3, height: "100%" }}>
                  <CardContent>
                    <Box display="flex" gap={2} alignItems="center" mb={2}>
                      <Avatar sx={{ bgcolor: brand.success, width: 56, height: 56 }}>
                        {doc.name?.charAt(3) || "D"}
                      </Avatar>
                      <Box>
                        <Typography fontWeight={600}>{doc.name}</Typography>
                        <Chip label={doc.specialization} size="small" sx={{ mt: 0.5 }} />
                      </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {doc.experience} years experience · {doc.availability}
                    </Typography>
                    <Button
                      component={Link}
                      to={`/Book-Appointment?doctorId=${doc._id || doc.id}&doctorName=${encodeURIComponent(doc.name)}&specialization=${encodeURIComponent(doc.specialization)}`}
                      variant="contained"
                      fullWidth
                      sx={{ mt: 2, bgcolor: brand.primary }}
                    >
                      Book appointment
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
  );

  if (inPortal) return content;
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#f4f6fb] to-white">
      <Nav />
      <div className="flex-grow">{content}</div>
      <Footer />
    </div>
  );
}

export default FindADoctor;
