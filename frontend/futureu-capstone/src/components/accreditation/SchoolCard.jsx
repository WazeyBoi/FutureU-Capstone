import React, { useState } from 'react';
import { Building, MapPin, School as SchoolIcon } from 'lucide-react';

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

// Function to get the school background based on name
const getSchoolBackground = (schoolName) => {
  if (!schoolName) return null;
  
  const normalizedName = schoolName.toLowerCase();
  
  // Check each key in our map to see if it's in the school name
  for (const [key, background] of Object.entries(schoolBackgroundMap)) {
    if (normalizedName.includes(key.toLowerCase())) {
      return background;
    }
  }
  
  return null;
};

const SchoolCard = ({ school, onViewPrograms, isSelected, onSelect }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  console.log('Full school object:', school); // Added temporary debug log
  
  const schoolBackground = getSchoolBackground(school.name);
  const schoolLogo = schoolLogos[school.id];
  
  console.log('School ID:', school.id, 'School Name:', school.name, 'Logo:', schoolLogo);

  return (
    <div
      className={`bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl h-full flex flex-col cursor-pointer ${
        isSelected ? 'ring-2 ring-yellow-500 ring-offset-2' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={(e) => {
        // Only handle selection if not clicking the View Programs button
        if (!e.target.closest('button')) {
          onSelect?.(school);
        }
      }}
    >
      {/* School Background Image */}
      <div className="relative h-48 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-300"
          style={{ 
            backgroundImage: schoolBackground ? `url(${schoolBackground})` : 'none',
            transform: isHovered ? 'scale(1.1)' : 'scale(1)',
            backgroundColor: !schoolBackground ? '#f3f4f6' : 'transparent'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black/70" />
        
        {/* Selected Indicator */}
        {isSelected && (
          <div className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
            Selected
          </div>
        )}
        
        {/* School Logo and Name Container */}
        <div className="absolute bottom-3 left-3 right-3">
          <div className="flex items-start gap-3">
            {/* Logo */}
            <div className="w-16 h-16 rounded-full bg-white shadow-lg overflow-hidden relative flex-shrink-0">
              {schoolLogo ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <img 
                    src={schoolLogo} 
                    alt={`${school.name} logo`} 
                    className="w-[130%] h-[130%] object-cover absolute transform -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2"
                    style={{ objectFit: 'cover', objectPosition: 'center' }}
                    onError={(e) => console.error('Logo load error:', e)}
                  />
                </div>
              ) : (
                <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center">
                  <SchoolIcon className="w-8 h-8 text-gray-400" />
                </div>
              )}
            </div>
            {/* Text Content */}
            <div className="flex-grow">
              <h3 className="text-white font-bold text-base leading-tight mb-1.5 w-full text-left" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>{school.name}</h3>
              <div className="flex items-center text-white/90 text-xs w-full">
                <Building className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
                <span className="text-left flex-grow">{school.totalAccredited} Accredited Programs</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* School Details */}
      <div className="p-6 flex flex-col flex-grow">
        <div className="bg-white rounded-lg shadow-md p-4 mb-auto">
          <div className="flex flex-col">
            <div className="flex items-start text-left">
              <MapPin className="w-5 h-5 mr-2 text-yellow-500 flex-shrink-0 mt-1" />
              <span className="text-sm text-gray-900">{school.location || 'Location not available'}</span>
            </div>
            <div className="h-px bg-gray-200 my-3 w-full"></div>
            <div className="flex items-start text-left">
              <Building className="w-5 h-5 mr-2 text-yellow-500 flex-shrink-0 mt-1" />
              <span className="text-sm text-gray-900">{school.type || 'Type not available'}</span>
            </div>
          </div>
        </div>

        {/* View Programs Button */}
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevent card selection when clicking the button
            onViewPrograms(school);
          }}
          className="mt-6 w-full !bg-[#2B3E4E] hover:!bg-[#1a2630] !text-white py-3 rounded-lg transition-colors flex items-center justify-center gap-2 !border-0"
          style={{ backgroundColor: '#2B3E4E' }}
        >
          <Building className="w-5 h-5" />
          View Accredited Programs
        </button>
      </div>
    </div>
  );
};

export default SchoolCard; 