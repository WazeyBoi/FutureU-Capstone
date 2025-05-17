import React from "react";

const SchoolsList = ({ schools, selectedSchool, setSelectedSchool, contentAnimated }) => {
  return (
    <div className="lg:w-1/4">
      <div className="bg-slate-800 rounded-t-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-4 text-white flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
          </svg>
          Schools
        </h2>
      </div>
      <div className="bg-white rounded-b-lg shadow overflow-hidden">
        <div className="space-y-0 divide-y divide-gray-200">
          {schools.map((school, index) => (
            <button
              key={school.id}
              className={`w-full text-left px-4 py-3 transition-all duration-300 ease-out transform ${selectedSchool === index ? "bg-indigo-50 border-l-4 border-yellow-500" : "hover:bg-gray-50"} ${contentAnimated ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
              style={{ transitionDelay: `${index * 50}ms` }}
              onClick={() => setSelectedSchool(selectedSchool === index ? null : index)}
            >
              <div className="flex items-center">
                <div>
                  <div className={`font-medium ${selectedSchool === index ? "text-gray-900" : "text-gray-700"}`}>
                    {school.name}
                  </div>
                  <div className="text-sm text-gray-500 flex items-center">
                    <svg className="w-4 h-4 mr-1 text-yellow-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"></path>
                    </svg>
                    {school.totalAccredited} Programs
                  </div>
                </div>
                <div className="ml-auto">
                  <svg 
                    className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${selectedSchool === index ? "transform rotate-90" : ""}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SchoolsList; 