import React, { useState } from "react";
import Nav from "../Nav Component/Nav";
import { usePatientPortal } from "./PatientPortalContext";
import axios from "axios";
import { Container, Typography, TextField, Button, Alert, MenuItem } from "@mui/material";
import { brand } from "../../theme/brand";

function RequestConsultation() {
  const inPortal = usePatientPortal();
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

  React.useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/api/doctor/public`).then((r) => setDoctors(r.data || []));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setMsg("");
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
        setErr("No doctors in database. Run db:seed first.");
        return;
      }
      await axios.post(`${import.meta.env.VITE_API_URL}/api/appoinment`, payload);
      setMsg("Consultation request submitted. Status: Pending.");
    } catch (error) {
      setErr(error.response?.data?.message || "Could not submit request.");
    }
  };

  const inner = (
      <Container maxWidth="sm" sx={{ py: inPortal ? 0 : 4 }}>
        <Typography variant="h4" fontWeight={700} sx={{ color: brand.primary, mb: 2 }}>
          Request a Consultation
        </Typography>
        {msg && <Alert severity="success" sx={{ mb: 2 }}>{msg}</Alert>}
        {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}
        <form onSubmit={submit} className="space-y-3">
          <TextField label="Full name" fullWidth required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <TextField label="Email" fullWidth required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <TextField label="Phone" fullWidth required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <TextField label="Address" fullWidth required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <TextField select label="Doctor" fullWidth value={form.doctorName} onChange={(e) => {
            const d = doctors.find((x) => x.name === e.target.value);
            setForm({
              ...form,
              doctorName: e.target.value,
              specialization: d?.specialization || form.specialization,
              doctor_id: d?._id || d?.id,
            });
          }}>
            {doctors.map((d) => (
              <MenuItem key={d._id} value={d.name}>{d.name} — {d.specialization}</MenuItem>
            ))}
          </TextField>
          <TextField label="Preferred date" type="date" fullWidth required InputLabelProps={{ shrink: true }} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          <TextField label="Preferred time" fullWidth value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
          <Button type="submit" variant="contained" fullWidth sx={{ bgcolor: brand.success, py: 1.5 }}>
            Submit request
          </Button>
        </form>
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
