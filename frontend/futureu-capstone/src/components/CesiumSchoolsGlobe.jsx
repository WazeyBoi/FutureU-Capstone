import React from "react";
import { Viewer, Entity, CameraFlyTo } from "resium";
import { Cartesian3, Ion, Color } from "cesium";
window.CESIUM_BASE_URL = "/cesium";

// Set your Cesium Ion access token
Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjZjJiOWEwZC0xNjU0LTQ2MGMtYmQ2MC03NTE5YTIxNmNiZGQiLCJpZCI6MzAzMTI3LCJpYXQiOjE3NDc0MTM1OTd9.WEx14yAnEcgin85BPZIxsl1v6cDryz7uR-WLBTLtzdg";

const cebuCenter = Cartesian3.fromDegrees(123.8854, 10.3157, 2000);

const CesiumSchoolsGlobe = ({
  schools,
  selectedSchool,
  setSelectedSchool,
  goTo2DMap,
}) => {
  const flyToPosition = selectedSchool
    ? Cartesian3.fromDegrees(selectedSchool.lng, selectedSchool.lat, 1500)
    : cebuCenter;

  return (
    <div className="flex h-[70vh] w-full">
      {/* Cesium Globe Section */}
      <div className="relative flex-1 min-w-0 rounded-l-3xl overflow-hidden shadow-2xl border border-blue-100">
        {/* Go to 2D Map Button */}
        <button
          onClick={goTo2DMap}
          className="absolute top-6 left-6 z-20 bg-white border border-blue-200 rounded-full px-4 py-2 shadow hover:bg-blue-50 font-semibold text-blue-700 transition"
        >
          ← Go to 2D Map
        </button>
        <Viewer full>
          <CameraFlyTo destination={flyToPosition} duration={2} />
          {schools.map((school) => (
            <Entity
              key={school.id}
              name={school.name}
              position={Cartesian3.fromDegrees(school.lng, school.lat, 0)}
              point={{
                pixelSize: 18,
                color:
                  selectedSchool && selectedSchool.id === school.id
                    ? Color.ORANGE
                    : Color.YELLOW,
                outlineColor: Color.DARKBLUE,
                outlineWidth: 3,
              }}
              description={school.description}
              onClick={() => setSelectedSchool(school)}
            />
          ))}
        </Viewer>
      </div>
      {/* School Details Section */}
      <div className="w-full max-w-md bg-white rounded-r-3xl shadow-2xl border border-yellow-100 p-8 flex flex-col justify-center items-center">
        {selectedSchool ? (
          <div className="w-full">
            <h2 className="text-3xl font-extrabold mb-2 text-blue-900 animate-float">
              {selectedSchool.name}
            </h2>
            <p className="mb-4 text-gray-700">{selectedSchool.description}</p>
            {/* Add more school details here */}
            <hr className="my-6 border-yellow-200" />
            <h3 className="text-xl font-semibold mb-2 text-yellow-600">
              Submit a Testimonial
            </h3>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-700 text-center">
              Testimonial form coming soon!
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <svg
              className="w-16 h-16 mb-4 text-yellow-200"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 20.5v-17m0 0L7 7m5-3.5l5 3.5"
              />
            </svg>
            <span className="text-lg font-medium">
              Click a school marker to view details and submit a testimonial.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CesiumSchoolsGlobe;