import React, { useState, useEffect, useRef } from "react";
import apiClient from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import CesiumSchoolsGlobe from "./CesiumSchoolsGlobe";
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import cdu_school_logo from '../assets/school_logos/cdu_school_logo.png';
import citu_school_logo from '../assets/school_logos/citu_school_logo.png';
import cnu_school_logo from '../assets/school_logos/cnu_school_logo.png';
import ctu_school_logo from '../assets/school_logos/ctu_school_logo.png';
import iau_school_logo from '../assets/school_logos/iau_school_logo.png';
import swu_school_logo from '../assets/school_logos/swu_school_logo.png';
import uc_school_logo from '../assets/school_logos/uc_school_logo.png';
import usc_school_logo from '../assets/school_logos/usc_school_logo.png';
import usjr_school_logo from '../assets/school_logos/usjr_school_logo.png';
import up_school_logo from '../assets/school_logos/up_school_logo.png';
import uv_school_logo from '../assets/school_logos/uv_school_logo.png';
import { useClickAway } from "react-use"; // Add this at the top if you want to close dropdown on outside click (optional)

// School logo mapping
const schoolLogos = {
  1: cdu_school_logo,
  2: citu_school_logo,
  3: cnu_school_logo,
  4: ctu_school_logo,
  5: iau_school_logo,
  6: swu_school_logo,
  7: uc_school_logo,
  8: usc_school_logo,
  9: usjr_school_logo,
  10: up_school_logo,
  11: uv_school_logo,
};

const schoolIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/167/167707.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const defaultMapCenter = [10.314906600288964, 123.92222881993207];
const defaultMapZoom = 13;

function FlyToSchool({ position, zoom }) {
  const map = useMap();
  React.useEffect(() => {
    if (position && zoom) map.flyTo(position, zoom, { duration: 1.5 });
  }, [position, zoom, map]);
  return null;
}

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

function getSchoolMarkerIcon(schoolId) {
  const logo = schoolLogos[schoolId];
  return L.divIcon({
    className: 'custom-school-marker',
    iconSize: [48, 56],
    iconAnchor: [24, 56],
    popupAnchor: [0, -56],
    html: `
      <div style="position: relative; width: 48px; height: 56px;">
        <svg width="48" height="56" viewBox="0 0 48 56" fill="none" xmlns="http://www.w3.org/2000/svg" style="position:absolute;top:0;left:0;z-index:1;">
          <ellipse cx="24" cy="20" rx="18" ry="18" fill="#fff" stroke="#4285F4" stroke-width="3"/>
          <path d="M24 55C24 55 42 35.5 42 20C42 9.50659 33.4934 1 23.9999 1C14.5066 1 6 9.50659 6 20C6 35.5 24 55 24 55Z" fill="#4285F4" stroke="#4285F4" stroke-width="2"/>
        </svg>
        <div style="position:absolute;top:6px;left:6px;width:36px;height:36px;display:flex;align-items:center;justify-content:center;overflow:hidden;border-radius:50%;background:#fff;z-index:2;">
          ${logo ? `<img src="${logo}" alt="logo" style="width:44px;height:44px;object-fit:cover;" />` : ''}
        </div>
      </div>
    `
  });
}

const VirtualCampusToursPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [school, setSchool] = useState("");
  const [schoolType, setSchoolType] = useState("");
  const [filteredCampuses, setFilteredCampuses] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [realSchoolData, setRealSchoolData] = useState({});
  const [apiSchools, setApiSchools] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [enhancedCampuses, setEnhancedCampuses] = useState([]); // New state for enhanced campuses
  const [viewMode, setViewMode] = useState("2d"); // "2d" for Leaflet, "3d" for Cesium
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [flyTo, setFlyTo] = useState(defaultMapCenter);
  const [mapZoom, setMapZoom] = useState(defaultMapZoom);
  const [tileUrl, setTileUrl] = useState(tileOptions[0].url);
  const [tileAttribution, setTileAttribution] = useState(tileOptions[0].attribution);
  const [tours, setTours] = useState([]);
  const [schools, setSchools] = useState([]);
  const mapRef = useRef(null);
  const [schoolSearch, setSchoolSearch] = useState("");
  const [showSchoolDropdown, setShowSchoolDropdown] = useState(false);
  const schoolInputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Animation variants - simplified for smoother animations
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.4, ease: "easeOut" } }
  };

  const slideUp = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        type: "spring", 
        stiffness: 70, 
        damping: 15 
      } 
    },
    hover: { 
      y: -5, 
      boxShadow: "0px 10px 25px rgba(0, 0, 0, 0.1)",
      transition: { type: "spring", stiffness: 300, damping: 20 }
    }
  };

  // Map school names as they might appear in the API to the names in our current data
  // This helps match schools from the API to our existing video data
  const schoolNameMapping = {
    "Cebu Institute of Technology - University": ["CIT", "CIT-U", "Cebu Institute of Technology"],
    "University of San Jose - Recoletos": ["USJ-R", "San Jose Recoletos"],
    "Southwestern University - PHINMA": ["SWU", "Southwestern University"],
    "University of San Carlos": ["USC", "San Carlos"],
    "University of the Visayas - Main Campus": ["UV", "University of the Visayas"],
    "Cebu Doctors' University": ["CDU", "Cebu Doctors"],
    "Cebu Technological University": ["CTU", "Cebu Tech"],
    "Indiana Aerospace University": ["IAU", "Indiana Aerospace"],
    "Cebu Normal University": ["CNU", "Normal University"],
  };

  // Helper function to find a matching school name across different formats
  const findMatchingSchool = (apiSchoolName) => {
    for (const [displayName, alternativeNames] of Object.entries(schoolNameMapping)) {
      if (
        displayName.toLowerCase().includes(apiSchoolName.toLowerCase()) ||
        alternativeNames.some(alt => apiSchoolName.toLowerCase().includes(alt.toLowerCase()))
      ) {
        return displayName;
      }
    }
    return null;
  };

  // Fetch school metadata from API
  useEffect(() => {
    const fetchSchoolData = async () => {
      setIsLoading(true);
      try {
        // First try the getAllSchools endpoint
        const response = await apiClient.get('/school/getAllSchools');
        console.log("API Response:", response.data);
        
        setApiSchools(response.data);
        
        // Create a map of school name to school metadata
        const schoolMap = {};
        
        response.data.forEach(school => {
          // Debug each school object
          console.log("Processing school:", school);
          
          // The API might return school data in different formats
          // Let's check the possible property names
          const schoolName = school.schoolName || school.name || "";
          const schoolLocation = school.location || school.address || "";
          const schoolType = school.schoolType || school.type || "";
          const schoolDescription = school.description || school.about || "";
          
          console.log(`School data: Name=${schoolName}, Location=${schoolLocation}, Type=${schoolType}`);
          
          // Try to match this school to our existing data
          const matchedName = findMatchingSchool(schoolName) || schoolName;
          
          if (matchedName) {
            schoolMap[matchedName] = {
              location: schoolLocation,
              schoolType: schoolType,
              description: schoolDescription
            };
            
            console.log(`Matched school ${schoolName} to ${matchedName}`);
          }
        });
        
        console.log("Final school mapping:", schoolMap);
        setRealSchoolData(schoolMap);
      } catch (error) {
        console.error("Error fetching from getAllSchools:", error);
        
        // If the first endpoint fails, try another one
        try {
          const response = await apiClient.get('/api/school/test');
          console.log("API Test Response:", response.data);
          
          // If we can reach the test endpoint but not the data, there might be other issues
          alert("Connected to API but couldn't retrieve school data. Check console for details.");
        } catch (fallbackError) {
          console.error("Error fetching from test endpoint:", fallbackError);
          alert("Could not connect to school API. Using default data instead.");
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSchoolData();
  }, []);

  // Log the enhanced campuses for debugging
  useEffect(() => {
    console.log("Enhanced campuses with real data:", enhancedCampuses);
  }, [enhancedCampuses]);

  useEffect(() => {
    // Filter campuses based on search query and selected filters
    const filtered = enhancedCampuses.filter(
      (campus) =>
        (searchQuery ? campus.name.toLowerCase().includes(searchQuery.toLowerCase()) : true) &&
        (school ? campus.name === school : true) &&
        (schoolType ? campus.schoolType === schoolType : true)
    );
    
    // Sort the filtered campuses alphabetically by name
    const sortedFiltered = [...filtered].sort((a, b) => 
      a.name.localeCompare(b.name)
    );
    
    setFilteredCampuses(sortedFiltered);
  }, [searchQuery, school, schoolType, enhancedCampuses]);

  const handleReset = () => {
    setSchool("");
    setSchoolType("");
    setSearchQuery("");
  };

  // Check if any featured schools match the search query
  const hasFeaturedResults = searchQuery && filteredCampuses.some(campus => campus.featured);

  // Render function for campus cards to avoid duplication
  const renderCampusCard = (campus, index) => (
    <motion.div
      key={`${campus.name}-${index}`}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      transition={{ 
        delay: index * 0.05,
        duration: 0.3
      }}
      className="bg-white rounded-xl overflow-hidden shadow-[rgba(0,0,0,0.08)_0px_8px_24px] border border-gray-100 transition-all duration-300"
    >
      <div className="relative aspect-video overflow-hidden">
        <iframe
          className="w-full h-full"
          src={campus.video}
          title={campus.name}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
        
        {campus.featured && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="absolute top-3 right-3 bg-amber-400 text-xs font-bold px-3 py-1 rounded-full text-black shadow-md"
          >
            FEATURED
          </motion.div>
        )}
      </div>
      
      <div className="p-5 text-left">
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          {campus.name}
        </h3>
        
        <div className="flex items-center space-x-3 mt-3">
          <div className="flex items-center text-sm text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {campus.location}
          </div>
          <div className="text-sm text-gray-400">•</div>
          <div className="flex items-center text-sm text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            {campus.schoolType}
          </div>
        </div>
        
        <div className="mt-4 bg-white p-4 rounded-lg shadow-md">
          <p className="text-sm text-gray-600">
            {campus.description}
          </p>
        </div>
      </div>
    </motion.div>
  );

  const handleSchoolMarkerClick = (schoolObj) => {
    setSelectedSchool(schoolObj);
    setSchool(schoolObj.name);
    setSchoolSearch(schoolObj.name); // <-- Sync search bar with selected school
    setFlyTo([Number(schoolObj.latitude), Number(schoolObj.longitude)]);
    setMapZoom(17); // Zoom in to school
  };

  const handleClearSchool = () => {
    setSelectedSchool(null);
    setSchool("");
    setFlyTo(defaultMapCenter);
    setMapZoom(defaultMapZoom);
    if (mapRef.current) {
      mapRef.current.setView(defaultMapCenter, defaultMapZoom, { animate: true });
    }
  };

  const handleTileChange = (e) => {
    const option = tileOptions.find(opt => opt.url === e.target.value);
    setTileUrl(option.url);
    setTileAttribution(option.attribution);
  };

  // Fetch schools and tours from backend
  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      apiClient.get("/school/getAllSchools"),
      apiClient.get("/virtualcampustours/getAllVirtualCampousTours"),
    ])
      .then(([schoolsRes, toursRes]) => {
        setSchools(schoolsRes.data);
        setTours(toursRes.data);
      })
      .catch((err) => {
        console.error("Failed to fetch data:", err);
      })
      .finally(() => setIsLoading(false));
  }, []);

  // Helper to get school info by id
  const getSchoolInfo = (schoolObj) => {
    if (!schoolObj) return {};
    // If backend returns school as object, use as is
    if (schoolObj.name) return schoolObj;
    // If only id, find in schools array
    return schools.find((s) => s.schoolId === schoolObj) || {};
  };

  // Render function for campus tour cards
  const renderTourCard = (tour, index) => {
    const school = getSchoolInfo(tour.school);
    return (
      <motion.div
        key={tour.virtualCampusTourId}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover="hover"
        transition={{
          delay: index * 0.05,
          duration: 0.3,
        }}
        className="bg-white rounded-xl overflow-hidden shadow-[rgba(0,0,0,0.08)_0px_8px_24px] border border-gray-100 transition-all duration-300"
      >
        <div className="relative aspect-video overflow-hidden">
          <iframe
            className="w-full h-full"
            src={tour.virtualCampusTourUrl}
            title={school.name || "Virtual Tour"}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
          {tour.featured && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="absolute top-3 right-3 bg-amber-400 text-xs font-bold px-3 py-1 rounded-full text-black shadow-md"
            >
              FEATURED
            </motion.div>
          )}
        </div>
        <div className="p-5 text-left">
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            {school.name || "Unknown School"}
          </h3>
          <div className="flex items-center space-x-3 mt-3">
            <div className="flex items-center text-sm text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {school.location}
            </div>
            <div className="text-sm text-gray-400">•</div>
            <div className="flex items-center text-sm text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              {school.type}
            </div>
            <div className="text-sm text-gray-400">•</div>
            <div className="flex items-center text-sm text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
                <text x="12" y="16" textAnchor="middle" fontSize="10" fill="currentColor">{tour.views}</text>
              </svg>
              {tour.views} views
            </div>
          </div>
          <div className="mt-4 bg-white p-4 rounded-lg shadow-md">
            <p className="text-sm text-gray-600">{tour.caption}</p>
          </div>
        </div>
      </motion.div>
    );
  };

  const handleSchoolSelect = (schoolObj) => {
    setSchoolSearch(schoolObj.name);
    setSelectedSchool(schoolObj);
    setSchool(schoolObj.name);
    setFlyTo([Number(schoolObj.latitude), Number(schoolObj.longitude)]);
    setMapZoom(17);
    setShowSchoolDropdown(false);
  };

  const handleSchoolInputKeyDown = (e) => {
    if (e.key === "Enter" && filteredSchools.length > 0) {
      handleSchoolSelect(filteredSchools[0]);
    }
    if (e.key === "Escape") {
      setShowSchoolDropdown(false);
    }
  };

  // Filtered schools for dropdown
  const filteredSchools = schools.filter(s =>
    s.name.toLowerCase().includes(schoolSearch.toLowerCase())
  );

  // Optional: close dropdown when clicking outside
  useClickAway(dropdownRef, () => setShowSchoolDropdown(false));

  // When schoolSearch is cleared, reset map
  useEffect(() => {
    if (schoolSearch === "") {
      setSelectedSchool(null);
      setSchool("");
      setFlyTo(defaultMapCenter);
      setMapZoom(defaultMapZoom);
    }
  }, [schoolSearch]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Wave */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-r from-slate-800 to-slate-900 text-white relative"
      >
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <motion.h1 
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="text-4xl font-bold mb-4 tracking-tight"
          >
            Virtual Campus Tours
          </motion.h1>
          <motion.p 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="text-xl max-w-3xl mx-auto text-gray-200"
          >
            Experience the campus environment. Explore facilities,
            classrooms, and student spaces through our immersive virtual tours.
          </motion.p>
        </div>
        
        {/* Wave Shape */}
        <div className="absolute bottom-0 left-0 right-0 h-16 overflow-hidden">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full h-auto">
            <path fill="#f9fafb" fillOpacity="1" d="M0,96L80,106.7C160,117,320,139,480,138.7C640,139,800,117,960,96C1120,75,1280,53,1360,42.7L1440,32L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"></path>
          </svg>
        </div>
      </motion.div>

      {/* --- MOVE THIS MAP SECTION UP, right after the hero section --- */}
      <div className="flex justify-center mb-4 mt-4">
        <button
          className={`px-6 py-2 font-semibold rounded-l-full border transition-all duration-200 shadow-sm
            ${viewMode === "2d"
              ? "bg-gradient-to-r from-blue-600 to-blue-400 text-white border-blue-700 shadow-lg scale-105 z-10"
              : "bg-white text-blue-700 border-blue-400 hover:bg-blue-50"}
          `}
          onClick={() => setViewMode("2d")}
        >
          2D Map
        </button>
        <button
          className={`px-6 py-2 font-semibold rounded-r-full border transition-all duration-200 shadow-sm
            ${viewMode === "3d"
              ? "bg-gradient-to-r from-blue-600 to-blue-400 text-white border-blue-700 shadow-lg scale-105 z-10"
              : "bg-white text-blue-700 border-blue-400 hover:bg-blue-50"}
          `}
          onClick={() => setViewMode("3d")}
        >
          3D Globe
        </button>
      </div>
      <div className="flex flex-col md:flex-row h-[85vh] items-stretch bg-gradient-to-br from-blue-50 via-yellow-50 to-white relative max-w-7xl mx-auto rounded-3xl shadow-2xl border border-blue-100 mb-8">
        {viewMode === "2d" ? (
          <div className="w-full h-full flex items-center justify-center p-4 relative">
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
            {/* Clear School Button */}
            {selectedSchool && (
              <button
                onClick={handleClearSchool}
                className="absolute top-6 right-6 z-[1000] bg-white border border-yellow-200 rounded-full px-4 py-2 shadow hover:bg-yellow-50 transition"
              >
                Clear School
              </button>
            )}
            <div className="w-full h-full rounded-3xl shadow-2xl overflow-hidden border border-blue-100">
              <MapContainer
                center={flyTo}
                zoom={mapZoom}
                style={{ height: "100%", width: "100%" }}
                whenCreated={mapInstance => { mapRef.current = mapInstance; }}
              >
                <TileLayer
                  attribution={tileAttribution}
                  url={tileUrl}
                />
                {schools.map((schoolObj) => (
                  <Marker
                    key={schoolObj.schoolId}
                    position={[Number(schoolObj.latitude), Number(schoolObj.longitude)]}
                    icon={getSchoolMarkerIcon(schoolObj.schoolId)}
                    eventHandlers={{
                      click: () => handleSchoolMarkerClick(schoolObj),
                    }}
                  >
                    {/*<Popup>
                      <div className="text-center">
                        <strong className="block text-blue-800">{schoolObj.name}</strong>
                      </div>
                    </Popup>*/}
                    <Tooltip
                      direction="top"
                      offset={[0, -20]}
                      opacity={1}
                      className="custom-school-tooltip"
                    >
                      {schoolObj.name}
                    </Tooltip>
                  </Marker>
                ))}
                {/* Fly to school when selected */}
                {flyTo && <FlyToSchool position={flyTo} zoom={mapZoom} />}
              </MapContainer>
            </div>
          </div>
        ) : (
          <CesiumSchoolsGlobe
            schools={schools
              .map(s => ({
                ...s,
                latitude: Number(s.latitude),
                longitude: Number(s.longitude)
              }))
              .filter(s =>
                !isNaN(s.latitude) &&
                !isNaN(s.longitude)
              )
            }
            selectedSchool={selectedSchool}
            setSelectedSchool={schoolObj => {
              setSelectedSchool(schoolObj);
              setSchool(schoolObj ? schoolObj.name : "");
              setFlyTo(
                schoolObj
                  ? [Number(schoolObj.latitude), Number(schoolObj.longitude)]
                  : null
              );
            }}
            goTo2DMap={() => setViewMode("2d")}
          />
        )}
        {/* School Details Section (always shown for both 2D and 3D) */}
        <div className="w-full max-w-md h-full min-h-[85vh] flex flex-col justify-center items-center p-0">
          {selectedSchool ? (
            <motion.div
              initial={{ opacity: 0, y: 60, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.7, type: "spring", stiffness: 80 }}
              className="w-full h-full flex flex-col items-center justify-center"
              style={{ minHeight: "100%" }}
            >
              <div className="w-full h-full flex flex-col justify-start items-center overflow-auto p-0">
                {/* Glassmorphism Card */}
                <div className="relative w-full h-full bg-white/70 backdrop-blur-lg rounded-3xl shadow-2xl border border-blue-100 flex flex-col items-center px-6 py-7 md:px-8 md:py-10 transition-all duration-300">
                  {/* Accent Bar */}
                  <div className="absolute top-0 left-0 w-full h-2" />
                  {/* Logo with animated ring */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.15, duration: 0.5, type: "spring" }}
                    className="flex flex-col items-center mb-3 mt-2"
                  >
                    <div className="relative mb-2">
                      <motion.span
                        initial={{ opacity: 0, scale: 0.7 }}
                        animate={{ opacity: 1, scale: 1.15 }}
                        transition={{ delay: 0.2, duration: 1.2, repeat: Infinity, repeatType: "reverse", type: "spring" }}
                        className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-400 to-amber-300 opacity-40 blur-[10px] scale-110"
                      ></motion.span>
                      <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-xl border-4 border-blue-200 relative z-10">
                        <img
                          src={schoolLogos[selectedSchool.schoolId]}
                          alt={selectedSchool.name}
                          className="w-20 h-20 object-cover rounded-full"
                          style={{ background: "#fff" }}
                        />
                      </div>
                    </div>
                    <motion.h2
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25, duration: 0.5, type: "spring" }}
                      className="text-2xl font-extrabold text-blue-800 mt-2 text-center drop-shadow-sm tracking-tight"
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      {selectedSchool.name}
                    </motion.h2>
                  </motion.div>
                  {/* Info */}
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={{
                      hidden: {},
                      visible: {
                        transition: { staggerChildren: 0.12 }
                      }
                    }}
                    className="flex flex-col gap-3 mt-2 w-full"
                  >
                    {/* Location Detail - icon only, no label */}
                    <motion.div
                      variants={{
                        hidden: { opacity: 0, x: -20 },
                        visible: { opacity: 1, x: 0, transition: { duration: 0.4 } }
                      }}
                      className="flex items-center gap-2 text-gray-700 text-sm text-justify"
                    >
                      <svg
                        className="w-4 h-4 text-blue-500 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                        style={{ minWidth: "1rem", minHeight: "1rem" }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="break-words whitespace-pre-line">{selectedSchool.location}</span>
                    </motion.div>
                    {/* School Type Detail - icon only, no label, new icon */}
                    <motion.div
                      variants={{
                        hidden: { opacity: 0, x: -20 },
                        visible: { opacity: 1, x: 0, transition: { duration: 0.4 } }
                      }}
                      className="flex items-center gap-2 text-gray-700 text-sm"
                    >
                      {/* Academic Cap icon for school type */}
                      <svg
                        className="w-4 h-4 text-amber-500 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                        style={{ minWidth: "1rem", minHeight: "1rem" }}
                      >
                        <path d="M12 3L2 9l10 6 10-6-10-6z" />
                        <path d="M2 9v6c0 2.21 4.48 4 10 4s10-1.79 10-4V9" />
                        <path d="M12 21v-6" />
                      </svg>
                      <span>{selectedSchool.type}</span>
                    </motion.div>
                  </motion.div>
                  {/* Description */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5, type: "spring" }}
                    className="w-full bg-gradient-to-br from-blue-50 via-amber-50 to-white rounded-xl p-5 mt-6 border border-blue-100 shadow-inner text-base"
                  >
                    <p className="text-gray-700 leading-relaxed break-words whitespace-pre-line text-justify">{selectedSchool.description}</p>
                  </motion.div>
                  {/* Visit Website Button - now below description and centered */}
                  {selectedSchool.schoolWebsiteUrl && (
                    <motion.a
                      variants={{
                        hidden: { opacity: 0, x: -20 },
                        visible: { opacity: 1, x: 0, transition: { duration: 0.4 } }
                      }}
                      href={selectedSchool.schoolWebsiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 mt-5 px-3 py-2 bg-gradient-to-r from-blue-100 to-amber-100 hover:from-blue-200 hover:to-amber-200 text-blue-700 font-semibold rounded-xl transition-all duration-200 shadow border border-blue-100 text-sm mx-auto"
                      style={{ minWidth: "0" }}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 3h7v7m0 0L10 21l-7-7 11-11z" />
                      </svg>
                      Visit Website
                    </motion.a>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 py-16">
              <svg
                className="w-16 h-16 mb-4 text-yellow-200"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 20.5v-17m0 0L7 7m5-3.5l5 3.5"
                />
              </svg>
              <span className="text-lg font-medium">
                Click a school marker to view details.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content - Conditionally show search results or featured tours */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="py-12 max-w-7xl mx-auto px-4"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key="featured-tours"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="text-center mb-10"
            >
              <h2 className="text-3xl font-bold text-gray-800 relative inline-block">
                Virtual Campus Tours
                <span className="absolute -bottom-2 left-0 w-full h-1 bg-amber-400 rounded-full"></span>
              </h2>
              <p className="mt-6 text-gray-600">
                Explore our most popular virtual campus experiences
              </p>
            </motion.div>

            {/* Filter Controls */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
              <div className="flex-1 flex flex-col md:flex-row gap-4">
                {/* Unified School Search/Dropdown */}
                <div className="relative w-full md:w-64" ref={dropdownRef}>
                  <input
                    type="text"
                    ref={schoolInputRef}
                    value={schoolSearch}
                    onChange={e => {
                      setSchoolSearch(e.target.value);
                      setShowSchoolDropdown(true);
                    }}
                    onFocus={() => setShowSchoolDropdown(true)}
                    onKeyDown={handleSchoolInputKeyDown}
                    placeholder="Search for a school..."
                    className="py-2 px-4 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all duration-300 w-full pr-10"
                    autoComplete="off"
                  />
                  {/* Improved Clear button */}
                  {(schoolSearch || selectedSchool) && (
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white border border-gray-200 rounded-full p-1 shadow hover:bg-amber-100 hover:border-amber-300 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-amber-400"
                      onClick={() => {
                        setSchoolSearch("");
                        setSelectedSchool(null);
                        setSchool("");
                        setFlyTo(defaultMapCenter);
                        setMapZoom(defaultMapZoom);
                        setShowSchoolDropdown(false);
                      }}
                      tabIndex={-1}
                      aria-label="Clear"
                      style={{ lineHeight: 0 }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 hover:text-amber-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="1.5" fill="#fff"/>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9l6 6m0-6l-6 6" stroke="#f59e42"/>
                      </svg>
                    </button>
                  )}
                  {showSchoolDropdown && filteredSchools.length > 0 && (
                    <ul className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredSchools.map((s) => (
                        <li
                          key={s.schoolId}
                          className="px-4 py-2 hover:bg-amber-50 cursor-pointer"
                          onMouseDown={() => handleSchoolSelect(s)}
                        >
                          {s.name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                {/* School Type Dropdown remains */}
                <select
                  value={schoolType}
                  onChange={(e) => setSchoolType(e.target.value)}
                  className="py-2 px-4 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all duration-300 w-full md:w-64"
                >
                  <option value="">All School Types</option>
                  <option value="Public">Public</option>
                  <option value="Private">Private</option>
                </select>
              </div>
              {/* Reset Button */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleReset}
                className="mt-4 md:mt-0 bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg flex items-center text-sm font-medium transition-all duration-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset Filters
              </motion.button>
            </div>

            {/* Filtered Tours */}
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-400"
                ></motion.div>
                <span className="ml-3 text-gray-600">Loading campus tours...</span>
              </div>
            ) : (
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {tours
                  .filter((tour) => {
                    // Get school info for this tour
                    const schoolObj = getSchoolInfo(tour.school);
                    // Filter by search query (school name or tour caption)
                    const matchesSearch =
                      !searchQuery ||
                      (schoolObj.name && schoolObj.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                      (tour.caption && tour.caption.toLowerCase().includes(searchQuery.toLowerCase()));
                    // Filter by school
                    const matchesSchool = !school || (schoolObj.name === school);
                    // Filter by school type
                    const matchesType = !schoolType || (schoolObj.type === schoolType);
                    return matchesSearch && matchesSchool && matchesType;
                  })
                  .map((tour, index) => renderTourCard(tour, index))
                }
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
      <style>
        {`
        .custom-school-marker {
          filter: drop-shadow(0 2px 6px rgba(0,0,0,0.15));
        }
        .leaflet-tooltip.custom-school-tooltip {
          background: linear-gradient(90deg, #2563eb 0%, #60a5fa 100%);
          color: #fff;
          font-weight: 600;
          border-radius: 12px;
          box-shadow: 0 4px 16px rgba(37,99,235,0.12);
          padding: 8px 18px;
          border: none;
          font-size: 1rem;
          letter-spacing: 0.01em;
        }
        `}
      </style>
    </div>
  );
};

export default VirtualCampusToursPage;
//kuwang kay mga filter HAHAHA