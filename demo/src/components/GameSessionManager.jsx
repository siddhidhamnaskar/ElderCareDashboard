import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  Snackbar,
  CircularProgress,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Badge
} from '@mui/material';
import {
  SportsEsports as GameIcon,
  PlayArrow as StartIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  Timer as TimerIcon,
  Person as PersonIcon,
  EmojiEvents as TrophyIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Pause as PauseIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import axios from 'axios';
import config from '../config';
import { useNavigate } from 'react-router-dom';

const GameSessionManager = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionDetails, setSessionDetails] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchSessions();
    // Auto-refresh every 5 seconds for real-time updates
    const interval = setInterval(fetchSessions, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${config.API_URL}/api/game-sessions`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (response.data.success) {
        setSessions(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching game sessions:', error);
      showSnackbar('Error fetching game sessions', 'error');
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

  const handleStartSession = async (sessionId) => {
    try {
      const response = await axios.post(`${config.API_URL}/api/game-sessions/${sessionId}/start`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.data.success) {
        showSnackbar('Game session started successfully!', 'success');
        fetchSessions();
      } else {
        showSnackbar(response.data.message || 'Failed to start session', 'error');
      }
    } catch (error) {
      console.error('Error starting session:', error);
      showSnackbar('Error starting session', 'error');
    }
  };

  const handleEndSession = async (sessionId) => {
    try {
      const response = await axios.post(`${config.API_URL}/api/game-sessions/${sessionId}/end`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.data.success) {
        showSnackbar('Game session ended successfully!', 'success');
        fetchSessions();
      } else {
        showSnackbar(response.data.message || 'Failed to end session', 'error');
      }
    } catch (error) {
      console.error('Error ending session:', error);
      showSnackbar('Error ending session', 'error');
    }
  };

  const handleViewDetails = async (session) => {
    setSelectedSession(session);
    try {
      const response = await axios.get(`${config.API_URL}/api/game-sessions/${session.sessionId}/results`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.data.success) {
        setSessionDetails(response.data.data);
        setDetailsDialogOpen(true);
      }
    } catch (error) {
      console.error('Error fetching session details:', error);
      showSnackbar('Error fetching session details', 'error');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'active':
        return 'success';
      case 'completed':
        return 'info';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <ScheduleIcon />;
      case 'active':
        return <PlayIcon />;
      case 'completed':
        return <CheckIcon />;
      case 'cancelled':
        return <CancelIcon />;
      default:
        return <GameIcon />;
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleString();
  };

  const calculateTimeRemaining = (session) => {
    if (session.status !== 'active' || !session.startTime) return 0;
    
    const startTime = new Date(session.startTime);
    const now = new Date();
    const elapsed = Math.floor((now - startTime) / 1000);
    const remaining = Math.max(0, session.gameTime - elapsed);
    
    return remaining;
  };

  const getProgressPercentage = (session) => {
    if (session.status !== 'active' || !session.startTime) return 0;
    
    const startTime = new Date(session.startTime);
    const now = new Date();
    const elapsed = Math.floor((now - startTime) / 1000);
    const percentage = Math.min(100, (elapsed / session.gameTime) * 100);
    
    return percentage;
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <GameIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            Game Session Manager
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchSessions}
          disabled={loading}
        >
          {loading ? <CircularProgress size={20} /> : 'Refresh'}
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                {sessions.length}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Total Sessions
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main">
                {sessions.filter(s => s.status === 'pending').length}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Pending
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                {sessions.filter(s => s.status === 'active').length}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Active
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="info.main">
                {sessions.filter(s => s.status === 'completed').length}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Completed
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Sessions Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Game Sessions
          </Typography>
          
          {sessions.length === 0 ? (
            <Alert severity="info">
              No game sessions found. Create a new session to get started.
            </Alert>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Session ID</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Players</TableCell>
                    <TableCell>Duration</TableCell>
                    <TableCell>Time Remaining</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sessions.map((session) => {
                    const timeRemaining = calculateTimeRemaining(session);
                    const progressPercentage = getProgressPercentage(session);
                    
                    return (
                      <TableRow key={session.sessionId} hover>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                            {session.sessionId.slice(0, 8)}...
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={getStatusIcon(session.status)}
                            label={session.status}
                            color={getStatusColor(session.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {session.players?.length || 0} players
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatTime(session.gameTime)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {session.status === 'active' ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2" color="error">
                                {formatTime(timeRemaining)}
                              </Typography>
                              <LinearProgress
                                variant="determinate"
                                value={progressPercentage}
                                sx={{ width: 60, height: 6 }}
                              />
                            </Box>
                          ) : (
                            <Typography variant="body2" color="textSecondary">
                              -
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatDateTime(session.createdAt)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                onClick={() => handleViewDetails(session)}
                              >
                                <ViewIcon />
                              </IconButton>
                            </Tooltip>
                            
                            {session.status === 'active' && (
                              <Tooltip title="End Session">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleEndSession(session.sessionId)}
                                >
                                  <StopIcon />
                                </IconButton>
                              </Tooltip>
                            )}
                            <Tooltip title="Score Board">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => navigate('/game-scores', {
                                  state: {
                                    deviceNumbers: session.players?.map(p => p.deviceNumber),
                                    sessionId: session.sessionId,
                                    playerNames: session.players?.reduce((acc, p) => {
                                      acc[p.deviceNumber] = p.playerName;
                                      return acc;
                                    }, {}),
                                    playerStatus: session.status,
                                    playerTimeRemaining: session.gameTime
                                  }
                                })}
                              >
                                <TrendingUpIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Session Details Dialog */}
      <Dialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Session Details - {selectedSession?.sessionId}
        </DialogTitle>
        <DialogContent>
          {sessionDetails && (
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Session Information
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText
                        primary="Status"
                        secondary={
                          <Chip
                            icon={getStatusIcon(sessionDetails.status)}
                            label={sessionDetails.status}
                            color={getStatusColor(sessionDetails.status)}
                            size="small"
                          />
                        }
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Game Duration"
                        secondary={formatTime(sessionDetails.gameTime)}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Start Time"
                        secondary={formatDateTime(sessionDetails.startTime)}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="End Time"
                        secondary={formatDateTime(sessionDetails.endTime)}
                      />
                    </ListItem>
                  </List>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Players & Scores
                  </Typography>
                  {sessionDetails.players && sessionDetails.players.length > 0 ? (
                    <List dense>
                      {sessionDetails.players
                        .sort((a, b) => (b.finalScore || 0) - (a.finalScore || 0))
                        .map((player, index) => (
                          <ListItem key={player.deviceNumber}>
                            <ListItemAvatar>
                              <Badge
                                badgeContent={index + 1}
                                color="primary"
                                anchorOrigin={{
                                  vertical: 'top',
                                  horizontal: 'left',
                                }}
                              >
                                <Avatar sx={{ bgcolor: index === 0 ? 'gold' : 'primary.main' }}>
                                  {index === 0 ? <TrophyIcon /> : <PersonIcon />}
                                </Avatar>
                              </Badge>
                            </ListItemAvatar>
                            <ListItemText
                              primary={player.playerName}
                              secondary={`Device ${player.deviceNumber}`}
                            />
                            <Box sx={{ textAlign: 'right' }}>
                              <Typography variant="h6" color="primary">
                                {player.finalScore || 0}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                Score
                              </Typography>
                            </Box>
                          </ListItem>
                        ))}
                    </List>
                  ) : (
                    <Alert severity="info">No players found</Alert>
                  )}
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

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

export default GameSessionManager; 