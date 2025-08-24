# OAuth2 Google Setup Guide

This document explains how to set up Google OAuth2 authentication for the FutureU Capstone project.

## ⚠️ Current Status

**Important**: Google OAuth2 authentication is currently **NOT CONFIGURED** and will not work until proper credentials are set up. 

When OAuth2 is not configured:
- Google login buttons will show a warning message
- Clicking "Continue with Google" will display an error
- Users can still authenticate using email/password

## OAuth2 Configuration Status

You can check the current OAuth2 configuration status at: `http://localhost:8080/api/oauth2/status`

## Prerequisites

1. Google Account
2. Google Cloud Console access

## Setup Steps

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API or People API

### 2. Configure OAuth2 Credentials

1. Navigate to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Select "Web application" as the application type
4. Add authorized redirect URIs:
   - `http://localhost:8080/login/oauth2/code/google`
   - Add production URL when deployed
5. Note down the Client ID and Client Secret

### 3. Update Application Properties

Update the `application.properties` file with your credentials:

```properties
# OAuth2 Google Configuration
spring.security.oauth2.client.registration.google.client-id=YOUR_ACTUAL_GOOGLE_CLIENT_ID
spring.security.oauth2.client.registration.google.client-secret=YOUR_ACTUAL_GOOGLE_CLIENT_SECRET
```

Replace `YOUR_ACTUAL_GOOGLE_CLIENT_ID` and `YOUR_ACTUAL_GOOGLE_CLIENT_SECRET` with the actual values from Google Cloud Console.

### 4. Frontend Integration

The frontend should redirect users to:
```
http://localhost:8080/oauth2/authorization/google
```

After successful authentication, users will be redirected to:
```
http://localhost:5173/auth/callback?token=JWT_TOKEN&userId=USER_ID&email=EMAIL&role=ROLE&firstName=FIRST_NAME
```

## Features

- Automatic user creation for new Google accounts
- Existing user login for accounts already in the database
- JWT token generation for seamless frontend integration
- Profile picture and provider ID storage
- Support for both traditional email/password and OAuth2 authentication

## Security Notes

- Keep your Client Secret secure and never commit it to version control
- Use environment variables in production
- The application supports both stateless JWT and OAuth2 flows
- CORS is configured to allow frontend communication

## Database Changes

The following fields have been added to the `user` table:
- `profile_picture` - Stores Google profile picture URL
- `provider_id` - Stores Google account identifier
- `provider` - Stores authentication provider (e.g., "google")

These fields are automatically populated during OAuth2 authentication.

## Troubleshooting

### Issue: Google Login Redirects to /login Instead of /user-landing-page

**Root Cause**: This happens when OAuth2 credentials are not properly configured.

**Solutions**:
1. **Check Configuration Status**: Visit `http://localhost:8080/api/oauth2/status` to verify OAuth2 setup
2. **Verify Credentials**: Ensure `application.properties` has actual Google credentials, not placeholder values
3. **Check Application Logs**: Look for OAuth2 authentication errors in the backend logs
4. **Validate Google Cloud Setup**: Ensure the Google Cloud project has OAuth2 properly configured

### Issue: Google Authentication Shows "Not Available" Message

**Cause**: OAuth2 configuration validation failed.

**Solutions**:
1. Update `application.properties` with actual Google OAuth2 credentials
2. Restart the backend application
3. Verify the Google Cloud Console setup

### Issue: Authentication Works But Redirects to Wrong URL

**Cause**: OAuth2SuccessHandler misconfiguration.

**Solutions**:
1. Check that the success handler redirects to: `http://localhost:5173/user-landing-page`
2. Verify JWT token generation is working properly
3. Check frontend routing for the `/user-landing-page` endpoint

### Debug Mode

The application includes comprehensive debug logging for OAuth2 flows. Check the backend logs for:
- `OAuth2SuccessHandler` logs
- `CustomOAuth2UserService` logs
- Spring Security OAuth2 debug messages

### Test OAuth2 Configuration

1. **Backend Status**: `GET http://localhost:8080/api/oauth2/status`
2. **OAuth2 Endpoint**: `GET http://localhost:8080/oauth2/authorization/google`
3. **Frontend Check**: Look for warning messages on login/register pages