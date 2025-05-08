import React, { useState, useEffect } from "react";
import axios from "axios";

const CareerPathways = () => {
  const [careers, setCareers] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [selectedProgram, setSelectedProgram] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCareer, setExpandedCareer] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch careers and programs on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [careersRes, programsRes] = await Promise.all([
          axios.get("/api/career/getAllCareers"),
          axios.get("/api/program/getAllPrograms"),
        ]);
        setCareers(careersRes.data);
        setPrograms(programsRes.data);
      } catch (err) {
        // handle error
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Get unique industries for filter dropdown
  const industries = Array.from(new Set(careers.map((c) => c.industry).filter(Boolean)));

  // Filtering logic
  const filteredCareers = careers.filter((career) => {
    const matchesIndustry = !selectedIndustry || career.industry === selectedIndustry;
    const matchesProgram = !selectedProgram || (career.program && career.program.programId === Number(selectedProgram));
    const matchesSearch = !searchTerm || career.careerTitle.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesIndustry && matchesProgram && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Career Pathways</h1>
      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-8">
        <input
          type="text"
          placeholder="Search career title..."
          className="border rounded px-3 py-2 text-sm w-64"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="border rounded px-3 py-2 text-sm w-48"
          value={selectedIndustry}
          onChange={(e) => setSelectedIndustry(e.target.value)}
        >
          <option value="">All Industries</option>
          {industries.map((industry) => (
            <option key={industry} value={industry}>
              {industry}
            </option>
          ))}
        </select>
        <select
          className="border rounded px-3 py-2 text-sm w-48"
          value={selectedProgram}
          onChange={(e) => setSelectedProgram(e.target.value)}
        >
          <option value="">All Programs</option>
          {programs.map((program) => (
            <option key={program.programId} value={program.programId}>
              {program.programName}
            </option>
          ))}
        </select>
        <button
          className="ml-auto bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-4 py-2 rounded"
          onClick={() => {
            setSelectedIndustry("");
            setSelectedProgram("");
            setSearchTerm("");
          }}
        >
          Clear Filters
        </button>
      </div>
      {/* Loading */}
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCareers.map((career) => (
            <div
              key={career.careerId}
              className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 cursor-pointer"
              onClick={() => setExpandedCareer(expandedCareer === career.careerId ? null : career.careerId)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">{career.careerTitle}</h2>
                  <p className="text-sm text-gray-500">{career.industry}</p>
                  <p className="text-sm text-gray-500">
                    Program: {career.program ? career.program.programName : "N/A"}
                  </p>
                </div>
                <span className="text-yellow-500 font-bold text-lg">
                  ₱{career.salary?.toLocaleString()}
                </span>
              </div>
              <div className="mt-2 text-sm text-gray-700">
                <span className="font-medium">Job Trend:</span> {career.jobTrend}
              </div>
              {/* Expandable Description/Details */}
              {expandedCareer === career.careerId && (
                <div className="mt-4 border-t pt-4 text-gray-700">
                  {/* Add more details here if available */}
                  <div>
                    <span className="font-medium">Industry:</span> {career.industry}
                  </div>
                  <div>
                    <span className="font-medium">Salary:</span> ₱{career.salary?.toLocaleString()}
                  </div>
                  <div>
                    <span className="font-medium">Job Trend:</span> {career.jobTrend}
                  </div>
                  <div>
                    <span className="font-medium">Program:</span> {career.program ? career.program.programName : "N/A"}
                  </div>
                </div>
              )}
            </div>
          ))}
          {filteredCareers.length === 0 && (
            <div className="col-span-full text-center text-gray-500 py-12">
              No careers found matching your filters.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CareerPathways;