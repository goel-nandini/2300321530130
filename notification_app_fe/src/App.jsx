import React, { useState, useEffect } from 'react';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Container,
  useMediaQuery,
  Tooltip,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Star as StarIcon,
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  MarkEmailRead as MarkReadIcon,
} from '@mui/icons-material';

import AllNotifications from './components/AllNotifications';
import PriorityNotifications from './components/PriorityNotifications';
import { fetchNotifications } from './api';

// ─── Theme ────────────────────────────────────────────────────────────────────
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary:   { main: '#6366f1' },
    secondary: { main: '#f59e0b' },
    success:   { main: '#22c55e' },
    background: {
      default: '#0f172a',
      paper:   '#1e293b',
    },
    text: {
      primary:   '#f8fafc',
      secondary: '#94a3b8',
    },
  },
  typography: {
    fontFamily: '"Outfit", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 700 },
    h6: { fontWeight: 600 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 8, textTransform: 'none', fontWeight: 600 },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 12, backgroundImage: 'none' },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontFamily: '"Outfit", sans-serif' },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          mx: 1,
          transition: 'background-color 0.2s ease',
          '&.Mui-selected': {
            backgroundColor: 'rgba(99, 102, 241, 0.15)',
            '&:hover': { backgroundColor: 'rgba(99, 102, 241, 0.25)' },
          },
        },
      },
    },
  },
});

const DRAWER_WIDTH = 248;

// ─── App ──────────────────────────────────────────────────────────────────────
function App() {
  const [activePage, setActivePage]   = useState('all');
  const [readIds, setReadIds]         = useState([]);
  const [totalCount, setTotalCount]   = useState(0);
  const [mobileOpen, setMobileOpen]   = useState(false);
  const isLargeScreen = useMediaQuery(darkTheme.breakpoints.up('md'));

  // Load persisted read IDs from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('viewed_notification_ids');
      if (stored) setReadIds(JSON.parse(stored));
    } catch (err) {
      console.error('Failed to load read state:', err);
    }
  }, []);

  // Fetch total count for unread badge calculation
  useEffect(() => {
    fetchNotifications({ limit: 100, page: 1 })
      .then(res => setTotalCount(res.totalCount ?? res.notifications?.length ?? 0))
      .catch(() => {});
  }, []);

  const unreadCount = Math.max(0, totalCount - readIds.length);

  const handleDrawerToggle = () => setMobileOpen(prev => !prev);

  const navigateTo = (page) => {
    setActivePage(page);
    setMobileOpen(false);
  };

  // ─── Drawer Content ─────────────────────────────────────────────────────────
  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Brand */}
      <Toolbar sx={{ px: 2.5 }}>
        <Badge badgeContent={unreadCount > 0 ? unreadCount : null} color="error" max={99}>
          <NotificationsIcon color="primary" sx={{ fontSize: 28 }} />
        </Badge>
        <Typography
          variant="h6"
          color="primary"
          sx={{ ml: 1.5, letterSpacing: '-0.3px', fontWeight: 700 }}
        >
          NotifyCore
        </Typography>
      </Toolbar>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />

      <List sx={{ px: 1.5, pt: 1.5, flexGrow: 1 }}>
        {/* All Notifications */}
        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton
            selected={activePage === 'all'}
            onClick={() => navigateTo('all')}
            sx={{ borderRadius: 2 }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              <Badge badgeContent={unreadCount > 0 ? unreadCount : null} color="error" max={99}>
                <DashboardIcon
                  fontSize="small"
                  sx={{ color: activePage === 'all' ? 'primary.main' : 'text.secondary' }}
                />
              </Badge>
            </ListItemIcon>
            <ListItemText
              primary="Inbox"
              primaryTypographyProps={{
                fontWeight: activePage === 'all' ? 700 : 500,
                color: activePage === 'all' ? 'primary.main' : 'text.primary',
                fontSize: '0.925rem',
              }}
            />
          </ListItemButton>
        </ListItem>

        {/* Priority Board */}
        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton
            selected={activePage === 'priority'}
            onClick={() => navigateTo('priority')}
            sx={{ borderRadius: 2 }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              <StarIcon
                fontSize="small"
                sx={{ color: activePage === 'priority' ? 'secondary.main' : 'text.secondary' }}
              />
            </ListItemIcon>
            <ListItemText
              primary="Priority Board"
              primaryTypographyProps={{
                fontWeight: activePage === 'priority' ? 700 : 500,
                color: activePage === 'priority' ? 'secondary.main' : 'text.primary',
                fontSize: '0.925rem',
              }}
            />
          </ListItemButton>
        </ListItem>
      </List>

      {/* Footer */}
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          Notification Priority System
        </Typography>
        <Typography display="block" variant="caption" color="text.secondary" sx={{ mt: 0.25 }}>
          Stage 2 · v1.0.0
        </Typography>
      </Box>
    </Box>
  );

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'background.default' }}>

        {/* ── Top AppBar ── */}
        <AppBar
          position="fixed"
          elevation={0}
          sx={{
            width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
            ml:    { md: `${DRAWER_WIDTH}px` },
            backdropFilter: 'blur(12px)',
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' } }}
              aria-label="open navigation menu"
            >
              <MenuIcon />
            </IconButton>

            <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
              {activePage === 'all' ? 'Inbox' : 'Priority Board'}
            </Typography>

            {/* Unread count summary */}
            {unreadCount > 0 && (
              <Tooltip title={`${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`}>
                <Badge badgeContent={unreadCount} color="error" max={99} sx={{ mr: 1 }}>
                  <NotificationsIcon color="action" />
                </Badge>
              </Tooltip>
            )}
            {unreadCount === 0 && (
              <Tooltip title="All caught up!">
                <MarkReadIcon sx={{ color: 'success.main' }} />
              </Tooltip>
            )}
          </Toolbar>
        </AppBar>

        {/* ── Sidebar ── */}
        <Box
          component="nav"
          sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
        >
          {/* Mobile temporary drawer */}
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{
              display: { xs: 'block', md: 'none' },
              '& .MuiDrawer-paper': {
                width: DRAWER_WIDTH,
                backgroundColor: 'background.paper',
                borderRight: '1px solid rgba(255,255,255,0.07)',
              },
            }}
          >
            {drawerContent}
          </Drawer>

          {/* Desktop permanent drawer */}
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', md: 'block' },
              '& .MuiDrawer-paper': {
                width: DRAWER_WIDTH,
                backgroundColor: 'background.paper',
                borderRight: '1px solid rgba(255,255,255,0.07)',
              },
            }}
            open
          >
            {drawerContent}
          </Drawer>
        </Box>

        {/* ── Main Panel ── */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            minHeight: '100vh',
            backgroundColor: 'background.default',
            width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          }}
        >
          <Toolbar />
          <Container maxWidth="lg" sx={{ py: 4 }}>
            {activePage === 'all' ? (
              <AllNotifications readIds={readIds} setReadIds={setReadIds} />
            ) : (
              <PriorityNotifications readIds={readIds} setReadIds={setReadIds} />
            )}
          </Container>
        </Box>

      </Box>
    </ThemeProvider>
  );
}

export default App;
