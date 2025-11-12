import React, { useState, useRef, useEffect } from 'react';
import { Search, BookOpen, School, X, ChevronDown } from 'lucide-react';

const PersistentSearchHeader = ({
  searchMode,
  setSearchMode,
  searchTerm,
  setSearchTerm,
  onSearch,
  currentDataCount = 0,
  onBackToBrowse,
  placeholder,
  leftSideButton,
  showingSchoolsForProgram = false,
  showingProgramsForSchool = false,
  programs = [],
  schools = [],
  onProgramSelect,
  onSchoolSelect
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter data based on search term
  const filteredPrograms = programs.filter(program =>
    program.programName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSchools = schools.filter(school =>
    school.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputFocus = () => {
    setShowDropdown(true);
  };

  const handleItemSelect = (item) => {
    if (searchMode === 'programs') {
      setSearchTerm(item.programName);
      onProgramSelect && onProgramSelect(item.programId);
    } else {
      setSearchTerm(item.name);
      onSchoolSelect && onSchoolSelect(item);
    }
    setShowDropdown(false);
  };
  const handleClearSearch = () => {
    setSearchTerm('');
    if (onBackToBrowse) {
      onBackToBrowse();
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch();
    }
  };

  return (
    <div className="bg-gradient-to-r from-white via-[#FFB71B]/5 to-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
      {/* Toggle Buttons Container */}
      <div className="flex items-center justify-center mb-6 relative">
        {/* Show Program Details Button - Left Side */}
        <div className="absolute left-0">
          {leftSideButton}
        </div>
        
        {/* Centered Toggle Buttons */}
        <div className="inline-flex rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 p-1.5 shadow-inner">
          <button
            onClick={() => setSearchMode('programs')}
            className={`px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-300 transform ${
              searchMode === 'programs'
                ? 'bg-gradient-to-r from-[#2B3E4E] to-[#1D63A1] text-white shadow-lg scale-105'
                : 'text-gray-600 hover:text-[#2B3E4E] hover:bg-white/50 hover:scale-102'
            }`}
          >
            <BookOpen className={`w-5 h-5 inline-block mr-2 ${searchMode === 'programs' ? 'animate-pulse' : ''}`} />
            Search Programs
          </button>
          <button
            onClick={() => setSearchMode('schools')}
            className={`px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-300 transform ${
              searchMode === 'schools'
                ? 'bg-gradient-to-r from-[#2B3E4E] to-[#1D63A1] text-white shadow-lg scale-105'
                : 'text-gray-600 hover:text-[#2B3E4E] hover:bg-white/50 hover:scale-102'
            }`}
          >
            <School className={`w-5 h-5 inline-block mr-2 ${searchMode === 'schools' ? 'animate-pulse' : ''}`} />
            Search Schools
          </button>
        </div>
      </div>

      {/* Optimized Search Bar */}
      <div className="max-w-2xl mx-auto" ref={dropdownRef}>
        <div className="relative group">
          {/* Mode Icon (Book/School) */}
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
            {searchMode === 'programs' ? (
              <BookOpen className={`h-5 w-5 transition-colors duration-300 ${
                searchTerm ? 'text-[#2B3E4E]' : 'text-gray-500'
              }`} />
            ) : (
              <School className={`h-5 w-5 transition-colors duration-300 ${
                searchTerm ? 'text-[#2B3E4E]' : 'text-gray-500'
              }`} />
            )}
          </div>
          
          {/* Search Icon */}
          <div className="absolute inset-y-0 left-12 pl-2 flex items-center pointer-events-none z-10">
            <Search className={`h-4 w-4 transition-colors duration-300 ${
              searchTerm ? 'text-[#FFB71B]' : 'text-gray-400'
            }`} />
          </div>
          
          {/* Dropdown Arrow */}
          <div className="absolute inset-y-0 right-12 flex items-center pointer-events-none z-10">
            <ChevronDown className={`h-4 w-4 transition-all duration-300 ${
              showDropdown ? 'transform rotate-180 text-[#FFB71B]' : 'text-gray-400'
            }`} />
          </div>
          
          {/* Search Input */}
          <input
            ref={inputRef}
            type="text"
            className="block w-full pl-20 pr-20 py-4 border-2 border-gray-200 rounded-xl text-sm 
                     focus:ring-4 focus:ring-[#FFB71B]/20 focus:border-[#FFB71B] 
                     transition-all duration-300 bg-white backdrop-blur-sm
                     hover:border-[#FFB71B]/50 hover:shadow-md
                     group-hover:bg-white text-gray-700"
            placeholder={placeholder || (searchMode === 'programs' ? 'Search for programs...' : 'Search for schools...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            onFocus={handleInputFocus}
          />
          
          {/* Clear Button */}
          {searchTerm && (
            <button
              onClick={handleClearSearch}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-[#FFB71B] transition-colors hover:scale-110 z-10"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {/* Dropdown Menu */}
          {showDropdown && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-lg z-50 max-h-64 overflow-y-auto">
              {searchMode === 'programs' ? (
                filteredPrograms.length > 0 ? (
                  <div className="py-2">
                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
                      Available Programs ({filteredPrograms.length})
                    </div>
                    {filteredPrograms.slice(0, 10).map((program) => (
                      <button
                        key={program.programId}
                        onClick={() => handleItemSelect(program)}
                        className="w-full text-left px-4 py-3 hover:bg-[#FFB71B]/10 transition-colors duration-200 border-b border-gray-50 last:border-b-0"
                      >
                        <div className="flex items-center">
                          <BookOpen className="w-4 h-4 text-[#2B3E4E] mr-3 flex-shrink-0" />
                          <span className="text-sm text-gray-700 font-medium">{program.programName}</span>
                        </div>
                      </button>
                    ))}
                    {filteredPrograms.length > 10 && (
                      <div className="px-4 py-2 text-xs text-gray-500 text-center border-t border-gray-100">
                        Showing 10 of {filteredPrograms.length} results
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <BookOpen className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No programs found</p>
                  </div>
                )
              ) : (
                filteredSchools.length > 0 ? (
                  <div className="py-2">
                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
                      Available Schools ({filteredSchools.length})
                    </div>
                    {filteredSchools.slice(0, 10).map((school) => (
                      <button
                        key={school.schoolId}
                        onClick={() => handleItemSelect(school)}
                        className="w-full text-left px-4 py-3 hover:bg-[#FFB71B]/10 transition-colors duration-200 border-b border-gray-50 last:border-b-0"
                      >
                        <div className="flex items-start">
                          <School className="w-4 h-4 text-[#1D63A1] mr-3 flex-shrink-0 mt-0.5" />
                          <div>
                            <div className="text-sm text-gray-700 font-medium">{school.name}</div>
                            <div className="text-xs text-gray-500">{school.location}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                    {filteredSchools.length > 10 && (
                      <div className="px-4 py-2 text-xs text-gray-500 text-center border-t border-gray-100">
                        Showing 10 of {filteredSchools.length} results
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <School className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No schools found</p>
                  </div>
                )
              )}
            </div>
          )}
        </div>
        
        {/* Results Counter */}
        <div className="text-center mt-4">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm border border-gray-200">
            <div className={`w-2 h-2 rounded-full ${currentDataCount > 0 ? 'bg-green-500' : 'bg-gray-400'} animate-pulse`}></div>
            <span className="text-gray-600 text-sm font-medium">
              {currentDataCount >= 0 && (showingSchoolsForProgram || showingProgramsForSchool) ? (
                <>Found <span className="text-[#2B3E4E] font-bold text-lg">{currentDataCount}</span> {
                  showingSchoolsForProgram ? 'schools' : 'programs'
                }</>
              ) : currentDataCount > 0 ? (
                <>Found <span className="text-[#2B3E4E] font-bold text-lg">{currentDataCount}</span> {searchMode}</>
              ) : (
                <>Ready to search {searchMode}</>
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersistentSearchHeader;