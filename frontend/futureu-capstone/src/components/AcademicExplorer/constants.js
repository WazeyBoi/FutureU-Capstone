// School logos mapping
import cdu_school_logo from '../../assets/school_logos/cdu_school_logo.png';
import citu_school_logo from '../../assets/school_logos/citu_school_logo.png';
import cnu_school_logo from '../../assets/school_logos/cnu_school_logo.png';
import ctu_school_logo from '../../assets/school_logos/ctu_school_logo.png';
import iau_school_logo from '../../assets/school_logos/iau_school_logo.png';
import swu_school_logo from '../../assets/school_logos/swu_school_logo.png';
import uc_school_logo from '../../assets/school_logos/uc_school_logo.png';
import usc_school_logo from '../../assets/school_logos/usc_school_logo.png';
import usjr_school_logo from '../../assets/school_logos/usjr_school_logo.png';
import up_school_logo from '../../assets/school_logos/up_school_logo.png';
import uv_school_logo from '../../assets/school_logos/uv_school_logo.png';

// School building images import
import cduBuilding from '../../assets/school_buildings/CDU school building.png';
import cituBuilding from '../../assets/school_buildings/CITU school building.png';
import cnuBuilding from '../../assets/school_buildings/CNU school building.png';
import ctuBuilding from '../../assets/school_buildings/CTU school building.png';
import iauBuilding from '../../assets/school_buildings/IAU school building.png';
import swuBuilding from '../../assets/school_buildings/SWU school building.png';
import ucBuilding from '../../assets/school_buildings/UC school building.png';
import upCebuBuilding from '../../assets/school_buildings/UP Cebu school building.png';
import uscBuilding from '../../assets/school_buildings/USC school building.png';
import usjrBuilding from '../../assets/school_buildings/USJR school building.png';
import uvBuilding from '../../assets/school_buildings/UV school building.png';

// School background images
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

// Academic Explorer hero background
import academicExplorerHeroBackground from '../../assets/Academic_Explorer_Hero_Section_Background.png';

// Create a mapping of school IDs to logos
export const schoolLogos = {
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

// School building images mapping by school ID or name
export const schoolBuildings = {
  // You can map by school ID or name - adjust these keys based on your school data structure
  1: cduBuilding, // CDU
  2: cituBuilding, // CITU
  3: cnuBuilding, // CNU
  4: ctuBuilding, // CTU
  5: iauBuilding, // IAU
  6: swuBuilding, // SWU
  7: ucBuilding, // UC
  8: usjrBuilding, // UP Cebu (corrected)
  9: upCebuBuilding, // USC (corrected)
  10: uscBuilding, // USJR (corrected)
  11: uvBuilding, // UV
  
  // Alternative mapping by school name (case-insensitive matching)
  'CDU': cduBuilding,
  'CITU': cituBuilding,
  'CNU': cnuBuilding,
  'CTU': ctuBuilding,
  'IAU': iauBuilding,
  'SWU': swuBuilding,
  'UC': ucBuilding,
  'UP CEBU': usjrBuilding, // UP Cebu (corrected)
  'USC': upCebuBuilding, // USC (corrected)
  'USJR': uscBuilding, // USJR (corrected)
  'UV': uvBuilding
};

// Create a mapping for school name detection to their background images
export const schoolBackgroundMap = {
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

// Animation styles CSS
export const fadeAnimationStyle = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .animate-fade-in-up {
    animation: fadeInUp 0.4s ease-out forwards;
  }

  @keyframes slideIn {
    from {
      transform: translateX(-20px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  .animate-slide-in {
    animation: slideIn 0.3s ease-out forwards;
  }
  
  @keyframes slideDown {
    from {
      max-height: 0;
      opacity: 0;
    }
    to {
      max-height: 500px;
      opacity: 1;
    }
  }
  
  .animate-slide-down {
    animation: slideDown 0.4s ease-out forwards;
    overflow: hidden;
  }
  
  @keyframes slideUp {
    from {
      max-height: 500px;
      opacity: 1;
    }
    to {
      max-height: 0;
      opacity: 0;
    }
  }
  
  .animate-slide-up {
    animation: slideUp 0.4s ease-out forwards;
    overflow: hidden;
  }

  @keyframes contentSlide {
    from {
      margin-left: 0;
      width: 100%;
    }
    to {
      margin-left: 384px;
      width: calc(100% - 384px);
    }
  }
  
  .animate-content-slide {
    animation: contentSlide 0.4s ease-out forwards;
  }
  
  @keyframes contentSlideBack {
    from {
      margin-left: 384px;
      width: calc(100% - 384px);
    }
    to {
      margin-left: 0;
      width: 100%;
    }
  }

  .animate-content-slide-back {
    animation: contentSlideBack 0.4s ease-out forwards;
  }

  /* Responsive grid adjustments */
  @media (min-width: 640px) {
    .grid-with-panel {
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    }
  }

  @media (min-width: 768px) {
    .grid-with-panel {
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    }
  }

  @media (min-width: 1024px) {
    .grid-with-panel {
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    }
  }

  @media (min-width: 1280px) {
    .grid-with-panel {
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    }
  }
  
  @media (min-width: 1536px) {
    .grid-with-panel {
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    }
  }

  /* Mascot hover wiggle */
  @keyframes mascotWiggle {
    0% { transform: rotate(0deg) scale(1); }
    15% { transform: rotate(-10deg) scale(1.08); }
    30% { transform: rotate(8deg) scale(1.08); }
    45% { transform: rotate(-6deg) scale(1.08); }
    60% { transform: rotate(4deg) scale(1.08); }
    75% { transform: rotate(-2deg) scale(1.08); }
    100% { transform: rotate(0deg) scale(1); }
  }
  .mascot-wiggle {
    animation: mascotWiggle 0.7s both;
  }

  /* Emphasis glow on mascot */
  .mascot-glow {
    box-shadow: 0 0 0 0 #FFB71B, 0 0 24px 8px #FFB71B55;
    transition: box-shadow 0.3s;
  }
  .mascot-glow-hover {
    box-shadow: 0 0 0 0 #FFB71B, 0 0 36px 12px #FFB71B99;
  }

  /* Pulse animation for loading states */
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  .animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  /* Bounce animation for interactive elements */
  @keyframes bounce {
    0%, 20%, 53%, 80%, 100% { transform: translate3d(0,0,0); }
    40%, 43% { transform: translate3d(0, -30px, 0); }
    70% { transform: translate3d(0, -15px, 0); }
    90% { transform: translate3d(0, -4px, 0); }
  }
  .animate-bounce {
    animation: bounce 1s ease-in-out;
  }

  /* Subtle float animation for cards */
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-5px); }
  }
  .animate-float {
    animation: float 3s ease-in-out infinite;
  }
`;

// Export hero background image
export { academicExplorerHeroBackground };