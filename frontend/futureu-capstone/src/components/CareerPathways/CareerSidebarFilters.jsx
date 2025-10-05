import React, { useState } from 'react';
import { X, ChevronDown, ChevronUp } from "lucide-react";

const CareerSidebarFilters = ({
    industries = [],
    selectedIndustry = "",
    setSelectedIndustry,
    filteredProgramsOptions = [], // Add default value
    programSearch = "",
    setProgramSearch,
    selectedProgram = "",
    setSelectedProgram,
    jobTrends = [],
    selectedJobTrend = "",
    setSelectedJobTrend,
    selectedFilters = {}, // Add default value
    clearAllFilters
}) => {
    const [openDropdown, setOpenDropdown] = useState(null);

    const toggleDropdown = (dropdown) => {
        setOpenDropdown(openDropdown === dropdown ? null : dropdown);
    };

    const CustomDropdown = ({ 
        title, 
        icon, 
        options = [], // Add default value
        selectedValue, 
        onSelect, 
        placeholder,
        dropdownKey 
    }) => (
        <div className="mb-6 pb-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    {icon}
                    <span className="text-base font-medium text-gray-800">{title}</span>
                </div>
            </div>
            
            {openDropdown === dropdownKey && (
                <div className="relative">
                    <div className="absolute top-0 left-0 right-0 z-10 bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-y-auto">
                        <button
                            className="flex items-center gap-2 px-4 py-2 text-[#2B3E4E] hover:bg-[#FFB71B] hover:text-[#2B3E4E] rounded-t-xl w-full text-left font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB71B] focus-visible:border-[#FFB71B] border-2 border-[#FFB71B] hover:border-[#FFB71B] !ring-[#FFB71B] !border-[#FFB71B]"
                            style={{ boxShadow: '0 0 0 2px #FFB71B' }}
                            onClick={() => setOpenDropdown(null)}
                        >
                            <ChevronDown className="w-4 h-4 transform rotate-90" />
                        </button>
                        <div className="p-4 space-y-2">
                            <button
                                className={`w-full text-left px-4 py-4 rounded-lg text-sm transition-colors duration-200 flex items-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB71B] focus-visible:border-[#FFB71B] border-2 border-transparent ${
                                    selectedValue === "" 
                                        ? "bg-[#FFB71B] text-[#2B3E4E] border-2 border-[#2B3E4E]" 
                                        : "hover:bg-[#FFB71B] hover:text-[#2B3E4E] hover:border-[#2B3E4E] text-[#2B3E4E]"
                                }`}
                                onClick={() => {
                                    onSelect("");
                                    setOpenDropdown(null);
                                }}
                            >
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                                {placeholder}
                            </button>
                            {Array.isArray(options) && options.map((option) => (
                                <button
                                    key={option.value || option}
                                    className={`w-full text-left px-4 py-4 rounded-lg text-sm transition-colors duration-200 flex items-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB71B] focus-visible:border-[#FFB71B] border-2 border-transparent ${
                                        selectedValue === (option.value || option)
                                            ? "bg-[#FFB71B] text-[#2B3E4E] border-[#2B3E4E]"
                                            : "hover:bg-[#FFB71B] hover:text-[#2B3E4E] hover:border-[#2B3E4E] text-[#2B3E4E]"
                                    }`}
                                    onClick={() => {
                                        onSelect(option.value || option);
                                        setOpenDropdown(null);
                                    }}
                                >
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                    {option.label || option}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            
            {/* Display selected value */}
            <div className="px-4 py-4 border border-gray-200 rounded-xl text-sm bg-white shadow-sm cursor-pointer hover:border-yellow-400 hover:shadow-md transition-all duration-200 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400" onClick={() => toggleDropdown(dropdownKey)}>
                <div className="flex items-center justify-between">
                    <span className={selectedValue ? "text-gray-900" : "text-gray-500"}>
                        {selectedValue || placeholder}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>
            </div>
        </div>
    );

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            {/* Filters Header */}
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-200">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                </svg>
                <h2 className="text-lg font-bold text-gray-800">Filters</h2>
            </div>

            {/* Industry Filter */}
            <CustomDropdown
                title="Industry"
                icon={
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                }
                options={industries}
                selectedValue={selectedIndustry}
                onSelect={setSelectedIndustry}
                placeholder="All Industries"
                dropdownKey="industry"
            />

            {/* Program Filter */}
            <CustomDropdown
                title="Program"
                icon={
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                    </svg>
                }
                options={filteredProgramsOptions?.map(p => ({ value: String(p.programId), label: p.programName })) || []}
                selectedValue={selectedProgram}
                onSelect={setSelectedProgram}
                placeholder="All Programs"
                dropdownKey="program"
            />

            {/* Job Demand Filter */}
            <CustomDropdown
                title="Job Demand"
                icon={
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    </svg>
                }
                options={jobTrends}
                selectedValue={selectedJobTrend}
                onSelect={setSelectedJobTrend}
                placeholder="All Demands"
                dropdownKey="jobDemand"
            />

            {/* Clear Filters */}
            <div className="pt-4 border-t border-gray-200">
                <div className="flex flex-col gap-2">
                    <h3 className="text-base font-semibold text-gray-700 mb-2">Active Filters</h3>
                    <div className="flex flex-wrap gap-2 mb-2">
                        {selectedFilters.selectedIndustry && (
                            <span className="bg-yellow-100 px-3 py-1.5 rounded-full text-xs font-medium text-yellow-800">
                                Industry: {selectedFilters.selectedIndustry}
                            </span>
                        )}
                        {selectedFilters.selectedProgram && (
                            <span className="bg-yellow-100 px-3 py-1.5 rounded-full text-xs font-medium text-yellow-800">
                                Program: {
                                    filteredProgramsOptions?.find(p => String(p.programId) === selectedFilters.selectedProgram)?.programName || selectedFilters.selectedProgram
                                }
                            </span>
                        )}
                        {selectedFilters.selectedJobTrend && (
                            <span className="bg-yellow-100 px-3 py-1.5 rounded-full text-xs font-medium text-yellow-800">
                                Job Trend: {selectedFilters.selectedJobTrend}
                            </span>
                        )}
                        {selectedFilters.searchTerm && (
                            <span className="bg-yellow-100 px-3 py-1.5 rounded-full text-xs font-medium text-yellow-800">
                                Search: {selectedFilters.searchTerm}
                            </span>
                        )}
                        {!selectedFilters.selectedIndustry && !selectedFilters.selectedProgram && !selectedFilters.selectedJobTrend && !selectedFilters.searchTerm && (
                            <span className="text-gray-500 text-sm">No active filters</span>
                        )}
                    </div>
                    <button
                        className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-4 py-3 rounded-lg flex items-center justify-center shadow-md transition"
                        onClick={clearAllFilters}
                    >
                        <X className="h-4 w-4 mr-2" />
                        Clear All Filters
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CareerSidebarFilters;