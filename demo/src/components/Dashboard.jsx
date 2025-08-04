import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';
import { Sensors as SensorIcon } from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import axios from 'axios';
import config from '../config';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSensors: 0,
    onlineSensors: 0,
    offlineSensors: 0,
    sensorTypes: {}
  });

  const COLORS = ['#00C49F', '#FF8042', '#0088FE', '#FFBB28', '#FF8042'];

  const pieData = [
    { name: 'Active Sensors', value: stats.onlineSensors },
    { name: 'Inactive Sensors', value: stats.offlineSensors },
  ];

  const typePieData = Object.entries(stats.sensorTypes).map(([type, count]) => ({
    name: type,
    value: count
  }));

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        
        // Fetch user's sensors
        const response = await axios.get(`${config.API_URL}/sensors/`, {
          params: { user_id: userId },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const sensors = response.data;
        const onlineSensors = sensors.filter(sensor => sensor.status === 'ACTIVE').length;
        
        // Calculate sensor type distribution
        const typeDistribution = sensors.reduce((acc, sensor) => {
          acc[sensor.type] = (acc[sensor.type] || 0) + 1;
          return acc;
        }, {});
        
        setStats({
          totalSensors: sensors.length,
          onlineSensors: onlineSensors,
          offlineSensors: sensors.length - onlineSensors,
          sensorTypes: typeDistribution
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box 
      component={Paper} 
      sx={{ 
        p: 3,
        width: '100%',
        maxWidth: '100% !important',
        margin: '0 !important',
        boxSizing: 'border-box'
      }}
    >
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Box 
        sx={{ 
          display: 'flex',
          flexWrap: 'wrap',
          gap: 3,
          width: '100%'
        }}
      >
        <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
          <Card sx={{ width: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <SensorIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Total Sensors</Typography>
              </Box>
              <Typography variant="h4">{stats.totalSensors}</Typography>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
          <Card sx={{ width: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <SensorIcon sx={{ mr: 1, color: 'success.main' }} />
                <Typography variant="h6">Active Sensors</Typography>
              </Box>
              <Typography variant="h4">{stats.onlineSensors}</Typography>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
          <Card sx={{ width: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <SensorIcon sx={{ mr: 1, color: 'error.main' }} />
                <Typography variant="h6">Inactive Sensors</Typography>
              </Box>
              <Typography variant="h4">{stats.offlineSensors}</Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      <Box 
        sx={{ 
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          gap: 3,
          width: '100%',
          mt: 3
        }}
      >
        <Box sx={{ flex: 1, width: '50%' }}>
          <Card sx={{ height: '100%', width: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Sensor Status Distribution
              </Typography>
              <Box sx={{ height: 400, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={150}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: 1, width: '50%' }}>
          <Card sx={{ height: '100%', width: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Sensor Type Distribution
              </Typography>
              <Box sx={{ height: 400, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={typePieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={150}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {typePieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
} 