import React from "react";

const SearchFilterBar = ({ searchTerm, onSearchChange, filterOptions, selectedFilter, onFilterChange }) => {
  return (
    <div className="flex flex-col md:flex-row items-center gap-4 animate-fade-in flex-grow justify-end rounded-xl py-4">
      <div className="relative w-full md:w-80">
        <input
          type="text"
          placeholder="Search by student name or email..."
          className="text-left pl-10 pr-10 py-3 rounded-xl border border-gray-200 w-full bg-white text-gray-900 shadow focus:ring-2 focus:ring-[#FFB71B] focus:border-[#FFB71B] transition-all text-sm placeholder-gray-400 outline-none"
          value={searchTerm}
          onChange={e => onSearchChange(e.target.value)}
        />
        {/* Search icon (left) */}
        <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
          <svg className="w-4 h-4 text-[#FFB71B]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-2-2" />
          </svg>
        </div>
        {/* Clear (X) icon (right) */}
        {searchTerm && (
          <button
            type="button"
            className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-[#FFB71B] focus:outline-none"
            onClick={() => onSearchChange("")}
            tabIndex={-1}
            aria-label="Clear search"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      <div className="relative w-full md:w-64">
        <select
          className="appearance-none pl-4 pr-10 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 shadow focus:ring-2 focus:ring-[#1D63A1] focus:border-[#1D63A1] transition-all w-full text-sm outline-none hover:border-[#FFB71B] cursor-pointer"
          value={selectedFilter}
          onChange={e => onFilterChange(e.target.value)}
        >
          <option value="">All Assessments</option>
          {filterOptions.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        {/* Custom arrow icon */}
        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
          <svg className="w-3 h-3 text-[#1D63A1]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default SearchFilterBar;
