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
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Star as StarIcon,
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';

import AllNotifications from './components/AllNotifications';
import PriorityNotifications from './components/PriorityNotifications';

// Define a premium dark theme
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#6366f1', // Sleek indigo
    },
    secondary: {
      main: '#f59e0b', // Accent gold
    },
    background: {
      default: '#0f172a', // Slate 900 dark background
      paper: '#1e293b',   // Slate 800 surfaces
    },
    text: {
      primary: '#f8fafc',
      secondary: '#94a3b8',
    },
  },
  typography: {
    fontFamily: '"Outfit", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundImage: 'none',
        },
      },
    },
  },
});

const DRAWER_WIDTH = 240;

function App() {
  const [activePage, setActivePage] = useState('all'); // 'all' or 'priority'
  const [readIds, setReadIds] = useState([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isLargeScreen = useMediaQuery(darkTheme.breakpoints.up('md'));

  // Load read notifications from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('viewed_notification_ids');
      if (stored) {
        setReadIds(JSON.parse(stored));
      }
    } catch (err) {
      console.error('Failed to load read notification state:', err);
    }
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const navigateTo = (page) => {
    setActivePage(page);
    setMobileOpen(false);
  };

  // Drawer menu content
  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar>
        <Typography variant="h6" color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <NotificationsIcon color="primary" />
          NotifyCore
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton selected={activePage === 'all'} onClick={() => navigateTo('all')}>
            <ListItemIcon>
              <DashboardIcon color={activePage === 'all' ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText primary="All Notifications" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton selected={activePage === 'priority'} onClick={() => navigateTo('priority')}>
            <ListItemIcon>
              <StarIcon color={activePage === 'priority' ? 'secondary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText primary="Priority Board" />
          </ListItemButton>
        </ListItem>
      </List>
      <Box sx={{ flexGrow: 1 }} />
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          v1.0.0 • Stage 2 App
        </Typography>
      </Box>
    </Box>
  );

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        {/* AppBar header */}
        <AppBar
          position="fixed"
          sx={{
            width: isLargeScreen ? `calc(100% - ${DRAWER_WIDTH}px)` : '100%',
            ml: isLargeScreen ? `${DRAWER_WIDTH}px` : 0,
            backdropFilter: 'blur(8px)',
            backgroundColor: 'rgba(30, 41, 59, 0.8)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: 'none',
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: isLargeScreen ? 'none' : 'block' }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              {activePage === 'all' ? 'All Notifications' : 'Priority Board'}
            </Typography>
          </Toolbar>
        </AppBar>

        {/* Sidebar / Drawer Navigation */}
        <Box
          component="nav"
          sx={{ width: isLargeScreen ? DRAWER_WIDTH : 0, flexShrink: 0 }}
        >
          {/* Mobile drawer */}
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }} // Better open performance on mobile
            sx={{
              display: { xs: 'block', md: 'none' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
            }}
          >
            {drawerContent}
          </Drawer>

          {/* Desktop drawer */}
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', md: 'block' },
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: DRAWER_WIDTH,
                borderRight: '1px solid rgba(255, 255, 255, 0.08)',
              },
            }}
            open
          >
            {drawerContent}
          </Drawer>
        </Box>

        {/* Main Panel */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: isLargeScreen ? `calc(100% - ${DRAWER_WIDTH}px)` : '100%',
          }}
        >
          <Toolbar /> {/* Spacer to push contents down below AppBar */}
          <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
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
