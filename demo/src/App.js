import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Clients from './components/Clients';
import Rooms from './components/Rooms';
import Sensors from './components/Sensors';
import SensorsLive from './components/SensorsLive';
import Login from './Login';
import Devices from './components/Devices';
import UserSensors from './components/UserSensors';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import Transactions from './components/TransactionsTable';
import GameDevices from './components/GameDevices';
import ScoreBoard from './components/ScoreBoard';
import GameScoreReports from './components/GameScoreReports';
import GameSessionSetup from './components/GameSessionSetup';
import GameSessionManager from './components/GameSessionManager';
import GameResults from './components/GameResults';
import DeviceDisplay from './components/DeviceDisplay';
import api from './utils/axiosConfig';
import config from './config';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#4CAF50', // Light Green
      light: '#81C784',
      dark: '#388E3C',
      contrastText: '#FFC107', // Yellow text on green
    },
    secondary: {
      main: '#FFC107', // Amber/Yellow
      light: '#FFD54F',
      dark: '#FFA000',
      contrastText: '#000',
    },
    background: {
      default: '#F1F8E9', // Very Light Green
      paper: '#ffffff',
    },
    success: {
      main: '#2E7D32', // Dark Green for active/online status
      light: '#4CAF50',
      dark: '#1B5E20',
      contrastText: '#fff',
    },
    error: {
      main: '#D32F2F', // Red for inactive/offline status
      light: '#EF5350',
      dark: '#C62828',
      contrastText: '#fff',
    },
    text: {
      primary: '#2E7D32', // Dark Green
      secondary: '#558B2F', // Medium Green
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
      color: '#2E7D32', // Dark Green
    },
    h6: {
      fontWeight: 500,
      color: '#2E7D32', // Dark Green
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          '&:hover': {
            boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
        },
        colorSuccess: {
          backgroundColor: '#2E7D32', // Dark Green
          color: '#fff',
        },
        colorError: {
          backgroundColor: '#D32F2F', // Red
          color: '#fff',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#4CAF50', // Light Green
          '& .MuiTypography-root': {
            color: '#FFC107', // Yellow text
          },
          '& .MuiIconButton-root': {
            color: '#FFC107', // Yellow icons
          },
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: '#4CAF50', // Light Green
          '& .MuiTableCell-head': {
            color: '#FFC107', // Yellow text
            fontWeight: 'bold',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          color: 'inherit',
          borderBottom: '1px solid rgba(224, 224, 224, 1)',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:nth-of-type(odd)': {
            backgroundColor: '#ffffff',
          },
          '&:nth-of-type(even)': {
            backgroundColor: '#fafafa',
          },
          '&:hover': {
            backgroundColor: '#f5f5f5',
          },
        },
      },
    },
  },
});

// Protected Route component for admin-only access
const AdminRoute = ({ userInfo, children }) => {
  if (!userInfo?.isAdmin) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [userInfo, setUserInfo] = React.useState(null);

  const handleLogin = (token, userData) => {
    localStorage.setItem('token', token);
    // console.log(token);
    localStorage.setItem('userInfo', JSON.stringify(userData));
    console.log(userData);
    setUserInfo(userData);
    console.log("User Data", userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('userId');
    setUserInfo(null);
    setIsAuthenticated(false);
  };

  React.useEffect(() => {
    const validateToken = async () => {
      try {
        const token = localStorage.getItem('token');
        const storedUserInfo = localStorage.getItem('userInfo');
        
        if (token && storedUserInfo) {
          const parsedUserInfo = JSON.parse(storedUserInfo);
          
          if (parsedUserInfo) {
            // Validate token by making a test API call
            try {
              await api.get('/api/test-auth');
              setIsAuthenticated(true);
              setUserInfo(parsedUserInfo);
            } catch (error) {
              console.error('Token validation failed:', error);
              // Token is invalid or expired, clear data and redirect to login
              localStorage.removeItem('token');
              localStorage.removeItem('userInfo');
              localStorage.removeItem('userId');
              setIsAuthenticated(false);
              setUserInfo(null);
            }
          }
        }
      } catch (error) {
        console.error('Error parsing user info:', error);
        // Clear invalid data
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
        localStorage.removeItem('userId');
        setIsAuthenticated(false);
        setUserInfo(null);
      }
    };

    validateToken();
  }, []);

  if (!isAuthenticated) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Login onLogin={handleLogin} />
      </ThemeProvider>
    );
  }

  // Restrict non-admin users to only ScoreBoard
  if (!userInfo?.isAdmin) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Layout onLogout={handleLogout} userInfo={userInfo}>
            <Routes>
              <Route path="/game-scores" element={<ScoreBoard />} />
              <Route path="*" element={<Navigate to="/game-scores" replace />} />
            </Routes>
          </Layout>
        </Router>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Layout onLogout={handleLogout} userInfo={userInfo}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/rooms" element={<Rooms />} />
            <Route path="/sensors" element={<Sensors />} />
            <Route path="/sensors-live" element={<SensorsLive />} />
            <Route path="/users" element={<AdminRoute userInfo={userInfo}><UserSensors /></AdminRoute>} />
            <Route path="/devices" element={<Devices />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/game-devices" element={<GameDevices />} />
            <Route path="/game-scores" element={<ScoreBoard />} />
            <Route path="/game-reports" element={<GameScoreReports />} />
            <Route path="/game-session-setup" element={<GameSessionSetup />} />
            <Route path="/game-session-manager" element={<GameSessionManager />} />
            <Route path="/game-results" element={<GameResults />} />
            <Route path="/device-display/:deviceNumber" element={<DeviceDisplay />} />
            {/* <Route path="/super-admin" element={<SuperAdminDashboard />} /> */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
