import React, { useState } from "react";
import ProgramDetailsModal from "../ProgramDetailsModal";
import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from 'lucide-react';

const ProgramsTab = ({ filteredPrograms, contentAnimated }) => {
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Pagination states
  const [page, setPage] = useState(0); // Changed from currentPage to page (0-indexed)
  const [rowsPerPage, setRowsPerPage] = useState(10); // Changed from itemsPerPage, added setter
  
  // Get current programs for pagination
  const indexOfLastProgram = (page + 1) * rowsPerPage; // Adjusted for 0-indexed page
  const indexOfFirstProgram = page * rowsPerPage; // Adjusted for 0-indexed page
  const currentPrograms = filteredPrograms.slice(indexOfFirstProgram, indexOfLastProgram);
  
  // Calculate total pages
  const totalPages = Math.ceil(filteredPrograms.length / rowsPerPage);
  
  // Change page function
  const handleChangePage = (newPage) => { // Renamed from paginate and adjusted for 0-indexed
    setPage(newPage);
  };
  
  // Previous and next page functions (will be replaced by admin pagination buttons)
  // const goToPreviousPage = () => {
  //   if (page > 0) { // Adjusted for 0-indexed page
  //     setPage(page - 1);
  //   }
  // };
  
  // const goToNextPage = () => {
  //   if (page < totalPages - 1) { // Adjusted for 0-indexed page
  //     setPage(page + 1);
  //   }
  // };

  // Helper function to get pagination range (copied from CRUD_SchoolProgram.jsx)
  const getPaginationRange = (current, totalPages) => {
    const MAX_VISIBLE_PAGES = 5;
    let start = Math.max(0, current - Math.floor(MAX_VISIBLE_PAGES / 2));
    let end = Math.min(totalPages - 1, start + MAX_VISIBLE_PAGES - 1);
    
    // Adjust start if we're near the end
    if (end - start + 1 < MAX_VISIBLE_PAGES) {
      start = Math.max(0, end - MAX_VISIBLE_PAGES + 1);
    }
    
    const range = [];
    for (let i = start; i <= end; i++) {
      range.push(i);
    }
    
    return range;
  };

  // Function to determine the color for recognition badges
  const getRecognitionColor = (recognition) => {
    if (!recognition) return "bg-gray-200 text-gray-600";
    
    switch(recognition) {
      case "COE": return "bg-indigo-700 text-white";
      case "COD": return "bg-indigo-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };
  
  // Function to determine the color for accreditation level badges
  const getLevelColor = (level) => {
    switch(level) {
      case 4: return "bg-yellow-600 text-white";
      case 3: return "bg-yellow-500 text-black";
      case 2: return "bg-yellow-400 text-black";
      case 1: return "bg-yellow-300 text-black";
      default: return "bg-gray-200 text-gray-600";
    }
  };
  
  // Function to format the level Roman numerals
  const formatLevel = (level) => {
    switch(level) {
      case 4: return "IV";
      case 3: return "III";
      case 2: return "II";
      case 1: return "I";
      default: return "-";
    }
  };

  const handleProgramClick = (program) => {
    if (program.level > 0) {  // Only allow clicking accredited programs
      // Create a combined program object with accreditation details
      const programWithAccreditation = {
        ...program,
        accreditation: {
          title: program.accreditation?.title || 'Not Available',
          description: program.accreditation?.description || 'No description available',
          level: program.level,
          accreditingBody: program.accreditingBody,
          recognition: program.recognition,
          status: program.status
        }
      };
      setSelectedProgram(programWithAccreditation);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProgram(null);
  };

  return (
    <div className="animate-fadeIn">
      {/* Search and Filter Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-wrap gap-4">
          {/* Filters button removed from here since it's now at the top */}
        </div>
      </div>
      
      {/* Accredited Programs Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Accredited Programs</h3>
          <p className="text-sm text-gray-500 mt-1">
            Showing {filteredPrograms.length > 0 ? indexOfFirstProgram + 1 : 0} - {Math.min(indexOfLastProgram, filteredPrograms.length)} of {filteredPrograms.length} programs
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SCHOOL & PROGRAM
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  RECOGNITION
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ACCREDITING BODY
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  STATUS
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentPrograms.length > 0 ? (
                currentPrograms.map((program, index) => (
                  <tr 
                    key={`${program.schoolName}-${program.name}-${index}`} 
                    className={`transition-opacity duration-500 ease-out ${
                      program.level > 0 ? 'hover:bg-gray-50 cursor-pointer' : 'cursor-default'
                    }`}
                    onClick={() => handleProgramClick(program)}
                    style={{ 
                      animationDelay: `${index * 30}ms`,
                      opacity: contentAnimated ? 1 : 0,
                      transition: `opacity 500ms ease-out ${100 + index * 30}ms`
                    }}
                  >
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{program.name}</div>
                      <div className="text-xs text-gray-500">{program.schoolName}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {program.recognition ? (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRecognitionColor(program.recognition)}`}>
                          {program.recognition}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-500">
                      {program.accreditingBody || "-"}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {program.level > 0 ? (
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getLevelColor(program.level)}`}>
                          Level {formatLevel(program.level)} {program.level > 0 ? "Accredited" : ""}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500">Not Accredited</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-10 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      <p>No programs found matching your criteria.</p>
                      <p className="text-sm mt-2">Try adjusting your filters or search term.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls - Updated to match admin style */}
        {filteredPrograms.length > 0 && totalPages > 0 && (
          <div className="bg-white rounded-b-lg shadow p-4 border-t border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-600">
                Showing {filteredPrograms.length > 0 ? page * rowsPerPage + 1 : 0} to{" "}
                {Math.min((page + 1) * rowsPerPage, filteredPrograms.length)} of {filteredPrograms.length} programs
              </div>
            
              <div className="flex items-center space-x-1">
                {totalPages > 0 && (
                  <div className="flex space-x-1 items-center">
                    {/* First page button */}
                    <button
                      onClick={() => handleChangePage(0)}
                      disabled={page === 0}
                      className={`p-2 rounded-lg ${page === 0 ? "text-gray-400 cursor-not-allowed" : "text-gray-700 hover:bg-gray-100"} transition-colors`}
                      title="First page"
                    >
                      <ChevronsLeft className="h-5 w-5" />
                    </button>
                    
                    {/* Previous page button */}
                    <button
                      onClick={() => handleChangePage(Math.max(0, page - 1))}
                      disabled={page === 0}
                      className={`p-2 rounded-lg ${page === 0 ? "text-gray-400 cursor-not-allowed" : "text-gray-700 hover:bg-gray-100"} transition-colors`}
                      title="Previous page"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    
                    {/* Page numbers */}
                    {getPaginationRange(page, totalPages).map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => handleChangePage(pageNum)}
                        className={`px-3 py-1 rounded-lg ${pageNum === page ? "bg-[#FFB71B] text-[#2B3E4E] font-semibold" : "text-gray-700 hover:bg-gray-100"} transition-colors`}
                      >
                        {pageNum + 1}
                      </button>
                    ))}
                    
                    {/* Next page button */}
                    <button
                      onClick={() => handleChangePage(Math.min(totalPages - 1, page + 1))}
                      disabled={page >= totalPages - 1}
                      className={`p-2 rounded-lg ${page >= totalPages - 1 ? "text-gray-400 cursor-not-allowed" : "text-gray-700 hover:bg-gray-100"} transition-colors`}
                      title="Next page"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                    
                    {/* Last page button */}
                    <button
                      onClick={() => handleChangePage(totalPages - 1)}
                      disabled={page >= totalPages - 1}
                      className={`p-2 rounded-lg ${page >= totalPages - 1 ? "text-gray-400 cursor-not-allowed" : "text-gray-700 hover:bg-gray-100"} transition-colors`}
                      title="Last page"
                    >
                      <ChevronsRight className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>
            
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Rows per page:</span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setPage(0); // Reset to first page when rows per page changes
                  }}
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#FFB71B] focus:border-[#FFB71B]"
                >
                  {[5, 10, 25, 50].map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Program Details Modal */}
      <ProgramDetailsModal
        program={selectedProgram}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default ProgramsTab;