import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { Box, Typography, Paper } from '@mui/material';
import axios from 'axios';
import config from './config';

export default function Login({ onLogin }) {
  const handleSuccess = async (credentialResponse) => {
    try {
      const response = await axios.post(`${config.API_URL}/auth/google`, {
        credential: credentialResponse.credential,
      });
      console.log('Login response:', response.data.user);
      onLogin(response.data.token, response.data.user);

      const userId = response.data.user.sub;
      localStorage.setItem('userId', userId);

      // Send user details to save in SensorUser table
      const userResponse = await axios.post(`${config.API_URL}/users`, {
        name: response.data.user.name,
        email: response.data.user.email,
        google_id: response.data.user.sub,
      }, {
        headers: {
          Authorization: `Bearer ${response.data.token}`,
        },
      });

      // Store the user_id in localStorage
    
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleError = () => {
    console.error('Login Failed');
  };

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          maxWidth: 400,
          width: '100%',
        }}
      >
        <Box
          component="img"
          src="/JoyLogo.jpg"
          alt="Joy Logo"
          sx={{
            width: '200px',
            height: 'auto',
            mb: 3,
          }}
        />
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 3 }}>
          Please sign in to access the dashboard
        </Typography>
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={handleError}
          useOneTap
        />
      </Paper>
    </Box>
  );
}
