import React, { useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
// import TestimonialForm from './TestimonialForm';

// Example school data (replace with your real data or fetch from API)
const schools = [
  {
    id: 1,
    name: "Cebu Institute of Technology",
    lat: 10.2945,
    lng: 123.8811,
    description: "A leading technology school in Cebu.",
  },
  {
    id: 2,
    name: "University of San Carlos",
    lat: 10.3521,
    lng: 123.9133,
    description: "A premier university in Cebu.",
  },
  // Add more schools as needed
];

// Custom marker icon
const schoolIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/167/167707.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// Map tile options
const tileOptions = [
  {
    name: "Default",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
  },
  {
    name: "Topo",
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a> contributors'
  },
  {
    name: "Dark",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://carto.com/">CartoDB</a>'
  },
  {
    name: "Satellite",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: 'Tiles &copy; Esri'
  }
];

// Fly to school on marker click
function FlyToSchool({ position }) {
  const map = useMap();
  React.useEffect(() => {
    if (position) map.flyTo(position, 17, { duration: 1.5 });
  }, [position, map]);
  return null;
}

// Show user location
function LocateButton({ mapRef }) {
  const handleLocate = () => {
    if (!mapRef.current) return;
    mapRef.current.locate({
      setView: true,
      maxZoom: 16,
    });
  };
  return (
    <button
      className="absolute top-6 left-6 z-[1000] bg-white border border-blue-200 rounded-full px-4 py-2 shadow hover:bg-blue-50 transition"
      onClick={handleLocate}
      title="Show My Location"
    >
      📍 My Location
    </button>
  );
}

// Reset view to Cebu
function ResetViewButton({ mapRef, center }) {
  return (
    <button
      className="absolute top-6 right-6 z-[1000] bg-white border border-yellow-200 rounded-full px-4 py-2 shadow hover:bg-yellow-50 transition"
      onClick={() => mapRef.current && mapRef.current.setView(center, 13)}
      title="Reset Map View"
    >
      🔄 Reset View
    </button>
  );
}

const SchoolsPage = () => {
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [tileUrl, setTileUrl] = useState(tileOptions[0].url);
  const [tileAttribution, setTileAttribution] = useState(tileOptions[0].attribution);
  const [flyTo, setFlyTo] = useState(null);
  const mapRef = useRef(null);

  // Cebu City center coordinates
  const cebuCenter = [10.3157, 123.8854];

  // Handle tile style change
  const handleTileChange = (e) => {
    const option = tileOptions.find(opt => opt.url === e.target.value);
    setTileUrl(option.url);
    setTileAttribution(option.attribution);
  };

  return (
    <div className="flex flex-col md:flex-row h-[90vh] bg-gradient-to-br from-blue-50 via-yellow-50 to-white relative">
      {/* Map Section */}
      <div className="w-full md:w-2/3 h-[400px] md:h-full flex items-center justify-center p-4 relative">
        {/* Map Style Switcher */}
        <select
          className="absolute top-6 left-1/2 transform -translate-x-1/2 z-[1000] bg-white border border-gray-200 rounded-full px-4 py-2 shadow"
          value={tileUrl}
          onChange={handleTileChange}
        >
          {tileOptions.map(opt => (
            <option key={opt.name} value={opt.url}>{opt.name} Map</option>
          ))}
        </select>
        <LocateButton mapRef={mapRef} />
        <ResetViewButton mapRef={mapRef} center={cebuCenter} />
        <div className="w-full h-full rounded-3xl shadow-2xl overflow-hidden border border-blue-100">
          <MapContainer
            center={cebuCenter}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
            whenCreated={mapInstance => { mapRef.current = mapInstance; }}
          >
            <TileLayer
              attribution={tileAttribution}
              url={tileUrl}
            />
            {schools.map((school) => (
              <React.Fragment key={school.id}>
                <Marker
                  position={[school.lat, school.lng]}
                  icon={schoolIcon}
                  eventHandlers={{
                    click: () => {
                      setSelectedSchool(school);
                      setFlyTo([school.lat, school.lng]);
                    },
                  }}
                >
                  <Popup>
                    <div className="text-center">
                      <strong className="block text-blue-800">{school.name}</strong>
                      <button
                        className="mt-2 px-3 py-1 bg-blue-600 text-white rounded-full shadow hover:bg-blue-700 transition"
                        onClick={() => {
                          setSelectedSchool(school);
                          setFlyTo([school.lat, school.lng]);
                        }}
                      >
                        View Details
                      </button>
                    </div>
                  </Popup>
                  <Tooltip direction="top" offset={[0, -20]} opacity={0.9}>
                    {school.name}
                  </Tooltip>
                </Marker>
                {/* School Area Circle */}
                <Circle
                  center={[school.lat, school.lng]}
                  radius={300}
                  pathOptions={{ color: "#1D63A1", fillColor: "#1D63A1", fillOpacity: 0.1 }}
                />
              </React.Fragment>
            ))}
            {/* Fly to school when selected */}
            {flyTo && <FlyToSchool position={flyTo} />}
          </MapContainer>
        </div>
      </div>

      {/* School Detail & Testimonial Section */}
      <div className="w-full md:w-1/3 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-yellow-100 p-8">
          {selectedSchool ? (
            <div>
              <h2 className="text-3xl font-extrabold mb-2 text-blue-900">{selectedSchool.name}</h2>
              <p className="mb-4 text-gray-700">{selectedSchool.description}</p>
              {/* Add more school details here */}
              <hr className="my-6 border-yellow-200" />
              <h3 className="text-xl font-semibold mb-2 text-yellow-600">Submit a Testimonial</h3>
              {/* <TestimonialForm schoolId={selectedSchool.id} /> */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-700 text-center">
                Testimonial form coming soon!
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <svg className="w-16 h-16 mb-4 text-yellow-200" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.5v-17m0 0L7 7m5-3.5l5 3.5" />
              </svg>
              <span className="text-lg font-medium">Click a school marker to view details and submit a testimonial.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SchoolsPage;