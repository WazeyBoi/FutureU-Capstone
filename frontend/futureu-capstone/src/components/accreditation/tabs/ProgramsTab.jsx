import React from "react";

const ProgramsTab = ({ filteredPrograms, contentAnimated }) => {
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
          <p className="text-sm text-gray-500 mt-1">Showing {filteredPrograms.length} programs</p>
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
              {filteredPrograms.map((program, index) => (
                <tr 
                  key={`${program.schoolName}-${program.name}-${index}`} 
                  className="hover:bg-gray-50 transition-opacity duration-500 ease-out" 
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
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${program.recognition === "COE" ? "bg-indigo-700" : "bg-indigo-500"} text-white`}>
                        {program.recognition}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-500">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-500">
                    {program.accreditingBody}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${program.level === 4 ? "bg-yellow-500" : program.level === 3 ? "bg-yellow-500" : program.level === 2 ? "bg-yellow-500" : "bg-yellow-500"} text-black`}>
                      Level {program.level === 1 ? "I" : program.level === 2 ? "II" : program.level === 3 ? "III" : "IV"} {program.level > 2 ? "Accredited" : "Accredited"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProgramsTab; 