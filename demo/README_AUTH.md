# Authentication & Token Expiration Handling

This document explains how token expiration is handled in the LoveChopraDashboard application.

## Overview

The application now includes automatic token expiration handling that redirects users to the login screen when their JWT token expires or becomes invalid.

## How It Works

### 1. Axios Interceptor (`utils/axiosConfig.js`)

The application uses a centralized axios configuration with interceptors:

- **Request Interceptor**: Automatically adds the JWT token to all API requests
- **Response Interceptor**: Catches 401 errors and token expiration errors, then:
  - Clears all stored authentication data (token, userInfo, userId)
  - Redirects to the login page

### 2. Token Validation on App Startup (`App.js`)

When the application starts, it validates the stored token by making a test API call to `/api/test-auth`. If the token is invalid or expired:
- All stored authentication data is cleared
- User is redirected to the login screen

### 3. Global Error Handling

All API calls now automatically handle token expiration without requiring manual error handling in each component.

## Usage

### For New Components

1. Import the configured axios instance:
```javascript
import api from '../utils/axiosConfig';
```

2. Use it instead of the regular axios:
```javascript
// Instead of:
// const response = await axios.get(`${config.API_URL}/api/endpoint`, {
//   headers: { Authorization: `Bearer ${token}` }
// });

// Use:
const response = await api.get('/api/endpoint');
```

### Benefits

- **Automatic Token Management**: No need to manually add Authorization headers
- **Centralized Error Handling**: Token expiration is handled globally
- **Consistent User Experience**: Users are automatically redirected to login when needed
- **Reduced Code Duplication**: No need to repeat token expiration logic in each component

### Migration Guide

To update existing components:

1. Replace `import axios from 'axios'` with `import api from '../utils/axiosConfig'`
2. Remove manual Authorization headers from API calls
3. Remove manual token expiration handling (the interceptor handles it)
4. Update API URLs to be relative (remove `${config.API_URL}` prefix)

### Example Migration

**Before:**
```javascript
const response = await axios.get(`${config.API_URL}/api/sensor-txns/user`, {
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`
  }
});
```

**After:**
```javascript
const response = await api.get('/api/sensor-txns/user');
```

## Security Features

- Automatic token validation on app startup
- Immediate logout on token expiration
- Complete cleanup of stored authentication data
- Prevention of unauthorized API calls

## Testing

To test token expiration handling:

1. Log in to the application
2. Wait for the JWT token to expire (check your backend configuration)
3. Try to perform any action that requires authentication
4. You should be automatically redirected to the login screen

## Backend Requirements

The backend should return appropriate 401 status codes for:
- Expired JWT tokens
- Invalid JWT tokens
- Missing Authorization headers

The frontend will handle these responses automatically. 