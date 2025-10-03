import React from 'react';
import { Search, Filter, X, BookOpen, School } from 'lucide-react';
import ProgramDropdown from './ProgramDropdown';
import FilterMenu from './FilterMenu';

const SearchHeader = ({
  // Program search props
  programSearchTerm,
  setProgramSearchTerm,
  showProgramDropdown,
  setShowProgramDropdown,
  programs,
  selectedProgram,
  onProgramChange,
  
  // School search props
  searchTerm,
  setSearchTerm,
  showSchoolDropdown,
  setShowSchoolDropdown,
  schools,
  onSchoolSearch,
  onSearchKeyDown,
  onSchoolSelect,
  
  // Filter props
  showFilterMenu,
  setShowFilterMenu,
  filterOptions,
  setFilterOptions,
  
  // Loading state
  isSearchingSchool
}) => {
  const filteredSchoolDropdown = schools
    .filter(school =>
      school.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-30 w-full backdrop-blur-sm bg-white/90 dark:bg-gray-800/90 animate-slide-in">
      <div className="w-full px-6 py-5">
        <div className="flex items-center gap-16">
          {/* Program Search Bar */}
          <div className="relative z-50 w-[180rem]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-indigo-500 pointer-events-none" />
              <input
                type="text"
                placeholder="Search programs..."
                value={programSearchTerm}
                onChange={(e) => setProgramSearchTerm(e.target.value)}
                onFocus={() => setShowProgramDropdown(true)}
                onBlur={() => setTimeout(() => setShowProgramDropdown(false), 100)}
                className="pl-10 pr-12 py-3 w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all shadow-sm text-left"
              />
              {programSearchTerm && (
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 dark:hover:text-[#FFB71B] rounded-full p-1.5 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  onClick={() => setProgramSearchTerm('')}
                  tabIndex={-1}
                  aria-label="Clear program search"
                  style={{ lineHeight: 0, background: 'transparent' }}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <ProgramDropdown
              show={showProgramDropdown}
              programs={programs}
              programSearchTerm={programSearchTerm}
              selectedProgram={selectedProgram}
              onProgramChange={onProgramChange}
              onClose={() => setShowProgramDropdown(false)}
            />
          </div>

          <div className="flex items-center max-w-5xl mx-auto flex-1">
            <div className="flex w-full">
              <div className="relative flex-1 w-[600px]">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="h-5 w-5 text-indigo-500" />
                </div>
                <input
                  type="text"
                  placeholder="Search schools..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setShowSchoolDropdown(true)}
                  onBlur={() => setTimeout(() => setShowSchoolDropdown(false), 100)}
                  onKeyDown={onSearchKeyDown}
                  className="pl-10 pr-4 py-3 w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-l-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all shadow-sm hover:shadow h-[56px]"
                />
                {searchTerm && (
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 dark:hover:text-[#FFB71B] rounded-full p-1.5 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    onClick={() => setSearchTerm('')}
                    tabIndex={-1}
                    aria-label="Clear school search"
                    style={{ lineHeight: 0, background: 'transparent' }}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                
                {/* School dropdown */}
                {showSchoolDropdown && (
                  <div
                    className="absolute mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl z-50 border border-gray-100 dark:border-gray-700 w-full animate-slide-down"
                    style={{
                      maxHeight: '20rem',
                      overflowY: 'auto',
                      minHeight: '6rem',
                    }}
                  >
                    {filteredSchoolDropdown.length > 0 ? (
                      filteredSchoolDropdown.map((school) => (
                        <button
                          key={school.schoolId}
                          onMouseDown={() => onSchoolSelect(school)}
                          className="w-full text-left px-4 py-3 rounded-lg flex items-center hover:bg-gray-100 dark:hover:bg-gray-700 mb-1 transition-colors"
                        >
                          <School className="w-5 h-5 mr-3 text-indigo-500" />
                          <span className="text-gray-800 dark:text-gray-200">{school.name}</span>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
                        No schools found.
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="flex">
                <button
                  onClick={() => setShowFilterMenu(!showFilterMenu)}
                  className="bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow flex items-center h-[56px] ml-3"
                >
                  <Filter className="w-5 h-5 text-indigo-500" />
                  <span className="">Filters</span>
                </button>
              </div>
              
              <FilterMenu
                show={showFilterMenu}
                filterOptions={filterOptions}
                setFilterOptions={setFilterOptions}
                onClose={() => setShowFilterMenu(false)}
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default SearchHeader;