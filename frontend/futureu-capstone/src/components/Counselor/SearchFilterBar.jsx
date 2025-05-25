import React from "react";

const SearchFilterBar = ({ searchTerm, onSearchChange, filterOptions, selectedFilter, onFilterChange }) => {
  return (
    <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
      <input
        type="text"
        placeholder="Search students..."
        className="px-4 py-2 rounded-lg border border-gray-200 shadow focus:ring-2 focus:ring-[#FFB71B] focus:border-[#FFB71B] w-full md:w-1/3"
        value={searchTerm}
        onChange={e => onSearchChange(e.target.value)}
      />
      {filterOptions && (
        <select
          className="px-4 py-2 rounded-lg border border-gray-200 shadow focus:ring-2 focus:ring-[#FFB71B] focus:border-[#FFB71B] w-full md:w-1/4"
          value={selectedFilter}
          onChange={e => onFilterChange(e.target.value)}
        >
          <option value="">All Assessments</option>
          {filterOptions.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      )}
    </div>
  );
};

export default SearchFilterBar;
