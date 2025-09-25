// src/components/CareerPathways/CareerResultsTable.jsx
import React from 'react';
import { Briefcase, GraduationCap, DollarSign, TrendingUp, Star, ChevronRight } from "lucide-react";

const CareerResultsTable = ({
    loading,
    paginatedCareers,
    totalPages,
    currentPage,
    setCurrentPage,
    getPaginationRange,
    handleItemClick,
    formatProgramsPreview,
    getProgramsForCareer,
    formatMoreProgramsText,
    getTrendStyle,
    getTrendIcon,
}) => {
    // Helper function to get demand level badge
    const getDemandBadge = (trend) => {
        if (!trend) return null;
        const demandLevels = {
            'Growing': { text: 'High', color: 'bg-[#FFB71B] text-[#2B3E4E]' },
            'Stable': { text: 'Moderate', color: 'bg-blue-100 text-blue-800' },
            'Declining': { text: 'Low', color: 'bg-gray-100 text-gray-600' }
        };
        const level = demandLevels[trend];
        if (!level) return null;
        return (
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${level.color}`}>
                {level.text}
            </span>
        );
    };

    // Helper function to format salary range
    const formatSalary = (salary) => {
        if (!salary) return 'N/A';
        return salary.toLocaleString();
    };

    // Helper function to get salary range display
    const getSalaryRange = (career) => {
        if (!career.salary) return 'N/A';
        return formatSalary(career.salary);
    };

    return (
        <div className="space-y-4">
                {loading ? (
                    <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2B3E4E]"></div>
                    </div>
                ) : (
                <>
                            {paginatedCareers.length === 0 ? (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                            <p className="text-gray-500 text-lg">No careers found matching your filters.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {paginatedCareers.map((career) => (
                                <div
                                        key={career.careerId}
                                    className="relative bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                                    onClick={() => handleItemClick(career)}
                                >
                                    {/* Job Trend Banner */}
                                    {career.jobTrend && (
                                        <div
                                            className={`absolute top-0 right-0 z-10 px-6 py-1 text-xs font-bold text-white rounded-bl-lg shadow-md select-none
                                                ${career.jobTrend.toLowerCase().includes('high') ? 'bg-[#FFB71B] text-[#2B3E4E]' :
                                                  career.jobTrend.toLowerCase().includes('moderate') ? 'bg-blue-500' :
                                                  career.jobTrend.toLowerCase().includes('stable') ? 'bg-green-600' :
                                                  'bg-gray-700'}
                                            `}
                                        >
                                            {career.jobTrend.toUpperCase()}
                                        </div>
                                    )}
                                    <div className="flex items-start justify-between">
                                        {/* Left Section - Icon & Title */}
                                        <div className="flex items-start gap-4 flex-1">
                                            <div className="flex-shrink-0">
                                                <div className="w-12 h-12 bg-[#2B3E4E] rounded-lg flex items-center justify-center">
                                                    <Briefcase className="h-6 w-6 text-white" />
                                                </div>
                                            </div>
                                                                                         <div className="flex-1 min-w-0">
                                                 <div className="flex items-center gap-2 mb-1">
                                                     <h3 className="text-lg font-semibold text-[#2B3E4E] truncate">
                                                         {career.careerTitle}
                                                     </h3>
                                                     {/* Star icon for highlighted careers */}
                                                     {(career.careerTitle.includes('Pilot') || career.careerTitle.includes('Program')) && (
                                                         <Star className="h-4 w-4 text-[#FFB71B] fill-current" />
                                                     )}
                                                 </div>
                                                 <p className="text-sm text-gray-600 text-left">{career.industry}</p>
                                             </div>
                                        </div>

                                        {/* Middle Section - Education & Salary */}
                                        <div className="flex flex-col gap-3 flex-1 ml-1 items-start">
                                            <div className="flex items-center gap-2 w-full mt-3 items-start">
                                                <GraduationCap className="h-5 w-5 text-gray-500" />
                                                <span className="text-base text-gray-800 font-small flex-1 break-words text-left">
                                                    {formatProgramsPreview(career)}
                                                        </span>
                                            </div>
                                        </div>

                                        {/* Right Section - Job Demand */}
                                        <div className="flex flex-col gap-2 ml-8 items-start">
                                            {/* Removed job trend text display here, only keeping the badge if needed */}
                                            {getDemandBadge(career.jobTrend)}

                                            {/* Salary section: label and value stack vertically if needed */}
                                            <div className="flex items-center w-56 mt-3">
                                                <span className="text-sm font-semibold text-green-600 mr-1">Salary:</span>
                                                <span className="text-sm text-green-600 font-medium truncate whitespace-nowrap overflow-hidden w-full">
                                                    {getSalaryRange(career)}
                                                </span>
                                            </div>
                                        </div>

                                         {/* Chevron for more details */}
                                         {/* Removed chevron arrow below job trend badge */}
                                    </div>

                                    {/* More programs indicator */}
                                    {getProgramsForCareer(career).length > 1 && (
                                        <div className="mt-3 pt-3 border-t border-gray-100">
                                            <div className="flex justify-end">
                                                <span className="text-xs text-[#2B3E4E] flex items-center gap-1">
                                                    {formatMoreProgramsText(career)}
                                                    <ChevronRight className="w-3 h-3" />
                                                    </span>
                                            </div>
                                        </div>
                )}
            </div>
                            ))}
                        </div>
                    )}

            {/* Pagination */}
            {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2 py-6">
                    <button
                                className="px-3 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                    >
                        First
                    </button>
                    <button
                                className="px-3 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                    >
                        Prev
                    </button>
                    {getPaginationRange(currentPage, totalPages).map((page) => (
                        <button
                            key={page}
                                    className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                                currentPage === page
                                            ? "bg-[#FFB71B] text-[#2B3E4E] shadow-md"
                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                            onClick={() => setCurrentPage(page)}
                        >
                            {page}
                        </button>
                    ))}
                    <button
                                className="px-3 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                    >
                        Next
                    </button>
                    <button
                                className="px-3 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                    >
                        Last
                    </button>
                </div>
                    )}
                </>
            )}
        </div>
    );
};

export default CareerResultsTable;