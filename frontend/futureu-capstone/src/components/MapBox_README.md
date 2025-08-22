# MapBox 3D Map Integration

This feature allows users to toggle between 2D and 3D views of the campus map.

## Setup Instructions

1. Sign up for a free MapBox account at [https://www.mapbox.com/](https://www.mapbox.com/)
2. Generate a new access token from your MapBox dashboard
3. Create a `.env` file in the root of the futureu-capstone project folder if it doesn't exist
4. Add your MapBox token to the `.env` file:
   ```
   VITE_MAPBOX_TOKEN=your_mapbox_access_token_here
   ```
5. Restart your development server

## Features

- Toggle between 2D and 3D map views
- 3D buildings displayed when zoomed in enough
- Custom school markers with logos
- Interactive school selection
- Popup information for selected schools

## Implementation Details

The implementation uses:
- react-map-gl for the React wrapper around MapBox GL JS
- mapbox-gl for the core mapping functionality
- Environment variables to securely store the MapBox access token

## Troubleshooting

If you encounter any issues:
1. Make sure your MapBox token is correctly set in the `.env` file
2. Check that you have the required dependencies installed
3. Ensure the MapBox token has the necessary permissions
