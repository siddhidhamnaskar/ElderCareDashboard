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
import axios from 'axios'
import AddDevice from './AddDevice';
import CustomAlert from './Alert';
import config from '../config';

export default function Sensors() {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [sensors, setSensors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingSensor, setEditingSensor] = useState(null);
  const [type, setType] = useState('');
  const [newSensor, setNewSensor] = useState({
    serial: '',
    client_uid: '',
    status: 'OFFLINE',
  });
  const [alert, setAlert] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // useEffect(() => {
  //   fetchClients();
  // }, []);

  useEffect(() => {
    // if (selectedClient) {
      fetchSensors();
    // }
  }, []);

  const fetchClients = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      const response = await axios.get(`${config.API_URL}/clients`, {
        params: { user_id: userId },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setClients(response.data);
      if (response.data.length > 0) {
        setSelectedClient(response.data[0].uid);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
      setAlert({
        open: true,
        message: 'Error fetching clients: ' + (error.response?.data?.error || error.message),
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSensors = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      const response = await axios.get(`${config.API_URL}/sensors/`, {
        params: { user_id: userId },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSensors(response.data);
    } catch (error) {
      console.error('Error fetching sensors:', error);
      setAlert({
        open: true,
        message: 'Error fetching sensors: ' + (error.response?.data?.error || error.message),
        severity: 'error'
      });
    }finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setOpen(true);
    setNewSensor({ ...newSensor, client_uid: selectedClient });
  };

  const handleClose = () => {
    setOpen(false);
    setNewSensor({ serial: '', client_uid: '', status: 'OFFLINE' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSensor((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      await axios.post(`${config.API_URL}/sensors`, newSensor);
      handleClose();
      fetchSensors();
    } catch (error) {
      console.error('Error creating sensor:', error);
    }
  };

  const getStatusColor = (status) => {
    return status === 'ACTIVE' ? 'success' : 'error';
  };

  const handleEditOpen = (sensor) => {
    setEditingSensor(sensor);
    setEditOpen(true);
  };

  const handleEditClose = () => {
    setEditOpen(false);
    setEditingSensor(null);
  };

  const handleEditSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${config.API_URL}/sensors`, {
        ...editingSensor,
        client_uid: editingSensor.client_uid,
        serial: editingSensor.serial
      },{
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      handleEditClose();
      fetchSensors();
      setAlert({
        open: true,
        message: 'Sensor updated successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error updating sensor:', error);
      setAlert({
        open: true,
        message: 'Error updating sensor: ' + (error.response?.data?.error || error.message),
        severity: 'error'
      });
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditingSensor((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  const handleDelete = async (serial) => {
    try {
      if(window.confirm('Are you sure you want to delete this sensor?')) {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      
      // Find the sensor to get its client_uid
      const sensor = sensors.find(s => s.serial === serial);
      if (!sensor) {
        throw new Error('Sensor not found');
      }

      await axios.delete(`${config.API_URL}/sensors/${serial}`, {
        params: {
          user_id: userId,
          client_uid: sensor.client_uid
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setAlert({
        open: true,
        message: 'Sensor removed successfully!',
        severity: 'success'
      });
      
      // Refresh the sensors list
      fetchSensors();
    }
    } catch (error) {
      console.error('Error removing sensor:', error);
      setAlert({
        open: true,
        message: 'Error removing sensor: ' + (error.response?.data?.error || error.message),
        severity: 'error'
      });
    }
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
        <Typography variant="h4">Sensors</Typography>
        <Box display="flex" alignItems="center" gap={2}>
          {/* <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Select Uid</InputLabel>
            <Select
              value={selectedClient}
              label="Select Client"
              onChange={(e) => setSelectedClient(e.target.value)}
            >
              {clients.map((client) => (
                <MenuItem key={client.uid} value={client.uid}>
                  {client.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl> */}
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpen}
          >
            Add Sensor
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>UID</TableCell>
              <TableCell>SensorNumber</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sensors.map((sensor) => (
              <TableRow key={sensor.serial}>
                <TableCell>{sensor.client_uid}</TableCell>
                <TableCell>{sensor.serial}</TableCell>
                <TableCell>{sensor.type}</TableCell>
                <TableCell>{sensor.desc}</TableCell>
                <TableCell>
                  <IconButton 
                    color="primary" 
                    size="small" 
                    onClick={() => handleEditOpen(sensor)}
                    sx={{ mr: 1 }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" size="small" onClick={() => handleDelete(sensor.serial)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <AddDevice onClose={handleClose} fetchSensors={fetchSensors}/>
      </Dialog>

      <Dialog open={editOpen} onClose={handleEditClose}>
        <DialogTitle>Edit Sensor</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Client UID: {editingSensor?.client_uid}
            </Typography>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Sensor Number: {editingSensor?.serial}
            </Typography>
        
            <FormControl fullWidth margin="normal">
            <InputLabel>Type</InputLabel>
              <Select
                value={editingSensor?.type}
                label="Type"
                name="type"
                onChange={(e) => handleEditInputChange(e)}
                sx={{ 
                  height:'57px',
                  width: '100px',
                  '& .MuiSelect-select': {
                    padding: '20px 14px',
                    fontSize: '1.1rem'
                  }
                }}
              >
                <MenuItem value="Door">Door</MenuItem>
                <MenuItem value="Chair">Chair</MenuItem>
                <MenuItem value="Bed">Bed</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Description"
              name="desc"
              value={editingSensor?.desc || ''}
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