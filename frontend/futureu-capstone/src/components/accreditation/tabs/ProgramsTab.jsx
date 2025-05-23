import React, { useState } from "react";
import ProgramDetailsModal from "../ProgramDetailsModal";

const ProgramsTab = ({ filteredPrograms, contentAnimated }) => {
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Show 10 items per page
  
  // Get current programs for pagination
  const indexOfLastProgram = currentPage * itemsPerPage;
  const indexOfFirstProgram = indexOfLastProgram - itemsPerPage;
  const currentPrograms = filteredPrograms.slice(indexOfFirstProgram, indexOfLastProgram);
  
  // Calculate total pages
  const totalPages = Math.ceil(filteredPrograms.length / itemsPerPage);
  
  // Change page function
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
  // Previous and next page functions
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
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
            Showing {indexOfFirstProgram + 1}-{Math.min(indexOfLastProgram, filteredPrograms.length)} of {filteredPrograms.length} programs
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

        {/* Pagination Controls - Updated to match screenshot */}
        {filteredPrograms.length > 0 && totalPages > 1 && (
          <div className="px-6 py-5 border-t border-gray-200 flex justify-center">
            <div className="flex items-center space-x-1">
              {/* Previous Button */}
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className={`flex items-center justify-center w-10 h-10 rounded-md shadow transition-colors duration-200 ${
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-[#2B3E4E] hover:bg-gray-50'
                }`}
                aria-label="Previous page"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              {/* Current Page Number */}
              <div className="flex items-center justify-center min-w-[40px] h-10 px-3 rounded-md bg-[#FFB71B] text-white font-semibold shadow">
                {currentPage}
              </div>
              
              {/* Total Pages (if more than 1 page) */}
              {totalPages > 1 && (
                <div className="text-[#2B3E4E] text-sm mx-1">
                  of {totalPages}
                </div>
              )}
              
              {/* Next Button */}
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className={`flex items-center justify-center w-10 h-10 rounded-md shadow transition-colors duration-200 ${
                  currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-[#2B3E4E] hover:bg-gray-50'
                }`}
                aria-label="Next page"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
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