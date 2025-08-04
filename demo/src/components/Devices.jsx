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
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import axios from 'axios';
import CustomAlert from './Alert';
import config from '../config';

export default function Devices() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);
  const [newDevice, setNewDevice] = useState({
    client_uid: '',
    user_google_id: '',
    role: 'user',
    status: 'active'
  });
  const [alert, setAlert] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      const userGoogleId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      
      console.log('Fetching devices with:', {
        url: `${config.API_URL}/api/client-user-relations/user-id/${userGoogleId}`,
        userId: userGoogleId,
        token: token ? 'present' : 'missing'
      });

      const response = await axios.get(`${config.API_URL}/api/client-user-relations/user-id/${userGoogleId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      console.log('API Response:', response.data);
      setDevices(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching devices:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers
        }
      });
      setAlert({
        open: true,
        message: 'Error fetching devices: ' + (error.response?.data?.error || error.message),
        severity: 'error'
      });
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setNewDevice({
      client_uid: '',
      user_google_id: '',
      role: 'user',
      status: 'active'
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewDevice((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      const userGoogleId = localStorage.getItem('userId');
      const response = await axios.post(`${config.API_URL}/api/client-user-relations`, {
        ...newDevice,
        user_google_id: userGoogleId
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      console.log('Device added:', response.data);
      
      // Show success message with sensor linking information
      const message = response.data.sensorsLinked > 0 
        ? `Device added successfully! ${response.data.sensorsLinked} sensor(s) linked to your account.`
        : 'Device added successfully! No sensors found for this device.';
      
      setAlert({
        open: true,
        message: message,
        severity: 'success'
      });
      handleClose();
      fetchDevices();
    } catch (error) {
      console.error('Error adding device:', error);
      setAlert({
        open: true,
        message: 'Error adding device: ' + (error.response?.data?.error || error.message),
        severity: 'error'
      });
    }
  };

  const handleEditOpen = (device) => {
    setEditingDevice(device);
    setEditOpen(true);
  };

  const handleEditClose = () => {
    setEditOpen(false);
    setEditingDevice(null);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditingDevice((prev) => ({
      ...prev,
      UnlinkedSensorClient: {
        ...prev.UnlinkedSensorClient,
        [name]: value
      }
    }));
  };

  const handleEditSubmit = async () => {
    try {
      if (!editingDevice?.UnlinkedSensorClient) {
        setAlert({
          open: true,
          message: 'Invalid device data',
          severity: 'error'
        });
        return;
      }

      const userGoogleId = localStorage.getItem('userId');
      if (!userGoogleId) {
        setAlert({
          open: true,
          message: 'User not authenticated',
          severity: 'error'
        });
        return;
      }

      const updateData = {
        name: editingDevice.UnlinkedSensorClient.name || '',
        building: editingDevice.UnlinkedSensorClient.building || '',
        city: editingDevice.UnlinkedSensorClient.city || ''
      };

      // Validate required fields
      if (!updateData.name.trim()) {
        setAlert({
          open: true,
          message: 'Name is required',
          severity: 'error'
        });
        return;
      }

      await axios.put(
        `${config.API_URL}/api/client-user-relations/${editingDevice.client_uid}/${userGoogleId}`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      
      handleEditClose();
      fetchDevices();
      setAlert({
        open: true,
        message: 'Device updated successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error updating device:', error);
      setAlert({
        open: true,
        message: 'Error updating device: ' + (error.response?.data?.message || error.message),
        severity: 'error'
      });
    }
  };

  const handleDelete = async (clientUid, userGoogleId) => {
    try {

      if (window.confirm('Are you sure you want to delete this device?')) {
        const userGoogleId = localStorage.getItem('userId');
        const response = await axios.delete(
          `${config.API_URL}/api/client-user-relations/${clientUid}/${userGoogleId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
        
        console.log('Device deleted:', response.data);
        
        // Show success message with sensor unlinking information
        const message = response.data.sensorsUnlinked > 0 
          ? `Device deleted successfully! ${response.data.sensorsUnlinked} sensor(s) unlinked from your account.`
          : 'Device deleted successfully!';
        
        fetchDevices();
        setAlert({
          open: true,
          message: message,
          severity: 'success'
        });
      }
    } catch (error) {
      console.error('Error deleting device:', error);
      setAlert({
        open: true,
        message: 'Error deleting device: ' + (error.response?.data?.error || error.message),
        severity: 'error'
      });
    }
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <CustomAlert
        open={alert.open}
        message={alert.message}
        severity={alert.severity}
        onClose={handleCloseAlert}
      />
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Devices</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpen}
        >
          Add Device
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Client UID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Building</TableCell>
              <TableCell>City</TableCell>
              <TableCell>Sensors</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {devices.map((device) => (
              <TableRow key={`${device.client_uid}-${device.user_google_id}`}>
                <TableCell>{device?.client_uid}</TableCell>
                <TableCell>{device.UnlinkedSensorClient?.name}</TableCell>
                <TableCell>{device.UnlinkedSensorClient?.building}</TableCell>
                <TableCell>{device.UnlinkedSensorClient?.city}</TableCell>
                <TableCell>
                  <Chip 
                    label={device.sensorsLinked || 0} 
                    color="primary"
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <IconButton 
                    color="primary" 
                    size="small" 
                    onClick={() => handleEditOpen(device)}
                    sx={{ mr: 1 }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    color="error" 
                    size="small" 
                    onClick={() => handleDelete(device.client_uid, device.user_google_id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add Device</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Client UID"
              name="client_uid"
              value={newDevice.client_uid}
              onChange={handleInputChange}
              margin="normal"
              required
            />
          
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editOpen} onClose={handleEditClose}>
        <DialogTitle>Edit Device</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Client UID: {editingDevice?.client_uid}
            </Typography>
            <TextField
              fullWidth
              label="Name"
              name="name"
              value={editingDevice?.UnlinkedSensorClient?.name}
              onChange={handleEditInputChange}
              margin="normal"
              
            />
              <TextField
              fullWidth
              label="Building"
              name="building"
              value={editingDevice?.UnlinkedSensorClient?.building}
              onChange={handleEditInputChange}
              margin="normal"
              
            />
              <TextField
              fullWidth
              label="City "
              name="city"
              value={editingDevice?.UnlinkedSensorClient?.city}
              onChange={handleEditInputChange}
              margin="normal"
              
            />
        
          
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose}>Cancel</Button>
          <Button onClick={handleEditSubmit} variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 