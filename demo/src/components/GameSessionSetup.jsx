import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  Snackbar,
  CircularProgress,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  FormControlLabel,
  InputAdornment,
  Tooltip,
  IconButton,
  Fab
} from '@mui/material';
import {
  SportsEsports as GameIcon,
  PlayArrow as StartIcon,
  Refresh as RefreshIcon,
  Wifi as WifiIcon,
  WifiOff as WifiOffIcon,
  Timer as TimerIcon,
  Person as PersonIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Add as AddIcon,
  Remove as RemoveIcon
} from '@mui/icons-material';
import axios from 'axios';
import config from '../config';

const GameSessionSetup = () => {
  const navigate = useNavigate();
  const [gameDevices, setGameDevices] = useState([]);
  const [selectedDevices, setSelectedDevices] = useState([]);
  const [playerNames, setPlayerNames] = useState({});
  // Change gameTime state to store minutes for UI, but convert to seconds for backend/localStorage
  const [gameTime, setGameTime] = useState(1); // Default 1 minute
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchGameDevices();
    // Auto-refresh every 10 seconds to keep device status updated
    const interval = setInterval(fetchGameDevices, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const savedSetup = localStorage.getItem('gameSessionSetup');
    if (savedSetup) {
      const { selectedDevices, playerNames, gameTime } = JSON.parse(savedSetup);
      setSelectedDevices(selectedDevices || []);
      setPlayerNames(playerNames || {});
      // Convert seconds to minutes for UI
      setGameTime(gameTime ? Math.round(gameTime / 60) : 1);
    }
  }, []);

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
      
      // Filter only online devices
      const onlineDevices = response.data.filter(device => isDeviceOnline(device));
      setGameDevices(onlineDevices);
    } catch (error) {
      console.error('Error fetching game devices:', error);
      showSnackbar('Error fetching game devices', 'error');
    } finally {
      setLoading(false);
    }
  };

  const isDeviceOnline = (device) => {
    if (!device.lastHeartBeatTime) return false;
    const lastHeartbeat = new Date(device.lastHeartBeatTime);
    const now = new Date();
    const timeDifference = now - lastHeartbeat;
    return timeDifference < 300000; // 5 minutes
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

  const handleDeviceSelection = (deviceNumber) => {
    setSelectedDevices(prev => {
      if (prev.includes(deviceNumber)) {
        // Remove device
        const newSelected = prev.filter(d => d !== deviceNumber);
        const newPlayerNames = { ...playerNames };
        delete newPlayerNames[deviceNumber];
        setPlayerNames(newPlayerNames);
        return newSelected;
      } else {
        // Add device (max 6)
        if (prev.length >= 6) {
          showSnackbar('Maximum 6 devices can be selected', 'warning');
          return prev;
        }
        return [...prev, deviceNumber];
      }
    });
  };

  const handlePlayerNameChange = (deviceNumber, name) => {
    setPlayerNames(prev => ({
      ...prev,
      [deviceNumber]: name
    }));
  };

  const handleGameTimeChange = (event) => {
    const value = parseInt(event.target.value);
    if (value >= 1 && value <= 10) { // 1 to 10 minutes
      setGameTime(value);
    }
  };

  const validateSetup = () => {
    if (selectedDevices.length < 1) {
      showSnackbar('Please select at least 1 device', 'error');
      return false;
    }

    if (selectedDevices.length > 6) {
      showSnackbar('Maximum 6 devices allowed', 'error');
      return false;
    }

    // Check if all selected devices have player names
    for (const deviceNumber of selectedDevices) {
      const playerName = playerNames[deviceNumber];
      if (!playerName || playerName.trim() === '') {
        showSnackbar(`Please enter a player name for device ${deviceNumber}`, 'error');
        return false;
      }
    }

    // Check for duplicate player names
    const names = selectedDevices.map(d => playerNames[d].trim().toLowerCase());
    const uniqueNames = new Set(names);
    if (uniqueNames.size !== names.length) {
      showSnackbar('Player names must be unique', 'error');
      return false;
    }

    if (gameTime < 1 || gameTime > 10) {
      showSnackbar('Game time must be between 1 and 10 minutes', 'error');
      return false;
    }

    return true;
  };

  const handleStartGame = async () => {
    if (!validateSetup()) {
      return;
    }

    // Save setup to localStorage (convert to seconds)
    localStorage.setItem('gameSessionSetup', JSON.stringify({
      selectedDevices,
      playerNames,
      gameTime: gameTime * 60
    }));

    try {
      setCreating(true);
      
      const sessionData = {
        gameTime: gameTime * 60, // send seconds to backend
        devices: selectedDevices,
        playerNames: selectedDevices.map(device => playerNames[device])
      };
      const userGoogleId = localStorage.getItem('userId');
      const response = await axios.post(`${config.API_URL}/api/game-sessions/setup`, sessionData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        params: {
          userGoogleId: userGoogleId
        }
      });

      if (response.data.success) {
        showSnackbar('Game session created successfully! Redirecting to ScoreBoard...', 'success');
        
        // Prepare data for ScoreBoard
        const sessionData = {
          deviceNumbers: selectedDevices,
          sessionId: response.data.data.session.sessionId,
          playerNames: playerNames,
          playerStatus: {},
          playerTimeRemaining: {}
        };
        
        // Navigate to ScoreBoard with session data after a short delay
        setRedirecting(true);
        setTimeout(() => {
          navigate('/game-scores', { state: sessionData });
        }, 1500);
      } else {
        showSnackbar(response.data.message || 'Failed to create game session', 'error');
      }
    } catch (error) {
      console.error('Error creating game session:', error);
      showSnackbar(
        `Error creating game session: ${error.response?.data?.message || error.message}`,
        'error'
      );
    } finally {
      setCreating(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDeviceStatusColor = (device) => {
    return isDeviceOnline(device) ? 'success' : 'error';
  };

  const getDeviceStatusIcon = (device) => {
    return isDeviceOnline(device) ? <WifiIcon /> : <WifiOffIcon />;
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <GameIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            Game Session Setup
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchGameDevices}
          disabled={loading}
        >
          {loading ? <CircularProgress size={20} /> : 'Refresh Devices'}
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Device Selection */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <WifiIcon />
                Select Devices ({selectedDevices.length}/6)
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                Choose 2-6 online devices for the game session
              </Typography>

              {gameDevices.length === 0 ? (
                <Alert severity="info">
                  No online devices found. Please wait for devices to come online.
                </Alert>
              ) : (
                <List>
                  {gameDevices.map((device) => (
                    <ListItem
                      key={device.DeviceNumber}
                      dense
                      button
                      onClick={() => handleDeviceSelection(device.DeviceNumber)}
                      sx={{
                        border: '1px solid',
                        borderColor: selectedDevices.includes(device.DeviceNumber) 
                          ? 'primary.main' 
                          : 'divider',
                        borderRadius: 1,
                        mb: 1,
                        backgroundColor: selectedDevices.includes(device.DeviceNumber) 
                          ? 'primary.50' 
                          : 'transparent'
                      }}
                    >
                      <Checkbox
                        checked={selectedDevices.includes(device.DeviceNumber)}
                        color="primary"
                      />
                      <ListItemIcon>
                        <Box sx={{ color: getDeviceStatusColor(device) }}>
                          {getDeviceStatusIcon(device)}
                        </Box>
                      </ListItemIcon>
                      <ListItemText
                        primary={`Device ${device.DeviceNumber}`}
                        secondary={`Level ${device.NL} • Last seen: ${device.lastHeartBeatTime ? new Date(device.lastHeartBeatTime).toLocaleTimeString() : 'Never'}`}
                      />
                      <Chip
                        label={isDeviceOnline(device) ? 'Online' : 'Offline'}
                        color={getDeviceStatusColor(device)}
                        size="small"
                        variant="outlined"
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Player Names and Game Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon />
                Player Names
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                Enter unique names for each selected player
              </Typography>

              {selectedDevices.length === 0 ? (
                <Alert severity="info">
                  Select devices first to assign player names
                </Alert>
              ) : (
                <Box>
                  {selectedDevices.map((deviceNumber, index) => (
                    <TextField
                      key={deviceNumber}
                      label={`Player ${index + 1} (Device ${deviceNumber})`}
                      value={playerNames[deviceNumber] || ''}
                      onChange={(e) => handlePlayerNameChange(deviceNumber, e.target.value)}
                      fullWidth
                      margin="normal"
                      required
                      placeholder={`Enter name for Device ${deviceNumber}`}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon color="primary" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  ))}

                  <Divider sx={{ my: 3 }} />

                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TimerIcon />
                    Game Settings
                  </Typography>

                  <TextField
                    label="Game Duration"
                    type="number"
                    value={gameTime}
                    onChange={handleGameTimeChange}
                    fullWidth
                    margin="normal"
                    required
                    inputProps={{
                      min: 1,
                      max: 10,
                      step: 1
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <TimerIcon color="primary" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <Typography variant="body2" color="textSecondary">
                            minutes
                          </Typography>
                        </InputAdornment>
                      ),
                    }}
                    helperText={`Game will last ${gameTime} minute${gameTime > 1 ? 's' : ''}`}
                  />

                  <Box sx={{ mt: 3 }}>
                    <Alert severity="info">
                      <Typography variant="body2">
                        <strong>Game Summary:</strong><br />
                        • {selectedDevices.length} players<br />
                        • Duration: {gameTime} minute{gameTime > 1 ? 's' : ''}<br />
                        • All devices are online and ready
                      </Typography>
                    </Alert>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Start Game Button */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Button
          variant="contained"
          size="large"
          startIcon={creating || redirecting ? <CircularProgress size={20} /> : <StartIcon />}
          onClick={handleStartGame}
          disabled={creating || redirecting || selectedDevices.length < 1}
          sx={{
            px: 4,
            py: 2,
            fontSize: '1.2rem',
            minWidth: 200
          }}
        >
          {creating ? 'Creating Session...' : redirecting ? 'Redirecting to ScoreBoard...' : 'Start Game Session'}
        </Button>
      </Box>

      {/* Status Summary */}
      {selectedDevices.length > 0 && (
        <Paper sx={{ mt: 3, p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Session Summary
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary">
                  {selectedDevices.length}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Players
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="secondary">
                  {gameTime} minute{gameTime > 1 ? 's' : ''}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Duration
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="success.main">
                  {gameDevices.filter(d => isDeviceOnline(d)).length}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Online Devices
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default GameSessionSetup; 