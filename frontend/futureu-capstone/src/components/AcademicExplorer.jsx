import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AcademicExplorer = () => {
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [schools, setSchools] = useState([]); // State to store all schools
  const [filteredSchools, setFilteredSchools] = useState([]); // State to store filtered schools
  const [error, setError] = useState(null);

  // Fetch programs from the backend
  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const response = await axios.get('/api/program/getAllPrograms');
        if (Array.isArray(response.data)) {
          const transformedPrograms = response.data.map((program) => ({
            programId: program.programId,
            programName: program.programName,
          }));
          setPrograms(transformedPrograms);
        } else {
          setError('Failed to load programs. Please try again later.');
        }
      } catch (error) {
        setError('Failed to load programs. Please check your connection.');
      }
    };

    fetchPrograms();
  }, []);

  // Fetch all schools from the backend
  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const response = await axios.get('/api/school/getAllSchools');
        if (Array.isArray(response.data)) {
          setSchools(response.data);
        } else {
          setError('Failed to load schools. Please try again later.');
        }
      } catch (error) {
        setError('Failed to load schools. Please check your connection.');
      }
    };

    fetchSchools();
  }, []);

  // Fetch schools offering the selected program
  useEffect(() => {
    if (selectedProgram) {
      const fetchSchoolPrograms = async () => {
        try {
          const response = await axios.get(
            `/api/schoolprogram/getSchoolProgramsByProgram/${selectedProgram}`
          );
          if (Array.isArray(response.data)) {
            const schoolIds = response.data.map(
              (schoolProgram) => schoolProgram.school.schoolId
            );
            const filtered = schools.filter((school) =>
              schoolIds.includes(school.schoolId)
            );
            setFilteredSchools(filtered);
          } else {
            setFilteredSchools([]);
          }
        } catch (error) {
          setFilteredSchools([]);
          setError('Failed to load schools for the selected program.');
        }
      };

      fetchSchoolPrograms();
    }
  }, [selectedProgram, schools]);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center text-indigo-600 font-semibold">
              <span className="text-2xl mr-2">🏛️</span>
              <span>Academic Explorer</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 mr-8">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h2 className="text-gray-700 font-medium mb-4">Programs</h2>
              {error ? (
                <p className="text-red-500">{error}</p>
              ) : (
                <nav className="space-y-2">
                  {programs.map((program) => (
                    <button
                      key={program.programId}
                      className={`block w-full text-left px-3 py-2 rounded-md transition ${
                        selectedProgram === program.programId
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedProgram(program.programId)}
                    >
                      {program.programName}
                    </button>
                  ))}
                </nav>
              )}
            </div>
          </div>

          {/* Main Panel */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h1 className="text-xl font-semibold text-gray-800 mb-6">
                {selectedProgram
                    ? `Schools Offering ${programs.find((program) => program.programId === selectedProgram)?.programName || 'the Selected Program'}`
                    : 'Select a Program to View Schools'}
                </h1>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {filteredSchools.map((school) => (
                    <div
                    key={school.schoolId}
                    className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition cursor-pointer overflow-hidden"
                    >
                    <div className="p-4">
                        <div className="flex items-center mb-2">
                        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 mr-3">
                            <span className="text-2xl">🏛️</span>
                        </div>
                        <h3 className="font-medium text-indigo-600">{school.name}</h3>
                        </div>
                        <p className="text-gray-600">{school.location}</p>
                        <a
                        href={school.virtualTourUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-500 hover:underline"
                        >
                        Virtual Tour
                        </a>
                    </div>
                    </div>
                ))}
                </div>
            </div>
            </div>
        </div>
      </main>
    </div>
  );
};

export default AcademicExplorer;