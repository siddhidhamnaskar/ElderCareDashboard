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
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Badge,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress
} from '@mui/material';
import {
  SportsEsports as GameIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Visibility as ViewIcon,
  EmojiEvents as TrophyIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Timer as TimerIcon,
  Person as PersonIcon,
  Speed as SpeedIcon,
  History as HistoryIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  BarChart as ChartIcon
} from '@mui/icons-material';
import axios from 'axios';
import config from '../config';

const GameResults = () => {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionDetails, setSessionDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [filters, setFilters] = useState({
    status: '',
    dateRange: '',
    searchTerm: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${config.API_URL}/api/game-sessions`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        params: {
          status: 'completed',
          ...filters
        }
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

  const handleExportResults = (session) => {
    // Create CSV data
    const csvData = [
      ['Rank', 'Player Name', 'Device', 'Final Score', 'Correct Presses', 'Wrong Presses', 'Missed Presses', 'Avg Response Time'],
      ...session.players
        .sort((a, b) => (b.finalScore || 0) - (a.finalScore || 0))
        .map((player, index) => [
          index + 1,
          player.playerName,
          player.deviceNumber,
          player.finalScore || 0,
          player.okPressed || 0,
          player.wrongPressed || 0,
          player.noPressed || 0,
          player.avgResponseTime || 0
        ])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `game-results-${session.sessionId}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    showSnackbar('Results exported successfully!', 'success');
  };

  const handleShareResults = (session) => {
    const shareText = `Game Results - Session ${session.sessionId.slice(0, 8)}...\n\n` +
      session.players
        .sort((a, b) => (b.finalScore || 0) - (a.finalScore || 0))
        .map((player, index) => `${index + 1}. ${player.playerName}: ${player.finalScore || 0} points`)
        .join('\n');

    if (navigator.share) {
      navigator.share({
        title: 'Game Results',
        text: shareText
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareText);
      showSnackbar('Results copied to clipboard!', 'success');
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

  const getPlayerRank = (players, playerId) => {
    const sortedPlayers = [...players].sort((a, b) => (b.finalScore || 0) - (a.finalScore || 0));
    return sortedPlayers.findIndex(p => p.id === playerId) + 1;
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

  const filteredSessions = sessions.filter(session => {
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      const hasMatchingPlayer = session.players?.some(player => 
        player.playerName.toLowerCase().includes(searchLower) ||
        player.deviceNumber.toLowerCase().includes(searchLower)
      );
      if (!hasMatchingPlayer) return false;
    }
    return true;
  });

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <TrophyIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            Game Results
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
                Completed Games
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                {sessions.reduce((total, session) => total + (session.players?.length || 0), 0)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Total Players
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main">
                {sessions.reduce((total, session) => {
                  const maxScore = Math.max(...(session.players?.map(p => p.finalScore || 0) || [0]));
                  return total + maxScore;
                }, 0)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Total Points
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="info.main">
                {sessions.length > 0 ? 
                  Math.round(sessions.reduce((total, session) => total + session.gameTime, 0) / 60) : 0
                }
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Total Minutes
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Filters
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Search Players"
                value={filters.searchTerm}
                onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                fullWidth
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FilterIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Date Range</InputLabel>
                <Select
                  value={filters.dateRange}
                  label="Date Range"
                  onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                >
                  <MenuItem value="">All Time</MenuItem>
                  <MenuItem value="today">Today</MenuItem>
                  <MenuItem value="week">This Week</MenuItem>
                  <MenuItem value="month">This Month</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Button
                variant="outlined"
                startIcon={<ClearIcon />}
                onClick={() => setFilters({ status: '', dateRange: '', searchTerm: '' })}
                fullWidth
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Game Results History
          </Typography>
          
          {filteredSessions.length === 0 ? (
            <Alert severity="info">
              No completed game sessions found.
            </Alert>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Session ID</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Players</TableCell>
                    <TableCell>Duration</TableCell>
                    <TableCell>Winner</TableCell>
                    <TableCell>Top Score</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredSessions.map((session) => {
                    const sortedPlayers = session.players?.sort((a, b) => (b.finalScore || 0) - (a.finalScore || 0)) || [];
                    const winner = sortedPlayers[0];
                    const topScore = winner?.finalScore || 0;
                    
                    return (
                      <TableRow key={session.sessionId} hover>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                            {session.sessionId.slice(0, 8)}...
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatDateTime(session.endTime)}
                          </Typography>
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
                          {winner ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar sx={{ width: 24, height: 24, bgcolor: 'gold' }}>
                                <TrophyIcon sx={{ fontSize: 16 }} />
                              </Avatar>
                              <Typography variant="body2">
                                {winner.playerName}
                              </Typography>
                            </Box>
                          ) : (
                            <Typography variant="body2" color="textSecondary">
                              -
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="primary" sx={{ fontWeight: 'bold' }}>
                            {topScore}
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
                            <Tooltip title="Export Results">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleExportResults(session)}
                              >
                                <DownloadIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Share Results">
                              <IconButton
                                size="small"
                                color="secondary"
                                onClick={() => handleShareResults(session)}
                              >
                                <ShareIcon />
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
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Game Results - {selectedSession?.sessionId}
        </DialogTitle>
        <DialogContent>
          {sessionDetails && (
            <Box>
              <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 2 }}>
                <Tab label="Scoreboard" />
                <Tab label="Player Statistics" />
                <Tab label="Session Details" />
              </Tabs>

              {activeTab === 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Final Rankings
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Rank</TableCell>
                          <TableCell>Player</TableCell>
                          <TableCell>Device</TableCell>
                          <TableCell>Final Score</TableCell>
                          <TableCell>Correct</TableCell>
                          <TableCell>Wrong</TableCell>
                          <TableCell>Missed</TableCell>
                          <TableCell>Avg Response</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {sessionDetails.players
                          ?.sort((a, b) => (b.finalScore || 0) - (a.finalScore || 0))
                          .map((player, index) => (
                            <TableRow key={player.deviceNumber}>
                              <TableCell>
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
                              </TableCell>
                              <TableCell>
                                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                  {player.playerName}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Chip label={`Device ${player.deviceNumber}`} size="small" />
                              </TableCell>
                              <TableCell>
                                <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                                  {player.finalScore || 0}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" color="success.main">
                                  {player.okPressed || 0}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" color="error.main">
                                  {player.wrongPressed || 0}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" color="warning.main">
                                  {player.noPressed || 0}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {player.avgResponseTime ? `${player.avgResponseTime.toFixed(2)}s` : '-'}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}

              {activeTab === 1 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Individual Player Statistics
                  </Typography>
                  <Grid container spacing={2}>
                    {sessionDetails.players?.map((player) => (
                      <Grid item xs={12} md={6} key={player.deviceNumber}>
                        <Card>
                          <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                              <Avatar sx={{ bgcolor: 'primary.main' }}>
                                <PersonIcon />
                              </Avatar>
                              <Box>
                                <Typography variant="h6">{player.playerName}</Typography>
                                <Typography variant="body2" color="textSecondary">
                                  Device {player.deviceNumber}
                                </Typography>
                              </Box>
                            </Box>
                            
                            <Grid container spacing={2}>
                              <Grid item xs={6}>
                                <Typography variant="body2" color="textSecondary">
                                  Final Score
                                </Typography>
                                <Typography variant="h5" color="primary">
                                  {player.finalScore || 0}
                                </Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="body2" color="textSecondary">
                                  Accuracy
                                </Typography>
                                <Typography variant="h5" color="success.main">
                                  {player.okPressed && player.wrongPressed ? 
                                    `${Math.round((player.okPressed / (player.okPressed + player.wrongPressed)) * 100)}%` : 
                                    '0%'
                                  }
                                </Typography>
                              </Grid>
                              <Grid item xs={12}>
                                <Typography variant="body2" color="textSecondary" gutterBottom>
                                  Performance Breakdown
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                                  <Chip 
                                    label={`Correct: ${player.okPressed || 0}`} 
                                    color="success" 
                                    size="small" 
                                  />
                                  <Chip 
                                    label={`Wrong: ${player.wrongPressed || 0}`} 
                                    color="error" 
                                    size="small" 
                                  />
                                  <Chip 
                                    label={`Missed: ${player.noPressed || 0}`} 
                                    color="warning" 
                                    size="small" 
                                  />
                                </Box>
                                {player.avgResponseTime && (
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <SpeedIcon fontSize="small" />
                                    <Typography variant="body2">
                                      Avg Response: {player.avgResponseTime.toFixed(2)}s
                                    </Typography>
                                  </Box>
                                )}
                              </Grid>
                            </Grid>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              {activeTab === 2 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Session Information
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <List>
                        <ListItem>
                          <ListItemText
                            primary="Session ID"
                            secondary={sessionDetails.sessionId}
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
                      <List>
                        <ListItem>
                          <ListItemText
                            primary="Total Players"
                            secondary={sessionDetails.players?.length || 0}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Total Points"
                            secondary={sessionDetails.players?.reduce((sum, p) => sum + (p.finalScore || 0), 0) || 0}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Average Score"
                            secondary={
                              sessionDetails.players?.length ? 
                                Math.round(sessionDetails.players.reduce((sum, p) => sum + (p.finalScore || 0), 0) / sessionDetails.players.length) : 
                                0
                            }
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Status"
                            secondary={
                              <Chip
                                label={sessionDetails.status}
                                color="success"
                                size="small"
                              />
                            }
                          />
                        </ListItem>
                      </List>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleExportResults(sessionDetails)}>
            Export
          </Button>
          <Button onClick={() => handleShareResults(sessionDetails)}>
            Share
          </Button>
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

export default GameResults; 