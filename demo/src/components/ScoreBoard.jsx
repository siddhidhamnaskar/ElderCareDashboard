import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  Tooltip,
  Fade,
  Zoom,
  LinearProgress,
  Divider,
  Avatar,
  Badge,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Help as HelpIcon,
  Schedule as ScheduleIcon,
  VideogameAsset as GameIcon,
  Speed as SpeedIcon,
  AccessTime as AccessTimeIcon,
  Timer as TimerIcon,
  Info as InfoIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import axios from 'axios';
import config from '../config';
import GameSessionSetup from './GameSessionSetup';
import { useLocation, useNavigate } from 'react-router-dom';
import { PlayArrow as PlayIcon } from '@mui/icons-material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';

// Utility function used by ScoreCard
function formatAvgTime(avgTime) {
  if (!avgTime || avgTime === 0) return 'N/A';
  return `${avgTime.toFixed(2)}s`;
}

// Memoized ScoreCard outside the main component
const ScoreCard = React.memo(function ScoreCard({ score, playerName, status, timeRemaining, isEditing, editablePlayerNames, handlePlayerNameChange, gameStatus }) {
  return (
    <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', width: '100%', color: 'white', position: 'relative' }}>
      <CardContent>
        {isEditing && gameStatus === 'pending' ? (
          <TextField
            value={editablePlayerNames[score.DeviceNumber] || ''}
            onChange={(e) => handlePlayerNameChange(score.DeviceNumber, e.target.value)}
            fullWidth
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': {
                  borderColor: 'rgba(255,255,255,0.3)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255,255,255,0.5)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'white',
                },
                '& input': {
                  color: 'white',
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  textAlign: 'center',
                },
                '& input::placeholder': {
                  color: 'rgba(255,255,255,0.7)',
                }
              }
            }}
            placeholder="Enter player name"
            size="small"
            autoFocus={false}
          />
        ) : (
          <Typography variant="h4" color="secondary">
            {playerName}
          </Typography>
        )}
      
        {/* <Typography variant="h6" color="primary">
          {score.liveValue ? `Live: ${score.liveValue}` : score.finalScore}
        </Typography> */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          {/* <GameIcon sx={{ fontSize: 32, mr: 2 }} /> */}
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              {score.DeviceNumber}
            </Typography>

          </Box>
        </Box>

        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                {score.OkPressed || 0}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Correct Answers
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#f44336' }}>
                {score.WrongPressed || 0}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Wrong Answers
              </Typography>
            </Box>
          </Grid>
         
        </Grid>

        {/* New Columns Section */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
     
          <Grid item xs={12} sm={4}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              p: 1,
              borderRadius: 2,
              bgcolor: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <AccessTimeIcon sx={{ mr: 1, color: '#2196f3' }} />
              <Box>
                <Typography variant="body2" sx={{ opacity: 0.8, fontSize: '1rem' }}>
                  Last Time
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#ffeb3b', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                  {score.last_time}s
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              p: 1,
              borderRadius: 2,
              bgcolor: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <TimerIcon sx={{ mr: 1, color: '#9c27b0' }} />
              <Box>
                <Typography variant="body2" sx={{ opacity: 0.8, fontSize: '1rem' }}>
                  Avg Time
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#ff9800', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                  {formatAvgTime(score.avg_time)}
                </Typography>
              </Box>
            </Box>
          </Grid>
          {/* <Grid item xs={12} sm={4}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              p: 2,
              borderRadius: 2,
              bgcolor: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <Box sx={{ color: getGameStatusColor(score.game_status) }}>
                {getGameStatusIcon(score.game_status)}
              </Box>
              <Box sx={{ ml: 1 }}>
                <Typography variant="body2" sx={{ opacity: 0.8, fontSize: '1rem' }}>
                  Status
                </Typography>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 'bold',
                    color: getGameStatusColor(score.game_status),
                    textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                  }}
                >
                  Game Status: {score.game_status || 'Unknown'}
                </Typography>
              </Box>
            </Box>
          </Grid> */}
        </Grid>

        {/* <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)', mb: 3 }} /> */}

        {/* <Grid container spacing={2}> */}
          
          {/* <Grid item xs={6}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                {accuracy}%
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Accuracy Rate
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={accuracy} 
                sx={{ 
                  mt: 1, 
                  height: 8, 
                  borderRadius: 4,
                  bgcolor: 'rgba(255,255,255,0.2)',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: '#4caf50'
                  }
                }} 
              />
            </Box>
          </Grid> */}
        {/* </Grid> */}
      </CardContent>
    </Card>
  );
});

const ScoreBoard = () => {
  const [scores, setScores] = useState([]);
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(() => {
    // Get selected device from localStorage on component mount
    return localStorage.getItem('selectedDevice') || '';
  });

  const [error, setError] = useState('');
  const [gameStatus, setGameStatus] = useState('pending');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [gameTime, setGameTime] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const intervalRef = useRef(null);
  const timerRef = useRef(null);
  const wsRef = useRef(null);
  const gameStatusRef = useRef('pending'); // Ref to track current game status
  const isEditingRef = useRef(false); // Ref to track editing state for API calls
  const location = useLocation();
  const navigate = useNavigate();
  let { deviceNumbers, sessionId, playerNames, playerStatus, playerTimeRemaining } = location.state || {};
  // Use state for deviceNumbers and playerNames for reactivity
  const [deviceNumbersState, setDeviceNumbersState] = useState(deviceNumbers || []);
  const [playerNamesState, setPlayerNamesState] = useState(playerNames || {});
  
  // Editing state variables
  const [isEditing, setIsEditing] = useState(false);
  const [editablePlayerNames, setEditablePlayerNames] = useState({});
  const [editableDuration, setEditableDuration] = useState(0);
  
  // Store initial values when editing starts to prevent API interference
  const [initialPlayerNames, setInitialPlayerNames] = useState({});
  const [initialDuration, setInitialDuration] = useState(0);

  // Save sessionId to localStorage if available
  useEffect(() => {
    if (sessionId) {
      localStorage.setItem('lastSessionId', sessionId);
    }
  }, [sessionId]);

  // Session ID logic
  const [effectiveSessionId, setEffectiveSessionId] = useState(() => {
    if (sessionId) return sessionId;
    const lastSessionId = localStorage.getItem('lastSessionId');
    if (lastSessionId) return lastSessionId;
    return null;
  });

  // Fetch last session from backend if no sessionId in state or localStorage
  useEffect(() => {
    if (!effectiveSessionId) {
      axios.get(`${config.API_URL}/api/game-sessions?limit=1&sort=desc`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }).then(response => {
        if (response.data.success && response.data.data && response.data.data.length > 0) {
          setEffectiveSessionId(response.data.data[0].sessionId);
        }
      });
    }
  }, [effectiveSessionId]);

  useEffect(() => {
    // Only fetch if we don't have deviceNumbers/playerNames from navigation
    if (effectiveSessionId && (deviceNumbersState.length === 0 || Object.keys(playerNamesState).length === 0)) {
      const fetchSessionDetails = async () => {
        try {
          const response = await axios.get(`${config.API_URL}/api/game-sessions/${effectiveSessionId}/progress`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          });
          if (response.data.success) {
            const sessionData = response.data.data;
            const devices = (sessionData.players || []).map(p => p.deviceNumber);
            const names = {};
            (sessionData.players || []).forEach(p => { names[p.deviceNumber] = p.playerName; });
            setDeviceNumbersState(devices);
            setPlayerNamesState(names);
          }
        } catch (err) {
          // Optionally handle error
        }
      };
      fetchSessionDetails();
    }
  }, [effectiveSessionId]);

  // Initialize editable values when playerNamesState or gameTime changes
  // Only update if not currently editing to prevent interference with typing
  useEffect(() => {
    if (!isEditingRef.current) {
      setEditablePlayerNames({ ...playerNamesState });
      setEditableDuration(Math.round(gameTime / 60)); // Convert seconds to minutes
    }
  }, [playerNamesState, gameTime]);
  const [filteredScores, setFilteredScores] = useState([]);


  const fetchDevices = async () => {
    try {
      const userGoogleId = localStorage.getItem('userId');
      const response = await axios.get(`${config.API_URL}/api/game-devices`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        params: {
          userGoogleId: userGoogleId
        }
      });
      setDevices(response.data || []);
    } catch (err) {
      console.error('Error fetching devices:', err);
    }
  };

  const fetchScores = async () => {
    if (!selectedDevice) {
      setScores([]);
      return;
    }

    setError('');
    try {
      const response = await axios.get(`${config.API_URL}/api/game-device-scores/device/${selectedDevice}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      const newScores = response.data.data ? [response.data.data] : [];
      
      // Only update if the data has actually changed
      setScores(prevScores => {
        if (JSON.stringify(prevScores) !== JSON.stringify(newScores)) {
          return newScores;
        }
        return prevScores;
      });
    } catch (err) {
      setError('Failed to fetch scores for selected device');
      setScores([]);
    }
  };

  const fetchSessionProgress = async (showLoading = false) => {
    if (!effectiveSessionId) {
      console.log('No sessionId available for fetchSessionProgress');
      return;
    }
    
    try {
      if (showLoading) {
        setLoadingStatus(true);
      }
      console.log('Fetching session progress for sessionId:', effectiveSessionId);
      const response = await axios.get(`${config.API_URL}/api/game-sessions/${effectiveSessionId}/progress`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      console.log('Session progress response:', response.data);
      
      if (response.data.success) {
        const { status, gameTime: sessionGameTime, timeRemaining: sessionTimeRemaining, startTime: sessionStartTime } = response.data.data;
        console.log('Setting game state:', { status, sessionGameTime, sessionTimeRemaining, sessionStartTime });
        
        setGameStatus(status);
        gameStatusRef.current = status; // Update the ref with current status
        setGameTime(sessionGameTime);
        setTimeRemaining(sessionTimeRemaining);
        setStartTime(sessionStartTime);
        
        // If game is completed, clear the timer
        if (status === 'completed') {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
        }
      }
    } catch (err) {
      console.error('Error fetching session progress:', err);
      console.error('Error details:', err.response?.data);
    } finally {
      if (showLoading) {
        setLoadingStatus(false);
      }
    }
  };

 



  useEffect(() => {
    fetchDevices();
  }, []);

  // Fetch session progress when component mounts or sessionId changes
  useEffect(() => {
    console.log('useEffect triggered with sessionId:', effectiveSessionId);
    if (effectiveSessionId) {
      console.log('Setting up session progress tracking for sessionId:', effectiveSessionId);
      fetchSessionProgress(false);
      
      // Set up interval to fetch session progress every 5 seconds (silent refresh)
      // Only fetch if not in editing mode
      const progressInterval = setInterval(() => {
        if (!isEditingRef.current) {
          fetchSessionProgress(false);
        } else {
          console.log('API call skipped - editing mode is active');
        }
      }, 5000);
      
      return () => {
        console.log('Cleaning up progress interval');
        clearInterval(progressInterval);
      };
    }
  }, [effectiveSessionId]); // Only depend on sessionId to avoid infinite re-renders

  // Separate useEffect for timer logic
  useEffect(() => {
    console.log('Timer useEffect - gameStatus:', gameStatus, 'startTime:', startTime, 'gameTime:', gameTime);
    
    // Clear existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Set up new timer if game is active
    if (gameStatus === 'active' && startTime && gameTime > 0) {
      console.log('Setting up timer for active game');
      timerRef.current = setInterval(() => {
        // Log startTime for debugging
        console.log('Raw startTime:', startTime, 'Type:', typeof startTime);
        // Always parse as UTC ISO string or Date
        let startTimestamp;
        if (typeof startTime === 'string' || startTime instanceof String) {
          startTimestamp = new Date(startTime).getTime();
        } else if (typeof startTime === 'number') {
          // If it's a number, check if it's seconds or ms
          startTimestamp = startTime > 1e12 ? startTime : startTime * 1000;
        } else {
          startTimestamp = Date.now(); // fallback
        }
        const now = Date.now();
        const elapsed = Math.floor((now - startTimestamp) / 1000);
        const remaining = Math.max(0, gameTime - elapsed);
        console.log('Timer update - elapsed:', elapsed, 'remaining:', remaining, 'now:', now, 'startTimestamp:', startTimestamp);
        setTimeRemaining(remaining);
        // If time is up, update status to completed
        if (remaining <= 0) {
          console.log('Game time is up, setting status to completed');
          setGameStatus('completed');
          gameStatusRef.current = 'completed'; // Update the ref
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      }, 1000);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [gameStatus, startTime, gameTime]);

  // Initial data fetch when component mounts or device changes
  // useEffect(() => {
  //   if (selectedDevice) {
  //     fetchScores();
  //   }
  // }, []);

  // Prevent filteredScores update during editing
  useEffect(() => {
    if (isEditingRef.current) return; // Don't update scores while editing
    if (deviceNumbersState && deviceNumbersState.length > 0) {
      Promise.all(deviceNumbersState.map(deviceNumber =>
        axios.get(`${config.API_URL}/api/game-device-scores/device/${deviceNumber}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }).then(res => res.data.data)
      )).then(results => {
        setFilteredScores(results.filter(Boolean));
      });
    } else {
      setFilteredScores(scores);
    }
  }, [deviceNumbersState, scores]);

  useEffect(() => {
    if (isEditingRef.current) return; // Don't update scores while editing
    if (deviceNumbersState && deviceNumbersState.length > 0) {
      const initialScores = deviceNumbersState.map(deviceNumber => ({
        DeviceNumber: deviceNumber,
        OkPressed: 0,
        WrongPressed: 0,
        NoPressed: 0,
        last_time: 0,
        avg_time: 0,
        game_status: 'inactive',
        liveValue: 0,
        finalScore: 0
      }));
      setFilteredScores(initialScores);
    }
  }, [deviceNumbersState]);

  // WebSocket connection for real-time updates
  useEffect(() => {
    
    const wsUrl = process.env.REACT_APP_WEBSOCKET_URL || 'ws://snackboss-iot.in:6060';
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      console.log('WebSocket connected');
    };

    wsRef.current.onmessage = (event) => {
      try {
        const { topic, value } = JSON.parse(event.data);
        // Example topic: "GVC/KP/123"
        console.log('event.data', event.data);
        const match = topic.match("GVC/KP/ALL");
        if (match) {
          console.log("matched")
          const cleanedValue = value.replace(/[*#]/g, '');
          console.log('cleanedValue', cleanedValue);
          const splitValue = cleanedValue.split(",");
          console.log('splitValue', splitValue);
          const deviceNumber = splitValue[0];
          console.log('deviceNumber', deviceNumber);
          
          // Check if game is over - if so, don't process WebSocket data
          console.log('Current game status from ref:', gameStatusRef.current);
          if (gameStatusRef.current === 'completed') {
            console.log('Game is completed, ignoring WebSocket data for device:', deviceNumber);
            return;
          }
          
          // Check if in editing mode - if so, don't process WebSocket data
          if (isEditingRef.current) {
            console.log('In editing mode, ignoring WebSocket data for device:', deviceNumber);
            return;
          }
          
          if(splitValue.length == 3 && splitValue[1] == "Status"){
          setFilteredScores(prevScores =>
            prevScores.map(score =>
              score.DeviceNumber === deviceNumber
                ? { ...score, game_status:splitValue[2] }
                : score
            )
          );
         }
         else  if(splitValue.length==9 && splitValue[1]=="Status"){
          console.log('Updating scores with WebSocket data:', splitValue);
          setFilteredScores(prevScores => 
            prevScores.map(score =>
              score.DeviceNumber === deviceNumber
                ? { ...score, OkPressed:parseInt(splitValue[4]),WrongPressed:parseInt(splitValue[5]),NoPressed:parseInt(splitValue[6]),last_time:parseFloat(splitValue[7]),avg_time:parseFloat(splitValue[8])}
                : score
            )
          );
        }
          // console.log('filteredScores', filteredScores);
        }
      } catch (err) {
        // Ignore non-JSON or unrelated messages
      }
    };

    wsRef.current.onclose = () => {
      console.log('WebSocket disconnected');
    };

    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  useEffect(() => {
    console.log('filteredScores', filteredScores);
  }, [filteredScores]);

  // useEffect(() => {
  //   fetchScores();
    
  //   // Start silent auto-refresh only if device is selected
  //   if (selectedDevice) {
  //     intervalRef.current = setInterval(() => {
  //       fetchScores();
  //     }, 3000); // Refresh every 5 seconds instead of 3
  //   }
    
  //   return () => {
  //     if (intervalRef.current) {
  //       clearInterval(intervalRef.current);
  //       intervalRef.current = null;
  //     }
  //   };
  // }, [selectedDevice]);

  

  const handleStartGame = async () => {
    if (!effectiveSessionId) {
      alert('No session ID found!');
      return;
    }
    try {
      await axios.post(`${config.API_URL}/api/game-sessions/${effectiveSessionId}/start`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      // Reset scores to 0 for all devices when game starts
      if (deviceNumbersState && deviceNumbersState.length > 0) {
        const resetScores = deviceNumbersState.map(deviceNumber => ({
          DeviceNumber: deviceNumber,
          OkPressed: 0,
          WrongPressed: 0,
          NoPressed: 0,
          last_time: 0,
          avg_time: 0,
          game_status: 'active',
          liveValue: 0,
          finalScore: 0
        }));
        setFilteredScores(resetScores);
        console.log('Scores reset to 0 for all devices:', resetScores);
      }
      
      // Refresh session progress after starting
      fetchSessionProgress(false);
    } catch (error) {
      alert('Failed to start game: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleGoBack = () => {
    navigate('/game-session-setup');
  };

  const handleEditSettings = () => {
    // Store current values as initial values to prevent API interference
    setInitialPlayerNames({ ...playerNamesState });
    setInitialDuration(Math.round(gameTime / 60));
    setEditablePlayerNames({ ...playerNamesState });
    setEditableDuration(Math.round(gameTime / 60));
    setIsEditing(true);
    isEditingRef.current = true;
  };

  const handleSaveSettings = async () => {
    // Validate player names
    const names = Object.values(editablePlayerNames);
    const uniqueNames = new Set(names.map(name => name.trim().toLowerCase()));
    if (uniqueNames.size !== names.length) {
      alert('Player names must be unique');
      return;
    }

    // Validate duration
    if (editableDuration < 1 || editableDuration > 10) {
      alert('Game duration must be between 1 and 10 minutes');
      return;
    }

    try {
      // Update session with new settings
      const sessionData = {
        gameTime: editableDuration * 60, // Convert to seconds
        devices: deviceNumbersState,
        playerNames: deviceNumbersState.map(device => editablePlayerNames[device])
      };

      const response = await axios.put(`${config.API_URL}/api/game-sessions/${effectiveSessionId}`, sessionData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.data.success) {
        setPlayerNamesState({ ...editablePlayerNames });
        setGameTime(editableDuration * 60);
        setIsEditing(false);
        isEditingRef.current = false;
        alert('Settings updated successfully!');
      } else {
        alert('Failed to update settings');
      }
    } catch (error) {
      alert('Error updating settings: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleCancelEdit = () => {
    // Reset editable values to initial values when editing started
    setEditablePlayerNames({ ...initialPlayerNames });
    setEditableDuration(initialDuration);
    setIsEditing(false);
    isEditingRef.current = false;
  };

  const handlePlayerNameChange = useCallback((deviceNumber, name) => {
    setEditablePlayerNames(prev => ({
      ...prev,
      [deviceNumber]: name
    }));
  }, []);

  const handleDurationChange = (event) => {
    const value = parseInt(event.target.value);
    if (value >= 1 && value <= 10) {
      setEditableDuration(value);
    }
  };

  const handleCreateNewSession = async () => {
    // Use the same devices, player names, and game time as the completed session
    if (!deviceNumbersState || !playerNamesState || !gameTime) {
      alert('Missing session data to create a new session.');
      return;
    }
    try {
      const userGoogleId = localStorage.getItem('userId');
      const sessionData = {
        gameTime: gameTime,
        devices: deviceNumbersState,
        playerNames: deviceNumbersState.map(device => playerNamesState[device])
      };
      const response = await axios.post(`${config.API_URL}/api/game-sessions/setup`, sessionData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        params: {
          userGoogleId: userGoogleId
        }
      });
      if (response.data.success) {
        // Prepare data for ScoreBoard
        const newSessionData = {
          deviceNumbers: deviceNumbersState,
          sessionId: response.data.data.session.sessionId,
          playerNames: playerNamesState,
          playerStatus: {},
          playerTimeRemaining: {}
        };
        navigate('/game-scores', { state: newSessionData });
      } else {
        alert(response.data.message || 'Failed to create game session');
      }
    } catch (error) {
      alert('Error creating new session: ' + (error.response?.data?.message || error.message));
    }
  };


  const getScoreColor = (type) => {
    switch (type) {
      case 'ok': return '#4caf50';
      case 'wrong': return '#f44336';
      case 'no': return '#ff9800';
      default: return '#757575';
    }
  };

  const getScoreIcon = (type) => {
    switch (type) {
      case 'ok': return <CheckCircleIcon />;
      case 'wrong': return <CancelIcon />;
      case 'no': return <HelpIcon />;
      default: return <GameIcon />;
    }
  };

  const calculateTotalScore = (score) => {
    return (score.OkPressed || 0) + (score.WrongPressed || 0) + (score.NoPressed || 0);
  };

  const calculateAccuracy = (score) => {
    const total = calculateTotalScore(score);
    if (total === 0) return 0;
    return Math.round(((score.OkPressed || 0) / total) * 100);
  };

  const formatLastTime = (timestamp) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp * 1000); // Convert from Unix timestamp
    return date.toLocaleString();
  };

  const getGameStatusColor = (status) => {
    if (!status) return '#8e8e8e';
    switch (status.toLowerCase()) {
      case 'start':
      case 'active':
      case 'playing':
      case 'running':
        return '#00ff88';
      case 'stop':
      case 'stopped':
      case 'offline':
      case 'inactive':
      case 'error':
        return '#ff1744';
      case 'idle':
      case 'waiting':
      case 'paused':
        return '#ff8c00';
      case 'ready':
        return '#00bcd4';
      case 'busy':
        return '#e91e63';
      case 'maintenance':
        return '#9c27b0';
      case 'completed':
        return '#4caf50';
      default:
        return '#8e8e8e';
    }
  };

  const getGameStatusIcon = (status) => {
    if (!status) return <InfoIcon />;
    switch (status.toLowerCase()) {
      case 'active':
      case 'playing':
        return <PlayArrowIcon />;
      case 'idle':
      case 'waiting':
        return <PauseIcon />;
      case 'offline':
      case 'inactive':
        return <CancelIcon />;
      default:
        return <InfoIcon />;
    }
  };

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <Card 
      sx={{ 
        height: '100%',
        background: `linear-gradient(135deg, ${color}15, ${color}05)`,
        border: `1px solid ${color}30`,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: `0 8px 25px ${color}20`,
        }
      }}
    >
      <CardContent sx={{ textAlign: 'center', p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Avatar 
            sx={{ 
              bgcolor: color, 
              width: 56, 
              height: 56,
              boxShadow: `0 4px 12px ${color}40`
            }}
          >
            {icon}
          </Avatar>
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: color, mb: 1 }}>
          {value}
        </Typography>
        <Typography variant="h6" sx={{ color: 'text.primary', mb: 1 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  // Format time for display based on game status
  const getDisplayTime = () => {
    if (gameStatus === 'pending') {
      // For pending games, show total game time
      return formatTimeRemaining(gameTime);
    } else if (gameStatus === 'active') {
      // For active games, show remaining time
      return formatTimeRemaining(timeRemaining);
    } else if (gameStatus === 'completed') {
      // For completed games, show 00:00
      return '00:00';
    } else {
      // For unknown status, show 00:00
      return '00:00';
    }
  };

  // Format time remaining for display
  const formatTimeRemaining = (seconds) => {
    if (seconds <= 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Check if game is over (only when status is actually completed)
  const isGameOver = gameStatus === 'completed';

  // Calculate winner when game is completed
  const getWinner = () => {
    if (gameStatus !== 'completed' || !filteredScores || filteredScores.length === 0) {
      return null;
    }

    // Sort scores by total score (OkPressed + WrongPressed + NoPressed) in descending order
    const sortedScores = [...filteredScores].sort((a, b) => {
      const scoreA = (a.OkPressed || 0) + (a.WrongPressed || 0) + (a.NoPressed || 0);
      const scoreB = (b.OkPressed || 0) + (b.WrongPressed || 0) + (b.NoPressed || 0);
      return scoreB - scoreA;
    });

    const winner = sortedScores[0];
    const winnerName = playerNamesState?.[winner.DeviceNumber] || `Player ${winner.DeviceNumber}`;
    const winnerScore = (winner.OkPressed || 0) + (winner.WrongPressed || 0) + (winner.NoPressed || 0);

    return {
      deviceNumber: winner.DeviceNumber,
      playerName: winnerName,
      totalScore: winnerScore,
      okPressed: winner.OkPressed || 0,
      wrongPressed: winner.WrongPressed || 0,
      noPressed: winner.NoPressed || 0
    };
  };

  // Debug logging for display values
  console.log('Display values:', {
    gameStatus,
    timeRemaining,
    gameTime,
    startTime,
    isGameOver,
    sessionId
  });

  // Get admin status from localStorage
  let isAdmin = false;
  try {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    isAdmin = !!userInfo?.isAdmin;
  } catch (e) {}

  return (
    <Box
      sx={{
        p: 3,
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        boxSizing: 'border-box',
        width: '100%',
        maxWidth: '100vw',
        overflowX: 'hidden',
      }}
    >
      {/* Go Back Button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        {isAdmin && (
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleGoBack}
            sx={{
              px: 3,
              py: 1.5,
              fontSize: '1.1rem',
              borderRadius: 2,
              borderColor: 'primary.main',
              color: 'primary.main',
              '&:hover': {
                borderColor: 'primary.dark',
                backgroundColor: 'primary.50'
              }
            }}
          >
            Back to Game Setup
          </Button>
        )}

        {/* Edit/Save/Cancel Settings Button - Only show when game hasn't started */}
        {gameStatus === 'pending' && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            {isEditing ? (
              <>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveSettings}
                  sx={{
                    px: 3,
                    py: 1.5,
                    fontSize: '1.1rem',
                    borderRadius: 2,
                    bgcolor: 'success.main',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'success.dark'
                    }
                  }}
                >
                  Save
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={handleCancelEdit}
                  sx={{
                    px: 3,
                    py: 1.5,
                    fontSize: '1.1rem',
                    borderRadius: 2,
                    borderColor: 'error.main',
                    color: 'error.main',
                    '&:hover': {
                      borderColor: 'error.dark',
                      backgroundColor: 'error.50'
                    }
                  }}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={handleEditSettings}
                sx={{
                  px: 3,
                  py: 1.5,
                  fontSize: '1.1rem',
                  borderRadius: 2,
                  borderColor: 'secondary.main',
                  color: 'secondary.main',
                  '&:hover': {
                    borderColor: 'secondary.dark',
                    backgroundColor: 'secondary.50'
                  }
                }}
              >
                Edit Settings
              </Button>
            )}
          </Box>
        )}
     
        {/* Game Status and Remaining Time Display */}
      <Box sx={{ 
        mb: 3, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        gap: 4,
        p: 2,
        bgcolor: 'rgba(255,255,255,0.9)',
        borderRadius: 2,
        boxShadow: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ color: getGameStatusColor(gameStatus) }}>
            {getGameStatusIcon(gameStatus)}
          </Box>
          <Typography variant="h5" sx={{ color: getGameStatusColor(gameStatus), fontWeight: 'bold' }}>
            {gameStatus ? gameStatus.charAt(0).toUpperCase() + gameStatus.slice(1) : 'Unknown'}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TimerIcon sx={{ color: 'secondary.main' }} />
          <Box>
            {isEditing && gameStatus === 'pending' ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TextField
                  type="number"
                  value={editableDuration}
                  onChange={handleDurationChange}
                  inputProps={{
                    min: 1,
                    max: 10,
                    step: 1,
                    style: { 
                      fontSize: '1.5rem', 
                      fontWeight: 'bold',
                      textAlign: 'center',
                      color: 'secondary.main'
                    }
                  }}
                  sx={{
                    width: 80,
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: 'secondary.main',
                      },
                      '&:hover fieldset': {
                        borderColor: 'secondary.dark',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'secondary.main',
                      },
                    }
                  }}
                />
                <Typography variant="body2" color="text.secondary">
                  min
                </Typography>
              </Box>
            ) : (
              <Typography variant="h5" color="secondary" sx={{ fontWeight: 'bold' }}>
                {getDisplayTime()}
              </Typography>
            )}
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center' }}>
              {gameStatus === 'pending' ? 'Game Duration' : gameStatus === 'active' ? 'Time Remaining' : 'Game Time'}
            </Typography>
          </Box>
        </Box>
        {gameStatus === 'active' && gameTime > 0 && timeRemaining > 0 && (
          <Box sx={{ width: 200, ml: 2 }}>
            <LinearProgress 
              variant="determinate" 
              value={((gameTime - timeRemaining) / gameTime) * 100} 
              sx={{ 
                height: 8, 
                borderRadius: 4,
                bgcolor: 'rgba(0,0,0,0.1)',
                '& .MuiLinearProgress-bar': {
                  bgcolor: 'secondary.main'
                }
              }} 
            />
          </Box>
        )}
      </Box>
      </Box>

      {/* No Session Banner */}
      {!effectiveSessionId && (
        <Box sx={{ 
          mb: 3, 
          p: 2, 
          bgcolor: 'rgba(255, 152, 0, 0.9)', 
          borderRadius: 2, 
          textAlign: 'center',
          boxShadow: 3
        }}>
          <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold' }}>
            ⚠️ No Active Session
          </Typography>
          <Typography variant="body1" sx={{ color: 'white', opacity: 0.9 }}>
            Please create a game session first
          </Typography>
        </Box>
      )}

      {/* Editing Mode Banner */}
      {isEditing && gameStatus === 'pending' && (
        <Box sx={{ 
          mb: 3, 
          p: 2, 
          bgcolor: 'rgba(33, 150, 243, 0.9)', 
          borderRadius: 2, 
          textAlign: 'center',
          boxShadow: 3
        }}>
          <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
            ✏️ Editing Mode - Click Save to apply changes or Cancel to discard
          </Typography>
          <Typography variant="body2" sx={{ color: 'white', opacity: 0.9, mt: 1 }}>
            Real-time updates are paused during editing to prevent interference
          </Typography>
        </Box>
      )}

      {/* Game Over Banner */}
      {gameStatus === 'completed' && (
        <Box sx={{ 
          mb: 3, 
          p: 2, 
          bgcolor: 'rgba(76, 175, 80, 0.9)', 
          borderRadius: 2, 
          textAlign: 'center',
          boxShadow: 3
        }}>
          <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
            🎉 Game Completed! 🎉
          </Typography>
          <Typography variant="h6" sx={{ color: 'white', opacity: 0.9 }}>
            Final scores are displayed below
          </Typography>
        </Box>
      )}

      {/* Winner Display */}
      {gameStatus === 'completed' && getWinner() && (
        <Box sx={{ 
          mb: 3, 
          p: 3, 
          bgcolor: 'rgba(255, 215, 0, 0.9)', 
          borderRadius: 2, 
          textAlign: 'center',
          boxShadow: 3,
          border: '3px solid #FFD700'
        }}>
          <Typography variant="h3" sx={{ color: '#B8860B', fontWeight: 'bold', mb: 1 }}>
            🏆 WINNER 🏆
          </Typography>
          <Typography variant="h4" sx={{ color: '#B8860B', fontWeight: 'bold', mb: 2 }}>
            {getWinner().playerName}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, mb: 2 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h5" sx={{ color: '#B8860B', fontWeight: 'bold' }}>
                {getWinner().totalScore}
              </Typography>
              <Typography variant="body2" sx={{ color: '#B8860B', opacity: 0.8 }}>
                Total Score
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h5" sx={{ color: '#4CAF50', fontWeight: 'bold' }}>
                {getWinner().okPressed}
              </Typography>
              <Typography variant="body2" sx={{ color: '#4CAF50', opacity: 0.8 }}>
                Correct
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h5" sx={{ color: '#F44336', fontWeight: 'bold' }}>
                {getWinner().wrongPressed}
              </Typography>
              <Typography variant="body2" sx={{ color: '#F44336', opacity: 0.8 }}>
                Wrong
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h5" sx={{ color: '#FF9800', fontWeight: 'bold' }}>
                {getWinner().noPressed}
              </Typography>
              <Typography variant="body2" sx={{ color: '#FF9800', opacity: 0.8 }}>
                Missed
              </Typography>
            </Box>
          </Box>
          <Typography variant="body1" sx={{ color: '#B8860B', opacity: 0.9 }}>
            Device: {getWinner().deviceNumber}
          </Typography>
        </Box>
      )}

      

    

      {/* Large Play Button at the top */}
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 3 }}>
        {gameStatus === 'completed' ? (
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<PlayIcon sx={{ fontSize: 40 }} />}
            sx={{ 
              px: 6, 
              py: 2, 
              fontSize: '2rem', 
              borderRadius: 8, 
              boxShadow: 3,
              opacity: 1
            }}
            onClick={handleCreateNewSession}
          >
            Start New Game
          </Button>
        ) : (
          <Button
            variant="contained"
            color={gameStatus === 'completed' ? "default" : "success"}
            size="large"
            startIcon={gameStatus === 'completed' ? <CheckCircleIcon sx={{ fontSize: 40 }} /> : <PlayIcon sx={{ fontSize: 40 }} />}
            sx={{ 
              px: 6, 
              py: 2, 
              fontSize: '2rem', 
              borderRadius: 8, 
              boxShadow: 3,
              opacity: gameStatus === 'completed' ? 0.7 : 1
            }}
            onClick={handleStartGame}
            disabled={gameStatus === 'active' || gameStatus === 'completed' || !effectiveSessionId}
          >
            {!effectiveSessionId ? 'No Session' : gameStatus === 'completed' ? 'Game Over' : gameStatus === 'active' ? 'Game Running' : 'Start Game'}
          </Button>
        )}
      </Box>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          {/* <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
              <GameIcon sx={{ fontSize: 32 }} />
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                Game Score Board
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                Real-time monitoring of game device performance
              </Typography>
            </Box>
          </Box> */}

          {/* <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Select Device</InputLabel>
              <Select
                value={selectedDevice}
                label="Select Device"
                onChange={handleDeviceChange}
                sx={{ bgcolor: 'white' }}
              >
                <MenuItem value="">
                  <em>All Devices</em>
                </MenuItem>
                {devices.map((device) => (
                  <MenuItem key={device.id} value={device.DeviceNumber}>
                    {device.DeviceNumber}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>


          </Box> */}
        </Box>


      </Box>



      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Content */}
      {filteredScores.length === 0 ? (
        <Zoom in={true}>
          <Paper sx={{ 
            p: 8, 
            textAlign: 'center',
            bgcolor: 'rgba(255,255,255,0.8)',
            backdropFilter: 'blur(10px)'
          }}>
            <GameIcon sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
            <Typography variant="h5" sx={{ color: 'text.secondary', mb: 1 }}>
              {selectedDevice ? 'No scores found for selected device' : 'Please select a device to view scores'}
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              {selectedDevice ? 'The device may not have any recorded scores yet.' : 'Choose a device from the dropdown above to start monitoring.'}
            </Typography>
          </Paper>
        </Zoom>
      ) : (
        <Grid
          container
          spacing={3}
          sx={{
            width: '100%',
            margin: 0,
            justifyContent: 'center',
            alignItems: 'stretch',
            pb: { xs: 2, sm: 4 },
            mb: { xs: 2, sm: 4 },
          }}
        >
          {filteredScores.map(score => (
            <Grid
              item
              key={score.DeviceNumber}
              xs={12}
              sm={6}
              md={4}
              lg={3}
              sx={{ display: 'flex' }}
            >
              <ScoreCard
                score={score}
                playerName={playerNamesState?.[score.DeviceNumber]}
                status={playerStatus?.status}
                timeRemaining={playerTimeRemaining?.g}
                isEditing={isEditing}
                editablePlayerNames={editablePlayerNames}
                handlePlayerNameChange={handlePlayerNameChange}
                gameStatus={gameStatus}
              />
            </Grid>
          ))}
        </Grid>
      )}


    </Box>
  );
};

export default ScoreBoard; 