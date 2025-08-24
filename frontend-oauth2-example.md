# Frontend OAuth2 Integration Example

This directory contains a simple example of how to integrate Google OAuth2 authentication from the frontend.

## JavaScript Example

```javascript
// Add this to your frontend application

// Initiate Google OAuth2 login
function loginWithGoogle() {
  // Redirect to backend OAuth2 endpoint
  window.location.href = 'http://localhost:8080/oauth2/authorization/google';
}

// Handle OAuth2 callback
function handleOAuth2Callback() {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  const userId = urlParams.get('userId');
  const email = urlParams.get('email');
  const role = urlParams.get('role');
  const firstName = urlParams.get('firstName');

  if (token) {
    // Store JWT token for future API calls
    localStorage.setItem('futureu_token', token);
    localStorage.setItem('user_id', userId);
    localStorage.setItem('user_email', email);
    localStorage.setItem('user_role', role);
    localStorage.setItem('user_firstName', firstName);

    // Redirect to dashboard or home page
    window.location.href = '/dashboard';
  } else {
    // Handle error
    console.error('OAuth2 authentication failed');
    window.location.href = '/login?error=oauth2_failed';
  }
}

// Add this to your auth callback page (e.g., /auth/callback)
if (window.location.pathname === '/auth/callback') {
  handleOAuth2Callback();
}
```

## React Example

```jsx
import React from 'react';

const GoogleLoginButton = () => {
  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  };

  return (
    <button 
      onClick={handleGoogleLogin}
      className="google-login-btn"
    >
      Login with Google
    </button>
  );
};

// OAuth2 Callback Component
const OAuth2Callback = () => {
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const userId = urlParams.get('userId');
    const email = urlParams.get('email');
    const role = urlParams.get('role');
    const firstName = urlParams.get('firstName');

    if (token) {
      // Store user data and token
      localStorage.setItem('futureu_token', token);
      localStorage.setItem('user_data', JSON.stringify({
        userId,
        email,
        role,
        firstName
      }));

      // Redirect to dashboard
      window.location.href = '/dashboard';
    } else {
      window.location.href = '/login?error=oauth2_failed';
    }
  }, []);

  return <div>Processing login...</div>;
};

export { GoogleLoginButton, OAuth2Callback };
```

## API Usage After Authentication

Once authenticated, include the JWT token in your API requests:

```javascript
// Using fetch
const response = await fetch('http://localhost:8080/api/protected-endpoint', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('futureu_token')}`,
    'Content-Type': 'application/json'
  }
});

// Using axios
axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('futureu_token')}`;
```

## Route Setup

Make sure your frontend routing includes:
- `/auth/callback` - For handling OAuth2 redirect
- Login page with Google login button
- Dashboard or protected routes that verify authentication

## Security Notes

- Always validate the JWT token on protected routes
- Clear localStorage on logout
- Handle token expiration gracefully
- Use HTTPS in production