import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Chip,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar,
} from '@mui/material';
import { Person as PersonIcon } from '@mui/icons-material';
import axios from 'axios';
import config from '../config';

export default function UserSensors() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });

  // Get current user info from localStorage
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
  const isSuperAdmin = Boolean(currentUser?.isSuperAdmin);
  const isAdmin = Boolean(currentUser?.isAdmin);
  
  // Debug logging
  console.log('Current user from localStorage:', currentUser);
  console.log('isSuperAdmin value:', isSuperAdmin);
  console.log('isAdmin value:', isAdmin);
  console.log('isSuperAdmin type:', typeof isSuperAdmin);

  const fetchUsersAndSensors = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${config.API_URL}/users/sensors`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Users data received from API:', response.data);
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users and sensors:', error);
      setAlert({
        open: true,
        message: 'Error fetching users: ' + (error.response?.data?.error || error.message),
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAdminToggle = async (googleId, currentAdminStatus) => {
    try {
      setUpdating(prev => ({ ...prev, [googleId]: true }));
      
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${config.API_URL}/users/${googleId}/admin`,
        { isAdmin: !currentAdminStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      // Update the user in the local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.google_id === googleId 
            ? { ...user, isAdmin: !currentAdminStatus }
            : user
        )
      );
      
      setAlert({
        open: true,
        message: `User ${response.data.user.name} ${!currentAdminStatus ? 'promoted to' : 'removed from'} admin successfully`,
        severity: 'success'
      });
      
    } catch (error) {
      console.error('Error updating admin status:', error);
      setAlert({
        open: true,
        message: 'Error updating admin status: ' + (error.response?.data?.error || error.message),
        severity: 'error'
      });
    } finally {
      setUpdating(prev => ({ ...prev, [googleId]: false }));
    }
  };

  useEffect(() => {
    fetchUsersAndSensors();
    const interval = setInterval(fetchUsersAndSensors, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Users Management
      </Typography>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Total Users: {users.length}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {isSuperAdmin 
            ? 'Toggle admin privileges for users. Only super admins can modify admin status.'
            : 'View user information. Only super admins can modify admin status.'
          }
        </Typography>
      </Paper>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Number of Sensors</TableCell>
              <TableCell>Admin Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.google_id}>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                    {user.name}
                  </Box>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.sensors?.length || 0}</TableCell>
                <TableCell>
                  <Chip 
                    label={user.isAdmin ? 'Admin' : 'User'} 
                    color={user.isAdmin ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {console.log('Rendering toggle for user:', user.name, 'isSuperAdmin:', isSuperAdmin)}
                  {isSuperAdmin === true ? (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={user.isAdmin}
                          onChange={() => handleAdminToggle(user.google_id, user.isAdmin)}
                          disabled={updating[user.google_id]}
                          color="primary"
                        />
                      }
                      label={updating[user.google_id] ? 'Updating...' : (user.isAdmin ? 'Admin' : 'User')}
                    />
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Super Admin Only
                    </Typography>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseAlert} severity={alert.severity} sx={{ width: '100%' }}>
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
} 