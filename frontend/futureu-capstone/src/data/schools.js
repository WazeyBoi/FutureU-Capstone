// Mock data for school accreditation
export const schools = [
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