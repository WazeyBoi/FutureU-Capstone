// src/components/CareerPathways/CareerResultsTable.jsx
import React from 'react';
import { Briefcase, ChevronRight } from "lucide-react";

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
    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: "calc(100vh - 280px)" }}>
                {loading ? (
                    <div className="flex justify-center items-center h-40">
                        <div className="loader"></div> {/* Assuming 'loader' CSS class exists */}
                    </div>
                ) : (
                    <table className="min-w-full table-fixed divide-y divide-gray-200">
                        <colgroup>
                            {/*
                                Define column widths and labels in a more structured way
                                for easier adjustments and readability.
                            */}
                            { [
                                { width: "20%", label: "CAREER" },
                                { width: "20%", label: "INDUSTRY" }, 
                                { width: "35%", label: "PROGRAM" },
                                { width: "15%", label: "SALARY" },
                                { width: "10%", label: "JOB TREND" }
                            ].map((col, index) => (
                                <col key={index} style={{ width: col.width }} />
                            ))}
                        </colgroup>
                        <thead className="bg-gray-50 sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Career
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Industry
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Program
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Salary
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Job Trend
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {paginatedCareers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-12 text-gray-500">
                                        No careers found matching your filters.
                                    </td>
                                </tr>
                            ) : (
                                paginatedCareers.map((career) => (
                                    <tr
                                        key={career.careerId}
                                        className="hover:bg-[#2B3E4E]/5 cursor-pointer transition duration-200"
                                        onClick={(e) => {
                                            if (!e.target.closest('td.programs-cell')) {
                                                handleItemClick(career); // This triggers opening CareerDetailsModal
                                            }
                                        }}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-[#2B3E4E]/10 flex items-center justify-center mr-3">
                                                    <Briefcase className="h-4 w-4 text-[#2B3E4E]" />
                                                </div>
                                                <div className="text-sm font-medium text-gray-900 text-center w-full">{career.careerTitle}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-700">{career.industry}</div>
                                        </td>
                                        <td
                                            className="px-6 py-4 programs-cell"
                                            onClick={(e) => {
                                                e.stopPropagation(); // Prevent opening CareerDetailsModal
                                                handleItemClick(career); // Still triggers modal for programs, or you could have a specific handleProgramsCellClick prop
                                            }}
                                        >
                                            <div className="flex flex-col cursor-pointer group">
                                                <div className="text-sm text-gray-700 group-hover:text-[#2B3E4E] transition-colors">
                                                    {formatProgramsPreview(career)}
                                                </div>
                                                {getProgramsForCareer(career).length > 1 && (
                                                    <div className="flex justify-end mt-1">
                                                        <span className="text-xs text-[#2B3E4E] flex items-center">
                                                            {formatMoreProgramsText(career)}
                                                            <ChevronRight className="w-3 h-3 ml-0.5 mt-px group-hover:translate-x-0.5 transition-transform" />
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="text-sm text-yellow-600 font-bold">
                                                {career.salary ? `₱${career.salary.toLocaleString()}` : 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center">
                                                {career.jobTrend ? (
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getTrendStyle(career.jobTrend)}`}>
                                                        {getTrendIcon(career.jobTrend)}
                                                        {career.jobTrend}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                                        Not specified
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 py-4">
                    <button
                        className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold"
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                    >
                        First
                    </button>
                    <button
                        className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                    >
                        Prev
                    </button>
                    {getPaginationRange(currentPage, totalPages).map((page) => (
                        <button
                            key={page}
                            className={`px-3 py-1 rounded font-bold transition border-2 ${
                                currentPage === page
                                    ? "bg-yellow-500 text-black border-yellow-600 shadow-lg scale-110"
                                    : "bg-gray-100 text-gray-700 border-transparent hover:bg-yellow-100"
                            }`}
                            onClick={() => setCurrentPage(page)}
                        >
                            {page}
                        </button>
                    ))}
                    <button
                        className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                    >
                        Next
                    </button>
                    <button
                        className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold"
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                    >
                        Last
                    </button>
                </div>
            )}
        </div>
    );
};

export default CareerResultsTable;