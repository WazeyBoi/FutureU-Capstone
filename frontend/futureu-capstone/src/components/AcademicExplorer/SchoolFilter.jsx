import React, { useState, useEffect } from 'react';
import { Filter, MapPin, Building, Award, ChevronDown, X, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SchoolFilter = ({ 
  onFilterChange, 
  schools, 
  accreditationData = [],
  className = "" 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({
    location: '',
    schoolType: 'all', // all, private, public
    accreditation: 'all' // all, accredited, not-accredited
  });
  
  // Temporary filters for UI (only applied when "Apply Filters" is clicked)
  const [tempFilters, setTempFilters] = useState({
    location: '',
    schoolType: 'all',
    accreditation: 'all'
  });
  
  const [locationInput, setLocationInput] = useState('');

  // Get unique locations from schools
  const uniqueLocations = React.useMemo(() => {
    const locations = schools.map(school => {
      const location = school.location || 'Unknown Location';
      // Extract city/area from full address
      const parts = location.split(',');
      return parts.length > 1 ? parts[parts.length - 2].trim() : location;
    });
    return [...new Set(locations)].filter(Boolean).sort();
  }, [schools]);

  // Get accreditation status for a school
  const getSchoolAccreditationStatus = (school) => {
    const accreditedSchool = accreditationData.find(
      (accSchool) => 
        accSchool.name.toLowerCase().includes(school.name.toLowerCase()) ||
        school.name.toLowerCase().includes(accSchool.name.toLowerCase())
    );
    return accreditedSchool && accreditedSchool.totalAccredited > 0;
  };

  // Handle temporary filter changes (UI only)
  const handleTempFilterChange = (filterType, value) => {
    const newTempFilters = {
      ...tempFilters,
      [filterType]: value
    };
    setTempFilters(newTempFilters);
    
    // Update location input when location filter changes
    if (filterType === 'location') {
      setLocationInput(value);
    }
  };

  // Apply filters to schools (called when "Apply Filters" button is clicked)
  const applyFilters = () => {
    setFilters(tempFilters);
    
    console.log('=== FILTER DEBUG ===');
    console.log('tempFilters:', tempFilters);
    console.log('Sample school data:', schools.slice(0, 2));
    
    const filteredSchools = schools.filter(school => {
      // Location filter
      if (tempFilters.location && tempFilters.location !== '') {
        const schoolLocation = school.location || '';
        if (!schoolLocation.toLowerCase().includes(tempFilters.location.toLowerCase())) {
          return false;
        }
      }

      // School type filter - Fixed logic with case-insensitive matching
      if (tempFilters.schoolType !== 'all') {
        // First, try to get the school type from the database field (should be "Public", "Private", etc.)
        let schoolTypeDisplay = school.type || school.schoolType;
        
        // Fallback to isPrivate boolean logic if type field is empty
        if (!schoolTypeDisplay) {
          schoolTypeDisplay = school.isPrivate === true ? 'Private' : 
                             school.isPrivate === false ? 'Public' : 
                             'Private'; // Default fallback
        }
        
        console.log(`School: ${school.name}`);
        console.log(`- type:`, school.type);
        console.log(`- schoolType:`, school.schoolType);
        console.log(`- isPrivate:`, school.isPrivate);
        console.log(`- schoolTypeDisplay:`, schoolTypeDisplay);
        console.log(`- tempFilters.schoolType:`, tempFilters.schoolType);
        
        // Normalize both values to lowercase for comparison
        const normalizedSchoolType = schoolTypeDisplay?.toLowerCase();
        const normalizedFilterType = tempFilters.schoolType.toLowerCase();
        
        console.log(`- Normalized comparison: ${normalizedSchoolType} === ${normalizedFilterType}`);
        
        if (normalizedFilterType === 'private' && normalizedSchoolType !== 'private') {
          console.log(`- Filtering out: not private`);
          return false;
        }
        if (normalizedFilterType === 'public' && normalizedSchoolType !== 'public') {
          console.log(`- Filtering out: not public`);
          return false;
        }
        console.log(`- Including school`);
      }

      // Accreditation filter (fixed logic)
      if (tempFilters.accreditation !== 'all') {
        const isAccredited = getSchoolAccreditationStatus(school);
        if (tempFilters.accreditation === 'accredited' && !isAccredited) {
          return false;
        }
        if (tempFilters.accreditation === 'not-accredited' && isAccredited) {
          return false;
        }
      }

      return true;
    });

    onFilterChange(filteredSchools, tempFilters);
    setIsOpen(false); // Close filter panel after applying
  };

  // Handle location input change
  const handleLocationInputChange = (e) => {
    const value = e.target.value;
    setLocationInput(value);
    handleTempFilterChange('location', value);
  };

  // Clear all filters
  const clearFilters = () => {
    const resetFilters = {
      location: '',
      schoolType: 'all',
      accreditation: 'all'
    };
    setFilters(resetFilters);
    setTempFilters(resetFilters);
    setLocationInput('');
    onFilterChange(schools, resetFilters);
  };

  // Remove individual filter (applies immediately for breadcrumbs)
  const removeFilter = (filterType) => {
    const newFilters = { ...filters };
    const newTempFilters = { ...tempFilters };
    
    if (filterType === 'location') {
      setLocationInput('');
      newFilters.location = '';
      newTempFilters.location = '';
    } else {
      newFilters[filterType] = 'all';
      newTempFilters[filterType] = 'all';
    }
    
    setFilters(newFilters);
    setTempFilters(newTempFilters);
    
    // Apply filters immediately when removing from breadcrumbs
    const filteredSchools = schools.filter(school => {
      // Location filter
      if (newFilters.location && newFilters.location !== '') {
        const schoolLocation = school.location || '';
        if (!schoolLocation.toLowerCase().includes(newFilters.location.toLowerCase())) {
          return false;
        }
      }

      // School type filter - Fixed logic with case-insensitive matching
      if (newFilters.schoolType !== 'all') {
        // First, try to get the school type from the database field (should be "Public", "Private", etc.)
        let schoolTypeDisplay = school.type || school.schoolType;
        
        // Fallback to isPrivate boolean logic if type field is empty
        if (!schoolTypeDisplay) {
          schoolTypeDisplay = school.isPrivate === true ? 'Private' : 
                             school.isPrivate === false ? 'Public' : 
                             'Private'; // Default fallback
        }
        
        // Normalize both values to lowercase for comparison
        const normalizedSchoolType = schoolTypeDisplay?.toLowerCase();
        const normalizedFilterType = newFilters.schoolType.toLowerCase();
        
        if (normalizedFilterType === 'private' && normalizedSchoolType !== 'private') {
          return false;
        }
        if (normalizedFilterType === 'public' && normalizedSchoolType !== 'public') {
          return false;
        }
      }

      // Accreditation filter
      if (newFilters.accreditation !== 'all') {
        const isAccredited = getSchoolAccreditationStatus(school);
        if (newFilters.accreditation === 'accredited' && !isAccredited) {
          return false;
        }
        if (newFilters.accreditation === 'not-accredited' && isAccredited) {
          return false;
        }
      }

      return true;
    });

    onFilterChange(filteredSchools, newFilters);
  };

  // Get active filter labels for breadcrumbs
  const getActiveFilterLabels = () => {
    const activeFilters = [];
    
    if (filters.location && filters.location !== '') {
      activeFilters.push({
        type: 'location',
        label: `School Location: ${filters.location}`,
        value: filters.location,
        icon: MapPin
      });
    }
    
    if (filters.schoolType && filters.schoolType !== 'all') {
      const typeLabel = filters.schoolType === 'private' ? 'Private' : 'Public';
      activeFilters.push({
        type: 'schoolType',
        label: `School Type: ${typeLabel}`,
        value: filters.schoolType,
        icon: Building
      });
    }
    
    if (filters.accreditation && filters.accreditation !== 'all') {
      const accredLabel = filters.accreditation === 'accredited' ? 'Accredited' : 'Non-Accredited';
      activeFilters.push({
        type: 'accreditation',
        label: `Accreditation Status: ${accredLabel}`,
        value: filters.accreditation,
        icon: Award
      });
    }
    
    return activeFilters;
  };

  // Count active filters and get labels
  const activeFilterLabels = getActiveFilterLabels();
  const activeFiltersCount = activeFilterLabels.length;

  return (
    <div className={`relative ${className}`}>
      {/* Filter Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          // Sync temp filters with current filters when opening
          if (!isOpen) {
            setTempFilters(filters);
            setLocationInput(filters.location);
          }
        }}
        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 shadow-sm"
      >
        <Filter className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter Schools</span>
        {activeFiltersCount > 0 && (
          <div className="bg-[#FFB71B] text-[#2B3E4E] text-xs font-bold px-2 py-1 rounded-full min-w-[20px] text-center">
            {activeFiltersCount}
          </div>
        )}
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Filter Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-full left-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-xl z-50 p-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filter Schools</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Location Filter */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <MapPin className="w-4 h-4 text-[#FFB71B]" />
                  Location
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={locationInput}
                    onChange={handleLocationInputChange}
                    placeholder="Search by address..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-[#FFB71B] focus:border-transparent"
                  />
                </div>
              </div>

              {/* School Type Filter */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Building className="w-4 h-4 text-[#1D63A1]" />
                  School Type
                </label>
                <select
                  value={tempFilters.schoolType}
                  onChange={(e) => handleTempFilterChange('schoolType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-[#FFB71B] focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  <option value="private">Private</option>
                  <option value="public">Public</option>
                </select>
              </div>

              {/* Accreditation Filter */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Award className="w-4 h-4 text-[#2B3E4E]" />
                  Accreditation Status
                </label>
                <select
                  value={tempFilters.accreditation}
                  onChange={(e) => handleTempFilterChange('accreditation', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-[#FFB71B] focus:border-transparent"
                >
                  <option value="all">All Schools</option>
                  <option value="accredited">Accredited</option>
                  <option value="not-accredited">Non-Accredited</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={clearFilters}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                >
                  Clear All
                </button>
                <button
                  onClick={applyFilters}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-[#FFB71B] rounded-lg hover:bg-[#FFB71B]/90 transition-colors duration-200"
                >
                  Apply Filters
                </button>
              </div>

              {/* Filter Summary */}
              {activeFiltersCount > 0 && (
                <div className="pt-3 border-t border-gray-200 dark:border-gray-600">
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    <span className="font-medium">{activeFiltersCount}</span> filter{activeFiltersCount > 1 ? 's' : ''} active
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Filter Breadcrumbs */}
      {activeFilterLabels.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 flex flex-wrap gap-2"
        >
          {activeFilterLabels.map((filter, index) => {
            const IconComponent = filter.icon;
            return (
              <motion.div
                key={`${filter.type}-${filter.value}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-1 px-3 py-1.5 bg-[#FFB71B]/10 text-[#2B3E4E] border border-[#FFB71B]/20 rounded-full text-sm font-medium"
              >
                <IconComponent className="w-3 h-3" />
                <span className="text-xs">{filter.label}</span>
                <button
                  onClick={() => removeFilter(filter.type)}
                  className="ml-1 p-0.5 hover:bg-[#FFB71B]/20 rounded-full transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default SchoolFilter;