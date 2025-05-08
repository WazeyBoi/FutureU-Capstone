import React, { useState } from "react";

const AccreditationRatings = () => {
  const schools = [
    {
      id: 1,
      name: "University of San Jose-Recoletos",
      totalAccredited: 24,
      institutionalStatus: {
        autonomousStatus: "CHED Autonomous Status",
        institutionalAccreditation: "PAASCU Level III Certified",
        validUntil: "2028-12-31",
      },
      programs: [
        {
          category: "Undergraduate Programs",
          items: [
            {
              name: "Bachelor of Science in Computer Science",
              accreditationStatus: "Level III Accredited",
              accreditingBody: "PACUCOA",
              recognition: "COE",
              level: 3,
            },
            {
              name: "Bachelor of Science in Information Technology",
              accreditationStatus: "Level II Accredited",
              accreditingBody: "PACUCOA",
              recognition: "COD",
              level: 2,
            },
          ],
        },
      ],
    },
    {
      id: 2,
      name: "University of San Carlos (USC)",
      totalAccredited: 30,
      institutionalStatus: {
        autonomousStatus: "CHED Autonomous Status",
        institutionalAccreditation: "PAASCU Level IV Certified",
        validUntil: "2030-06-30",
      },
      programs: [
        {
          category: "Graduate Programs",
          items: [
            {
              name: "Master of Business Administration",
              accreditationStatus: "Level IV Accredited",
              accreditingBody: "PAASCU",
              recognition: "COE",
              level: 4,
            },
            {
              name: "Master of Science in Engineering",
              accreditationStatus: "Level III Accredited",
              accreditingBody: "PACUCOA",
              recognition: "COD",
              level: 3,
            },
          ],
        },
      ],
    },
    {
      id: 3,
      name: "Cebu Normal University (CNU)",
      totalAccredited: 18,
      institutionalStatus: {
        autonomousStatus: "CHED Autonomous Status",
        institutionalAccreditation: "AACCUP Level III Certified",
        validUntil: "2027-12-31",
      },
      programs: [
        {
          category: "Undergraduate Programs",
          items: [
            {
              name: "Bachelor of Science in Nursing",
              accreditationStatus: "Level III Accredited",
              accreditingBody: "AACCUP",
              recognition: "COE",
              level: 3,
            },
            {
              name: "Bachelor of Elementary Education",
              accreditationStatus: "Level II Accredited",
              accreditingBody: "AACCUP",
              recognition: "COD",
              level: 2,
            },
          ],
        },
      ],
    },
    {
      id: 4,
      name: "University of Cebu (UC)",
      totalAccredited: 20,
      institutionalStatus: {
        autonomousStatus: "CHED Deregulated Status",
        institutionalAccreditation: "PACUCOA Level II Certified",
        validUntil: "2026-12-31",
      },
      programs: [
        {
          category: "Undergraduate Programs",
          items: [
            {
              name: "Bachelor of Science in Marine Engineering",
              accreditationStatus: "Level II Accredited",
              accreditingBody: "PACUCOA",
              recognition: "COD",
              level: 2,
            },
            {
              name: "Bachelor of Science in Criminology",
              accreditationStatus: "Level I Accredited",
              accreditingBody: "PACUCOA",
              recognition: null,
              level: 1,
            },
          ],
        },
      ],
    },
    {
      id: 5,
      name: "Cebu Institute of Technology – University (CIT-U)",
      totalAccredited: 22,
      institutionalStatus: {
        autonomousStatus: "CHED Autonomous Status",
        institutionalAccreditation: "PACUCOA Level III Certified",
        validUntil: "2029-12-31",
      },
      programs: [
        {
          category: "Undergraduate Programs",
          items: [
            {
              name: "Bachelor of Science in Civil Engineering",
              accreditationStatus: "Level III Accredited",
              accreditingBody: "PACUCOA",
              recognition: "COE",
              level: 3,
            },
            {
              name: "Bachelor of Science in Architecture",
              accreditationStatus: "Level II Accredited",
              accreditingBody: "PACUCOA",
              recognition: "COD",
              level: 2,
            },
          ],
        },
      ],
    },
    {
      id: 6,
      name: "University of the Philippines Cebu (UP Cebu)",
      totalAccredited: 15,
      institutionalStatus: {
        autonomousStatus: "CHED Autonomous Status",
        institutionalAccreditation: "UP System Certified",
        validUntil: "2031-12-31",
      },
      programs: [
        {
          category: "Undergraduate Programs",
          items: [
            {
              name: "Bachelor of Arts in Communication",
              accreditationStatus: "Level IV Accredited",
              accreditingBody: "UP System",
              recognition: "COE",
              level: 4,
            },
            {
              name: "Bachelor of Science in Computer Science",
              accreditationStatus: "Level IV Accredited",
              accreditingBody: "UP System",
              recognition: "COE",
              level: 4,
            },
          ],
        },
      ],
    },
    {
      id: 7,
      name: "Cebu Technological University (CTU)",
      totalAccredited: 25,
      institutionalStatus: {
        autonomousStatus: "CHED Autonomous Status",
        institutionalAccreditation: "AACCUP Level III Certified",
        validUntil: "2028-12-31",
      },
      programs: [
        {
          category: "Undergraduate Programs",
          items: [
            {
              name: "Bachelor of Science in Industrial Technology",
              accreditationStatus: "Level III Accredited",
              accreditingBody: "AACCUP",
              recognition: "COD",
              level: 3,
            },
            {
              name: "Bachelor of Science in Agriculture",
              accreditationStatus: "Level II Accredited",
              accreditingBody: "AACCUP",
              recognition: null,
              level: 2,
            },
          ],
        },
      ],
    },
    {
      id: 8,
      name: "Southwestern University (SWU) PHINMA",
      totalAccredited: 12,
      institutionalStatus: {
        autonomousStatus: "CHED Deregulated Status",
        institutionalAccreditation: "PACUCOA Level II Certified",
        validUntil: "2025-12-31",
      },
      programs: [
        {
          category: "Undergraduate Programs",
          items: [
            {
              name: "Doctor of Dental Medicine",
              accreditationStatus: "Level III Accredited",
              accreditingBody: "PACUCOA",
              recognition: "COE",
              level: 3,
            },
            {
              name: "Bachelor of Science in Pharmacy",
              accreditationStatus: "Level II Accredited",
              accreditingBody: "PACUCOA",
              recognition: "COD",
              level: 2,
            },
          ],
        },
      ],
    },
    {
      id: 9,
      name: "Cebu Doctors' University (CDU)",
      totalAccredited: 10,
      institutionalStatus: {
        autonomousStatus: "CHED Deregulated Status",
        institutionalAccreditation: "PACUCOA Level II Certified",
        validUntil: "2026-12-31",
      },
      programs: [
        {
          category: "Undergraduate Programs",
          items: [
            {
              name: "Bachelor of Science in Nursing",
              accreditationStatus: "Level III Accredited",
              accreditingBody: "PACUCOA",
              recognition: "COE",
              level: 3,
            },
            {
              name: "Bachelor of Science in Physical Therapy",
              accreditationStatus: "Level II Accredited",
              accreditingBody: "PACUCOA",
              recognition: "COD",
              level: 2,
            },
          ],
        },
      ],
    },
    {
      id: 10,
      name: "University of the Visayas (UV)",
      totalAccredited: 14,
      institutionalStatus: {
        autonomousStatus: "CHED Deregulated Status",
        institutionalAccreditation: "PACUCOA Level II Certified",
        validUntil: "2027-12-31",
      },
      programs: [
        {
          category: "Undergraduate Programs",
          items: [
            {
              name: "Bachelor of Science in Business Administration",
              accreditationStatus: "Level II Accredited",
              accreditingBody: "PACUCOA",
              recognition: "COD",
              level: 2,
            },
            {
              name: "Bachelor of Science in Hospitality Management",
              accreditationStatus: "Level I Accredited",
              accreditingBody: "PACUCOA",
              recognition: null,
              level: 1,
            },
          ],
        },
      ],
    },
    {
      id: 11,
      name: "Indiana Aerospace University",
      totalAccredited: 8,
      institutionalStatus: {
        autonomousStatus: "CHED Deregulated Status",
        institutionalAccreditation: "PACUCOA Level I Certified",
        validUntil: "2025-12-31",
      },
      programs: [
        {
          category: "Undergraduate Programs",
          items: [
            {
              name: "Bachelor of Science in Aerospace Engineering",
              accreditationStatus: "Level II Accredited",
              accreditingBody: "PACUCOA",
              recognition: "COD",
              level: 2,
            },
            {
              name: "Bachelor of Science in Aviation Technology",
              accreditationStatus: "Level I Accredited",
              accreditingBody: "PACUCOA",
              recognition: null,
              level: 1,
            },
          ],
        },
      ],
    },
  ];

  const [selectedSchool, setSelectedSchool] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProgramType, setSelectedProgramType] = useState("");
  const [selectedAccreditationLevel, setSelectedAccreditationLevel] =
    useState("");
  const [selectedRecognition, setSelectedRecognition] = useState("");

  const getRecognitionBadgeColor = (recognition) => {
    switch (recognition) {
      case "COE":
        return "bg-purple-600";
      case "COD":
        return "bg-blue-600";
      default:
        return "bg-gray-600";
    }
  };

  const getAccreditationLevelColor = (level) => {
    switch (level) {
      case 4:
        return "bg-green-600";
      case 3:
        return "bg-teal-600";
      case 2:
        return "bg-blue-600";
      case 1:
        return "bg-indigo-600";
      default:
        return "bg-gray-600";
    }
  };

  const getAllPrograms = (school) => {
    return school.programs.flatMap((category) =>
      category.items.map((program) => ({
        ...program,
        schoolName: school.name,
        category: category.category,
      }))
    );
  };

  const filteredPrograms = schools
    .flatMap((school) => getAllPrograms(school))
    .filter((program) => {
      if (
        selectedSchool !== null &&
        program.schoolName !== schools[selectedSchool].name
      )
        return false;
      if (
        searchTerm &&
        !program.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
        return false;
      if (selectedProgramType && program.category !== selectedProgramType)
        return false;
      if (
        selectedAccreditationLevel &&
        program.level !== parseInt(selectedAccreditationLevel)
      )
        return false;
      if (selectedRecognition && program.recognition !== selectedRecognition)
        return false;
      return true;
    });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Accreditation & Recognition Status
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Explore the quality assurance ratings of educational institutions
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Sidebar - Schools List */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold mb-4">Schools</h2>
              <div className="space-y-2">
                {schools.map((school, index) => (
                  <button
                    key={school.id}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors duration-200 ${
                      selectedSchool === index
                        ? "bg-indigo-50 text-indigo-700"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() =>
                      setSelectedSchool(selectedSchool === index ? null : index)
                    }
                  >
                    <div className="font-medium">{school.name}</div>
                    <div className="text-sm text-gray-500">
                      {school.totalAccredited} Programs
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Content */}
          <div className="lg:w-3/4 flex flex-col gap-8">
            {/* Programs Table */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b border-gray-200">
                <div className="flex flex-wrap gap-4">
                  <input
                    type="text"
                    className="block w-full lg:w-auto pl-3 pr-3 py-2 border border-gray-300 rounded-md text-sm"
                    placeholder="Search programs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <select
                    className="border border-gray-300 rounded-md text-sm px-3 py-2"
                    value={selectedProgramType}
                    onChange={(e) => setSelectedProgramType(e.target.value)}
                  >
                    <option value="">All Program Types</option>
                    <option value="Undergraduate Programs">Undergraduate</option>
                    <option value="Graduate Programs">Graduate</option>
                  </select>
                  <select
                    className="border border-gray-300 rounded-md text-sm px-3 py-2"
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
                    className="border border-gray-300 rounded-md text-sm px-3 py-2"
                    value={selectedRecognition}
                    onChange={(e) => setSelectedRecognition(e.target.value)}
                  >
                    <option value="">All Recognitions</option>
                    <option value="COE">COE</option>
                    <option value="COD">COD</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        School & Program
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Recognition
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Accrediting Body
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredPrograms.map((program, index) => (
                      <tr
                        key={index}
                        className="hover:bg-gray-100 transition duration-200"
                      >
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {program.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {program.schoolName}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {program.recognition ? (
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRecognitionBadgeColor(
                                program.recognition
                              )} text-white`}
                            >
                              {program.recognition}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-500">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-900">
                            {program.accreditingBody}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getAccreditationLevelColor(
                              program.level
                            )} text-white`}
                          >
                            {program.accreditationStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Legend Section */}
            <div className="lg:w-full bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Legend</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-md font-medium text-gray-800 mb-2">
                    Accreditation Levels
                  </h4>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-green-600 text-white text-xs mr-2">
                        IV
                      </span>
                      <span className="text-sm text-gray-600">
                        Level IV - Highest level of accreditation
                      </span>
                    </li>
                    <li className="flex items-center">
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-teal-600 text-white text-xs mr-2">
                        III
                      </span>
                      <span className="text-sm text-gray-600">
                        Level III - Well-established program quality
                      </span>
                    </li>
                    <li className="flex items-center">
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white text-xs mr-2">
                        II
                      </span>
                      <span className="text-sm text-gray-600">
                        Level II - Demonstrated program quality
                      </span>
                    </li>
                    <li className="flex items-center">
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-indigo-600 text-white text-xs mr-2">
                        I
                      </span>
                      <span className="text-sm text-gray-600">
                        Level I - Initial accreditation
                      </span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-md font-medium text-gray-800 mb-2">
                    Recognition Types
                  </h4>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-600 text-white mr-2">
                        COE
                      </span>
                      <span className="text-sm text-gray-600">
                        Center of Excellence - Recognized by CHED for outstanding
                        performance
                      </span>
                    </li>
                    <li className="flex items-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-600 text-white mr-2">
                        COD
                      </span>
                      <span className="text-sm text-gray-600">
                        Center of Development - Recognized by CHED for potential
                        excellence
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AccreditationRatings;