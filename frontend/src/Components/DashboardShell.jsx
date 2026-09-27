import React, { useState, useEffect } from "react";
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  TextField,
  InputAdornment,
  Paper,
  ListItem,
  Divider,
} from "@mui/material";
import { Menu, Bell, Search, LogOut } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { brand } from "../theme/brand";

const drawerWidth = 260;

export default function DashboardShell({
  title,
  menuItems,
  children,
  searchEnabled = true,
}) {
  const [open, setOpen] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((r) => setNotifications(r.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!searchEnabled || searchQ.length < 2) {
      setSearchResults(null);
      return;
    }
    const t = setTimeout(() => {
      const token = localStorage.getItem("token");
      axios
        .get(`${import.meta.env.VITE_API_URL}/api/search`, {
          params: { q: searchQ },
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((r) => setSearchResults(r.data))
        .catch(() => setSearchResults(null));
    }, 300);
    return () => clearTimeout(t);
  }, [searchQ, searchEnabled]);

  const unread = notifications.filter((n) => !n.read).length;

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: brand.lightBg }}>
      <AppBar
        position="fixed"
        sx={{
          zIndex: (t) => t.zIndex.drawer + 1,
          bgcolor: brand.primary,
        }}
      >
        <Toolbar>
          <IconButton color="inherit" onClick={() => setOpen(!open)} edge="start">
            <Menu size={22} />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, ml: 1 }}>
            {title}
          </Typography>
          {searchEnabled && (
            <TextField
              size="small"
              placeholder="Search patients or appointments..."
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              sx={{
                mr: 2,
                width: 280,
                bgcolor: "rgba(255,255,255,0.15)",
                borderRadius: 1,
                input: { color: "white" },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={18} color="white" />
                  </InputAdornment>
                ),
              }}
            />
          )}
          <IconButton color="inherit" onClick={() => setShowNotifs(!showNotifs)}>
            <Badge badgeContent={unread} color="error">
              <Bell size={22} />
            </Badge>
          </IconButton>
          <IconButton color="inherit" onClick={logout}>
            <LogOut size={22} />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="persistent"
        open={open}
        sx={{
          width: open ? drawerWidth : 0,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
            mt: 8,
            borderRight: "none",
            bgcolor: brand.primary,
            color: "white",
          },
        }}
      >
        <List sx={{ pt: 2 }}>
          {menuItems.map((item) => (
            <ListItemButton
              key={item.path}
              selected={location.pathname === item.path}
              onClick={() => item.path !== "#" && navigate(item.path)}
              sx={{
                mx: 1,
                borderRadius: 2,
                mb: 0.5,
                "&.Mui-selected": { bgcolor: "rgba(255,255,255,0.15)" },
              }}
            >
              <ListItemIcon sx={{ color: "inherit", minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.name} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8, ml: open ? 0 : 0 }}>
        {showNotifs && (
          <Paper sx={{ mb: 2, p: 2, maxWidth: 420 }}>
            <Typography variant="subtitle1" fontWeight={600}>
              Notifications
            </Typography>
            <Divider sx={{ my: 1 }} />
            {notifications.length === 0 ? (
              <Typography variant="body2" color="text.secondary">No notifications</Typography>
            ) : (
              notifications.slice(0, 8).map((n) => (
                <ListItem key={n._id || n.id} dense>
                  <ListItemText primary={n.title} secondary={n.body} />
                </ListItem>
              ))
            )}
          </Paper>
        )}
        {searchResults && (
          <Paper sx={{ mb: 2, p: 2 }}>
            <Typography variant="subtitle2">Search results</Typography>
            {(searchResults.patients || []).map((p) => (
              <Typography key={p._id} variant="body2">
                Patient: {p.name} ({p.email})
              </Typography>
            ))}
            {(searchResults.appointments || []).map((a) => (
              <Typography key={a._id} variant="body2">
                Appt {a.indexno}: {a.name} — {a.status}
              </Typography>
            ))}
          </Paper>
        )}
        {children}
      </Box>
    </Box>
  );
}
