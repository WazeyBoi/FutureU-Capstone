import React, { useState, useEffect } from 'react';
import { School, MapPin, ChevronRight, Building, Award, ExternalLink, Info } from 'lucide-react';
import { schoolLogos } from './constants';
import { getSchoolBackground, getAnimationClass } from './utils';
import accreditationService from '../../services/accreditationService';

// Tooltip data for accreditation information
const accreditationBodyInfo = {
  'PACUCOA': {
    fullName: 'Philippine Association of Colleges and Universities Commission on Accreditation',
    focus: 'Primarily private, non-sectarian colleges and universities',
    significance: 'One of the most active accreditation bodies in the private sector'
  },
  'AACCUP': {
    fullName: 'Accrediting Agency of Chartered Colleges and Universities in the Philippines',
    focus: 'Primarily State Universities and Colleges (SUCs) and Local Universities and Colleges (LUCs)',
    significance: 'The main accrediting body for public higher education institutions'
  },
  'PAASCU': {
    fullName: 'Philippine Accrediting Association of Schools, Colleges and Universities',
    focus: 'Private, sectarian, and non-sectarian institutions',
    significance: 'One of the oldest and most recognized accrediting bodies'
  },
  'PTC-ACBET': {
    fullName: 'Philippine Technological Council - Accreditation and Certification Board for Engineering and Technology',
    focus: 'Focuses specifically on Engineering and Technology programs',
    significance: 'Certifies that an engineering program meets local and international standards, crucial for global mobility'
  },
  'PAASCU/PTC-ACBET': {
    fullName: 'Combined Accreditation Engineering and Technology programs in PAASCU-affiliated schools',
    focus: 'Indicates the program meets both the general PAASCU quality standards and the specific engineering competencies',
    significance: 'PAASCU quality standards and the specific engineering competencies set by PTC-ACBET'
  }
};

const accreditationLevelInfo = {
  'Level I': 'The program has successfully met the minimum standards set by the accrediting body and has achieved a basic level of quality assurance.',
  'Level II': 'The program has demonstrated substantial compliance and continuous quality improvement since its initial accreditation.',
  'Level III': 'The program meets a high level of quality in all aspects (instruction, research, community extension). The university is often granted partial deregulation in curriculum matters for this program by CHED.',
  'Level IV': 'Highest level attainable. The program is highly esteemed, has a strong research tradition, and is nationally and internationally recognized for excellence. The university is granted full autonomy in curriculum and program matters for this specific program by CHED.'
};

const chedRecognitionInfo = {
  'COE': 'Center of Excellence (COE) refers to a department/program within a higher education institution, which continuously demonstrates excellent performance in the areas of instruction, research and publication, extension and linkages and institutional qualifications.',
  'COD': 'Center of Development (COD) refers to a department/program within a higher education institution, which demonstrates the potential to become a Center of Excellence (COE) in the future.'
};

// Simple Tooltip Component - Left positioning for better visibility
const Tooltip = ({ children, content, title, position = "left" }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className={`absolute z-[9999] pointer-events-none ${
          position === 'top' ? 'bottom-full left-1/2 transform -translate-x-1/2 mb-2' :
          position === 'bottom' ? 'top-full left-1/2 transform -translate-x-1/2 mt-2' :
          position === 'left' ? 'right-full top-1/2 transform -translate-y-1/2 mr-2' :
          'left-full top-1/2 transform -translate-y-1/2 ml-2'
        }`}>
          <div className="w-80 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl border border-gray-700">
            {title && <div className="font-semibold text-yellow-400 mb-2 text-center">{title}</div>}
            <div className="leading-relaxed whitespace-pre-line text-justify">{content}</div>
          </div>
        </div>
      )}
    </div>
  );
};

const SchoolGrid = ({ 
  schools, 
  showProgramSidePanel,
  selectedProgram,
  schoolProgramData = [] // Array of school-program relationships with department info
}) => {
  const [accreditationData, setAccreditationData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch accreditation data when component mounts
  useEffect(() => {
    const fetchAccreditationData = async () => {
      try {
        const data = await accreditationService.getAllAccreditationData();
        setAccreditationData(data);
      } catch (error) {
        console.error('Error fetching accreditation data:', error);
        setAccreditationData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAccreditationData();
  }, []);

  // Get department information for a school and selected program
  const getSchoolDepartmentInfo = (school) => {
    if (!selectedProgram || !schoolProgramData.length) {
      return null;
    }
    
    const schoolProgramRelation = schoolProgramData.find(
      sp => sp.school && sp.school.schoolId === school.schoolId
    );
    
    return schoolProgramRelation?.department || null;
  };

  // Get accreditation info for a school
  const getSchoolAccreditationInfo = (school) => {
    const accreditedSchool = accreditationData.find(
      (accSchool) => 
        accSchool.name.toLowerCase().includes(school.name.toLowerCase()) ||
        school.name.toLowerCase().includes(accSchool.name.toLowerCase())
    );

    if (accreditedSchool && accreditedSchool.programs) {
      // Get all programs and their accreditation details
      const allPrograms = accreditedSchool.programs.flatMap(category => category.items);
      
      // Find highest accreditation level
      const highestLevel = Math.max(...allPrograms.map(p => p.level || 0));
      
      // Find programs with COE/COD recognition
      const coePrograms = allPrograms.filter(p => p.recognition === 'COE');
      const codPrograms = allPrograms.filter(p => p.recognition === 'COD');
      
      // Get most common accrediting body
      const accreditingBodies = allPrograms
        .map(p => p.accreditation?.accreditingBody)
        .filter(body => body && body !== '-');
      const mostCommonBody = accreditingBodies.length > 0 
        ? accreditingBodies.reduce((a, b, i, arr) => 
            arr.filter(v => v === a).length >= arr.filter(v => v === b).length ? a : b
          )
        : 'Not Available';

      return {
        totalAccredited: accreditedSchool.totalAccredited || 0,
        hasAccreditation: accreditedSchool.totalAccredited > 0,
        highestLevel: highestLevel > 0 ? `Level ${['', 'I', 'II', 'III', 'IV'][highestLevel]}` : 'No Information Available',
        accreditingBody: mostCommonBody,
        chedRecognition: coePrograms.length > 0 ? 'COE' : codPrograms.length > 0 ? 'COD' : 'No Information Available',
        coeCount: coePrograms.length,
        codCount: codPrograms.length
      };
    }

    return {
      totalAccredited: 0,
      hasAccreditation: false,
      highestLevel: 'Not Accredited',
      accreditingBody: 'Not Available',
      chedRecognition: 'None',
      coeCount: 0,
      codCount: 0
    };
  };
  // Empty state when no schools match the filters
  if (schools.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <div className="bg-gradient-to-br from-[#2B3E4E]/10 to-[#FFB71B]/10 p-8 rounded-full mb-6 hover:scale-110 transition-transform duration-300">
          <School className="w-16 h-16 text-[#2B3E4E]/60" />
        </div>
        <h3 className="text-2xl font-bold text-[#2B3E4E] mb-4">No Schools Found</h3>
        <div className="max-w-md text-gray-600 text-lg leading-relaxed space-y-2">
          <p>No schools match your current filter criteria.</p>
          <p className="text-sm text-gray-500">
            Try adjusting your filters or <span className="font-medium text-[#FFB71B]">clearing all filters</span> to see more results.
          </p>
        </div>
        <div className="mt-8 flex items-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-1 text-[#FFB71B]" />
            <span>Location</span>
          </div>
          <span>•</span>
          <div className="flex items-center">
            <Building className="w-4 h-4 mr-1 text-[#1D63A1]" />
            <span>School Type</span>
          </div>
          <span>•</span>
          <div className="flex items-center">
            <Award className="w-4 h-4 mr-1 text-[#2B3E4E]" />
            <span>Accreditation</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`grid gap-6 auto-rows-max transition-all duration-300 ${
      showProgramSidePanel 
        ? 'grid-with-panel grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3' 
        : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6'
    }`}>
        {schools.map((school, index) => {
          const schoolLogo = schoolLogos[school.schoolId];
          const schoolBackground = getSchoolBackground(school.name);

          return (
            <div
              key={school.schoolId}
              className={`relative bg-white dark:bg-gray-700 border rounded-xl transition-all duration-300 ${getAnimationClass(index)} ${
                showProgramSidePanel ? 'hover:scale-[1.02]' : 'hover:scale-105'
              } hover:shadow-lg cursor-pointer border-gray-200 dark:border-gray-600 shadow-sm flex flex-col hover:z-[10000] group`}
              style={{ 
                animationDelay: `${index * 50}ms`,
                animationFillMode: 'both',
                minHeight: '650px'
              }}
            >
              {/* School Background Image */}
              <div className="w-full h-48 relative overflow-hidden rounded-t-xl">
                {schoolBackground ? (
                  <img
                    src={schoolBackground} 
                    alt={`${school.name} campus`}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextElementSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                
                {/* Fallback background for schools without images */}
                <div 
                  className="w-full h-full bg-gradient-to-br from-[#2B3E4E] via-[#1B2836] to-[#0F1419] flex items-center justify-center"
                  style={{ display: schoolBackground ? 'none' : 'flex' }}
                >
                  <School className="w-16 h-16 text-[#FFB71B] opacity-50" />
                </div>
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/70"></div>
                
                {/* School Logo Overlay */}
                <div className="absolute top-4 left-4">
                  {schoolLogo ? (
                    <img
                      src={schoolLogo}
                      alt={`${school.name} logo`}
                      className="w-16 h-16 object-cover rounded-full shadow-lg border-2 border-white dark:border-gray-800"
                    />
                  ) : (
                    <div className="w-16 h-16 flex items-center justify-center bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/30 dark:to-blue-900/30 rounded-full shadow-lg border-2 border-white dark:border-gray-800">
                      <School className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                    </div>
                  )}
                </div>
                
                {/* School name overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-white font-bold text-lg leading-tight drop-shadow-lg line-clamp-2">
                    {school.name}
                  </h3>
                </div>
              </div>

              {/* School Info Card Body */}
              <div className="p-4 flex flex-col flex-1">
                {(() => {
                  const accreditationInfo = getSchoolAccreditationInfo(school);
                  return (
                    <div className="bg-white dark:bg-gray-700/60 rounded-lg shadow-md p-4 mb-4 border border-gray-200 dark:border-gray-600">
                      {/* School Information - Full Width Top, 2-Column Bottom Layout */}
                      <div className="mb-6 space-y-4 text-left">
                        {/* Full Width Top Row: Address */}
                        <div className="flex items-start space-x-2">
                          <MapPin className="w-3 h-3 text-[#FFB71B] flex-shrink-0 mt-1" />
                          <div className="flex-1">
                            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Address</div>
                            <div className="text-xs font-bold text-[#2B3E4E] dark:text-white leading-tight">{school.location}</div>
                          </div>
                        </div>

                        {/* Full Width Second Row: Department (if available) */}
                        {(() => {
                          const department = getSchoolDepartmentInfo(school);
                          return department ? (
                            <div className="flex items-start space-x-2">
                              <Building className="w-3 h-3 text-[#2B3E4E] flex-shrink-0 mt-1" />
                              <div className="flex-1">
                                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Department</div>
                                <div className="text-xs font-bold text-[#2B3E4E] dark:text-white leading-tight">{department}</div>
                              </div>
                            </div>
                          ) : null;
                        })()}
                        
                        {/* Bottom Row: 2-Column Layout for School Type and Accreditation Status */}
                        <div className="grid grid-cols-2 gap-4">
                          {/* Left: School Type */}
                          <div className="flex items-start space-x-2">
                            <School className="w-3 h-3 text-[#1D63A1] flex-shrink-0 mt-1" />
                            <div className="flex-1">
                              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">School Type</div>
                              <div className="text-xs font-bold text-[#2B3E4E] dark:text-white leading-tight">
                                {school.type || (school.isPrivate ? 'Private University' : 'Public University')}
                              </div>
                            </div>
                          </div>
                          
                          {/* Right: Accreditation Status */}
                          <div className="flex items-start space-x-2">
                            <Award className={`w-3 h-3 flex-shrink-0 mt-1 ${
                              accreditationInfo.hasAccreditation 
                                ? 'text-green-500' 
                                : 'text-gray-400'
                            }`} />
                            <div className="flex-1">
                              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Accreditation Status</div>
                              <div className={`text-xs font-bold leading-tight ${
                                accreditationInfo.hasAccreditation 
                                  ? 'text-green-600 dark:text-green-400' 
                                  : 'text-gray-600 dark:text-gray-400'
                              }`}>
                                {accreditationInfo.hasAccreditation ? 'Accredited' : 'No Accreditation Status Available'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Compact Accreditation Information - 2 Column Layout */}
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        {/* Left: CHED Recognition */}
                        <div className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-900/30 dark:via-yellow-900/20 dark:to-orange-900/30 rounded-lg p-3 border border-amber-300 dark:border-amber-700 shadow-sm">
                          <div className="flex items-center justify-center mb-2">
                            <h6 className="text-xs font-bold text-[#2B3E4E] dark:text-[#FFB71B] flex items-center">
                              <div className="w-4 h-4 rounded bg-gradient-to-br from-[#FFB71B] to-[#F59E0B] flex items-center justify-center mr-1.5 shadow-sm">
                                <School className="w-2 h-2 text-[#232D35]" />
                              </div>
                              CHED Recognition
                            </h6>
                            <Tooltip 
                              content="CHED (Commission on Higher Education) Recognition indicates the quality and performance level of academic programs in Philippine higher education institutions."
                              title="CHED Recognition Information"
                              position="left"
                            >
                              <Info className="w-2.5 h-2.5 text-amber-600 hover:text-amber-800 cursor-pointer transition-colors ml-1" />
                            </Tooltip>
                          </div>
                          
                          <div className="text-center">
                            {accreditationInfo.chedRecognition === 'COE' ? (
                              <Tooltip 
                                content={chedRecognitionInfo.COE}
                                title="Center of Excellence (COE)"
                                position="left"
                              >
                                <div className="inline-flex px-2 py-1 rounded-full text-xs font-semibold cursor-pointer hover:scale-105 transition-transform bg-gradient-to-r from-green-400 to-emerald-500 text-white">
                                  🏆 Center of Excellence
                                </div>
                              </Tooltip>
                            ) : accreditationInfo.chedRecognition === 'COD' ? (
                              <Tooltip 
                                content={chedRecognitionInfo.COD}
                                title="Center of Development (COD)"
                                position="left"
                              >
                                <div className="inline-flex px-2 py-1 rounded-full text-xs font-semibold cursor-pointer hover:scale-105 transition-transform bg-gradient-to-r from-blue-400 to-indigo-500 text-white">
                                  ⭐ Center of Development
                                </div>
                              </Tooltip>
                            ) : (
                              <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                                📋 No Data Available
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Right: Accreditation Body & Level */}
                        <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/30 dark:via-indigo-900/20 dark:to-purple-900/30 rounded-lg p-3 border border-blue-300 dark:border-blue-700 shadow-sm">
                          <div className="flex items-center justify-center mb-2">
                            <h6 className="text-xs font-bold text-[#2B3E4E] dark:text-[#FFB71B] flex items-center">
                              <div className="w-4 h-4 rounded bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mr-1.5 shadow-sm">
                                <Building className="w-2 h-2 text-white" />
                              </div>
                              Accreditation Body & Level
                            </h6>
                            <Tooltip 
                              content="Accreditation levels indicate the maturity and quality development stage of educational programs and institutions."
                              title="Accreditation Information"
                              position="left"
                            >
                              <Info className="w-2.5 h-2.5 text-blue-600 hover:text-blue-800 cursor-pointer transition-colors ml-1" />
                            </Tooltip>
                          </div>
                          
                          <div className="space-y-2 text-center">
                            {/* Accrediting Body */}
                            <div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Body</div>
                              {accreditationInfo.accreditingBody !== 'Not Available' ? (
                                <Tooltip 
                                  content={
                                    accreditationBodyInfo[accreditationInfo.accreditingBody] 
                                      ? `${accreditationBodyInfo[accreditationInfo.accreditingBody].fullName}\n\nFocus: ${accreditationBodyInfo[accreditationInfo.accreditingBody].focus}\n\nSignificance: ${accreditationBodyInfo[accreditationInfo.accreditingBody].significance}`
                                      : 'Information not available for this accrediting body.'
                                  }
                                  title={accreditationInfo.accreditingBody}
                                  position="left"
                                >
                                  <div className="text-xs font-semibold text-blue-600 cursor-pointer hover:text-blue-800 transition-colors">
                                    {accreditationInfo.accreditingBody}
                                  </div>
                                </Tooltip>
                              ) : (
                                <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                                  No Data Available
                                </div>
                              )}
                            </div>
                            
                            {/* Accreditation Level */}
                            <div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Level</div>
                              {accreditationInfo.highestLevel !== 'Not Accredited' && accreditationInfo.accreditingBody !== 'Not Available' && accreditationInfo.highestLevel !== 'No Information Available' ? (
                                <Tooltip 
                                  content={accreditationLevelInfo[accreditationInfo.highestLevel] || 'Information not available for this accreditation level.'}
                                  title={accreditationInfo.highestLevel}
                                  position="left"
                                >
                                  <div className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold cursor-pointer hover:scale-105 transition-transform ${
                                    accreditationInfo.highestLevel.includes('III') || accreditationInfo.highestLevel.includes('IV')
                                      ? 'bg-gradient-to-r from-emerald-400 to-teal-500 text-white' 
                                      : accreditationInfo.highestLevel.includes('II')
                                      ? 'bg-gradient-to-r from-blue-400 to-indigo-500 text-white'
                                      : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
                                  }`}>
                                    {accreditationInfo.highestLevel.includes('III') || accreditationInfo.highestLevel.includes('IV') ? '🏆' : accreditationInfo.highestLevel.includes('II') ? '⭐' : '📋'} {accreditationInfo.highestLevel}
                                  </div>
                                </Tooltip>
                              ) : (
                                <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                                  No Data Available
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Data Source Information */}
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                        <div className="flex items-center justify-center">
                          <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">
                            Data from Accreditation Records
                          </span>
                          <ExternalLink className="w-3 h-3 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Hover effect border */}
              <div className="absolute inset-0 rounded-xl border-2 border-transparent hover:border-[#FFB71B] transition-colors duration-300 pointer-events-none"></div>
            </div>
          );
        })}
    </div>
  );
};

export default SchoolGrid;