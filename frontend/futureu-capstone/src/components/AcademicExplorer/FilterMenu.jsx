import React from 'react';
import { Search } from 'lucide-react';

const FilterMenu = ({ show, filterOptions, setFilterOptions, onClose }) => {
  if (!show) return null;

  return (
    <div className="absolute right-0 top-[calc(100%+8px)] bg-white dark:bg-gray-700 rounded-lg shadow-xl p-5 z-40 border border-gray-100 dark:border-gray-600 w-72">
      <h3 className="font-bold text-gray-900 dark:text-white mb-4 text-lg">FILTER BY</h3>
      
      {/* School Type Filter */}
      <div className="mb-5">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">School Type</h4>
        <div className="space-y-2">
          <label className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 p-2 rounded-md transition-colors">
            <input
              type="radio"
              name="schoolType"
              checked={filterOptions.schoolType === 'all'}
              onChange={() => {
                setFilterOptions({
                  ...filterOptions,
                  schoolType: 'all'
                });
                onClose();
              }}
              className="text-[#FFB71B] focus:ring-[#FFB71B] w-5 h-5"
            />
            <span className="font-medium">All</span>
          </label>
          <label className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 p-2 rounded-md transition-colors">
            <input
              type="radio"
              name="schoolType"
              checked={filterOptions.schoolType === 'public'}
              onChange={() => {
                setFilterOptions({
                  ...filterOptions,
                  schoolType: 'public'
                });
                onClose();
              }}
              className="text-[#FFB71B] focus:ring-[#FFB71B] w-5 h-5"
            />
            <span className="font-medium">Public</span>
          </label>
          <label className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 p-2 rounded-md transition-colors">
            <input
              type="radio"
              name="schoolType"
              checked={filterOptions.schoolType === 'private'}
              onChange={() => {
                setFilterOptions({
                  ...filterOptions,
                  schoolType: 'private'
                });
                onClose();
              }}
              className="text-[#FFB71B] focus:ring-[#FFB71B] w-5 h-5"
            />
            <span className="font-medium">Private</span>
          </label>
        </div>
      </div>
      
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Location</h4>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-indigo-500" />
          <input
            type="text"
            placeholder="Search location (e.g. N. Bacalso)"
            value={filterOptions.locationSearch}
            onChange={(e) => setFilterOptions({
              ...filterOptions,
              locationSearch: e.target.value
            })}
            className="pl-9 pr-3 py-2.5 w-full text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all shadow-sm text-left"
          />
        </div>
      </div>

      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">School Name</h4>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-indigo-500" />
          <input
            type="text"
            placeholder="Filter by school name"
            value={filterOptions.schoolNameFilter}
            onChange={(e) =>
              setFilterOptions({
                ...filterOptions,
                schoolNameFilter: e.target.value,
              })
            }
            className="pl-9 pr-3 py-2.5 w-full text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all shadow-sm text-left"
          />
        </div>
      </div>
    </div>
  );
};

export default FilterMenu;