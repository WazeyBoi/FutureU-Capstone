import React, { useState, useEffect } from "react";
import axios from "axios";

const PAGE_SIZE = 10;

const CareerPathways = () => {
  const [careers, setCareers] = useState([]);
  const [schoolPrograms, setSchoolPrograms] = useState([]);
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [selectedProgram, setSelectedProgram] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("");
  const [selectedJobTrend, setSelectedJobTrend] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [programSearch, setProgramSearch] = useState("");
  const [schoolSearch, setSchoolSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Modal states
  const [selectedCareer, setSelectedCareer] = useState(null);
  const [showCareerModal, setShowCareerModal] = useState(false);
  const [showSchoolsModal, setShowSchoolsModal] = useState(false);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [careersRes, schoolProgramsRes] = await Promise.all([
          axios.get("/api/career/getAllCareers"),
          axios.get("/api/schoolprogram/getAllSchoolPrograms"),
        ]);
        setCareers(careersRes.data);
        setSchoolPrograms(schoolProgramsRes.data);
      } catch (err) {
        // handle error
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Derive unique programs and schools from schoolPrograms
  const allPrograms = Array.from(
    new Map(
      schoolPrograms.map((sp) => [sp.program.programId, sp.program])
    ).values()
  );
  const allSchools = Array.from(
    new Map(
      schoolPrograms.map((sp) => [sp.school.schoolId, sp.school])
    ).values()
  );

  // Filter programs based on selected school
  const filteredPrograms = selectedSchool
    ? allPrograms.filter((program) =>
        schoolPrograms.some(
          (sp) =>
            sp.program.programId === program.programId &&
            sp.school.schoolId === Number(selectedSchool)
        )
      )
    : programSearch
    ? allPrograms.filter((p) =>
        p.programName.toLowerCase().includes(programSearch.toLowerCase())
      )
    : allPrograms;

  // Filter schools based on selected program
  const filteredSchools = selectedProgram
    ? allSchools.filter((school) =>
        schoolPrograms.some(
          (sp) =>
            sp.school.schoolId === school.schoolId &&
            sp.program.programId === Number(selectedProgram)
        )
      )
    : schoolSearch
    ? allSchools.filter((s) =>
        s.schoolName.toLowerCase().includes(schoolSearch.toLowerCase())
      )
    : allSchools;

  // Unique industries and job trends
  const industries = Array.from(new Set(careers.map((c) => c.industry).filter(Boolean)));
  const jobTrends = Array.from(new Set(careers.map((c) => c.jobTrend).filter(Boolean)));

  // Filtering logic for careers
  const filteredCareers = careers.filter((career) => {
    const matchesIndustry = !selectedIndustry || career.industry === selectedIndustry;
    const matchesProgram = !selectedProgram || (career.program && career.program.programId === Number(selectedProgram));
    const matchesSchool =
      !selectedSchool ||
      (career.program &&
        schoolPrograms.some(
          (sp) =>
            sp.program.programId === career.program.programId &&
            sp.school.schoolId === Number(selectedSchool)
        ));
    const matchesJobTrend = !selectedJobTrend || career.jobTrend === selectedJobTrend;
    const matchesSearch = !searchTerm || career.careerTitle.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesIndustry && matchesProgram && matchesSchool && matchesJobTrend && matchesSearch;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredCareers.length / PAGE_SIZE);
  const paginatedCareers = filteredCareers.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedIndustry, selectedProgram, selectedSchool, selectedJobTrend, searchTerm]);

  function getPaginationRange(current, total) {
    const visiblePages = 5;
    let start = Math.max(1, current - Math.floor(visiblePages / 2));
    let end = start + visiblePages - 1;
    if (end > total) {
      end = total;
      start = Math.max(1, end - visiblePages + 1);
    }
    const range = [];
    for (let i = start; i <= end; i++) range.push(i);
    return range;
  }

  // Get schools offering the selected career's program
  const getSchoolsForCareer = (career) => {
    if (!career?.program) return [];
    return schoolPrograms
      .filter((sp) => sp.program.programId === career.program.programId)
      .map((sp) => sp.school);
  };

  // Helper to get a school background (reuse logic from AcademicExplorer)
  const schoolBackgroundMap = {
    "Cebu Institute of Technology": "path/to/citBackground.jpg",
    // ...add your mappings here...
  };
  const getSchoolBackground = (schoolName) => {
    if (!schoolName) return null;
    const normalizedName = schoolName.toLowerCase();
    for (const [key, background] of Object.entries(schoolBackgroundMap)) {
      if (normalizedName.includes(key.toLowerCase())) {
        return background;
      }
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-md">
        <div className="max-w-[1600px] mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Career Pathways</h1>
          <p className="mt-1 text-sm text-gray-600">
            Explore career opportunities, filter by industry, program, school, or job trend, and discover your future path.
          </p>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Filters */}
          <aside className="lg:w-1/4 w-full space-y-6">
            {/* Industry */}
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
            {/* Program */}
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold mb-4">Program</h2>
              <input
                type="text"
                className="w-full mb-2 px-3 py-2 border border-gray-300 rounded text-sm"
                placeholder="Search program..."
                value={programSearch}
                onChange={(e) => setProgramSearch(e.target.value)}
              />
              <select
                className="w-full border border-gray-300 rounded-md text-sm px-3 py-2"
                value={selectedProgram}
                onChange={(e) => setSelectedProgram(e.target.value)}
              >
                <option value="">All Programs</option>
                {filteredPrograms.map((program) => (
                  <option key={program.programId} value={program.programId}>
                    {program.programName}
                  </option>
                ))}
              </select>
            </div>
            {/* School */}
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold mb-4">School</h2>
              <input
                type="text"
                className="w-full mb-2 px-3 py-2 border border-gray-300 rounded text-sm"
                placeholder="Search school..."
                value={schoolSearch}
                onChange={(e) => setSchoolSearch(e.target.value)}
              />
              <select
                className="w-full border border-gray-300 rounded-md text-sm px-3 py-2"
                value={selectedSchool}
                onChange={(e) => setSelectedSchool(e.target.value)}
              >
                <option value="">All Schools</option>
                {filteredSchools.map((school) => (
                  <option key={school.schoolId} value={school.schoolId}>
                    {school.name}
                  </option>
                ))}
              </select>
            </div>
            {/* Job Trend */}
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
            <button
              className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-4 py-2 rounded mt-2"
              onClick={() => {
                setSelectedIndustry("");
                setSelectedProgram("");
                setSelectedSchool("");
                setSelectedJobTrend("");
                setSearchTerm("");
                setProgramSearch("");
                setSchoolSearch("");
              }}
            >
              Clear Filters
            </button>
          </aside>

          {/* Main Content */}
          <section className="lg:w-3/4 w-full flex flex-col gap-8">
            {/* Search */}
            <div className="flex flex-col md:flex-row gap-4 items-center bg-white rounded-lg shadow p-4">
              <input
                type="text"
                className="block w-full md:w-1/2 pl-3 pr-3 py-2 border border-gray-300 rounded-md text-sm"
                placeholder="Search career title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className="text-gray-400 text-xs mt-2 md:mt-0">
                Showing {filteredCareers.length} result{filteredCareers.length !== 1 ? "s" : ""}
              </span>
            </div>
            {/* Table and Pagination (keep your existing code here) */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b border-gray-200 flex flex-wrap gap-4 items-center">
                <input
                  type="text"
                  className="block w-full lg:w-1/2 pl-3 pr-3 py-2 border border-gray-300 rounded-md text-sm"
                  placeholder="Search career title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="overflow-x-auto">
                {loading ? (
                  <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
                  </div>
                ) : (
                  <table className="min-w-full table-fixed divide-y divide-gray-200">
                    <colgroup>
                      <col style={{ width: "24%" }} />
                      <col style={{ width: "18%" }} />
                      <col style={{ width: "28%" }} />
                      <col style={{ width: "15%" }} />
                      <col style={{ width: "15%" }} />
                    </colgroup>
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                          Career
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                          Industry
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                          Program
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                          Salary
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                          Job Trend
                        </th>
                      </tr>
                    </thead>
                    <tbody
                      className="bg-white divide-y divide-gray-200"
                      style={{ minHeight: "400px" }}
                    >
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
                            className="hover:bg-yellow-100 cursor-pointer transition duration-200"
                            onClick={() => {
                              setSelectedCareer(career);
                              setShowCareerModal(true);
                            }}
                          >
                            <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap truncate">{career.careerTitle}</td>
                            <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap truncate">{career.industry}</td>
                            <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap truncate">
                              {career.program ? career.program.programName : "N/A"}
                            </td>
                            <td className="px-6 py-4 text-sm text-yellow-600 font-bold whitespace-nowrap truncate">
                              ₱{career.salary?.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap truncate">{career.jobTrend}</td>
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

            {/* Career Details Modal */}
            {showCareerModal && selectedCareer && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full relative border border-gray-200 overflow-hidden">
                  {/* Header */}
                  <div className="bg-[#2B3E4E] h-24 flex items-center justify-center">
                    <div className="bg-white rounded-full shadow-lg w-20 h-20 flex items-center justify-center -mb-10 z-10 border-4 border-white">
                      <span className="text-4xl text-[#FFB71B]">🎯</span>
                    </div>
                  </div>
                  {/* Card Content */}
                  <div className="pt-12 pb-8 px-8">
                    {/* Close button */}
                    <button
                      className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 bg-gray-100 p-2 rounded-full shadow"
                      onClick={() => setShowCareerModal(false)}
                      aria-label="Close"
                    >
                      &times;
                    </button>
                    {/* Title */}
                    <div className="text-center mb-6">
                      <div className="text-xs uppercase tracking-wider text-[#2B3E4E] font-semibold mb-1">
                        Career Path
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900">{selectedCareer.careerTitle}</h2>
                    </div>
                    {/* Info Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-xs text-gray-500 font-semibold mb-1">Industry</div>
                        <div className="text-base text-gray-800">{selectedCareer.industry}</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-xs text-gray-500 font-semibold mb-1">Program</div>
                        <div className="text-base text-gray-800">{selectedCareer.program?.programName || "N/A"}</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-xs text-gray-500 font-semibold mb-1">Salary</div>
                        <div className="text-base text-yellow-600 font-bold">₱{selectedCareer.salary?.toLocaleString()}</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-xs text-gray-500 font-semibold mb-1">Job Trend</div>
                        <div className="text-base text-gray-800">{selectedCareer.jobTrend}</div>
                      </div>
                    </div>
                    {/* Action Button */}
                    <div className="flex justify-center mt-4">
                      <button
                        className="w-full sm:w-auto bg-[#FFB71B] hover:bg-[#FFB71B]/90 text-[#2B3E4E] font-bold px-6 py-3 rounded-lg transition shadow-md flex items-center justify-center"
                        onClick={() => setShowSchoolsModal(true)}
                      >
                        <span className="mr-2">🏫</span>
                        View Schools Offering this Program
                      </button>
                    </div>
                  </div>
                  {/* Schools Modal */}
{showSchoolsModal && selectedCareer && (
  <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
    <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full relative border border-gray-200 animate-fade-in-up overflow-hidden">
      <button
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 bg-gray-100 p-2 rounded-full shadow"
        onClick={() => setShowSchoolsModal(false)}
        aria-label="Close"
      >
        &times;
      </button>
      <div className="h-52 bg-[#2B3E4E] relative overflow-hidden w-full">
        {getSchoolsForCareer(selectedCareer)[0]?.name && getSchoolBackground(getSchoolsForCareer(selectedCareer)[0]?.name) ? (
          <img
            src={getSchoolBackground(getSchoolsForCareer(selectedCareer)[0]?.name)}
            alt="School background"
            className="w-full h-full object-cover object-center opacity-40"
          />
        ) : (
          <div className="absolute inset-0 bg-[#2B3E4E] opacity-90"></div>
        )}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="px-6 py-3 text-center">
            <h2 className="text-white text-3xl font-bold text-shadow-lg" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.4)' }}>
              Schools Offering {selectedCareer.program?.programName}
            </h2>
          </div>
        </div>
      </div>
      <div className="px-8 pb-8 relative">
        <ul className="space-y-8 max-h-[420px] overflow-y-auto pt-12">
          {getSchoolsForCareer(selectedCareer).length === 0 ? (
            <li className="text-gray-500">No schools found for this program.</li>
          ) : (
            getSchoolsForCareer(selectedCareer).map((school) => (
              <li key={school.schoolId} className="relative bg-white rounded-xl shadow-lg border border-gray-100 p-6 flex flex-col md:flex-row gap-6 mb-4">
                <div className="absolute -top-12 left-8 w-24 h-24">
                  <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-lg border-4 border-white overflow-hidden p-1">
                    <span className="text-4xl font-bold text-[#2B3E4E]">{school.name[0]}</span>
                  </div>
                </div>
                <div className="flex-1 pt-8 md:pt-0 md:pl-32">
                  <h3 className="font-bold text-xl text-[#2B3E4E] mb-2">{school.name}</h3>
                  <div className="flex flex-wrap gap-4 mb-2">
                    <div className="flex items-center text-gray-600">
                      <svg className="w-5 h-5 mr-2 text-[#FFB71B]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      {school.location}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <svg className="w-5 h-5 mr-2 text-[#FFB71B]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7v4a1 1 0 001 1h3m10-5h3a1 1 0 011 1v4a1 1 0 01-1 1h-3m-10 0v6a1 1 0 001 1h8a1 1 0 001-1v-6m-10 0h10" /></svg>
                      {school.type}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 mb-3">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-[#FFB71B]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 20h9" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m0 0H3" /></svg>
                      About the School
                    </h4>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {school.description || 'No description available for this school.'}
                    </p>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
        {/* View All Button */}
        <div className="mt-8 flex justify-end gap-4">
          <button
            className="py-3 px-6 bg-[#FFB71B] hover:bg-[#FFB71B]/90 text-[#2B3E4E] rounded-lg transition shadow-md hover:shadow-lg font-medium flex items-center justify-center"
            onClick={() => {
              window.location.href = `/academic-explorer?programId=${selectedCareer.program?.programId}`;
            }}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            View All in Academic Explorer
          </button>
          <button
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold px-4 py-2 rounded"
            onClick={() => setShowSchoolsModal(false)}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
)}
                </div>
              </div>
            )}

            {/* Legend Section */}
            <div className="lg:w-full bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Legend</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-md font-medium text-gray-800 mb-2">
                    Job Trend
                  </h4>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-green-600 text-white text-xs mr-2">
                        High Demand
                      </span>
                      <span className="text-sm text-gray-600">
                        Careers with strong job market growth
                      </span>
                    </li>
                    <li className="flex items-center">
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white text-xs mr-2">
                        Growing
                      </span>
                      <span className="text-sm text-gray-600">
                        Careers with steady growth
                      </span>
                    </li>
                    <li className="flex items-center">
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-yellow-500 text-white text-xs mr-2">
                        Stable
                      </span>
                      <span className="text-sm text-gray-600">
                        Careers with consistent opportunities
                      </span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-md font-medium text-gray-800 mb-2">
                    Salary
                  </h4>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-yellow-500 text-white text-xs mr-2">
                        ₱
                      </span>
                      <span className="text-sm text-gray-600">
                        Estimated monthly salary (PHP)
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default CareerPathways;