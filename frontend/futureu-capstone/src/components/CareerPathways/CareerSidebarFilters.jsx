import React from 'react';
import { X } from "lucide-react";

const CareerSidebarFilters = ({
    industries,
    selectedIndustry,
    setSelectedIndustry,
    filteredProgramsOptions,
    programSearch,
    setProgramSearch,
    selectedProgram,
    setSelectedProgram,
    jobTrends,
    selectedJobTrend,
    setSelectedJobTrend,
    selectedFilters, // Object containing selectedIndustry, selectedProgram, selectedJobTrend, searchTerm
    clearAllFilters
}) => {
    return (
        <div className="space-y-6">
            {/* Industry Filter */}
            <div className="bg-white rounded-lg shadow p-4">
                <h2 className="text-lg font-semibold mb-4">Industry</h2>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                    <button
                        className={`w-full text-left px-4 py-2 rounded-lg transition-colors duration-200 ${
                            selectedIndustry === "" ? "bg-yellow-100 text-yellow-800" : "hover:bg-gray-50"
                        }`}
                        onClick={() => setSelectedIndustry("")}
                    >
                        All Industries
                    </button>
                    {industries.map((industry) => (
                        <button
                            key={industry}
                            className={`w-full text-left px-4 py-2 rounded-lg transition-colors duration-200 ${
                                selectedIndustry === industry ? "bg-yellow-100 text-yellow-800" : "hover:bg-gray-50"
                            }`}
                            onClick={() => setSelectedIndustry(industry)}
                        >
                            {industry}
                        </button>
                    ))}
                </div>
            </div>

            {/* Program Filter */}
            <div className="bg-white rounded-lg shadow p-4">
                <h2 className="text-lg font-semibold mb-4">Program</h2>
                <div className="relative mb-2">
                    <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                        placeholder="Search programs..."
                        value={programSearch}
                        onChange={(e) => setProgramSearch(e.target.value)}
                    />
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1">
                    <button
                        className={`w-full text-left px-4 py-2 rounded-lg transition-colors duration-200 ${
                            selectedProgram === "" ? "bg-yellow-100 text-yellow-800" : "hover:bg-gray-50"
                        }`}
                        onClick={() => setSelectedProgram("")}
                    >
                        All Programs
                    </button>
                    {filteredProgramsOptions
                        .filter((program) => // This filter is applied here, as it's the UI of this component
                            program.programName.toLowerCase().includes(programSearch.toLowerCase())
                        )
                        .map((program) => (
                            <button
                                key={program.programId}
                                className={`w-full text-left px-4 py-2 rounded-lg transition-colors duration-200 ${
                                    selectedProgram === String(program.programId)
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "hover:bg-gray-50"
                                }`}
                                onClick={() => setSelectedProgram(String(program.programId))}
                            >
                                {program.programName}
                            </button>
                        ))}
                </div>
            </div>

            {/* Job Trend Filter */}
            <div className="bg-white rounded-lg shadow p-4">
                <h2 className="text-lg font-semibold mb-4">Job Trend</h2>
                <select
                    className="w-full border border-gray-300 rounded-md text-sm px-3 py-2"
                    value={selectedJobTrend}
                    onChange={(e) => setSelectedJobTrend(e.target.value)}
                >
                    <option value="">All Trends</option>
                    {jobTrends.map((trend) => (
                        <option key={trend} value={trend}>
                            {trend}
                        </option>
                    ))}
                </select>
            </div>

            {/* Clear Filters */}
            <div className="bg-white rounded-lg shadow p-4 my-4">
                <div className="flex flex-col gap-2">
                    <h3 className="text-base font-semibold text-gray-700">Active Filters</h3>
                    <div className="flex flex-wrap gap-2 mb-2">
                        {selectedFilters.selectedIndustry && (
                            <span className="bg-yellow-100 px-3 py-1.5 rounded-lg text-xs font-medium text-yellow-800">
                                Industry: {selectedFilters.selectedIndustry}
                            </span>
                        )}
                        {selectedFilters.selectedProgram && (
                            <span className="bg-yellow-100 px-3 py-1.5 rounded-lg text-xs font-medium text-yellow-800">
                                Program: {
                                    filteredProgramsOptions.find(p => String(p.programId) === selectedFilters.selectedProgram)?.programName || selectedFilters.selectedProgram
                                }
                            </span>
                        )}
                        {selectedFilters.selectedJobTrend && (
                            <span className="bg-yellow-100 px-3 py-1.5 rounded-lg text-xs font-medium text-yellow-800">
                                Job Trend: {selectedFilters.selectedJobTrend}
                            </span>
                        )}
                        {selectedFilters.searchTerm && (
                            <span className="bg-yellow-100 px-3 py-1.5 rounded-lg text-xs font-medium text-yellow-800">
                                Search: {selectedFilters.searchTerm}
                            </span>
                        )}
                        {!selectedFilters.selectedIndustry && !selectedFilters.selectedProgram && !selectedFilters.selectedJobTrend && !selectedFilters.searchTerm && (
                            <span className="text-gray-500 text-sm">No active filters</span>
                        )}
                    </div>
                    <button
                        className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-4 py-3 rounded mt-2 flex items-center justify-center shadow-md"
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