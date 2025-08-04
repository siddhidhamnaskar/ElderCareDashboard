import React, { useState } from 'react';
import { styled } from '@mui/material/styles';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Dashboard as DashboardIcon,
  Business as BusinessIcon,
  MeetingRoom as RoomIcon,
  Sensors as SensorIcon,
  Logout as LogoutIcon,
  AccountCircle as AccountCircleIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  Visibility as VisibilityIcon,
  AdminPanelSettings as SuperAdminIcon,
  Gamepad as GamepadIcon,
  Score as ScoreIcon,
  Assessment as ReportIcon,
  SportsEsports as GameSessionIcon,
  PlayArrow as GameManagerIcon,
  EmojiEvents as GameResultsIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import UserSensors from './UserSensors';
import GameDevices from './GameDevices';





const drawerWidth = 240;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${drawerWidth}px`,
    ...(open && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    }),
  }),
);

const AppBarStyled = styled(AppBar, { shouldForwardProp: (prop) => prop !== 'open' && prop !== 'isadmin' })(
  ({ theme, open, isadmin }) => ({
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    ...(isadmin && open && {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: `${drawerWidth}px`,
      transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
    }),
    ...(!isadmin && {
      width: '100%',
      marginLeft: 0,
    }),
  }),
);

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'space-between',
}));

export default function Layout({ children, onLogout, userInfo }) {
  const [open, setOpen] = useState(() => {
    // Get sidebar state from localStorage, default to false (closed)
    const savedState = localStorage.getItem('sidebarOpen');
    return savedState ? JSON.parse(savedState) : false;
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerToggle = () => {
    const newState = !open;
    setOpen(newState);
    // Save sidebar state to localStorage
    localStorage.setItem('sidebarOpen', JSON.stringify(newState));
  };

  const handleDrawerOpen = () => {
    setOpen(true);
    localStorage.setItem('sidebarOpen', 'true');
  };

  const handleDrawerClose = () => {
    setOpen(false);
    localStorage.setItem('sidebarOpen', 'false');
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleProfileMenuClose();
    localStorage.removeItem('userId')
    onLogout();
    navigate('/login');
  };

  const isProfileMenuOpen = Boolean(anchorEl);

  // Get current user info from localStorage for super admin check
  const getCurrentUserInfo = () => {
    try {
      const userInfo = localStorage.getItem('userInfo');
      return userInfo ? JSON.parse(userInfo) : null;
    } catch (error) {
      console.error('Error parsing user info:', error);
      return null;
    }
  };

  const currentUser = getCurrentUserInfo();
  const SUPER_ADMIN_EMAILS = ['sd@gvc.in', 'admin@example.com', 'superadmin@example.com'];
  const isSuperAdmin = currentUser?.email ? SUPER_ADMIN_EMAILS.includes(currentUser.email) : false;

  // Define menu items conditionally based on user role
  let menuItems = [];
  if (userInfo?.isAdmin) {
    menuItems = [
      { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
      { text: 'Devices', icon: <BusinessIcon />, path: '/devices' },
      // { text: 'Rooms', icon: <RoomIcon />, path: '/rooms' },
      { text: 'Sensors', icon: <SensorIcon />, path: '/sensors' },
      { text: 'Sensors Live', icon: <VisibilityIcon />, path: '/sensors-live' },
      { text: 'Report', icon: <AssessmentIcon />, path: '/transactions' },
      { text: 'Game Devices', icon: <GamepadIcon />, path: '/game-devices' },
      { text: 'Game Session Setup', icon: <GameSessionIcon />, path: '/game-session-setup' },
      { text: 'Game Session Manager', icon: <GameManagerIcon />, path: '/game-session-manager' },
      { text: 'Game Results', icon: <GameResultsIcon />, path: '/game-results' },
      { text: 'Game Scores', icon: <ScoreIcon />, path: '/game-scores' },
      { text: 'Game Reports', icon: <ReportIcon />, path: '/game-reports' },
      // Only show Users section if user is admin
      { text: 'Users', icon: <PeopleIcon />, path: '/users' },
      // Only show Super Admin Dashboard if user is super admin
      // ...(isSuperAdmin ? [{ text: 'Super Admin', icon: <SuperAdminIcon />, path: '/super-admin' }] : []),
    ];
  } else {
    menuItems = [
      { text: 'Game Scores', icon: <ScoreIcon />, path: '/game-scores' },
    ];
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBarStyled position="fixed" open={userInfo?.isAdmin ? open : false} isadmin={userInfo?.isAdmin}>
        <Toolbar>
          {/* Sidebar toggle button only for admin users */}
          {userInfo?.isAdmin && (
            <IconButton
              color="inherit"
              aria-label="toggle drawer"
              onClick={handleDrawerToggle}
              edge="start"
              sx={{ mr: 2 }}
            >
              {open ? <ChevronLeftIcon /> : <MenuIcon />}
            </IconButton>
          )}
          <Typography 
            variant="h6" 
            noWrap 
            component="div" 
            sx={{ 
              flexGrow: 1,
              color: '#FFC107',
              fontWeight: 'bold'
            }}
          >
            Sensor Dashboard
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
              {userInfo?.name}
            </Typography>
            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <Avatar 
                sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}
                src={userInfo?.picture}
                alt={userInfo?.name}
              >
                {!userInfo?.picture && <AccountCircleIcon />}
              </Avatar>
            </IconButton>
          </Box>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={isProfileMenuOpen}
            onClose={handleProfileMenuClose}
          >
            <MenuItem onClick={handleProfileMenuClose}>
              <ListItemIcon>
                <Avatar 
                  src={userInfo?.picture}
                  alt={userInfo?.name}
                  sx={{ width: 24, height: 24 }}
                >
                  {!userInfo?.picture && <AccountCircleIcon fontSize="small" />}
                </Avatar>
              </ListItemIcon>
              <Box sx={{ ml: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  {userInfo?.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {userInfo?.email}
                </Typography>
                {userInfo?.isAdmin && (
                  <Typography variant="caption" sx={{ 
                    color: 'primary.main', 
                    fontWeight: 'bold',
                    display: 'block',
                    mt: 0.5
                  }}>
                    Administrator
                  </Typography>
                )}
              </Box>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Logout</ListItemText>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBarStyled>
      {/* Only render Drawer/sidebar for admin users */}
      {userInfo?.isAdmin && (
        <Drawer
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
            },
          }}
          variant="persistent"
          anchor="left"
          open={open}
        >
          <DrawerHeader>
            <Box
              component="img"
              src="/JoyLogo.jpg"
              alt="Joy Logo"
              sx={{
                height: '40px',
                width: 'auto',
                ml: 1,
              }}
            />
            <IconButton onClick={handleDrawerToggle}>
              <ChevronLeftIcon />
            </IconButton>
          </DrawerHeader>
          <Divider />
          <List>
            {menuItems.map((item) => (
              <ListItem
                button
                key={item.text}
                onClick={() => navigate(item.path)}
                selected={location.pathname === item.path}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
        </Drawer>
      )}
      {userInfo?.isAdmin ? (
        <Main open={open}>
          <DrawerHeader />
          {children}
        </Main>
      ) : (
        <Main open={false} style={{ width: '100%', marginLeft: 0, paddingLeft: 0, paddingRight: 0 }}>
          {children}
        </Main>
      )}
    </Box>
  );
} 