import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  CircularProgress,
  Chip,
  Grid,
  Alert,
  Snackbar,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SearchIcon from '@mui/icons-material/Search';
import api from '../utils/axiosConfig';
import { useNavigate } from 'react-router-dom';

export default function TransactionsTable() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [alert, setAlert] = useState({
    open: false,
    message: '',
    severity: 'error'
  });
  const [search, setSearch] = useState('');
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [sensorSerials, setSensorSerials] = useState([]);
  const [selectedSensorSerial, setSelectedSensorSerial] = useState('');
  const [sensors, setSensors] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const navigate = useNavigate();

  const fetchTransactions = async () => {
    try {
      const response = await api.get('/api/sensor-txns/user');
      setTransactions(response.data);
      
      // Extract unique sensor serials from transactions
      const uniqueSerials = [...new Set(response.data.map(txn => txn.sensorSerial))].sort();
      setSensorSerials(uniqueSerials);
      
      console.log(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setAlert({
        open: true,
        message: 'Error fetching transactions: ' + (error.response?.data?.error || error.message),
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const userGoogleId = localStorage.getItem('userId');
      const response = await api.get(`/api/client-user-relations/user-id/${userGoogleId}`);
      setClients(response.data);
      // Don't set a default selected client - show all transactions by default
    } catch (error) {
      console.error('Error fetching clients:', error);
      setAlert({
        open: true,
        message: 'Error fetching clients: ' + (error.response?.data?.error || error.message),
        severity: 'error'
      });
    }
  };

  const fetchSensors = async (clientUid = null) => {
    try {
      const userId = localStorage.getItem('userId');
      
      // If no client is selected, don't fetch sensors
      if (!clientUid) {
        setSensors([]);
        return;
      }
      
      const response = await api.get(`/sensors/${clientUid}`, {
        params: { 
          user_id: userId,
          client_uid: clientUid
        }
      });
      setSensors(response.data);
    } catch (error) {
      console.error('Error fetching sensors:', error);
      setAlert({
        open: true,
        message: 'Error fetching sensors: ' + (error.response?.data?.error || error.message),
        severity: 'error'
      });
    }
  };

  useEffect(() => {
    fetchTransactions();
    fetchClients();
    // Don't fetch sensors initially - wait for client selection
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  const getStatusColor = (status) => {
    return status === 'OPEN' ? 'success' : 'error';
  };

  const getStatusDisplay = (status, sensorType) => {
    if (sensorType === 'Chair' || sensorType === 'Bed') {
      return status === 'OPEN' ? 'Occupied' : 'Unoccupied';
    }
    return status;
  };

  const handleSearch = (event) => {
    setSearch(event.target.value);
    setPage(0); // Reset to first page when searching
  };

  const handleClientChange = (event) => {
    const selectedClientData = event.target.value;
    setSelectedClient(selectedClientData);
    setPage(0); // Reset to first page when changing client
    
    // Find the client UID for the selected client
    const selectedClientObj = clients.find(client => client.UnlinkedSensorClient?.name === selectedClientData);
    const clientUid = selectedClientObj ? selectedClientObj.client_uid : null;
    
    // Fetch sensors for the selected client
    fetchSensors(clientUid);
  };

  const handleSensorSerialChange = (event) => {
    setSelectedSensorSerial(event.target.value);
    setPage(0); // Reset to first page when changing sensor serial
  };

  const handleStartDateChange = (event) => {
    setStartDate(event.target.value);
    setPage(0); // Reset to first page when changing date
  };

  const handleEndDateChange = (event) => {
    setEndDate(event.target.value);
    setPage(0); // Reset to first page when changing date
  };

  const clearDateFilters = () => {
    setStartDate('');
    setEndDate('');
    setPage(0);
  };

  const filteredTransactions = transactions.filter((transaction) => {
    const searchTerm = search.toLowerCase();
    const matchesSearch = (
      transaction.sensorSerial?.toLowerCase().includes(searchTerm) ||
      transaction.sensorDescription?.toLowerCase().includes(searchTerm) ||
      transaction.sensorType?.toLowerCase().includes(searchTerm) ||
      transaction.clientName?.toLowerCase().includes(searchTerm) ||
      transaction.status?.toLowerCase().includes(searchTerm)
    );
    
    // Filter by selected client if one is selected (not empty or " ")
    const matchesClient = selectedClient && selectedClient.trim() !== "" ? transaction.clientName === selectedClient : true;
    
    // Filter by selected sensor serial if one is selected
    const matchesSensorSerial = selectedSensorSerial && selectedSensorSerial.trim() !== "" ? transaction.sensorSerial === selectedSensorSerial : true;
    
    // Filter by date range
    const transactionDate = new Date(transaction.timestamp);
    const startDateTime = startDate ? new Date(startDate + 'T00:00:00') : null;
    const endDateTime = endDate ? new Date(endDate + 'T23:59:59') : null;
    
    const matchesStartDate = startDateTime ? transactionDate >= startDateTime : true;
    const matchesEndDate = endDateTime ? transactionDate <= endDateTime : true;
    
    return matchesSearch && matchesClient && matchesSensorSerial && matchesStartDate && matchesEndDate;
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={3}>
        <AssessmentIcon sx={{ mr: 1 }} />
        <Typography variant="h4">Sensor Activity Report</Typography>
      </Box>

      <Box mb={2}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search transactions by sensor serial, description, type, client, or status..."
              value={search}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel id="client-select-label">Filter by Client</InputLabel>
              <Select
                labelId="client-select-label"
                id="client-select"
                value={selectedClient}
                onChange={handleClientChange}
                label="Filter by Client"
                sx={{ minWidth: '200px' }}
              >
                <MenuItem value=" ">
                  <em>All Clients</em>
                </MenuItem>
                {clients.map((client) => (
                  <MenuItem key={client.client_uid} value={client.UnlinkedSensorClient?.name}>
                    {client.UnlinkedSensorClient?.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel id="sensor-serial-select-label">Filter by Sensor Serial</InputLabel>
              <Select
                labelId="sensor-serial-select-label"
                id="sensor-serial-select"
                value={selectedSensorSerial}
                onChange={handleSensorSerialChange}
                label="Filter by Sensor Serial"
                sx={{ minWidth: '200px' }}
              >
                <MenuItem value="">
                  <em>All Sensors</em>
                </MenuItem>
                {sensorSerials.map((serial) => (
                  <MenuItem key={serial} value={serial}>
                    {serial}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={1.5}>
            <TextField
              fullWidth
              type="date"
              label="Start Date"
              value={startDate}
              onChange={handleStartDateChange}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>

          <Grid item xs={12} md={1.5}>
            <TextField
              fullWidth
              type="date"
              label="End Date"
              value={endDate}
              onChange={handleEndDateChange}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
        </Grid>
        
        {(startDate || endDate) && (
          <Box mt={1} display="flex" justifyContent="flex-end">
            <Chip
              label="Clear Date Filters"
              onClick={clearDateFilters}
              color="primary"
              variant="outlined"
              size="small"
            />
          </Box>
        )}
      </Box>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader aria-label="sensor activity table">
            <TableHead>
              <TableRow>
                <TableCell>Sensor Serial</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Client</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Timestamp</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTransactions
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((transaction) => (
                  <TableRow hover key={transaction.id}>
                    <TableCell>{transaction.sensorSerial}</TableCell>
                    <TableCell>{transaction.sensorDescription}</TableCell>
                    <TableCell>{transaction.sensorType}</TableCell>
                    <TableCell>{transaction.clientName}</TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusDisplay(transaction.status, transaction.sensorType)}
                        color={getStatusColor(transaction.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(transaction.timestamp).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 100]}
          component="div"
          count={filteredTransactions.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseAlert} severity={alert.severity}>
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
} 