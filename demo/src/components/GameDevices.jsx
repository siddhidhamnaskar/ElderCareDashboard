import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  Card,
  CardContent,
  CardActions,
  Fab,
  Tooltip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  SportsEsports as GameIcon,
  Refresh as RefreshIcon,
  People as PeopleIcon,
  PersonAdd as PersonAddIcon,
  PersonRemove as PersonRemoveIcon,
  Wifi as WifiIcon,
  WifiOff as WifiOffIcon
} from '@mui/icons-material';
import axios from 'axios';
import config from '../config';
import AddGameDevice from './AddGameDevice';

const GameDevices = () => {
  const [gameDevices, setGameDevices] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [editingDevice, setEditingDevice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [userRole, setUserRole] = useState('user');
  const [deviceUsers, setDeviceUsers] = useState({});
  const [openUsersDialog, setOpenUsersDialog] = useState(false);
  const [selectedDeviceForUsers, setSelectedDeviceForUsers] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Form state
  const [formData, setFormData] = useState({
    DeviceNumber: '',
    LTime: 0,
    PTime: 0,
    GTime: 0,
    NL: 0,
    userGoogleId: ''
  });

  useEffect(() => {
    fetchGameDevices();
    fetchUsers();
    const interval = setInterval(() => {
      fetchGameDevices();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Auto-refresh connection status every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      // Force re-render to update connection status
      setGameDevices(prevDevices => [...prevDevices]);
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${config.API_URL}/users/sensors`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchDeviceUsers = async (deviceId) => {
    try {
      const response = await axios.get(`${config.API_URL}/api/game-devices/${deviceId}/users`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setDeviceUsers(prev => ({
        ...prev,
        [deviceId]: response.data
      }));
    } catch (error) {
      console.error('Error fetching device users:', error);
    }
  };

  const handleViewUsers = async (device) => {
    setSelectedDeviceForUsers(device);
    setOpenUsersDialog(true);
    await fetchDeviceUsers(device.id);
  };

  const fetchGameDevices = async () => {
    try {
      setLoading(true);
      const userGoogleId = localStorage.getItem('userId');
      const response = await axios.get(`${config.API_URL}/api/game-devices`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        params: {
          userGoogleId: userGoogleId
        }
      });
      setGameDevices(response.data);
    } catch (error) {
      console.error('Error fetching game devices:', error);
      showSnackbar('Error fetching game devices', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleOpenDialog = (device = null) => {
    if (device) {
      setEditingDevice(device);
      setFormData({
        DeviceNumber: device.DeviceNumber,
        LTime: device.LTime || 0,
        PTime: device.PTime || 0,
        GTime: device.GTime || 0,
        NL: device.NL || 0
      });
    } else {
      setEditingDevice(null);
      setFormData({
        DeviceNumber: '',
        LTime: 0,
        PTime: 0,
        GTime: 0,
        NL: 0
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingDevice(null);
    setFormData({
      DeviceNumber: '',
      LTime: 0,
      PTime: 0,
      GTime: 0,
      NL: 0
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      // Convert to numbers
      const userGoogleId = localStorage.getItem('userId');
      const submitData = {
        ...formData,
        LTime: parseInt(formData.LTime) || 0,
        PTime: parseInt(formData.PTime) || 0,
        GTime: parseInt(formData.GTime) || 0,
        NL: parseInt(formData.NL) || 0,
        userGoogleId: userGoogleId
      };

      if (editingDevice) {
        // Update existing device
        await axios.put(`${config.API_URL}/api/game-devices/${editingDevice.id}`, submitData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        showSnackbar('Game device updated successfully!');
      } else {
        // Create new device
        await axios.post(`${config.API_URL}/api/game-devices`, submitData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
        });
        showSnackbar('Game device created successfully!');
      }

      handleCloseDialog();
      fetchGameDevices();
    } catch (error) {
      console.error('Error saving game device:', error);
      showSnackbar(
        `Error ${editingDevice ? 'updating' : 'creating'} game device: ${error.response?.data?.error || error.message}`,
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (deviceId) => {
    if (!window.confirm('Are you sure you want to delete this game device?')) {
      return;
    }

    try {
      setLoading(true);
      await axios.delete(`${config.API_URL}/api/game-devices/${deviceId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      showSnackbar('Game device deleted successfully!');
      fetchGameDevices();
    } catch (error) {
      console.error('Error deleting game device:', error);
      showSnackbar('Error deleting game device', 'error');
    } finally {
      setLoading(false);
    }
  };



  // Function to determine if device is online based on lastHeartBeatTime
  const isDeviceOnline = (device) => {
    if (!device.lastHeartBeatTime) return false;
    
    const lastHeartbeat = new Date(device.lastHeartBeatTime);
    const now = new Date();
    const timeDifference = now - lastHeartbeat;
    
    // Consider device offline if no heartbeat in last 5 minutes (300000 ms)
    return timeDifference < 300000;
  };

  // Function to get connection status color
  const getConnectionStatusColor = (device) => {
    return isDeviceOnline(device) ? 'success' : 'error';
  };

  // Function to get connection status text
  const getConnectionStatusText = (device) => {
    return isDeviceOnline(device) ? 'Online' : 'Offline';
  };

  const formatNumber = (value) => {
    if (value === null || value === undefined || value === '') return '0';
    return value.toString();
  };

  const handleAssignUser = (device) => {
    setSelectedDevice(device);
    setSelectedUser('');
    setUserRole('user');
    setOpenUserDialog(true);
  };

  const handleAssignUserSubmit = async () => {
    if (!selectedUser) {
      showSnackbar('Please select a user', 'error');
      return;
    }

    try {
      setLoading(true);
      await axios.post(`${config.API_URL}/api/game-devices/${selectedDevice.id}/assign-user`, {
        userGoogleId: selectedUser,
        role: userRole
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      showSnackbar('User assigned successfully!');
      setOpenUserDialog(false);
      setSelectedUser('');
      setUserRole('user');
      fetchDeviceUsers(selectedDevice.id);
    } catch (error) {
      console.error('Error assigning user:', error);
      showSnackbar(`Error assigning user: ${error.response?.data?.error || error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUserRole = async (deviceId, userGoogleId, newRole) => {
    try {
      setLoading(true);
      await axios.put(`${config.API_URL}/api/game-devices/${deviceId}/users/${userGoogleId}/role`, {
        role: newRole
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      showSnackbar('User role updated successfully!');
      fetchDeviceUsers(deviceId);
    } catch (error) {
      console.error('Error updating user role:', error);
      showSnackbar(`Error updating user role: ${error.response?.data?.error || error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveUser = async (deviceId, userGoogleId) => {
    if (!window.confirm('Are you sure you want to remove this user from the game device?')) {
      return;
    }

    try {
      setLoading(true);
      await axios.delete(`${config.API_URL}/api/game-devices/${deviceId}/users/${userGoogleId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      showSnackbar('User removed successfully!');
      fetchGameDevices();
    } catch (error) {
      console.error('Error removing user:', error);
      showSnackbar('Error removing user', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <GameIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            Game Devices
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {/* <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchGameDevices}
            disabled={true}
          >
            Refresh
          </Button> */}
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          
          >
            Add Game Device
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Devices
              </Typography>
              <Typography variant="h4" component="div">
                {gameDevices.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <WifiIcon color="success" />
                <Typography color="textSecondary">
                  Online Devices
                </Typography>
              </Box>
              <Typography variant="h4" component="div" color="success.main">
                {gameDevices.filter(d => isDeviceOnline(d)).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <WifiOffIcon color="error" />
                <Typography color="textSecondary">
                  Offline Devices
                </Typography>
              </Box>
              <Typography variant="h4" component="div" color="error.main">
                {gameDevices.filter(d => !isDeviceOnline(d)).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
     
      </Grid>

      {/* Game Devices Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Device Number</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Play Time (PTime) in min</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Game Time (GTime) in sec</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Number of Lights (NL)</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Connection</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Last Heartbeat</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Created</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {gameDevices.map((device) => (
                <TableRow key={device.id} hover>
                  <TableCell>
                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                      {device.DeviceNumber}
                    </Typography>
                  </TableCell>
                  <TableCell>{formatNumber(device.PTime)} min</TableCell>
                  <TableCell>{formatNumber(device.GTime)} sec</TableCell>
                  <TableCell>
                    <Chip 
                      label={`${device.NL} Lights`} 
                      color="primary" 
                      variant="outlined"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip 
                      title={
                        device.lastHeartBeatTime 
                          ? `Last heartbeat: ${new Date(device.lastHeartBeatTime).toLocaleString()}`
                          : 'No heartbeat recorded'
                      }
                      arrow
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {isDeviceOnline(device) ? (
                          <WifiIcon color="success" fontSize="small" />
                        ) : (
                          <WifiOffIcon color="error" fontSize="small" />
                        )}
                        <Chip 
                          label={getConnectionStatusText(device)} 
                          color={getConnectionStatusColor(device)}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    {device.lastHeartBeatTime ? (
                      <Typography variant="body2" color="textSecondary">
                        {new Date(device.lastHeartBeatTime).toLocaleString()}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        Never
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>{new Date(device.createdAt).toLocaleString()}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Edit Device">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(device)}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      {/* <Tooltip title="Manage Users">
                        <IconButton
                          size="small"
                          onClick={() => handleViewUsers(device)}
                          color="secondary"
                        >
                          <PeopleIcon />
                        </IconButton>
                      </Tooltip> */}
                      {/* <Tooltip title="Assign User">
                        <IconButton
                          size="small"
                          onClick={() => handleAssignUser(device)}
                          color="info"
                        >
                          <PersonAddIcon />
                        </IconButton>
                      </Tooltip> */}
                      <Tooltip title="Delete Device">
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(device.id)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
              {gameDevices.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="textSecondary">
                      No game devices found. Add your first game device!
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          {editingDevice ? 'Edit Game Device' : 'Add New Game Device'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Device Number"
                value={formData.DeviceNumber}
                onChange={(e) => handleInputChange('DeviceNumber', e.target.value)}
                fullWidth
                required
                disabled={editingDevice !== null} // Can't change device number when editing
                helperText={editingDevice ? "Device number cannot be changed" : "Unique identifier for the device"}
              />
            </Grid>
           
            {/* <Grid item xs={12} sm={4}>
              <TextField
                label="Light Time (LTime)"
                type="number"
                value={formData.LTime}
                onChange={(e) => handleInputChange('LTime', e.target.value)}
                fullWidth
                inputProps={{ min: 0, max: 999999 }}
                helperText="Light time value (0-999999)"
                placeholder="0"
              />
            </Grid> */}
            <Grid item xs={12} sm={4}>
              <TextField
                label="Play Time (PTime)"
                type="number"
                value={formData.PTime}
                onChange={(e) => handleInputChange('PTime', e.target.value)}
                fullWidth
                inputProps={{ min: 0, max: 999999 }}
                helperText="Play time value (0-999999)"
                placeholder="0"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Game Time (GTime)"
                type="number"
                value={formData.GTime}
                onChange={(e) => handleInputChange('GTime', e.target.value)}
                fullWidth
                inputProps={{ min: 0, max: 999999 }}
                helperText="Game time value (0-999999)"
                placeholder="0"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Number of Lights (NL)"
                type="number"
                value={formData.NL}
                onChange={(e) => handleInputChange('NL', e.target.value)}
                fullWidth
                inputProps={{ min: 0, max: 999 }}
                helperText="Number of lights on the device (0-999)"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            disabled={loading || !formData.DeviceNumber}
          >
            {loading ? 'Saving...' : (editingDevice ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Assign User Dialog */}
      <Dialog 
        open={openUserDialog} 
        onClose={() => setOpenUserDialog(false)} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>Assign User to Game Device</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Select User</InputLabel>
                <Select
                  value={selectedUser}
                  label="Select User"
                  onChange={(e) => setSelectedUser(e.target.value)}
                >
                  {users.map((user) => (
                    <MenuItem key={user.google_id} value={user.google_id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar src={user.picture} sx={{ width: 24, height: 24 }}>
                          {user.name?.charAt(0)}
                        </Avatar>
                        <Typography>{user.name}</Typography>
                        <Typography variant="caption" color="textSecondary">
                          ({user.email})
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={userRole}
                  label="Role"
                  onChange={(e) => setUserRole(e.target.value)}
                >
                  <MenuItem value="user">User</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="owner">Owner</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUserDialog(false)} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleAssignUserSubmit} 
            variant="contained" 
            disabled={loading || !selectedUser}
          >
            {loading ? 'Assigning...' : 'Assign User'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Users Dialog */}
      <Dialog 
        open={openUsersDialog} 
        onClose={() => setOpenUsersDialog(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          Users for Device: {selectedDeviceForUsers?.DeviceNumber}
        </DialogTitle>
        <DialogContent>
          {selectedDeviceForUsers && deviceUsers[selectedDeviceForUsers.id] ? (
            <List>
              {deviceUsers[selectedDeviceForUsers.id].map((relation, index) => (
                <React.Fragment key={relation.id}>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar src={relation.user?.picture}>
                        {relation.user?.name?.charAt(0)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={relation.user?.name}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            {relation.user?.email}
                          </Typography>
                          <Chip 
                            label={relation.role} 
                            size="small" 
                            color="primary" 
                            variant="outlined"
                          />
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <FormControl size="small">
                          <Select
                            value={relation.role}
                            onChange={(e) => handleUpdateUserRole(selectedDeviceForUsers.id, relation.user_google_id, e.target.value)}
                            sx={{ minWidth: 100 }}
                          >
                            <MenuItem value="user">User</MenuItem>
                            <MenuItem value="admin">Admin</MenuItem>
                            <MenuItem value="owner">Owner</MenuItem>
                          </Select>
                        </FormControl>
                        <Tooltip title="Remove User">
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveUser(selectedDeviceForUsers.id, relation.user_google_id)}
                            color="error"
                          >
                            <PersonRemoveIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < deviceUsers[selectedDeviceForUsers.id].length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Typography variant="body1" color="textSecondary" align="center" sx={{ py: 4 }}>
              No users assigned to this device.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUsersDialog(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button for quick add */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => handleOpenDialog()}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
};

export default GameDevices; 