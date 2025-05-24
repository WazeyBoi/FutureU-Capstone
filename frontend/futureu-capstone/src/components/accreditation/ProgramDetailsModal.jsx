import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Building, Award } from 'lucide-react';

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

// Create a mapping for school name detection to their logos
const schoolLogoMap = {
  "Cebu Institute of Technology": citu_school_logo,
  "Cebu Doctors'": cdu_school_logo,
  "Cebu Normal University": cnu_school_logo,
  "Cebu Technological University": ctu_school_logo,
  "Southwestern University": swu_school_logo,
  "University of San Carlos": usc_school_logo,
  "University of San Jose": usjr_school_logo,
  "University of the Philippines": up_school_logo,
  "University of Cebu": uc_school_logo,
  "University of the Visayas": uv_school_logo,
  "Indiana Aerospace University": iau_school_logo,
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

// Function to get the school logo based on name
const getSchoolLogo = (schoolName) => {
  if (!schoolName) return null;
  
  const normalizedName = schoolName.toLowerCase();
  
  // Check each key in our map to see if it's in the school name
  for (const [key, logo] of Object.entries(schoolLogoMap)) {
    if (normalizedName.includes(key.toLowerCase())) {
      return logo;
    }
  }
  
  return null;
};

const ProgramDetailsModal = ({ program, isOpen, onClose }) => {
  if (!isOpen || !program) return null;
  
  // Keep the improved scroll-locking mechanism
  useEffect(() => {
    // Store original body style
    const originalStyle = window.getComputedStyle(document.body).overflow;
    // Add a class to body instead of directly modifying the style
    document.body.classList.add('modal-open');
    
    return () => {
      // Remove the class when modal closes
      document.body.classList.remove('modal-open');
    };
  }, []);

  const schoolBackground = getSchoolBackground(program.schoolName);
  const schoolLogo = getSchoolLogo(program.schoolName);

  // Create modal content
  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div 
        className="bg-white rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden"
        style={{ 
          animation: 'modalSlideIn 0.3s ease-out'
        }}
      >
        {/* Header with Background Image */}
        <div className="relative h-48">
          {/* Background Image with Gradient Overlay */}
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ 
              backgroundImage: schoolBackground ? `url(${schoolBackground})` : 'none',
              backgroundColor: !schoolBackground ? '#2B3E4E' : 'transparent'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-[#2B3E4E]/60 via-[#2B3E4E]/80 to-[#2B3E4E]"></div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-[#2B3E4E] bg-white hover:bg-white/90 rounded-full p-2 transition-colors z-10"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* School Logo and Info */}
          <div className="absolute bottom-6 left-6 right-6 flex items-center">
            {/* School Logo */}
            <div className="w-20 h-20 rounded-full bg-white shadow-lg overflow-hidden relative flex-shrink-0">
              {schoolLogo ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <img 
                    src={schoolLogo} 
                    alt={`${program.schoolName} logo`}
                    className="w-[130%] h-[130%] object-cover absolute transform -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2"
                  />
                </div>
              ) : (
                <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center">
                  <Building className="w-12 h-12 text-gray-400" />
                </div>
              )}
            </div>

            {/* School and Program Info */}
            <div className="ml-6 flex-grow">
              <h2 className="text-2xl font-bold text-white mb-2">{program.name}</h2>
              <p className="text-white/90 flex items-center">
                <Building className="w-4 h-4 mr-2" />
                {program.schoolName}
              </p>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6">
          {/* Accreditation Title Box */}
          {program.accreditation?.title && (
            <div className="bg-[#2B3E4E] rounded-lg p-4 mb-6">
              <h4 className="text-xs font-medium text-[#FFB71B] uppercase tracking-wider mb-1 text-center">
                ACCREDITATION TITLE
              </h4>
              <p className="text-lg font-semibold text-white text-center">
                {program.accreditation.title}
              </p>
            </div>
          )}

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Recognition Status */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Award className="w-4 h-4 text-[#FFB71B] mr-2" />
                <span className="text-sm font-medium text-[#2B3E4E]">Recognition Status</span>
              </div>
              <p className="text-base font-semibold text-[#2B3E4E]">
                {program.recognition || 'Not Available'}
              </p>
            </div>

            {/* Accreditation Level */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Award className="w-4 h-4 text-[#FFB71B] mr-2" />
                <span className="text-sm font-medium text-[#2B3E4E]">Accreditation Level</span>
              </div>
              <p className="text-base font-semibold text-[#2B3E4E]">
                Level {program.level || 'Not Available'}
              </p>
            </div>

            {/* Accrediting Body */}
            <div className="bg-gray-50 rounded-lg p-4 col-span-2">
              <div className="flex items-center mb-2">
                <Building className="w-4 h-4 text-[#FFB71B] mr-2" />
                <span className="text-sm font-medium text-[#2B3E4E]">Accrediting Body</span>
              </div>
              <p className="text-base font-semibold text-[#2B3E4E]">
                {program.accreditingBody || 'Not Available'}
              </p>
            </div>
          </div>

          {/* Description Section */}
          {program.accreditation?.description && (
            <div className="mb-6">
              <div className="flex items-center mb-2">
                <svg className="w-4 h-4 text-[#FFB71B] mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
                </svg>
                <span className="text-sm font-medium text-[#2B3E4E]">Description</span>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-[#2B3E4E] leading-relaxed">
                  {program.accreditation.description}
                </p>
              </div>
            </div>
          )}

          {/* Close Button */}
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="bg-white text-[#2B3E4E] hover:bg-gray-50 border border-[#2B3E4E] px-6 py-2 rounded-lg text-sm font-bold shadow-md transition-all duration-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Add animation and scrolling styles */}
      <style jsx>{`
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        /* Add a global style for the modal-open class */
        :global(.modal-open) {
          overflow: hidden;
          padding-right: 15px; /* Prevent layout shift when scrollbar disappears */
        }
      `}</style>
    </div>
  );

  // Use portal to render directly to body
  return ReactDOM.createPortal(
    modalContent,
    document.body
  );
};

export default ProgramDetailsModal;