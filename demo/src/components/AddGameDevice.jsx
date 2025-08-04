import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  Box,
  Typography,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  SportsEsports as GameIcon
} from '@mui/icons-material';
import axios from 'axios';
import config from '../config';

const AddGameDevice = ({ open, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    DeviceNumber: '',
    LTime: '',
    PTime: '',
    GTime: '',
    NL: 0,
    status: 'active'
  });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.DeviceNumber.trim()) {
      showSnackbar('Device Number is required', 'error');
      return;
    }

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

      const response = await axios.post(`${config.API_URL}/api/game-devices`, submitData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      console.log('Game device created:', response.data);
      showSnackbar('Game device created successfully!');
      
      // Reset form
      setFormData({
        DeviceNumber: '',
        LTime: '',
        PTime: '',
        GTime: '',
        NL: 0,
        status: 'active'
      });
      
      onClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error creating game device:', error);
      showSnackbar(
        `Error creating game device: ${error.response?.data?.error || error.message}`,
        'error'
      );
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

  const handleClose = () => {
    if (!loading) {
      setFormData({
        DeviceNumber: '',
        LTime: '',
        PTime: '',
        GTime: '',
        NL: 0,
        status: 'active'
      });
      onClose();
    }
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    return now.toISOString().slice(0, 16);
  };

  const setCurrentTime = (field) => {
    handleInputChange(field, getCurrentDateTime());
  };

  return (
    <>
      <Dialog 
        open={open} 
        onClose={handleClose} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2,
          borderBottom: '1px solid #e0e0e0',
          pb: 2
        }}>
          <GameIcon sx={{ color: 'primary.main' }} />
          <Typography variant="h6" component="div">
            Add New Game Device
          </Typography>
        </DialogTitle>
        
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ pt: 3 }}>
            <Grid container spacing={3}>
              {/* Device Number */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Device Number *"
                  value={formData.DeviceNumber}
                  onChange={(e) => handleInputChange('DeviceNumber', e.target.value)}
                  fullWidth
                  required
                  helperText="Unique identifier for the game device"
                  placeholder="e.g., GAME001, ARCADE001"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: 'primary.main',
                      },
                    },
                  }}
                />
              </Grid>

              {/* Status */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    label="Status"
                    onChange={(e) => handleInputChange('status', e.target.value)}
                  >
                    <MenuItem value="active">
                      <Chip label="Active" color="success" size="small" />
                    </MenuItem>
                    <MenuItem value="inactive">
                      <Chip label="Inactive" color="error" size="small" />
                    </MenuItem>
                    <MenuItem value="maintenance">
                      <Chip label="Maintenance" color="warning" size="small" />
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Time Fields */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, color: 'text.secondary' }}>
                  Time Parameters
                </Typography>
              </Grid>

              <Grid item xs={12} sm={4}>
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
              </Grid>

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

              {/* Level */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Number of Lights (NL)"
                  type="number"
                  value={formData.NL}
                  onChange={(e) => handleInputChange('NL', e.target.value)}
                  fullWidth
                  inputProps={{ min: 0, max: 999 }}
                  helperText="Number of lights on the device (0-999)"
                  placeholder="0"
                />
              </Grid>

              {/* Quick Actions */}
              <Grid item xs={12}>
                <Box sx={{ 
                  display: 'flex', 
                  gap: 2, 
                  flexWrap: 'wrap',
                  p: 2,
                  bgcolor: 'grey.50',
                  borderRadius: 1
                }}>
                  <Typography variant="body2" color="text.secondary" sx={{ width: '100%' }}>
                    Quick Actions:
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      setCurrentTime('LTime');
                      setCurrentTime('PTime');
                      setCurrentTime('GTime');
                    }}
                  >
                    Set All Times to Now
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleInputChange('NL', 1)}
                  >
                    Set Lights to 1
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleInputChange('status', 'active')}
                  >
                    Set Status to Active
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions sx={{ 
            px: 3, 
            py: 2, 
            borderTop: '1px solid #e0e0e0',
            gap: 2
          }}>
            <Button 
              onClick={handleClose} 
              disabled={loading}
              variant="outlined"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              variant="contained" 
              disabled={loading || !formData.DeviceNumber.trim()}
              startIcon={<AddIcon />}
              sx={{ minWidth: 120 }}
            >
              {loading ? 'Creating...' : 'Create Device'}
            </Button>
          </DialogActions>
        </form>
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
    </>
  );
};

export default AddGameDevice; 