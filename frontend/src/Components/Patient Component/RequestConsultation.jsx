import React, { useState, useEffect } from "react";
import Nav from "../Nav Component/Nav";
import { usePatientPortal } from "./PatientPortalContext";
import axios from "axios";
import { Container, Typography, TextField, Button, Alert, MenuItem, Box, CircularProgress } from "@mui/material";
import { brand } from "../../theme/brand";
import { pageTitleSx, pageContainerSx } from "../../theme/responsive";
import { apiUrl } from "../../utils/apiBase";
import { fetchPublicDoctors } from "../../utils/doctorsApi";
import { isPatientSession } from "../../utils/auth";
import PatientLoginGate from "./PatientLoginGate";

function RequestConsultation() {
  const inPortal = usePatientPortal();
  const patientLoggedIn = isPatientSession();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    doctorName: "General Consultation",
    specialization: "General Practice",
    date: "",
    time: "10:00",
    user_id: "",
    doctor_id: "",
  });
  const [doctors, setDoctors] = useState([]);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(false);

  useEffect(() => {
    if (!patientLoggedIn) {
      setLoadingDoctors(false);
      return;
    }
    setLoadingDoctors(true);
    fetchPublicDoctors()
      .then((list) => setDoctors(list))
      .catch(() => setErr("Could not load doctors. Try again later."))
      .finally(() => setLoadingDoctors(false));
  }, [patientLoggedIn]);

  useEffect(() => {
    if (!patientLoggedIn) return;
    const token = localStorage.getItem("token");
    if (!token) return;
    setLoadingProfile(true);
    axios
      .get(apiUrl("/api/users/profile"), { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => {
        const u = r.data;
        setForm((prev) => ({
          ...prev,
          name: u.name || prev.name,
          email: u.email || prev.email,
          phone: u.mobile || prev.phone,
          address: u.city || u.country || prev.address,
          user_id: u._id || u.id || localStorage.getItem("userId") || "",
        }));
      })
      .catch(() => {})
      .finally(() => setLoadingProfile(false));
  }, [patientLoggedIn]);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setMsg("");
    if (!patientLoggedIn) {
      setErr("Please log in or create a patient account first.");
      return;
    }
    try {
      const payload = {
        ...form,
        doctor_id: form.doctor_id || doctors[0]?._id || doctors[0]?.id,
        doctorName: form.doctorName,
        user_id: localStorage.getItem("userId") || form.user_id,
      };
      if (!payload.user_id) {
        setErr("Please log in as a patient first.");
        return;
      }
      if (!payload.doctor_id) {
        setErr("No verified doctors available yet. Contact support or try again later.");
        return;
      }
      await axios.post(apiUrl("/api/appoinment"), payload);
      setMsg("Consultation request submitted. Status: Pending.");
    } catch (error) {
      setErr(error.response?.data?.message || "Could not submit request.");
    }
  };

  const gate = (
    <PatientLoginGate
      title="Sign in to request a consultation"
      message="Create a free patient account or log in to request a consultation with our verified doctors. Guest users cannot submit consultation requests."
    />
  );

  const formBlock = loadingProfile || loadingDoctors ? (
    <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
      <CircularProgress sx={{ color: brand.primary }} />
    </Box>
  ) : (
    <>
      {msg && <Alert severity="success" sx={{ mb: 2 }}>{msg}</Alert>}
      {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}
      <form onSubmit={submit} className="space-y-3">
        <TextField label="Full name" fullWidth required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <TextField label="Email" fullWidth required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <TextField label="Phone" fullWidth required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <TextField label="Address" fullWidth required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        <TextField
          select
          label="Doctor"
          fullWidth
          value={form.doctorName}
          onChange={(e) => {
            const d = doctors.find((x) => x.name === e.target.value);
            setForm({
              ...form,
              doctorName: e.target.value,
              specialization: d?.specialization || form.specialization,
              doctor_id: d?._id || d?.id,
            });
          }}
        >
          {doctors.length === 0 ? (
            <MenuItem value="General Consultation" disabled>No doctors loaded</MenuItem>
          ) : (
            doctors.map((d) => (
              <MenuItem key={d._id || d.id} value={d.name}>
                {d.name} — {d.specialization}
              </MenuItem>
            ))
          )}
        </TextField>
        <TextField label="Preferred date" type="date" fullWidth required InputLabelProps={{ shrink: true }} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        <TextField label="Preferred time" fullWidth value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
        <Button type="submit" variant="contained" fullWidth sx={{ bgcolor: brand.success, py: 1.5 }}>
          Submit request
        </Button>
      </form>
    </>
  );

  const inner = (
    <Container maxWidth="sm" disableGutters={inPortal} sx={{ py: inPortal ? 0 : { xs: 2, md: 4 }, px: inPortal ? 0 : { xs: 2, sm: 3 } }}>
      <Box sx={pageContainerSx}>
        {!patientLoggedIn ? (
          gate
        ) : (
          <>
            <Typography variant="h4" sx={{ ...pageTitleSx, color: brand.primary, mb: 2 }}>
              Request a Consultation
            </Typography>
            {formBlock}
          </>
        )}
      </Box>
    </Container>
  );

  if (inPortal) return inner;
  return (
    <div className="min-h-screen bg-[#f4f6fb]">
      <Nav />
      {inner}
    </div>
  );
}

export default RequestConsultation;
