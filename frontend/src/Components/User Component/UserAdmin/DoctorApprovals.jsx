import React, { useCallback, useEffect, useState } from "react";
import UAdminLayout from "./UAdminLayout";
import axios from "axios";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  CircularProgress,
  Tabs,
  Tab,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from "@mui/material";

import { apiUrl } from "../../../utils/apiBase";
import { getUserFacingApiError } from "../../../utils/apiErrors";

function statusChip(status) {
  const s = (status || "approved").toLowerCase();
  const color = s === "approved" ? "success" : s === "pending" ? "warning" : "error";
  return <Chip size="small" label={s} color={color} />;
}

function DoctorApprovals() {
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState([]);
  const [error, setError] = useState("");
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  const headers = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const url =
        tab === 0
          ? apiUrl("/api/admin/doctors/pending")
          : apiUrl("/api/admin/doctors");
      const res = await axios.get(url, { headers: headers() });
      setDoctors(res.data || []);
    } catch (e) {
      setError(getUserFacingApiError(e, "Could not load doctors. Please try again."));
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    load();
  }, [load]);

  const patchApproval = async (id, status, rejectionReason) => {
    setActionLoading(id);
    try {
      await axios.patch(
        apiUrl(`/api/admin/doctors/${id}/approval`),
        { status, rejectionReason },
        { headers: headers() }
      );
      await load();
    } catch (e) {
      setError(getUserFacingApiError(e, "That action could not be completed. Please try again."));
    } finally {
      setActionLoading(null);
      setRejectOpen(false);
      setRejectTarget(null);
      setRejectReason("");
    }
  };

  const openReject = (doc) => {
    setRejectTarget(doc);
    setRejectReason("");
    setRejectOpen(true);
  };

  const rows = tab === 0 ? doctors : doctors;

  return (
    <UAdminLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ color: "#2b2c6c", fontWeight: 500, mb: 1 }}>
          Doctor verification
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Approve doctor registrations before they appear to patients in Find a Doctor, booking, and the medical assistant.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
          <Tab label="Pending approval" />
          <Tab label="All doctors" />
        </Tabs>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress sx={{ color: "#e6317d" }} />
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Specialization</TableCell>
                  <TableCell>Experience</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      {tab === 0 ? "No doctors waiting for approval." : "No doctors in the system."}
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((d) => {
                    const id = d.id || d._id;
                    const status = d.approvalStatus || d.approval_status || "approved";
                    return (
                      <TableRow key={id} hover>
                        <TableCell>{d.name}</TableCell>
                        <TableCell>{d.email}</TableCell>
                        <TableCell>{d.specialization}</TableCell>
                        <TableCell>{d.experience} yrs</TableCell>
                        <TableCell>{statusChip(status)}</TableCell>
                        <TableCell align="right">
                          {status === "pending" && (
                            <>
                              <Button
                                size="small"
                                variant="contained"
                                color="success"
                                disabled={actionLoading === id}
                                onClick={() => patchApproval(id, "approved")}
                                sx={{ mr: 1 }}
                              >
                                Approve
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                disabled={actionLoading === id}
                                onClick={() => openReject(d)}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                          {status === "approved" && (
                            <Button
                              size="small"
                              color="warning"
                              disabled={actionLoading === id}
                              onClick={() => patchApproval(id, "pending")}
                            >
                              Revoke
                            </Button>
                          )}
                          {status === "rejected" && (
                            <Button
                              size="small"
                              variant="contained"
                              disabled={actionLoading === id}
                              onClick={() => patchApproval(id, "approved")}
                            >
                              Approve
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Dialog open={rejectOpen} onClose={() => setRejectOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Reject doctor registration</DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ mb: 2 }}>
              {rejectTarget?.name} ({rejectTarget?.email})
            </Typography>
            <TextField
              fullWidth
              multiline
              minRows={2}
              label="Reason (shown to doctor on login)"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRejectOpen(false)}>Cancel</Button>
            <Button
              color="error"
              variant="contained"
              onClick={() =>
                patchApproval(rejectTarget?.id || rejectTarget?._id, "rejected", rejectReason)
              }
            >
              Reject
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </UAdminLayout>
  );
}

export default DoctorApprovals;
