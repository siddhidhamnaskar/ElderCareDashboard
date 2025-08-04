import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Paper,
  Fade,
  Zoom,
  LinearProgress,
  Badge,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Timer as TimerIcon,
  EmojiEvents as TrophyIcon,
  Person as PersonIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Help as HelpIcon,
  Refresh as RefreshIcon,
  Wifi as WifiIcon,
  WifiOff as WifiOffIcon,
  SportsEsports as GameIcon,
  Stop as StopIcon,
  Pause as PauseIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon
} from '@mui/icons-material';
import axios from 'axios';
import config from '../config';

const DeviceDisplay = () => {
  const { deviceNumber } = useParams();
  const [gameStatus, setGameStatus] = useState(null);
  const [gameResults, setGameResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState(null);

  useEffect(() => {
    if (deviceNumber) {
      fetchGameStatus();
      fetchDeviceInfo();
      // Poll for updates every 2 seconds
      const interval = setInterval(fetchGameStatus, 2000);
      return () => clearInterval(interval);
    }
  }, [deviceNumber]);

  // Timer effect for countdown
  useEffect(() => {
    let interval;
    if (gameStatus?.status === 'active' && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Game ended, fetch results
            setTimeout(() => {
              fetchGameResults();
              setShowResults(true);
            }, 1000);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameStatus?.status, timeRemaining]);

  const fetchDeviceInfo = async () => {
    try {
      const response = await axios.get(`${config.API_URL}/api/game-devices/number/${deviceNumber}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setDeviceInfo(response.data);
    } catch (error) {
      console.error('Error fetching device info:', error);
    }
  };

  const fetchGameStatus = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${config.API_URL}/api/device-display/${deviceNumber}/status`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.data.success) {
        const status = response.data.data;
        setGameStatus(status);
        setTimeRemaining(status.timeRemaining || 0);
        setError('');
      } else {
        setError(response.data.message || 'Failed to fetch game status');
      }
    } catch (error) {
      console.error('Error fetching game status:', error);
      setError('Failed to connect to device');
    } finally {
      setLoading(false);
    }
  };

  const fetchGameResults = async () => {
    try {
      const response = await axios.get(`${config.API_URL}/api/device-display/${deviceNumber}/results`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.data.success) {
        setGameResults(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching game results:', error);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'active':
        return 'success';
      case 'completed':
        return 'info';
      case 'offline':
        return 'error';
      case 'idle':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <PauseIcon />;
      case 'active':
        return <PlayIcon />;
      case 'completed':
        return <CheckIcon />;
      case 'offline':
        return <WifiOffIcon />;
      case 'idle':
        return <HelpIcon />;
      default:
        return <GameIcon />;
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 1:
        return 'gold';
      case 2:
        return 'silver';
      case 3:
        return '#cd7f32'; // bronze
      default:
        return 'primary.main';
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <TrophyIcon />;
      case 2:
        return <TrophyIcon />;
      case 3:
        return <TrophyIcon />;
      default:
        return <PersonIcon />;
    }
  };

  const isDeviceOnline = () => {
    if (!deviceInfo?.lastHeartBeatTime) return false;
    const lastHeartbeat = new Date(deviceInfo.lastHeartBeatTime);
    const now = new Date();
    const timeDifference = now - lastHeartbeat;
    return timeDifference < 300000; // 5 minutes
  };

  if (loading && !gameStatus) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" action={
          <Button color="inherit" size="small" onClick={fetchGameStatus}>
            Retry
          </Button>
        }>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Device Header */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <GameIcon sx={{ fontSize: 40, color: 'primary.main' }} />
              <Box>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                  Device {deviceNumber}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {deviceInfo?.NL ? `Level ${deviceInfo.NL}` : 'Game Device'}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Chip
                icon={isDeviceOnline() ? <WifiIcon /> : <WifiOffIcon />}
                label={isDeviceOnline() ? 'Online' : 'Offline'}
                color={isDeviceOnline() ? 'success' : 'error'}
                variant="outlined"
              />
              <IconButton onClick={fetchGameStatus} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Game Status Display */}
      {gameStatus && (
        <Grid container spacing={3}>
          {/* Current Game Status */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {getStatusIcon(gameStatus.status)}
                  Current Game Status
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <Chip
                    icon={getStatusIcon(gameStatus.status)}
                    label={gameStatus.status.toUpperCase()}
                    color={getStatusColor(gameStatus.status)}
                    sx={{ fontSize: '1.1rem', py: 1 }}
                  />
                </Box>

                {gameStatus.playerName && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body1" color="textSecondary">
                      Player Name:
                    </Typography>
                    <Typography variant="h6" color="primary">
                      {gameStatus.playerName}
                    </Typography>
                  </Box>
                )}

                {gameStatus.sessionId && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="textSecondary">
                      Session ID: {gameStatus.sessionId.slice(0, 8)}...
                    </Typography>
                  </Box>
                )}

                {/* Countdown Timer */}
                {gameStatus.status === 'active' && timeRemaining > 0 && (
                  <Box sx={{ textAlign: 'center', mb: 2 }}>
                    <Typography variant="h3" color="error" sx={{ fontWeight: 'bold' }}>
                      {formatTime(timeRemaining)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Time Remaining
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={((gameStatus.gameTime - timeRemaining) / gameStatus.gameTime) * 100}
                      sx={{ mt: 1, height: 8, borderRadius: 4 }}
                    />
                  </Box>
                )}

                {gameStatus.status === 'pending' && (
                  <Alert severity="info">
                    Waiting for game to start...
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Live Scoreboard */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUpIcon />
                  Live Scoreboard
                </Typography>

                {gameStatus.players && gameStatus.players.length > 0 ? (
                  <List dense>
                    {gameStatus.players
                      .sort((a, b) => (b.currentScore || 0) - (a.currentScore || 0))
                      .map((player, index) => (
                        <ListItem
                          key={player.deviceNumber}
                          sx={{
                            backgroundColor: player.deviceNumber === deviceNumber ? 'primary.50' : 'transparent',
                            borderRadius: 1,
                            mb: 1
                          }}
                        >
                          <ListItemAvatar>
                            <Badge
                              badgeContent={index + 1}
                              color="primary"
                              anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'left',
                              }}
                            >
                              <Avatar sx={{ 
                                bgcolor: getRankColor(index + 1),
                                width: 32,
                                height: 32
                              }}>
                                {getRankIcon(index + 1)}
                              </Avatar>
                            </Badge>
                          </ListItemAvatar>
                          <ListItemText
                            primary={player.playerName}
                            secondary={`Device ${player.deviceNumber}`}
                          />
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                              {player.currentScore || 0}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {player.okPressed || 0} ✓ {player.wrongPressed || 0} ✗ {player.noPressed || 0} -
                            </Typography>
                          </Box>
                        </ListItem>
                      ))}
                  </List>
                ) : (
                  <Alert severity="info">
                    No players in current session
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Final Results Display */}
      {showResults && gameResults && (
        <Fade in={showResults}>
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrophyIcon color="primary" />
                Game Results
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Typography variant="h6" gutterBottom>
                    Final Rankings
                  </Typography>
                  <List>
                    {gameResults.players
                      .sort((a, b) => (b.finalScore || 0) - (a.finalScore || 0))
                      .map((player, index) => (
                        <ListItem
                          key={player.deviceNumber}
                          sx={{
                            backgroundColor: player.deviceNumber === deviceNumber ? 'primary.50' : 'transparent',
                            borderRadius: 1,
                            mb: 1
                          }}
                        >
                          <ListItemAvatar>
                            <Badge
                              badgeContent={index + 1}
                              color="primary"
                              anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'left',
                              }}
                            >
                              <Avatar sx={{ 
                                bgcolor: getRankColor(index + 1),
                                width: 40,
                                height: 40
                              }}>
                                {getRankIcon(index + 1)}
                              </Avatar>
                            </Badge>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="h6">
                                  {player.playerName}
                                </Typography>
                                {index === 0 && (
                                  <Chip label="WINNER" color="success" size="small" />
                                )}
                              </Box>
                            }
                            secondary={`Device ${player.deviceNumber}`}
                          />
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                              {player.finalScore || 0}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              Final Score
                            </Typography>
                          </Box>
                        </ListItem>
                      ))}
                  </List>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Typography variant="h6" gutterBottom>
                    Session Summary
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText
                        primary="Game Duration"
                        secondary={formatTime(gameResults.gameTime)}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Total Players"
                        secondary={gameResults.players.length}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Winner"
                        secondary={gameResults.players.find(p => p.isWinner)?.playerName || 'N/A'}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Your Rank"
                        secondary={
                          gameResults.players
                            .sort((a, b) => (b.finalScore || 0) - (a.finalScore || 0))
                            .findIndex(p => p.deviceNumber === deviceNumber) + 1
                        }
                      />
                    </ListItem>
                  </List>
                </Grid>
              </Grid>

              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Button
                  variant="outlined"
                  onClick={() => setShowResults(false)}
                  startIcon={<RefreshIcon />}
                >
                  Back to Live View
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Fade>
      )}

      {/* No Game Status */}
      {!gameStatus && !loading && (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <GameIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="textSecondary" gutterBottom>
              No Active Game Session
            </Typography>
            <Typography variant="body2" color="textSecondary">
              This device is not currently participating in any game session.
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default DeviceDisplay; 