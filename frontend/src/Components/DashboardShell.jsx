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

  useMediaQuery,

  useTheme,

} from "@mui/material";

import { Menu, Bell, Search, LogOut } from "lucide-react";

import { useNavigate, useLocation } from "react-router-dom";

import axios from "axios";

import { brand } from "../theme/brand";
import { apiUrl } from "../utils/apiBase";

import { logout as clearAuth } from "../utils/auth";



const drawerWidth = 260;



export default function DashboardShell({

  title,

  menuItems,

  children,

  searchEnabled = true,

}) {

  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [open, setOpen] = useState(false);

  const [notifications, setNotifications] = useState([]);

  const [showNotifs, setShowNotifs] = useState(false);

  const [searchQ, setSearchQ] = useState("");

  const [searchResults, setSearchResults] = useState(null);

  const navigate = useNavigate();

  const location = useLocation();



  useEffect(() => {

    setOpen(!isMobile);

  }, [isMobile]);



  useEffect(() => {

    if (isMobile) setOpen(false);

  }, [location.pathname, isMobile]);



  useEffect(() => {

    const token = localStorage.getItem("token");

    if (!token) return;

    axios

      .get(apiUrl("/api/notifications"), {

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

        .get(apiUrl("/api/search"), {

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

    const wasDoctor = sessionStorage.getItem("doctor");

    clearAuth();

    navigate(wasDoctor ? "/login-doctor" : "/login");

  };



  const goTo = (path) => {

    if (path !== "#") navigate(path);

    if (isMobile) setOpen(false);

  };



  const displayTitle = isMobile && title?.length > 18 ? "MEDI FLOW" : title;



  const drawerPaperSx = {

    width: drawerWidth,

    boxSizing: "border-box",

    mt: { xs: 7, sm: 8 },

    borderRight: "none",

    bgcolor: brand.primary,

    color: "white",

    height: { xs: "calc(100dvh - 56px)", sm: "calc(100dvh - 64px)" },

  };



  return (

    <Box

      sx={{

        display: "flex",

        minHeight: "100dvh",

        bgcolor: brand.lightBg,

        width: "100%",

        maxWidth: "100vw",

        overflowX: "hidden",

      }}

    >

      <AppBar

        position="fixed"

        sx={{ zIndex: (t) => t.zIndex.drawer + 1, bgcolor: brand.primary }}

      >

        <Toolbar sx={{ minHeight: { xs: 56, sm: 64 }, px: { xs: 1, sm: 2 } }}>

          <IconButton color="inherit" onClick={() => setOpen(!open)} edge="start" aria-label="Open menu">

            <Menu size={22} />

          </IconButton>

          <Typography

            variant="h6"

            noWrap

            sx={{

              flexGrow: 1,

              ml: 0.5,

              fontSize: { xs: "0.95rem", sm: "1.1rem", md: "1.25rem" },

            }}

          >

            {displayTitle}

          </Typography>

          {searchEnabled && !isMobile && (

            <TextField

              size="small"

              placeholder="Search patients or appointments..."

              value={searchQ}

              onChange={(e) => setSearchQ(e.target.value)}

              sx={{

                mr: 2,

                width: { md: 220, lg: 280 },

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

          <IconButton color="inherit" onClick={() => setShowNotifs(!showNotifs)} aria-label="Notifications">

            <Badge badgeContent={unread} color="error">

              <Bell size={22} />

            </Badge>

          </IconButton>

          <IconButton color="inherit" onClick={logout} aria-label="Log out">

            <LogOut size={22} />

          </IconButton>

        </Toolbar>

      </AppBar>



      <Drawer

        variant={isMobile ? "temporary" : "persistent"}

        open={open}

        onClose={() => setOpen(false)}

        ModalProps={{ keepMounted: true }}

        sx={{

          flexShrink: 0,

          ...(isMobile

            ? {}

            : {

                width: open ? drawerWidth : 0,

              }),

          [`& .MuiDrawer-paper`]: {
            ...drawerPaperSx,
            width: isMobile ? "82vw" : drawerWidth,
            maxWidth: "320px",
          },

        }}

      >

        <List sx={{ pt: 1, pb: 2 }}>

          {menuItems.map((item) => (

            <ListItemButton

              key={item.path}

              selected={location.pathname === item.path}

              onClick={() => goTo(item.path)}

              sx={{

                mx: 1,

                borderRadius: 2,

                mb: 0.5,

                py: { xs: 1.25, md: 1 },

                "&.Mui-selected": { bgcolor: "rgba(255,255,255,0.15)" },

              }}

            >

              <ListItemIcon sx={{ color: "inherit", minWidth: 36 }}>{item.icon}</ListItemIcon>

              <ListItemText

                primary={item.name}

                primaryTypographyProps={{ fontSize: { xs: "0.9rem", md: "1rem" } }}

              />

            </ListItemButton>

          ))}

        </List>

      </Drawer>



      <Box

        component="main"

        sx={{

          flexGrow: 1,

          width: isMobile ? "100%" : open ? `calc(100% - ${drawerWidth}px)` : "100%",

          maxWidth: "100%",

          minWidth: 0,

          overflowX: "hidden",

          p: { xs: 1.5, sm: 2, md: 3 },

          mt: { xs: 7, sm: 8 },

          boxSizing: "border-box",

        }}

      >

        {showNotifs && (

          <Paper sx={{ mb: 2, p: 2, width: "100%", maxWidth: { xs: "100%", sm: 420 } }}>

            <Typography variant="subtitle1" fontWeight={600}>Notifications</Typography>

            <Divider sx={{ my: 1 }} />

            {notifications.length === 0 ? (

              <Typography variant="body2" color="text.secondary">No notifications</Typography>

            ) : (

              notifications.slice(0, 8).map((n) => (

                <ListItem key={n._id || n.id} dense sx={{ px: 0 }}>

                  <ListItemText

                    primary={n.title}

                    secondary={n.body}

                    primaryTypographyProps={{ variant: "body2" }}

                    secondaryTypographyProps={{ variant: "caption" }}

                  />

                </ListItem>

              ))

            )}

          </Paper>

        )}

        {searchResults && (

          <Paper sx={{ mb: 2, p: 2, overflowX: "auto" }}>

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


