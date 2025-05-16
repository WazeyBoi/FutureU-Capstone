import React from "react";

const FilterOptions = ({
  selectedProgramType,
  setSelectedProgramType,
  selectedAccreditationLevel,
  setSelectedAccreditationLevel,
  selectedRecognition,
  setSelectedRecognition
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 mt-2 relative z-10">
      <div className="bg-white rounded-lg shadow-md p-4 flex flex-wrap gap-4 animate-fadeIn">
        <select
          className="border border-gray-200 rounded-md text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-100"
          value={selectedProgramType}
          onChange={(e) => setSelectedProgramType(e.target.value)}
        >
          <option value="">All Program Types</option>
          <option value="Undergraduate Programs">Undergraduate</option>
          <option value="Graduate Programs">Graduate</option>
        </select>
        
        <select
          className="border border-gray-200 rounded-md text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-100"
          value={selectedAccreditationLevel}
          onChange={(e) => setSelectedAccreditationLevel(e.target.value)}
        >
          <option value="">All Levels</option>
          <option value="4">Level IV</option>
          <option value="3">Level III</option>
          <option value="2">Level II</option>
          <option value="1">Level I</option>
        </select>
        
        <select
          className="border border-gray-200 rounded-md text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-100"
          value={selectedRecognition}
          onChange={(e) => setSelectedRecognition(e.target.value)}
        >
          <option value="">All Recognitions</option>
          <option value="COE">COE</option>
          <option value="COD">COD</option>
        </select>
      </div>
    </div>
  );
};

export default FilterOptions; 