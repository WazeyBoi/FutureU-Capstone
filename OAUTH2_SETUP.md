# OAuth2 Google Setup Guide

This document explains how to set up Google OAuth2 authentication for the FutureU Capstone project.

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