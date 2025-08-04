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
  Grid,
  Card,
  CardContent,
  IconButton,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, DoorFront as DoorFrontIcon, DoorSliding as DoorSlidingIcon, Chair as ChairIcon, Hotel as BedIcon } from '@mui/icons-material';
import axios from 'axios'
import AddDevice from './AddDevice';
import CustomAlert from './Alert';
import config from '../config';

export default function SensorsLive() {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(['']);
  const [sensors, setSensors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [clientName, setClientName] = useState('');
  const [alert, setAlert] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [newSensor, setNewSensor] = useState({
    serial: '',
    client_uid: '',
    status: 'OFFLINE',
  });

  // useEffect(() => {
  //   fetchClients();
  // }, []);

  useEffect(() => {
    // Initial fetch
    // fetchSensors();
    fetchSensors();
    fetchClients();

  
  }, []);

  useEffect(() => {
    // Set up polling every 5 seconds
    if(selectedClient){
    fetchSensors();
    const intervalId = setInterval(() => {
      fetchSensors();
    }, 5000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
    }
  }, [selectedClient]);

  const fetchClients = async () => {
    try {
      const userGoogleId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      const response = await axios.get(`${config.API_URL}/api/client-user-relations/user-id/${userGoogleId}`,{
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

  const fetchClientUid = async () => {
    try {
      const userGoogleId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      
      const response = await axios.get(
        `${config.API_URL}/api/client-user-relations/user-id/${userGoogleId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data && response.data.length > 0) {
        // Get first client UID from relations
        const clientUid = response.data[0].client_uid;
        setSelectedClient(clientUid);
        setNewSensor(prev => ({...prev, client_uid: clientUid}));
      } else {
        console.log('No client relations found for user');
        setAlert({
          open: true,
          message: 'No client relations found. Please add a device first.',
          severity: 'warning'
        });
      }
    } catch (error) {
      console.error('Error fetching client UID:', error);
      setAlert({
        open: true,
        message: 'Error fetching client data: ' + (error.response?.data?.message || error.message),
        severity: 'error'
      });
    }
  };

  const fetchSensors = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      const response = await axios.get(`${config.API_URL}/sensors/${selectedClient}`, {
        params: { user_id: userId ,client_uid: selectedClient},
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
    } finally {
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

  const handleClientChange = (e) => {
    console.log(e.target.value.client_uid);
    setSelectedClient(e.target.value.client_uid);
    setClientName(e.target.value.UnlinkedSensorClient.name);
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
        <Typography variant="h4">Sensors Live</Typography>
        <Typography variant="h5">{clientName} {selectedClient}</Typography>
      </Box>
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel id="client-uid-label">Select_Device</InputLabel>
        <Select
          labelId="client-uid-label"
          id="client-uid"
          name="client_uid"
          value={clients.find(device => device.client_uid === selectedClient) || ''}
          onChange={handleClientChange}
          label="Select_Device"
        >
          {clients.map((device) => (
            <MenuItem key={device.client_uid} value={device}>
              {device.UnlinkedSensorClient?.name} {device.UnlinkedSensorClient?.uid}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Grid container spacing={3}>
        {sensors.map((sensor) => (
          <Grid item xs={12} md={4} key={sensor.serial}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" noWrap>
                    {sensor.desc}
                  </Typography>
                 
                </Box>
                <Box mb={2}>
               
                  <Typography color="textSecondary" gutterBottom>
                    Serial: {sensor.serial}
                  </Typography>
                  <Typography color="textSecondary" gutterBottom>
                    Last Updated: {new Date(sensor.since).toLocaleString()}
                  </Typography>
                  <Typography color="textSecondary" gutterBottom>
                    Type: {sensor.type}
                  </Typography>
                 
                  {sensor.type=="Door" && (
                    <Box display="flex"  justifyContent="space-between" alignItems="center" mt={1}>
                      {sensor.status === 'ACTIVE' ? (
                        <DoorSlidingIcon color="success" style={{ fontSize: 60 }} />
                      ) : (
                        <DoorFrontIcon color="error" style={{ fontSize: 60 }} />
                      )}
                         <Chip
                    label={
                      sensor.type === 'Door' 
                        ? (sensor.status === 'ACTIVE' ? 'Open' : 'Close')
                        : (sensor.type === 'Chair' || sensor.type === 'Bed')
                          ? (sensor.status === 'ACTIVE' ? 'Occupied' : 'Unoccupied')
                          : sensor.status
                    }
                    color={getStatusColor(sensor.status)}
                    size="small"
                  />
                    </Box>
                  )}
                  {(sensor.type && sensor.type!="Door") && (
                    <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                      {sensor.type === 'Chair' ? (
                        <ChairIcon color={sensor.status === 'ACTIVE' ? 'success' : 'error'} style={{ fontSize: 60 }} />
                      ) : (sensor.type === 'Bed') ? (
                        <BedIcon color={sensor.status === 'ACTIVE' ? 'success' : 'error'} style={{ fontSize: 60 }} />
                      ):''}
                      <Chip
                    label={
                      sensor.type === 'Door' 
                        ? (sensor.status === 'ACTIVE' ? 'Open' : 'Close')
                        : (sensor.type === 'Chair' || sensor.type === 'Bed')
                          ? (sensor.status === 'ACTIVE' ? 'Occupied' : 'Unoccupied')
                          : sensor.status
                    }
                    color={getStatusColor(sensor.status)}
                    size="small"
                  />
                    </Box>
                  )}
                </Box>
           
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={handleClose}>
        <AddDevice onClose={handleClose} fetchSensors={fetchSensors}/>
      </Dialog>
    </Box>
  );
} 