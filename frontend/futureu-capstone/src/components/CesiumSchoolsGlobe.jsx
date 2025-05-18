import React, { useEffect, useState, useRef } from "react";
import { Viewer, Entity, CameraFlyTo } from "resium";
import cdu_school_logo from '../assets/school_logos/cdu_school_logo.png';
import citu_school_logo from '../assets/school_logos/citu_school_logo.png';
import cnu_school_logo from '../assets/school_logos/cnu_school_logo.png';
import ctu_school_logo from '../assets/school_logos/ctu_school_logo.png';
import iau_school_logo from '../assets/school_logos/iau_school_logo.png';
import swu_school_logo from '../assets/school_logos/swu_school_logo.png';
import uc_school_logo from '../assets/school_logos/uc_school_logo.png';
import usc_school_logo from '../assets/school_logos/usc_school_logo.png';
import usjr_school_logo from '../assets/school_logos/usjr_school_logo.png';
import up_school_logo from '../assets/school_logos/up_school_logo.png';
import uv_school_logo from '../assets/school_logos/uv_school_logo.png';
import { Cartesian3, Ion, Color } from "cesium";
window.CESIUM_BASE_URL = "/cesium";



// Set your Cesium Ion access token
Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjZjJiOWEwZC0xNjU0LTQ2MGMtYmQ2MC03NTE5YTIxNmNiZGQiLCJpZCI6MzAzMTI3LCJpYXQiOjE3NDc0MTM1OTd9.WEx14yAnEcgin85BPZIxsl1v6cDryz7uR-WLBTLtzdg";

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

const cebuCenter = Cartesian3.fromDegrees(123.92909779191835, 10.315512435599237, 10000); // [lon, lat, height]
const defaultMapCenter = [10.315512435599237, 123.93239779191835];//10.315512435599237, 123.93239779191835

function getPinWithLogoSVG(logoUrl) {
  // The logo will be a circle inside the yellow pin
  // SVG size: 64x80, logo circle: 36x36 at (14,14)
  return `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg width="64" height="80" viewBox="0 0 64 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g>
        <path d="M32 78C32 78 60 50 60 28C60 12.536 47.464 0 32 0C16.536 0 4 12.536 4 28C4 50 32 78 32 78Z" fill="#FACC15" stroke="#F59E42" stroke-width="4"/>
        <circle cx="32" cy="28" r="18" fill="white" stroke="#F59E42" stroke-width="3"/>
        <clipPath id="logoClip">
          <circle cx="32" cy="28" r="16"/>
        </clipPath>
        <image href="${logoUrl}" x="16" y="12" width="32" height="32" clip-path="url(#logoClip)" />
      </g>
    </svg>
  `)}`;
}

function getPinWithLogoCanvas(logoUrl, callback) {
  const width = 64, height = 80;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Draw yellow pin (same as before)
  ctx.beginPath();
  ctx.moveTo(32, 78);
  ctx.bezierCurveTo(32, 78, 60, 50, 60, 28);
  ctx.arc(32, 28, 28, 0, Math.PI * 2, true);
  ctx.bezierCurveTo(4, 50, 32, 78, 32, 78);
  ctx.closePath();
  ctx.fillStyle = "#FACC15";
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = "#F59E42";
  ctx.stroke();

  // Draw white circle for logo background
  ctx.beginPath();
  ctx.arc(32, 28, 18, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.fillStyle = "white";
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = "#F59E42";
  ctx.stroke();

  // Draw the logo image (as a centered circle, 36x36, object-fit: cover)
  const logoImg = new window.Image();
  logoImg.crossOrigin = "anonymous";
  logoImg.onload = () => {
    ctx.save();
    ctx.beginPath();
    ctx.arc(32, 28, 18, 0, Math.PI * 2, true); // match white circle radius
    ctx.closePath();
    ctx.clip();

    // "object-fit: cover" logic
    const size = 36;
    let sx = 0, sy = 0, sWidth = logoImg.width, sHeight = logoImg.height;
    if (logoImg.width > logoImg.height) {
      sx = (logoImg.width - logoImg.height) / 2;
      sWidth = sHeight = logoImg.height;
    } else if (logoImg.height > logoImg.width) {
      sy = (logoImg.height - logoImg.width) / 2;
      sWidth = sHeight = logoImg.width;
    }
    ctx.drawImage(logoImg, sx, sy, sWidth, sHeight, 32 - size / 2, 28 - size / 2, size, size);

    ctx.restore();
    callback(canvas.toDataURL());
  };
  logoImg.src = logoUrl;
}

const CesiumSchoolsGlobe = ({
  schools,
  selectedSchool,
  setSelectedSchool,
}) => {
  const [markerImages, setMarkerImages] = useState({});
  const [hoveredSchoolId, setHoveredSchoolId] = useState(null);
  const viewerRef = useRef();

  useEffect(() => {
    // Generate marker images for all schools
    schools.forEach((school) => {
      const logo = schoolLogos[school.schoolId];
      if (!markerImages[school.schoolId] && logo) {
        getPinWithLogoCanvas(logo, (dataUrl) => {
          setMarkerImages((prev) => ({ ...prev, [school.schoolId]: dataUrl }));
        });
      }
    });
    // eslint-disable-next-line
  }, [schools]);

  const flyToPosition = selectedSchool
    ? Cartesian3.fromDegrees(
        Number(selectedSchool.longitude),
        Number(selectedSchool.latitude),
        1200 // or your preferred zoom for selected school
      )
    : cebuCenter;

  const handleClearSchool = () => {
    setSelectedSchool(null);
    // Hide Cesium info box by clearing selectedEntity
    if (viewerRef.current && viewerRef.current.cesiumElement) {
      viewerRef.current.cesiumElement.selectedEntity = undefined;
    }
  };

  return (
    <div className="flex h-[70vh] w-full">
      {/* Cesium Globe Section */}
      <div className="relative flex-1 min-w-0 rounded-l-3xl overflow-hidden shadow-2xl border border-blue-100">
        {/* Clear School Button */}
        <button
          onClick={handleClearSchool}
          className="absolute top-6 left-6 z-20 bg-white border border-gray-200 rounded-full px-4 py-2 shadow hover:bg-gray-50 font-semibold text-gray-700 transition"
        >
          Clear School
        </button>
        <Viewer
          ref={viewerRef}
          full
          infoBox={true} // or false if you want to hide it always
        >
          <CameraFlyTo destination={flyToPosition} duration={2} />
          {schools.map((school) => {
            const lat = Number(school.latitude);
            const lon = Number(school.longitude);
            if (isNaN(lat) || isNaN(lon)) return null;
            const markerImg = markerImages[school.schoolId];
            if (!markerImg) return null; // Wait for marker image to be generated
            return (
              <Entity
                key={school.schoolId || school.id}
                name={school.name}
                position={Cartesian3.fromDegrees(lon, lat, 0)}
                billboard={{
                  image: markerImg,
                  scale:
                    selectedSchool &&
                    (selectedSchool.schoolId === school.schoolId ||
                      selectedSchool.id === school.id)
                      ? 1.3
                      : 1.0,
                  verticalOrigin: 1, // Cesium.VerticalOrigin.BOTTOM
                  width: 48,
                  height: 60,
                }}
                //description={school.description}
                onClick={() => setSelectedSchool(school)}
                onMouseEnter={() => setHoveredSchoolId(school.schoolId)}
                onMouseLeave={() => setHoveredSchoolId(null)}
              />
            );
          })}
          {/* Render popup for hovered marker */}
          {schools.map((school) => {
            if (hoveredSchoolId !== school.schoolId) return null;
            const lat = Number(school.latitude);
            const lon = Number(school.longitude);
            if (isNaN(lat) || isNaN(lon)) return null;
            return (
              <Entity
                key={`popup-${school.schoolId}`}
                position={Cartesian3.fromDegrees(lon, lat, 80)}
                label={{
                  text: school.name,
                  font: "16px sans-serif",
                  fillColor: Color.BLACK,
                  outlineColor: Color.WHITE,
                  outlineWidth: 2,
                  style: 2, // Cesium.LabelStyle.FILL_AND_OUTLINE
                  verticalOrigin: 1, // Cesium.VerticalOrigin.BOTTOM
                  pixelOffset: { x: 0, y: -50 },
                  showBackground: true,
                  backgroundColor: Color.WHITE.withAlpha(0.85),
                  scale: 1.0,
                }}
              />
            );
          })}
        </Viewer>
      </div>
    </div>
  );
};

export default CesiumSchoolsGlobe;