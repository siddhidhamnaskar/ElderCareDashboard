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
  Card,
  CardContent,
  Grid,
  Alert,
  Snackbar,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Button,
} from '@mui/material';
import {
  DeviceHub as DeviceIcon,
  Sensors as SensorIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import axios from 'axios';
import config from '../config';

export default function SuperAdminDashboard() {
  const [devices, setDevices] = useState([]);
  const [sensors, setSensors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
  const [selectedDevice, setSelectedDevice] = useState('');
  const [selectedSensor, setSelectedSensor] = useState('');
  
  // Filter states
  const [cityFilter, setCityFilter] = useState('');
  const [buildingFilter, setBuildingFilter] = useState('');
  const [clientUidFilter, setClientUidFilter] = useState('');
  const [sensorSerialFilter, setSensorSerialFilter] = useState('');
  
  // Status table data
  const [statusData, setStatusData] = useState([]);

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

  // Frontend-only super admin check
  const SUPER_ADMIN_EMAILS = [
    'sd@gvc.in',  // Current user - Siddhi D
    'admin@example.com',
    'superadmin@example.com'
  ];

  const currentUser = getCurrentUserInfo();
  const isSuperAdmin = currentUser?.email ? SUPER_ADMIN_EMAILS.includes(currentUser.email) : false;

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // Fetch all devices
      const devicesResponse = await axios.get(`${config.API_URL}/devices`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Fetch all sensors
      const sensorsResponse = await axios.get(`${config.API_URL}/sensors`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setDevices(devicesResponse.data || []);
      setSensors(sensorsResponse.data || []);
      setStatusData([]); // Initialize empty for now

    } catch (error) {
      console.error('Error fetching data:', error);
      setAlert({
        open: true,
        message: 'Error fetching data: ' + (error.response?.data?.error || error.message),
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSuperAdmin) {
      fetchAllData();
      // const interval = setInterval(fetchAllData, 30000); // Refresh every 30 seconds
      // return () => clearInterval(interval);
    }
  }, [isSuperAdmin]);

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  const handleClearSelection = () => {
    setSelectedDevice('');
    setSelectedSensor('');
  };

  const handleClearFilters = () => {
    setCityFilter('');
    setBuildingFilter('');
    setClientUidFilter('');
    setSensorSerialFilter('');
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'online':
      case 'active':
        return 'success';
      case 'offline':
      case 'inactive':
        return 'error';
      case 'warning':
        return 'warning';
      default:
        return 'default';
    }
  };

  // Get unique values for filters
  const getUniqueCities = () => {
    const cities = [...new Set(sensors.map(sensor => sensor.city).filter(Boolean))];
    return cities.sort();
  };

  const getUniqueBuildings = () => {
    const buildings = [...new Set(sensors.map(sensor => sensor.building).filter(Boolean))];
    return buildings.sort();
  };

  const getUniqueClientUids = () => {
    const clientUids = [...new Set(sensors.map(sensor => sensor.client_uid).filter(Boolean))];
    return clientUids.sort();
  };

  const getUniqueSensorSerials = () => {
    const serials = sensors.map(sensor => sensor.serial).filter(Boolean);
    return serials.sort();
  };

  // Filter sensors based on selected filters
  const getFilteredSensors = () => {
    return sensors.filter(sensor => {
      const matchesCity = !cityFilter || sensor.city === cityFilter;
      const matchesBuilding = !buildingFilter || sensor.building === buildingFilter;
      const matchesClientUid = !clientUidFilter || sensor.client_uid === clientUidFilter;
      const matchesSerial = !sensorSerialFilter || sensor.serial === sensorSerialFilter;
      
      return matchesCity && matchesBuilding && matchesClientUid && matchesSerial;
    });
  };

  if (!isSuperAdmin) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Access Denied. Only Super Admins can view this page.
        </Alert>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom>
          Super Admin Dashboard
        </Typography>
        <Tooltip title="Refresh Data">
          <IconButton onClick={fetchAllData} color="primary">
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Summary Cards */}
      <Box display="flex" flexWrap="wrap" gap={3} mb={3}>
        <Box flex="1" minWidth="200px">
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <DeviceIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Devices</Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {devices.length}
              </Typography>
            </CardContent>
          </Card>
        </Box>
        <Box flex="1" minWidth="200px">
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <SensorIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Sensors</Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {sensors.length}
              </Typography>
            </CardContent>
          </Card>
        </Box>
        <Box flex="1" minWidth="200px">
          <Card>
            <CardContent>
              <Typography variant="h6">Online Devices</Typography>
              <Typography variant="h4" color="success.main">
                {devices.filter(d => d.status?.toLowerCase() === 'online').length}
              </Typography>
            </CardContent>
          </Card>
        </Box>
        <Box flex="1" minWidth="200px">
          <Card>
            <CardContent>
              <Typography variant="h6">Active Sensors</Typography>
              <Typography variant="h4" color="success.main">
                {sensors.filter(s => s.status?.toLowerCase() === 'active').length}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Filters and Status Table - Side by Side */}
      <Box display="flex" gap={3} sx={{ mb: 3, alignItems: 'flex-start' }}>
        {/* Filters Section */}
        <Box flex="0 0 200px">
          <Paper sx={{ p: 3, height: '100%', minHeight: 600 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Filters
              </Typography>
              {(cityFilter || buildingFilter || clientUidFilter || sensorSerialFilter) && (
                <Button
                  variant="outlined"
                  startIcon={<ClearIcon />}
                  onClick={handleClearFilters}
                  size="small"
                >
                  Clear Filters
                </Button>
              )}
            </Box>
            <Stack spacing={2}>
              <FormControl fullWidth>
                <InputLabel id="city-filter-label">City</InputLabel>
                <Select
                  labelId="city-filter-label"
                  id="city-filter"
                  value={cityFilter}
                  label="City"
                  onChange={(e) => setCityFilter(e.target.value)}
                >
                  <MenuItem value="">
                    <em>All Cities</em>
                  </MenuItem>
                  {getUniqueCities().map((city) => (
                    <MenuItem key={city} value={city}>
                      {city}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl fullWidth>
                <InputLabel id="building-filter-label">Building</InputLabel>
                <Select
                  labelId="building-filter-label"
                  id="building-filter"
                  value={buildingFilter}
                  label="Building"
                  onChange={(e) => setBuildingFilter(e.target.value)}
                >
                  <MenuItem value="">
                    <em>All Buildings</em>
                  </MenuItem>
                  {getUniqueBuildings().map((building) => (
                    <MenuItem key={building} value={building}>
                      {building}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl fullWidth>
                <InputLabel id="client-uid-filter-label">Client UID</InputLabel>
                <Select
                  labelId="client-uid-filter-label"
                  id="client-uid-filter"
                  value={clientUidFilter}
                  label="Client UID"
                  onChange={(e) => setClientUidFilter(e.target.value)}
                >
                  <MenuItem value="">
                    <em>All Clients</em>
                  </MenuItem>
                  {getUniqueClientUids().map((clientUid) => (
                    <MenuItem key={clientUid} value={clientUid}>
                      {clientUid}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl fullWidth>
                <InputLabel id="sensor-serial-filter-label">Sensor Serial</InputLabel>
                <Select
                  labelId="sensor-serial-filter-label"
                  id="sensor-serial-filter"
                  value={sensorSerialFilter}
                  label="Sensor Serial"
                  onChange={(e) => setSensorSerialFilter(e.target.value)}
                >
                  <MenuItem value="">
                    <em>All Sensors</em>
                  </MenuItem>
                  {getUniqueSensorSerials().map((serial) => (
                    <MenuItem key={serial} value={serial}>
                      {serial}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
            
            {/* Filter Summary */}
            {(cityFilter || buildingFilter || clientUidFilter || sensorSerialFilter) && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
                <Typography variant="body2" color="white">
                  <strong>Active Filters:</strong> 
                  {cityFilter && ` City: ${cityFilter}`}
                  {buildingFilter && ` Building: ${buildingFilter}`}
                  {clientUidFilter && ` Client: ${clientUidFilter}`}
                  {sensorSerialFilter && ` Sensor: ${sensorSerialFilter}`}
                  {` | Showing ${getFilteredSensors().length} of ${sensors.length} sensors`}
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>

        {/* Status Table */}
        <Box flex="1">
          <Paper sx={{ height: '100%', minHeight: 600 }}>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h6">
                All Status Information ({getFilteredSensors().length} sensors)
              </Typography>
            </Box>
            <TableContainer sx={{ height: 'calc(100% - 60px)' }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Sensor Serial</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>City</TableCell>
                    <TableCell>Building</TableCell>
                    <TableCell>Client UID</TableCell>
                    <TableCell>Room</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getFilteredSensors().map((sensor) => (
                    <TableRow key={sensor.serial}>
                      <TableCell>{sensor.serial}</TableCell>
                      <TableCell>{sensor.type || 'N/A'}</TableCell>
                      <TableCell>
                        <Chip 
                          label={sensor.status || 'Unknown'} 
                          color={getStatusColor(sensor.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{sensor.city || 'N/A'}</TableCell>
                      <TableCell>{sensor.building || 'N/A'}</TableCell>
                      <TableCell>{sensor.client_uid || 'N/A'}</TableCell>
                      <TableCell>{sensor.room || 'N/A'}</TableCell>
                      <TableCell>
                        {sensor.last_reading ? new Date(sensor.last_reading).toLocaleString() : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {sensor.battery_level ? (
                          <Chip 
                            label={`${sensor.battery_level}%`}
                            color={sensor.battery_level > 20 ? 'success' : 'warning'}
                            size="small"
                          />
                        ) : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {sensor.signal_strength ? (
                          <Chip 
                            label={sensor.signal_strength}
                            color={sensor.signal_strength === 'Strong' ? 'success' : 
                                   sensor.signal_strength === 'Medium' ? 'warning' : 'error'}
                            size="small"
                          />
                        ) : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Tooltip title="View Details">
                          <IconButton size="small" color="primary">
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      </Box>

      {/* Selected Item Details */}
      {(selectedDevice || selectedSensor) && (
        <Paper sx={{ p: 3, mb: 3, bgcolor: 'grey.50' }}>
          <Typography variant="h6" gutterBottom>
            Selected Item Details
          </Typography>
          <Box display="flex" gap={3}>
            {selectedDevice && (
              <Box flex="1">
                <Card>
                  <CardContent>
                    <Typography variant="h6" color="primary" gutterBottom>
                      Selected Device
                    </Typography>
                    {(() => {
                      const device = devices.find(d => (d.id || d.device_id) === selectedDevice);
                      return device ? (
                        <Box>
                          <Typography><strong>ID:</strong> {device.id || device.device_id}</Typography>
                          <Typography><strong>Name:</strong> {device.name || 'N/A'}</Typography>
                          <Typography><strong>Type:</strong> {device.type || 'N/A'}</Typography>
                          <Typography><strong>Status:</strong> 
                            <Chip 
                              label={device.status || 'Unknown'} 
                              color={getStatusColor(device.status)}
                              size="small"
                              sx={{ ml: 1 }}
                            />
                          </Typography>
                          <Typography><strong>Location:</strong> {device.location || 'N/A'}</Typography>
                          <Typography><strong>Last Updated:</strong> {
                            device.last_updated ? new Date(device.last_updated).toLocaleString() : 'N/A'
                          }</Typography>
                        </Box>
                      ) : (
                        <Typography color="error">Device not found</Typography>
                      );
                    })()}
                  </CardContent>
                </Card>
              </Box>
            )}
            
            {selectedSensor && (
              <Box flex="1">
                <Card>
                  <CardContent>
                    <Typography variant="h6" color="primary" gutterBottom>
                      Selected Sensor
                    </Typography>
                    {(() => {
                      const sensor = sensors.find(s => s.serial === selectedSensor);
                      return sensor ? (
                        <Box>
                          <Typography><strong>Serial:</strong> {sensor.serial}</Typography>
                          <Typography><strong>Type:</strong> {sensor.type || 'N/A'}</Typography>
                          <Typography><strong>Status:</strong> 
                            <Chip 
                              label={sensor.status || 'Unknown'} 
                              color={getStatusColor(sensor.status)}
                              size="small"
                              sx={{ ml: 1 }}
                            />
                          </Typography>
                          <Typography><strong>Client UID:</strong> {sensor.client_uid || 'N/A'}</Typography>
                          <Typography><strong>Room:</strong> {sensor.room || 'N/A'}</Typography>
                          <Typography><strong>Last Reading:</strong> {
                            sensor.last_reading ? new Date(sensor.last_reading).toLocaleString() : 'N/A'
                          }</Typography>
                        </Box>
                      ) : (
                        <Typography color="error">Sensor not found</Typography>
                      );
                    })()}
                  </CardContent>
                </Card>
              </Box>
            )}
          </Box>
        </Paper>
      )}

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