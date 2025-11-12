import React, { useState, useEffect } from 'react';
import { MapPin, ChevronRight, School, Award, Building, ExternalLink, Info } from 'lucide-react';
import { schoolLogos } from './constants';
import { getSchoolBackground, getAnimationClass } from './utils';
import accreditationService from '../../services/accreditationService';

// Tooltip data for educational information
const accreditationBodyInfo = {
  'PACUCOA': 'Philippine Association of Colleges and Universities Commission on Accreditation. Founded in 1957, it is the largest voluntary accrediting agency in the country, primarily accrediting private non-sectarian higher education institutions.',
  'AACCUP': 'Association of Christian Schools, Colleges and Universities Accrediting Agency. Established to accredit Christian educational institutions and maintain high standards of Christian education in the Philippines.',
  'PAASCU': 'Philippine Accrediting Association of Schools, Colleges and Universities. One of the oldest recognized accrediting agencies in the Philippines, established in 1957, primarily serving Catholic educational institutions.',
  'PTC-ACBET': 'Philippine Technological Council - Accreditation and Certification Board for Engineering and Technology. Specializes in accrediting engineering, technology, and related programs.'
};

const accreditationLevelInfo = {
  'Level I': 'Candidate Status - The institution meets basic requirements and is working toward full accreditation. This is the initial level showing commitment to quality improvement.',
  'Level II': 'Fully Accredited - The institution has demonstrated substantial compliance with accreditation standards and shows evidence of continuous improvement in all areas.',
  'Level III': 'Re-Accredited - The institution has maintained high standards over time and continues to show excellence in education, with established quality assurance systems.',
  'Level IV': 'Autonomous Status - The highest level of accreditation. The institution has demonstrated exceptional quality and has earned the right to self-regulate certain aspects of its operations.'
};

const chedRecognitionInfo = {
  'COE': 'Center of Excellence - A recognition given to programs that continuously demonstrate excellent performance in the areas of instruction, research, extension, and production. These programs serve as models for other institutions.',
  'COD': 'Center of Development - A recognition given to programs that demonstrate potential for excellence and are committed to continuous improvement. These programs receive support to eventually become Centers of Excellence.'
};

// Simple Tooltip Component - Left positioning for better visibility
const Tooltip = ({ children, content, title, position = 'left' }) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className={`absolute z-[9999] ${positionClasses[position]} pointer-events-none`}>
          <div className="bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl w-80 border border-gray-700">
            {title && <div className="font-semibold mb-2 text-yellow-400">{title}</div>}
            <div className="leading-relaxed whitespace-pre-line">{content}</div>
          </div>
        </div>
      )}
    </div>
  );
};

const SchoolCard = ({ 
  school, 
  index, 
  onMouseEnter, 
  onMouseLeave
}) => {
  const schoolLogo = schoolLogos[school.schoolId];
  const schoolBackground = getSchoolBackground(school.name);
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
        highestLevel: highestLevel > 0 ? `Level ${['', 'I', 'II', 'III', 'IV'][highestLevel]}` : 'Not Accredited',
        accreditingBody: mostCommonBody,
        chedRecognition: coePrograms.length > 0 ? 'COE' : codPrograms.length > 0 ? 'COD' : 'None',
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

  const accreditationInfo = getSchoolAccreditationInfo(school);

  return (
    <div
      className={`relative bg-white dark:bg-gray-700 border rounded-xl transition-all duration-300 ${getAnimationClass(index)} ${
        'border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-lg hover:-translate-y-1'
      } hover:z-[10000] group`}
      onMouseEnter={(e) => onMouseEnter(school, e)}
      onMouseLeave={onMouseLeave}
    >
      <div className="flex flex-col h-full">
        {/* Top half with image and logo */}
        <div className="relative w-full h-44 bg-blue-100 overflow-hidden rounded-t-xl">
          {/* Banner image - using a gradient overlay to ensure text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-blue-500/30 to-blue-500/10"></div>
          
          {/* School background image */}
          {schoolBackground ? (
            <img 
              src={schoolBackground} 
              alt={`${school.name} campus`}
              className="w-full h-full object-cover object-center"
            />
          ) : (
            <img 
              src={`https://source.unsplash.com/800x450/?university,school,campus,college&${school.schoolId}`} 
              alt={`${school.name} campus`}
              className="w-full h-full object-cover object-center"
            />
          )}

          {/* Logo positioned in the middle with no white background */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            {schoolLogo ? (
              <img 
                src={schoolLogo} 
                alt={`${school.name} logo`}
                className="w-32 h-32 object-cover rounded-full shadow-lg"
              />
            ) : (
              <div className="w-32 h-32 flex items-center justify-center bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/30 dark:to-blue-900/30 rounded-full shadow-lg">
                <School className="w-16 h-16 text-indigo-600 dark:text-indigo-400" />
              </div>
            )}
          </div>
        </div>

        {/* Bottom half with school information */}
        <div className="p-5 flex flex-col flex-1">
          {/* School name centered */}
          <h3 className="font-bold text-lg text-gray-900 dark:text-white text-center mb-4">{school.name}</h3>
          
          {/* Enhanced School Information */}
          <div className="bg-white dark:bg-gray-700/60 rounded-lg shadow-md p-4 mb-4 border border-gray-200 dark:border-gray-600">
            {/* Full Address */}
            <div className="mb-3 pb-3 border-b border-gray-200 dark:border-gray-600">
              <div className="flex items-start text-xs text-gray-600 dark:text-gray-300">
                <MapPin className="w-3 h-3 mr-2 text-[#FFB71B] flex-shrink-0 mt-0.5" />
                <span className="font-medium leading-tight">{school.location}</span>
              </div>
            </div>

            {/* School Type and Accreditation Status */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center text-sm font-medium text-[#1D63A1] dark:text-blue-400">
                <Building className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>{school.type || (school.isPrivate ? 'Private University' : 'Public University')}</span>
              </div>
              {accreditationInfo.hasAccreditation && (
                <div className="bg-[#FFB71B]/20 text-[#FFB71B] text-xs px-2 py-1 rounded-full font-medium">
                  <Award className="w-3 h-3 inline mr-1" />
                  Accredited
                </div>
              )}
            </div>
            
            {/* Accreditation Information - Two Box Layout */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              {/* CHED Recognition Status */}
              <div className="bg-gradient-to-br from-[#FFB71B]/10 to-[#FFB71B]/5 border border-[#FFB71B]/30 rounded-lg p-3">
                <div className="text-center">
                  <div className="flex items-center justify-between mb-2">
                    <Award className="w-4 h-4 text-[#FFB71B]" />
                    <Tooltip 
                      content="CHED (Commission on Higher Education) Recognition indicates the quality and performance level of academic programs in Philippine higher education institutions."
                      title="CHED Recognition"
                      position="top"
                    >
                      <Info className="w-3 h-3 text-gray-500 hover:text-[#FFB71B] cursor-pointer" />
                    </Tooltip>
                  </div>
                  <div className="text-xs font-semibold text-[#2B3E4E] dark:text-gray-300 mb-2">CHED Recognition</div>
                  <div className="text-xs font-bold text-[#2B3E4E] dark:text-white leading-tight">
                    {accreditationInfo.chedRecognition === 'COE' ? (
                      <Tooltip 
                        content={chedRecognitionInfo.COE}
                        title="Center of Excellence (COE)"
                        position="left"
                      >
                        <span className="cursor-pointer">COE</span>
                      </Tooltip>
                    ) : accreditationInfo.chedRecognition === 'COD' ? (
                      <Tooltip 
                        content={chedRecognitionInfo.COD}
                        title="Center of Development (COD)"
                        position="left"
                      >
                        <span className="cursor-pointer">COD</span>
                      </Tooltip>
                    ) : 'None'}
                  </div>
                </div>
              </div>

              {/* Accreditation Level */}
              <div className="bg-gradient-to-br from-[#1D63A1]/10 to-[#1D63A1]/5 border border-[#1D63A1]/30 rounded-lg p-3">
                <div className="text-center">
                  <div className="flex items-center justify-between mb-2">
                    <Building className="w-4 h-4 text-[#1D63A1]" />
                    <Tooltip 
                      content="Accreditation is a quality assurance process that evaluates and certifies educational institutions and programs."
                      title="Accreditation Info"
                      position="top"
                    >
                      <Info className="w-3 h-3 text-gray-500 hover:text-[#1D63A1] cursor-pointer" />
                    </Tooltip>
                  </div>
                  <div className="text-xs font-semibold text-[#2B3E4E] dark:text-gray-300 mb-2">Accreditation</div>
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-[#2B3E4E] dark:text-white leading-tight">
                      {accreditationInfo.accreditingBody !== 'Not Available' ? (
                        <Tooltip 
                          content={accreditationBodyInfo[accreditationInfo.accreditingBody] || 'Information not available for this accrediting body.'}
                          title={accreditationInfo.accreditingBody}
                          position="left"
                        >
                          <span className="cursor-pointer">{accreditationInfo.accreditingBody}</span>
                        </Tooltip>
                      ) : 'No Information Available'}
                    </div>
                    <div className="text-xs font-medium text-[#1D63A1] dark:text-blue-400 leading-tight">
                      {accreditationInfo.highestLevel !== 'Not Accredited' && accreditationInfo.accreditingBody !== 'Not Available' && accreditationInfo.highestLevel ? (
                        <Tooltip 
                          content={accreditationLevelInfo[accreditationInfo.highestLevel] || 'Information not available for this accreditation level.'}
                          title={accreditationInfo.highestLevel}
                          position="left"
                        >
                          <span className="cursor-pointer">{accreditationInfo.highestLevel}</span>
                        </Tooltip>
                      ) : '—'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Total Programs Count */}
            {accreditationInfo.hasAccreditation && (
              <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-2 text-center mb-3">
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {accreditationInfo.totalAccredited} Total Accredited Programs
                </span>
              </div>
            )}
            
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
        </div>
      </div>
    </div>
  );
};

export default SchoolCard;