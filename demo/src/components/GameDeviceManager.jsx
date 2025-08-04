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
  Fab,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  SportsEsports as GameIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import axios from 'axios';
import config from '../config';

const GameDeviceManager = () => {
  const [gameDevices, setGameDevices] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Form state
  const [formData, setFormData] = useState({
    DeviceNumber: '',
    LTime: '',
    PTime: '',
    GTime: '',
    NL: 0,
    status: 'active'
  });

  useEffect(() => {
    fetchGameDevices();
  }, []);

  const fetchGameDevices = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${config.API_URL}/api/game-devices`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
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
        LTime: device.LTime ? new Date(device.LTime).toISOString().slice(0, 16) : '',
        PTime: device.PTime ? new Date(device.PTime).toISOString().slice(0, 16) : '',
        GTime: device.GTime ? new Date(device.GTime).toISOString().slice(0, 16) : '',
        NL: device.NL || 0,
        status: device.status || 'active'
      });
    } else {
      setEditingDevice(null);
      setFormData({
        DeviceNumber: '',
        LTime: '',
        PTime: '',
        GTime: '',
        NL: 0,
        status: 'active'
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingDevice(null);
    setFormData({
      DeviceNumber: '',
      LTime: '',
      PTime: '',
      GTime: '',
      NL: 0,
      status: 'active'
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
      
      // Convert empty strings to null for date fields
      const submitData = {
        ...formData,
        LTime: formData.LTime || null,
        PTime: formData.PTime || null,
        GTime: formData.GTime || null,
        NL: parseInt(formData.NL) || 0
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'error';
      case 'maintenance':
        return 'warning';
      default:
        return 'default';
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleString();
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
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchGameDevices}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            disabled={loading}
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
              <Typography color="textSecondary" gutterBottom>
                Active Devices
              </Typography>
              <Typography variant="h4" component="div" color="success.main">
                {gameDevices.filter(d => d.status === 'active').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Inactive Devices
              </Typography>
              <Typography variant="h4" component="div" color="error.main">
                {gameDevices.filter(d => d.status === 'inactive').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                In Maintenance
              </Typography>
              <Typography variant="h4" component="div" color="warning.main">
                {gameDevices.filter(d => d.status === 'maintenance').length}
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
                <TableCell sx={{ fontWeight: 'bold' }}>Last Time (LTime)</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Previous Time (PTime)</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Game Time (GTime)</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Level (NL)</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
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
                  <TableCell>{formatDateTime(device.LTime)}</TableCell>
                  <TableCell>{formatDateTime(device.PTime)}</TableCell>
                  <TableCell>{formatDateTime(device.GTime)}</TableCell>
                  <TableCell>
                    <Chip 
                      label={`Level ${device.NL}`} 
                      color="primary" 
                      variant="outlined"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={device.status} 
                      color={getStatusColor(device.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{formatDateTime(device.createdAt)}</TableCell>
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
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
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
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={(e) => handleInputChange('status', e.target.value)}
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="maintenance">Maintenance</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Last Time (LTime)"
                type="datetime-local"
                value={formData.LTime}
                onChange={(e) => handleInputChange('LTime', e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
                helperText="Last time the device was active"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Previous Time (PTime)"
                type="datetime-local"
                value={formData.PTime}
                onChange={(e) => handleInputChange('PTime', e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
                helperText="Previous time the device was active"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Game Time (GTime)"
                type="datetime-local"
                value={formData.GTime}
                onChange={(e) => handleInputChange('GTime', e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
                helperText="Game time or session time"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Level (NL)"
                type="number"
                value={formData.NL}
                onChange={(e) => handleInputChange('NL', e.target.value)}
                fullWidth
                inputProps={{ min: 0 }}
                helperText="Number of levels or game level"
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

export default GameDeviceManager; 