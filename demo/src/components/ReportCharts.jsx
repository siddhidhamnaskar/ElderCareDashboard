import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Chip
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Speed as SpeedIcon,
  AccessTime as AccessTimeIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';

const ReportCharts = ({ reports, stats }) => {
  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatResponseTime = (seconds) => {
    return seconds ? `${seconds.toFixed(1)}s` : 'N/A';
  };

  const getSuccessRateColor = (rate) => {
    if (rate >= 80) return '#4CAF50';
    if (rate >= 60) return '#FF9800';
    return '#F44336';
  };

  const getResponseTimeColor = (time) => {
    if (time <= 2) return '#4CAF50';
    if (time <= 5) return '#FF9800';
    return '#F44336';
  };

  // Calculate summary statistics
  const calculateSummary = () => {
    if (!reports || reports.length === 0) return null;

    const totalGames = reports.reduce((sum, report) => sum + report.TotalGames, 0);
    const totalOkPressed = reports.reduce((sum, report) => sum + report.TotalOkPressed, 0);
    const totalWrongPressed = reports.reduce((sum, report) => sum + report.TotalWrongPressed, 0);
    const totalNoPressed = reports.reduce((sum, report) => sum + report.TotalNoPressed, 0);
    const totalPlayTime = reports.reduce((sum, report) => sum + report.TotalPlayTime, 0);
    
    const avgSuccessRate = reports.reduce((sum, report) => sum + (report.SuccessRate || 0), 0) / reports.length;
    const avgResponseTime = reports.reduce((sum, report) => sum + (report.AverageResponseTime || 0), 0) / reports.length;

    return {
      totalGames,
      totalOkPressed,
      totalWrongPressed,
      totalNoPressed,
      totalPlayTime,
      avgSuccessRate,
      avgResponseTime
    };
  };

  const summary = calculateSummary();

  if (!summary) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="textSecondary">
          No data available for charts
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ color: '#2E7D32', fontWeight: 600, mb: 3 }}>
        Analytics Overview
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            borderRadius: 2, 
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            '&:hover': { boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)' }
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h6" color="textSecondary" gutterBottom>
                    Total Games
                  </Typography>
                  <Typography variant="h4" sx={{ color: '#2E7D32', fontWeight: 600 }}>
                    {summary.totalGames}
                  </Typography>
                </Box>
                <Box sx={{ 
                  bgcolor: '#E8F5E8', 
                  borderRadius: '50%', 
                  p: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <TrendingUpIcon sx={{ color: '#4CAF50', fontSize: 32 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            borderRadius: 2, 
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            '&:hover': { boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)' }
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h6" color="textSecondary" gutterBottom>
                    Success Rate
                  </Typography>
                  <Typography variant="h4" sx={{ 
                    color: getSuccessRateColor(summary.avgSuccessRate), 
                    fontWeight: 600 
                  }}>
                    {summary.avgSuccessRate.toFixed(1)}%
                  </Typography>
                </Box>
                <Box sx={{ 
                  bgcolor: '#E8F5E8', 
                  borderRadius: '50%', 
                  p: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <CheckCircleIcon sx={{ color: '#4CAF50', fontSize: 32 }} />
                </Box>
              </Box>
              <Box sx={{ mt: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={summary.avgSuccessRate}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: '#E0E0E0',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: getSuccessRateColor(summary.avgSuccessRate)
                    }
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            borderRadius: 2, 
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            '&:hover': { boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)' }
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h6" color="textSecondary" gutterBottom>
                    Avg Response
                  </Typography>
                  <Typography variant="h4" sx={{ 
                    color: getResponseTimeColor(summary.avgResponseTime), 
                    fontWeight: 600 
                  }}>
                    {formatResponseTime(summary.avgResponseTime)}
                  </Typography>
                </Box>
                <Box sx={{ 
                  bgcolor: '#E8F5E8', 
                  borderRadius: '50%', 
                  p: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <SpeedIcon sx={{ color: '#4CAF50', fontSize: 32 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            borderRadius: 2, 
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            '&:hover': { boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)' }
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h6" color="textSecondary" gutterBottom>
                    Total Play Time
                  </Typography>
                  <Typography variant="h4" sx={{ color: '#2E7D32', fontWeight: 600 }}>
                    {formatTime(summary.totalPlayTime)}
                  </Typography>
                </Box>
                <Box sx={{ 
                  bgcolor: '#E8F5E8', 
                  borderRadius: '50%', 
                  p: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <AccessTimeIcon sx={{ color: '#4CAF50', fontSize: 32 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Button Press Analysis */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#2E7D32', fontWeight: 600 }}>
              Button Press Analysis
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="body2" color="textSecondary">
                  OK Pressed
                </Typography>
                <Typography variant="body2" fontWeight="500">
                  {summary.totalOkPressed}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={(summary.totalOkPressed / (summary.totalOkPressed + summary.totalWrongPressed + summary.totalNoPressed)) * 100}
                sx={{
                  height: 12,
                  borderRadius: 6,
                  bgcolor: '#E0E0E0',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: '#4CAF50'
                  }
                }}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="body2" color="textSecondary">
                  Wrong Pressed
                </Typography>
                <Typography variant="body2" fontWeight="500">
                  {summary.totalWrongPressed}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={(summary.totalWrongPressed / (summary.totalOkPressed + summary.totalWrongPressed + summary.totalNoPressed)) * 100}
                sx={{
                  height: 12,
                  borderRadius: 6,
                  bgcolor: '#E0E0E0',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: '#FF9800'
                  }
                }}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="body2" color="textSecondary">
                  No Pressed
                </Typography>
                <Typography variant="body2" fontWeight="500">
                  {summary.totalNoPressed}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={(summary.totalNoPressed / (summary.totalOkPressed + summary.totalWrongPressed + summary.totalNoPressed)) * 100}
                sx={{
                  height: 12,
                  borderRadius: 6,
                  bgcolor: '#E0E0E0',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: '#F44336'
                  }
                }}
              />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#2E7D32', fontWeight: 600 }}>
              Performance Metrics
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="body2" color="textSecondary">
                  Success Rate
                </Typography>
                <Chip 
                  label={`${summary.avgSuccessRate.toFixed(1)}%`}
                  color={summary.avgSuccessRate >= 80 ? 'success' : summary.avgSuccessRate >= 60 ? 'warning' : 'error'}
                  size="small"
                />
              </Box>
              <LinearProgress
                variant="determinate"
                value={summary.avgSuccessRate}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: '#E0E0E0',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: getSuccessRateColor(summary.avgSuccessRate)
                  }
                }}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="body2" color="textSecondary">
                  Response Time
                </Typography>
                <Chip 
                  label={formatResponseTime(summary.avgResponseTime)}
                  color={summary.avgResponseTime <= 2 ? 'success' : summary.avgResponseTime <= 5 ? 'warning' : 'error'}
                  size="small"
                />
              </Box>
              <LinearProgress
                variant="determinate"
                value={Math.min((summary.avgResponseTime / 10) * 100, 100)}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: '#E0E0E0',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: getResponseTimeColor(summary.avgResponseTime)
                  }
                }}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="body2" color="textSecondary">
                  Engagement
                </Typography>
                <Chip 
                  label={`${summary.totalGames} games`}
                  color="primary"
                  size="small"
                />
              </Box>
              <LinearProgress
                variant="determinate"
                value={Math.min((summary.totalGames / 100) * 100, 100)}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: '#E0E0E0',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: '#4CAF50'
                  }
                }}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Report Type Distribution */}
      {stats && stats.length > 0 && (
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom sx={{ color: '#2E7D32', fontWeight: 600 }}>
            Report Type Distribution
          </Typography>
          <Grid container spacing={2}>
            {stats.map((stat, index) => (
              <Grid item xs={12} sm={4} key={index}>
                <Card sx={{ bgcolor: '#F5F5F5' }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Box>
                        <Typography variant="h6" sx={{ color: '#2E7D32', fontWeight: 600 }}>
                          {stat.ReportType}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {stat.totalReports} reports
                        </Typography>
                      </Box>
                      <Chip 
                        label={stat.totalGames || 0}
                        color="primary"
                        size="small"
                      />
                    </Box>
                    <Box sx={{ mt: 2 }}>
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
          </Grid>
        </Paper>
      )}
    </Box>
  );
};

export default ReportCharts; 