import React, { useEffect, useState, useRef } from 'react';
import Map, { Marker, Popup, NavigationControl, Source, Layer } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import './MapBox3DView.css'; // Import custom styles

// Using environment variable for MapBox token
// Make sure to add VITE_MAPBOX_TOKEN to your .env file
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1Ijoid2VuZzE1IiwiYSI6ImNtYzZ4aWI2NDE4YzQya3E1MWdiODBwcjYifQ.KRlFj-FQWFc0sbRve4d7Fg';

const MapBox3DView = ({ 
  schools, 
  selectedSchool, 
  setSelectedSchool,
  flyTo,
  mapZoom, 
  schoolLogos,
  mapStyle = "outdoors" // Accept map style as prop with a default value
}) => {  
  const [viewState, setViewState] = useState({
    longitude: flyTo ? flyTo[1] : 123.92222881993207,
    latitude: flyTo ? flyTo[0] : 10.314906600288964,
    zoom: mapZoom || 13,
    pitch: 45, // 3D view angle
    bearing: 0
  });
  
  // State to control terrain visibility
  const [showTerrain, setShowTerrain] = useState(true);
  
  // Available map styles
  const mapStyles = {
    outdoors: "mapbox://styles/mapbox/outdoors-v12",
    streets: "mapbox://styles/mapbox/streets-v12",
    satellite: "mapbox://styles/mapbox/satellite-streets-v12",
    light: "mapbox://styles/mapbox/light-v11",
    dark: "mapbox://styles/mapbox/dark-v11",
    // Custom branded style - blue theme that matches FutureU colors
    futureu: "mapbox://styles/mapbox/streets-v12" // We'll customize this with overlays
  };

  const mapRef = useRef();

  // Update view when flyTo changes
  useEffect(() => {
    if (flyTo && mapRef.current) {
      setViewState(prev => ({
        ...prev,
        longitude: flyTo[1],
        latitude: flyTo[0],
        zoom: mapZoom || 13,
        // When terrain is shown, adjust pitch for better viewing
        pitch: showTerrain ? 60 : 45,
      }));
    }
  }, [flyTo, mapZoom, showTerrain]);
  
  // Adjust pitch when terrain visibility changes
  useEffect(() => {
    setViewState(prev => ({
      ...prev,
      pitch: showTerrain ? 60 : 45,
    }));
  }, [showTerrain]);
  
  // Handle when a school is clicked
  const handleSchoolClick = (school) => {
    setSelectedSchool(school);
    
    // Update view to center on the selected school
    setViewState(prev => ({
      ...prev,
      longitude: school.longitude,
      latitude: school.latitude,
      zoom: 17, // Match the zoom level from 2D view
      pitch: 50, // Slightly increase pitch for better 3D viewing
      bearing: 0
    }));
  };
  
  return (
    <div className="map-container" style={{ width: '100%', height: '100%', borderRadius: '1.5rem', overflow: 'hidden' }}>
      {/* Terrain Control Button - repositioned to bottom right for better visibility */}
      <div style={{ 
        position: 'absolute', 
        bottom: '20px', 
        right: '20px', 
        zIndex: 10
      }}>
        <div style={{ 
          backgroundColor: showTerrain ? '#4285F4' : 'white',
          color: showTerrain ? 'white' : '#4285F4',
          padding: '8px 16px',
          borderRadius: '20px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          transition: 'all 0.3s ease',
          fontWeight: '500',
          fontSize: '14px'
        }} 
        onClick={() => setShowTerrain(prev => !prev)}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" style={{marginRight: '8px'}} viewBox="0 0 16 16">
            <path d="M14.54.8a1 1 0 0 0-1.42 0L10.4 3.6l1.5 1.5 2.72-2.72a1 1 0 0 0 0-1.58zm-5.72 5.72-6.5 6.5H1v-1.32l6.5-6.5 1.32 1.32z"/>
            <path d="M15 11l-5-5-3 3-3-3v6h11V11z"/>
          </svg>
          {showTerrain ? 'Hide 3D Terrain' : 'Show 3D Terrain'}
        </div>
      </div>

      <Map
        ref={mapRef}
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapStyle={mapStyles[mapStyle] || mapStyles["outdoors"]} // Use the selected map style from props
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: '100%', height: '100%' }}
        terrain={showTerrain ? { source: 'mapbox-dem', exaggeration: 1.3 } : null} // Add terrain with slight exaggeration
        onLoad={(evt) => {
          // Add 3D buildings layer when map loads
          const map = evt.target;
          
          // Wait for map style to be fully loaded
          if (map.isStyleLoaded()) {
            // Add 3D building layer if it doesn't exist
            if (!map.getLayer('3d-buildings')) {
              map.addLayer({
                'id': '3d-buildings',
                'source': 'composite',
                'source-layer': 'building',
                'filter': ['==', 'extrude', 'true'],
                'type': 'fill-extrusion',
                'minzoom': 14,
                'paint': {
                  'fill-extrusion-color': [
                    'interpolate',
                    ['linear'],
                    ['get', 'height'],
                    0, '#e0cece',
                    50, '#d9c7c7',
                    100, '#cbb9b9',
                    200, '#b7a7a7',
                    300, '#a79999',
                    400, '#937f7f'
                  ],
                  'fill-extrusion-height': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    15, 0,
                    16, ['get', 'height']
                  ],
                  'fill-extrusion-base': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    15, 0,
                    16, ['get', 'min_height']
                  ],
                  'fill-extrusion-opacity': 0.7
                }
              }, 'waterway-label');
            }
            
            // Add DEM source for terrain
            if (!map.getSource('mapbox-dem')) {
              map.addSource('mapbox-dem', {
                'type': 'raster-dem',
                'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
                'tileSize': 512,
                'maxzoom': 14
              });
            }
          }
        }}
      >
        <NavigationControl position="top-right" />
        
        {/* Add markers for each school */}
        {schools && schools.map((school) => (
          <Marker
            key={school.schoolId}
            longitude={Number(school.longitude)}
            latitude={Number(school.latitude)}
            anchor="bottom"
            onClick={(e) => {
              // Prevent default action to avoid any issues
              e.originalEvent.stopPropagation();
              handleSchoolClick(school);
            }}
          >
            <div className="school-marker-container">
              <div 
                className={`school-marker ${selectedSchool && selectedSchool.schoolId === school.schoolId ? 'active' : ''}`}
                style={{
                  backgroundImage: schoolLogos[school.schoolId] ? 
                    `url(${schoolLogos[school.schoolId]})` : 
                    undefined,
                }}
              />
              <div className="pulse-ring"></div>
            </div>
          </Marker>
        ))}
        
        {/* Popup for selected school */}
        {selectedSchool && (
          <Popup
            longitude={Number(selectedSchool.longitude)}
            latitude={Number(selectedSchool.latitude)}
            anchor="bottom"
            closeOnClick={false}
            closeButton={false}
            className="futureu-popup"
            onClose={() => setSelectedSchool(null)}
            offset={25}
          >
            <div className="school-popup">
              <h3>{selectedSchool.name}</h3>
              <p>{selectedSchool.location}</p>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
};

export default MapBox3DView;
