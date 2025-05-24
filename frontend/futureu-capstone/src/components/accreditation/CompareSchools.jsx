import React from 'react';
import { X, Building, MapPin, Award, School as SchoolIcon, Medal, ChevronDown } from 'lucide-react';
import { useState } from 'react';

// Import school logos
import cdu_school_logo from '../../assets/school_logos/cdu_school_logo.png';
import citu_school_logo from '../../assets/school_logos/citu_school_logo.png';
import cnu_school_logo from '../../assets/school_logos/cnu_school_logo.png';
import ctu_school_logo from '../../assets/school_logos/ctu_school_logo.png';
import swu_school_logo from '../../assets/school_logos/swu_school_logo.png';
import usc_school_logo from '../../assets/school_logos/usc_school_logo.png';
import usjr_school_logo from '../../assets/school_logos/usjr_school_logo.png';
import up_school_logo from '../../assets/school_logos/up_school_logo.png';
import uc_school_logo from '../../assets/school_logos/uc_school_logo.png';
import uv_school_logo from '../../assets/school_logos/uv_school_logo.png';
import iau_school_logo from '../../assets/school_logos/iau_school_logo.png';

// Import school backgrounds
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

// Create a mapping for school name detection to their background images
const schoolBackgroundMap = {
  "Cebu Institute of Technology": citu_school_image,
  "Cebu Doctors'": cdu_school_image,
  "Cebu Normal University": cnu_school_image,
  "Cebu Technological University": ctu_school_image,
  "Southwestern University": swu_school_image,
  "University of San Carlos": usc_school_image,
  "University of San Jose": usjr_school_image,
  "University of the Philippines": up_school_image,
  "University of Cebu": uc_school_image,
  "University of the Visayas": uv_school_image,
  "Indiana Aerospace University": iau_school_image,
};

// Create a mapping of school IDs to logos
const schoolLogos = {
  1: cdu_school_logo,
  2: citu_school_logo,
  3: cnu_school_logo,
  4: ctu_school_logo,
  5: iau_school_logo,
  6: swu_school_logo,
  7: uc_school_logo,
  8: usc_school_logo,
  9: usjr_school_logo,
  10: up_school_logo,
  11: uv_school_logo,
};

const CompareSchools = ({ schools, onClose }) => {
  if (!schools || schools.length < 2) return null;

  // Add state to track which school's dropdown is open
  const [openDropdown, setOpenDropdown] = useState(null);

  // Helper function to get school logo
  const getSchoolLogo = (school) => {
    return schoolLogos[school.id] || null;
  };

  // Helper function to get school background
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

  // Helper function to get unique accrediting bodies for a school
  const getSchoolAccreditingBodies = (school) => {
    if (!school.programs) return [];
    
    const accreditingBodies = new Set();
    
    school.programs.forEach(category => {
      category.items.forEach(program => {
        if (program.accreditingBody && program.accreditingBody !== '-') {
          accreditingBodies.add(program.accreditingBody);
        }
      });
    });
    
    return Array.from(accreditingBodies);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl my-8 relative">
        {/* Header */}
        <div className="bg-slate-800 p-6 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center">
            <Award className="w-6 h-6 text-yellow-500 mr-2" />
            <h2 className="text-xl font-bold text-white">Compare Schools</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-800 bg-white hover:bg-white/90 transition-colors p-2 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Comparison Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {schools.map((school) => (
              <div 
                key={school.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
              >
                {/* School Header with Background */}
                <div 
                  className="relative h-64 bg-cover bg-center"
                  style={{
                    backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.8)), url(${getSchoolBackground(school.name)})`
                  }}
                >
                  {/* Accrediting Bodies Pin */}
                  {getSchoolAccreditingBodies(school).length > 0 && (
                    <div className="absolute top-6 right-6 z-10">
                      <div 
                        className="bg-slate-800 rounded-lg shadow-md border border-slate-700 cursor-pointer"
                        onClick={() => setOpenDropdown(openDropdown === school.id ? null : school.id)}
                      >
                        {/* Main Display */}
                        <div className="px-3 py-2 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Medal className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                            <div>
                              <p className="text-xs font-medium text-white/80">Accredited by:</p>
                              <p className="text-[12px] font-semibold text-yellow-500 tracking-wide">
                                {getSchoolAccreditingBodies(school)[0]}
                              </p>
                            </div>
                          </div>
                          {getSchoolAccreditingBodies(school).length > 1 && (
                            <ChevronDown 
                              className={`w-4 h-4 text-white/80 transition-transform ${
                                openDropdown === school.id ? 'transform rotate-180' : ''
                              }`}
                            />
                          )}
                        </div>

                        {/* Dropdown Content */}
                        {openDropdown === school.id && getSchoolAccreditingBodies(school).length > 1 && (
                          <div className="border-t border-slate-700">
                            <div className="px-3 py-2 space-y-1">
                              {getSchoolAccreditingBodies(school).slice(1).map((body, index) => (
                                <div 
                                  key={index}
                                  className="bg-slate-700/50 rounded px-2 py-1 border border-yellow-500/20"
                                >
                                  <p className="text-[12px] font-semibold text-yellow-500 leading-tight break-words tracking-wide">
                                    {body}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="absolute inset-0 flex items-end p-6 pb-8">
                    {/* Logo */}
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-white shadow-lg border-2 border-white relative">
                      {getSchoolLogo(school) ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <img 
                            src={getSchoolLogo(school)} 
                            alt={`${school.name} logo`}
                            className="w-[130%] h-[130%] object-cover absolute transform -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2"
                            style={{ objectFit: 'cover', objectPosition: 'center' }}
                            onError={(e) => console.error('Logo load error:', e)}
                          />
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <SchoolIcon className="w-10 h-10 text-gray-400" />
                        </div>
                      )}
                    </div>
                    
                    {/* School Name and Programs Count */}
                    <div className="flex-1 ml-6 flex flex-col justify-end">
                      <h3 className="font-semibold text-lg mb-3 text-shadow text-left text-white leading-tight">{school.name}</h3>
                      <div className="inline-flex items-center px-3 py-1.5 bg-yellow-500/80 rounded-md shadow-md">
                        <Award className="w-4 h-4 text-white mr-2" />
                        <span className="text-white text-sm font-medium">
                          {school.totalAccredited} Accredited Programs
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* School Details */}
                <div className="p-4">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 space-y-3">
                    {/* Location */}
                    <div className="text-left">
                      <div className="text-sm font-medium text-gray-500 mb-1.5">Location</div>
                      <div className="flex items-start">
                        <MapPin className="w-5 h-5 mr-2 text-yellow-500 flex-shrink-0" />
                        <span className="text-gray-900 text-sm text-left">{school.location}</span>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-100"></div>

                    {/* Type */}
                    <div>
                      <div className="text-sm font-medium text-gray-500 mb-1.5">Type</div>
                      <div className="flex items-start">
                        <Building className="w-5 h-5 mr-2 text-yellow-500 flex-shrink-0" />
                        <span className="text-gray-900 text-sm">{school.type}</span>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-100"></div>

                    {/* Total Accredited Programs Summary */}
                    <div>
                      <div className="text-sm font-medium text-gray-500 mb-1.5">Program Summary</div>
                      <div className="flex items-start">
                        <Award className="w-5 h-5 mr-2 text-yellow-500 flex-shrink-0" />
                        <span className="text-gray-900 text-sm">{school.totalAccredited} Total Accredited Programs</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add text shadow utility class */}
      <style jsx="true">{`
        .text-shadow {
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
        }
      `}</style>
    </div>
  );
};

export default CompareSchools; 