import React, { useState, useEffect, useCallback } from 'react';
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
  TablePagination,
  CircularProgress,
  Alert,
  Snackbar,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Divider,
  Avatar,
  Badge
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Assessment as AssessmentIcon,
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
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import api from '../utils/axiosConfig';
import ReportCharts from './ReportCharts';

const GameScoreReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [stats, setStats] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Filter states
  const [filters, setFilters] = useState({
    deviceNumber: '',
    reportType: '',
    status: '',
    startDate: '',
    endDate: ''
  });

  // Search states for debouncing
  const [searchFilters, setSearchFilters] = useState({
    deviceNumber: '',
    reportType: '',
    status: '',
    startDate: '',
    endDate: ''
  });

  // Detailed view states
  const [selectedReport, setSelectedReport] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [showCharts, setShowCharts] = useState(false);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      // Only trigger search if filters have actually changed
      if (JSON.stringify(filters) !== JSON.stringify(searchFilters)) {
        setSearchFilters(filters);
      }
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [filters, searchFilters]);

  // Fetch data when search filters change
  useEffect(() => {
    fetchReports();
    fetchStats();
  }, [page, rowsPerPage, searchFilters]);

  const fetchReports = async () => {
    try {
      // Only show loading on initial load or when searching
      if (isInitialLoad || searching) {
        setLoading(true);
      }
      
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        ...searchFilters
      };

      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '') {
          delete params[key];
        }
      });

      const response = await api.get('/api/game-score-reports', { params });
      
      if (response.data.success) {
        setReports(response.data.data);
        setTotalItems(response.data.pagination.totalItems);
        setTotalPages(response.data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      setError('Failed to fetch reports');
    } finally {
      setLoading(false);
      setSearching(false);
      setIsInitialLoad(false);
    }
  };

  const fetchStats = async () => {
    try {
      const params = { ...searchFilters };
      Object.keys(params).forEach(key => {
        if (params[key] === '') {
          delete params[key];
        }
      });

      const response = await api.get('/api/game-score-reports/stats', { params });
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
    // Don't reset page immediately - let debounced search handle it
  };

  const handleSearch = () => {
    setSearching(true);
    setSearchFilters(filters);
    setPage(0);
  };

  const clearFilters = () => {
    const emptyFilters = {
      deviceNumber: '',
      reportType: '',
      status: '',
      startDate: '',
      endDate: ''
    };
    setFilters(emptyFilters);
    setSearchFilters(emptyFilters);
    setPage(0);
  };

  const handleViewDetails = (report) => {
    setSelectedReport(report);
    setDetailDialogOpen(true);
  };

  const handleCloseDetailDialog = () => {
    setDetailDialogOpen(false);
    setSelectedReport(null);
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'archived':
        return 'default';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getReportTypeColor = (type) => {
    switch (type) {
      case 'daily':
        return 'primary';
      case 'weekly':
        return 'secondary';
      case 'monthly':
        return 'info';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatResponseTime = (seconds) => {
    return seconds ? `${seconds.toFixed(1)}s` : 'N/A';
  };

  if (loading && reports.length === 0 && isInitialLoad) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ color: '#2E7D32', fontWeight: 600 }}>
        <AssessmentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Game Score Reports
      </Typography>

      {/* Statistics Cards */}
      {/* <Grid container spacing={3} sx={{ mb: 3 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ 
              borderRadius: 2, 
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              '&:hover': { boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)' }
            }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h6" color="textSecondary" gutterBottom>
                      {stat.ReportType} Reports
                    </Typography>
                    <Typography variant="h4" sx={{ color: '#2E7D32', fontWeight: 600 }}>
                      {stat.totalReports || 0}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: '#4CAF50', width: 56, height: 56 }}>
                    <AssessmentIcon />
                  </Avatar>
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="textSecondary">
                    Total Games: {stat.totalGames || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Avg Success: {stat.avgSuccessRate ? `${stat.avgSuccessRate.toFixed(1)}%` : 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Play Time: {formatTime(stat.totalPlayTime || 0)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid> */}

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6" sx={{ color: '#2E7D32' }}>
            <FilterIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Filters
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            {JSON.stringify(filters) !== JSON.stringify(searchFilters) && !searching && (
              <Chip 
                label="Search pending..." 
                size="small" 
                color="warning" 
                icon={<CircularProgress size={16} />}
              />
            )}
            {searching && (
              <Chip 
                label="Searching..." 
                size="small" 
                color="info" 
                icon={<CircularProgress size={16} />}
              />
            )}
            <Button
              startIcon={<ClearIcon />}
              onClick={clearFilters}
              variant="outlined"
              size="small"
            >
              Clear Filters
            </Button>
          </Box>
        </Box>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              label="Device Number"
              value={filters.deviceNumber}
              onChange={(e) => handleFilterChange('deviceNumber', e.target.value)}
              size="small"
              placeholder="Search device..."
            />
          </Grid>
        
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              label="End Date"
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
         
        </Grid>
      </Paper>

      {/* Charts Toggle */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ color: '#2E7D32', fontWeight: 600 }}>
          Game Score Reports
        </Typography>
        {/* <Button
          variant="outlined"
          startIcon={<AssessmentIcon />}
          onClick={() => setShowCharts(!showCharts)}
          sx={{ 
            borderColor: '#4CAF50', 
            color: '#4CAF50',
            '&:hover': { 
              borderColor: '#388E3C', 
              bgcolor: '#E8F5E8' 
            } 
          }}
        >
          {showCharts ? 'Hide Charts' : 'Show Charts'}
        </Button> */}
      </Box>

      {/* Charts Section */}
      {showCharts && (
        <Box sx={{ mb: 3 }}>
          <ReportCharts reports={reports} stats={stats} />
        </Box>
      )}

      {/* Reports Table */}
      <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
        {searching && (
          <LinearProgress sx={{ bgcolor: '#4CAF50' }} />
        )}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#4CAF50' }}>
                <TableCell sx={{ color: '#FFC107', fontWeight: 'bold',fontSize: '18px' }}>Device</TableCell>
                <TableCell sx={{ color: '#FFC107', fontWeight: 'bold',fontSize: '18px' }}>Date</TableCell>
                <TableCell sx={{ color: '#FFC107', fontWeight: 'bold',fontSize: '18px' }}>Ok Pressed</TableCell>
                <TableCell sx={{ color: '#FFC107', fontWeight: 'bold',fontSize: '18px' }}>Wrong Pressed</TableCell>
             
                <TableCell sx={{ color: '#FFC107', fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <GameIcon sx={{ mr: 1, color: '#4CAF50' }} />
                      <Typography variant="body2" fontWeight="500" fontSize="18px">
                        {report.DeviceNumber}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Typography variant="body2" fontSize="18px">
                        {formatDate(report.ReportDate)} {report.createdAt ? new Date(report.createdAt).toLocaleTimeString() : ''}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontSize: '18px' }}>{report.TotalOkPressed}</TableCell>
                  <TableCell sx={{ color: 'red', fontWeight: 'bold', fontSize: '18px' }}>{report.TotalWrongPressed}</TableCell>
                
                 
                  
                 
                 
                
                  <TableCell>
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => handleViewDetails(report)}
                        sx={{ color: '#4CAF50' }}
                      >
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={totalItems}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Paper>

      {/* Detail Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={handleCloseDetailDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: '#4CAF50', color: '#FFC107' }}>
          <Box display="flex" alignItems="center">
            <AssessmentIcon sx={{ mr: 1 }} />
            Report Details
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {selectedReport && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom sx={{ color: '#2E7D32' }}>
                  Basic Information
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="textSecondary">Device Number</Typography>
                  <Typography variant="body1" fontWeight="500">{selectedReport.DeviceNumber}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="textSecondary">Report Date</Typography>
                  <Typography variant="body1" fontWeight="500">{formatDate(selectedReport.ReportDate)} {new Date(selectedReport.createdAt).toLocaleTimeString()}</Typography>
                </Box>
              
               
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom sx={{ color: '#2E7D32' }}>
                  Game Statistics
                </Typography>
             
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="textSecondary">Success Rate</Typography>
                  <Typography variant="body1" fontWeight="500">
                    {selectedReport.SuccessRate ? `${selectedReport.SuccessRate.toFixed(1)}%` : 'N/A'}
                  </Typography>
                </Box>
               
              
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom sx={{ color: '#2E7D32' }}>
                  Button Press Statistics
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Card sx={{ bgcolor: '#E8F5E8' }}>
                      <CardContent>
                        <Typography variant="h6" color="success.main" align="center">
                          {selectedReport.TotalOkPressed}
                        </Typography>
                        <Typography variant="body2" align="center" color="textSecondary">
                          OK Pressed
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Card sx={{ bgcolor: '#FFF3E0' }}>
                      <CardContent>
                        <Typography variant="h6" color="warning.main" align="center">
                          {selectedReport.TotalWrongPressed}
                        </Typography>
                        <Typography variant="body2" align="center" color="textSecondary">
                          Wrong Pressed
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Card sx={{ bgcolor: '#FFEBEE' }}>
                      <CardContent>
                        <Typography variant="h6" color="error.main" align="center">
                          {selectedReport.TotalNoPressed}
                        </Typography>
                        <Typography variant="body2" align="center" color="textSecondary">
                          No Pressed
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ color: '#2E7D32' }}>
                  Response Time Analysis
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Box textAlign="center">
                      <Typography variant="h6" color="primary.main">
                        {formatResponseTime(selectedReport.AverageResponseTime)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Average Response
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box textAlign="center">
                      <Typography variant="h6" color="success.main">
                        {formatResponseTime(selectedReport.FastestResponseTime)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Fastest Response
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box textAlign="center">
                      <Typography variant="h6" color="error.main">
                        {formatResponseTime(selectedReport.SlowestResponseTime)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Slowest Response
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Grid>

              {selectedReport.Notes && (
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ color: '#2E7D32' }}>
                    Notes
                  </Typography>
                  <Paper sx={{ p: 2, bgcolor: '#F5F5F5' }}>
                    <Typography variant="body2">{selectedReport.Notes}</Typography>
                  </Paper>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetailDialog} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
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

export default GameScoreReports; 