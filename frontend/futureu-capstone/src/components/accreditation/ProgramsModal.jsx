import React from 'react';
import { X, Award, Building } from 'lucide-react';

// Import school images
import citu_school_image from '../../assets/school_images/citu_school_image.jpg';
import cdu_school_image from '../../assets/school_images/cdu_school_image.jpg';
import cnu_school_image from '../../assets/school_images/cnu_school_image.jpg';
import ctu_school_image from '../../assets/school_images/ctu_school_image.jpg';
import swu_school_image from '../../assets/school_images/swu_school_image.jpg';
import usc_school_image from '../../assets/school_images/usc_school_image.jpg';
import usjr_school_image from '../../assets/school_images/usjr_school_image.jpg';
import up_school_image from '../../assets/school_images/up_school_image.jpg';
import uc_school_image from '../../assets/school_images/uc_school_image.jpg';
import uv_school_image from '../../assets/school_images/uv_school_image.jpg';
import iau_school_image from '../../assets/school_images/iau_school_image.jpg';

// Import school logos
import citu_school_logo from '../../assets/school_logos/citu_school_logo.png';
import cdu_school_logo from '../../assets/school_logos/cdu_school_logo.png';
import cnu_school_logo from '../../assets/school_logos/cnu_school_logo.png';
import ctu_school_logo from '../../assets/school_logos/ctu_school_logo.png';
import swu_school_logo from '../../assets/school_logos/swu_school_logo.png';
import usc_school_logo from '../../assets/school_logos/usc_school_logo.png';
import usjr_school_logo from '../../assets/school_logos/usjr_school_logo.png';
import up_school_logo from '../../assets/school_logos/up_school_logo.png';
import uc_school_logo from '../../assets/school_logos/uc_school_logo.png';
import uv_school_logo from '../../assets/school_logos/uv_school_logo.png';
import iau_school_logo from '../../assets/school_logos/iau_school_logo.png';

// Create a mapping for school ID to their background images
const schoolBackgroundMap = {
  1: cdu_school_image,    // Cebu Doctors' University
  2: citu_school_image,   // Cebu Institute of Technology
  3: cnu_school_image,    // Cebu Normal University
  4: ctu_school_image,    // Cebu Technological University
  5: iau_school_image,    // Indiana Aerospace University
  6: swu_school_image,    // Southwestern University
  7: uc_school_image,     // University of Cebu
  8: usc_school_image,    // University of San Carlos
  9: usjr_school_image,   // University of San Jose-Recoletos
  10: up_school_image,    // University of the Philippines
  11: uv_school_image,    // University of the Visayas
};

// Create a mapping of school IDs to logos
const schoolLogosMap = {
  1: cdu_school_logo,    // Cebu Doctors' University
  2: citu_school_logo,   // Cebu Institute of Technology
  3: cnu_school_logo,    // Cebu Normal University
  4: ctu_school_logo,    // Cebu Technological University
  5: iau_school_logo,    // Indiana Aerospace University
  6: swu_school_logo,    // Southwestern University
  7: uc_school_logo,     // University of Cebu
  8: usc_school_logo,    // University of San Carlos
  9: usjr_school_logo,   // University of San Jose-Recoletos
  10: up_school_logo,    // University of the Philippines
  11: uv_school_logo,    // University of the Visayas
};

const ProgramsModal = ({ school, onClose }) => {
  // Helper function to get badge color based on level
  const getLevelColor = (level) => {
    switch(level) {
      case 4: return "bg-yellow-600 text-white";
      case 3: return "bg-yellow-500 text-black";
      case 2: return "bg-yellow-400 text-black";
      case 1: return "bg-yellow-300 text-black";
      default: return "bg-gray-200 text-gray-600";
    }
  };

  // Helper function to format level to Roman numerals
  const formatLevel = (level) => {
    switch(level) {
      case 4: return "IV";
      case 3: return "III";
      case 2: return "II";
      case 1: return "I";
      default: return "-";
    }
  };

  // Helper function to get recognition badge color
  const getRecognitionColor = (recognition) => {
    if (!recognition) return "bg-gray-200 text-gray-600";
    switch(recognition) {
      case "COE": return "bg-indigo-700 text-white";
      case "COD": return "bg-indigo-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  // Get school background and logo from maps
  const schoolBackground = schoolBackgroundMap[school.id];
  const schoolLogo = schoolLogosMap[school.id];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl my-8 relative transform transition-all">
        {/* Header with Background Image */}
        <div className="relative h-64 rounded-t-2xl overflow-hidden">
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ 
              backgroundImage: schoolBackground ? `url(${schoolBackground})` : 'none',
              backgroundColor: !schoolBackground ? '#2B3E4E' : 'transparent'
            }}
          >
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#2B3E4E] via-[#2B3E4E]/80 to-transparent"></div>
          </div>
          
          {/* Header Content */}
          <div className="relative h-full p-8 flex items-end justify-between">
            <div className="flex items-center">
              {/* School Logo */}
              <div className="w-20 h-20 rounded-full bg-white shadow-lg overflow-hidden relative">
                {schoolLogo ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <img 
                      src={schoolLogo} 
                      alt={`${school.name} logo`}
                      className="w-[130%] h-[130%] object-cover absolute transform -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2"
                      style={{ objectFit: 'cover', objectPosition: 'center' }}
                    />
                  </div>
                ) : (
                  <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center">
                    <Building className="w-12 h-12 text-gray-400" />
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{school.name}</h2>
                <p className="text-white/80 flex items-center mt-1">
                  <Building className="w-4 h-4 mr-2" />
                  {school.totalAccredited} Accredited Programs
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-[#2B3E4E] hover:text-[#1a2630] transition-colors p-2 hover:bg-white/10 rounded-lg self-start mt-2 bg-white"
              style={{ backgroundColor: 'white' }}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-180px)]">
          {school.programs.map((category, idx) => {
            // Filter out programs with no accreditation
            const accreditedPrograms = category.items.filter(program => program.level > 0);
            
            // Only render category if it has accredited programs
            if (accreditedPrograms.length === 0) return null;

            return (
              <div key={idx} className="mb-8 last:mb-0">
                <div className="flex items-center mb-6">
                  <Award className="w-5 h-5 text-yellow-500 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-800">{category.category}</h3>
                </div>
                <div className="grid gap-4">
                  {accreditedPrograms.map((program, programIdx) => (
                    <div 
                      key={programIdx}
                      className="bg-white rounded-xl border border-gray-200 p-5 hover:border-yellow-500 transition-colors shadow-sm hover:shadow-md"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900 text-lg">{program.name}</h4>
                          <p className="text-sm text-gray-500 mt-2 flex items-center">
                            <Building className="w-4 h-4 mr-2 text-gray-400" />
                            {program.accreditingBody || 'No accrediting body'}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          {program.recognition && (
                            <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${getRecognitionColor(program.recognition)} shadow-sm`}>
                              {program.recognition}
                            </span>
                          )}
                          <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${getLevelColor(program.level)} shadow-sm`}>
                            Level {formatLevel(program.level)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          
          {/* Show message if no accredited programs */}
          {!school.programs.some(category => category.items.some(program => program.level > 0)) && (
            <div className="text-center py-8">
              <Building className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No accredited programs found for this school.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgramsModal; 