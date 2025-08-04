import React, { useState } from 'react';
import { TextField, Button, Box, Typography, Grid, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import axios from 'axios';
import { DialogTitle, DialogContent, DialogActions } from '@mui/material';
import CustomAlert from './Alert';
import config from '../config';

const AddDevice = ({onClose, fetchSensors}) => {
  const [clientUid, setClientUid] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [role, setRole] = useState('user');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('');
  const [alert, setAlert] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Get the user's Google ID from localStorage
      const userGoogleId = localStorage.getItem('userId');
      
      const response = await axios.post(`${config.API_URL}/devices`, {
        client_uid: clientUid,
        serial: serialNumber,
        desc: description,
        user_google_id: userGoogleId,
        role: role,
        type: type
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      console.log('Sensor added:', response.data);
      
      // Clear form
      setClientUid('');
      setSerialNumber('');
      setRole('user');
      setAlert({
        open: true,
        message: 'Sensor added successfully!',
        severity: 'success'
      });
      onClose();
      fetchSensors();
    } catch (error) {
      console.error('Error adding sensor:', error);
      setAlert({
        open: true,
        message: 'Error adding sensor: ' + (error.response?.data?.error || error.message),
        severity: 'error'
      });
    }
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  return (
    <>
      <CustomAlert
        open={alert.open}
        message={alert.message}
        severity={alert.severity}
        onClose={handleCloseAlert}
      />
      <DialogTitle>Add New Sensor</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <TextField
              label="Client UID"
              value={clientUid}
              onChange={(e) => setClientUid(e.target.value)}
              fullWidth
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Sensor Number"
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
              fullWidth
              margin="normal"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth margin="normal">
            <InputLabel>Type</InputLabel>
              <Select
                value={type}
                label="Type"
                onChange={(e) => setType(e.target.value)}
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
          </Grid>
        
          <Grid item xs={12} sm={6}>
            <TextField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              margin="normal"
            />
          </Grid>
         
          <Grid item xs={12}>
            <Button 
              type="submit" 
              onClick={handleSubmit} 
              variant="contained" 
              color="primary" 
              fullWidth 
              sx={{ mt: 2 }}
            >
              Add Sensor
            </Button>
          </Grid>
        </Grid>
      </DialogContent>
    </>
  );
};

export default AddDevice; 