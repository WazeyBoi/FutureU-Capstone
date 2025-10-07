import React, { useRef, useEffect } from 'react';
import { Search, X, ChevronDown, BookOpen } from 'lucide-react';

const ProgramDropdown = ({
  programs,
  selectedProgram,
  programSearch,
  setProgramSearch,
  showDropdown,
  setShowDropdown,
  onProgramSelect,
  onClear
}) => {
  const dropdownRef = useRef(null);

  // Filter programs based on search
  const filteredPrograms = programs.filter(program =>
    program.programName.toLowerCase().includes(programSearch.toLowerCase())
  ); // Remove .slice(0, 10) to show all programs

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setShowDropdown]);

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        
        <input
          type="text"
          value={programSearch}
          onChange={(e) => {
            setProgramSearch(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          placeholder="Search for a program..."
          className="w-full pl-12 pr-20 py-4 border-2 border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#FFB71B] focus:border-[#FFB71B] transition-all text-[#2B3E4E] placeholder-gray-400"
        />

        <div className="absolute inset-y-0 right-0 flex items-center pr-4 space-x-2">
          {selectedProgram && (
            <button
              onClick={onClear}
              className="p-1 text-gray-400 hover:text-red-500 transition-colors"
              title="Clear selection"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <ChevronDown 
            className={`w-5 h-5 text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} 
          />
        </div>
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 max-h-80 overflow-y-auto">
          {filteredPrograms.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <BookOpen className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p>No programs found</p>
            </div>
          ) : (
            <div className="py-2">
              {filteredPrograms.map((program) => (
                <button
                  key={program.programId}
                  onClick={() => onProgramSelect(program)}
                  className="w-full px-4 py-3 text-left hover:bg-[#FFB71B]/10 focus:bg-[#FFB71B]/10 focus:outline-none transition-colors group"
                >
                  <div className="flex items-start">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#1D63A1] to-[#2B3E4E] rounded-lg flex items-center justify-center mr-3 group-hover:scale-105 transition-transform">
                      <BookOpen className="w-5 h-5 text-[#FFB71B]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-[#2B3E4E] group-hover:text-[#1D63A1] transition-colors">
                        {program.programName}
                      </h3>
                      {program.description && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                          {program.description}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProgramDropdown;