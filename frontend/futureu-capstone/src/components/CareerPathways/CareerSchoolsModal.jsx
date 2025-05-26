import React from 'react';
import { X, Globe, Building, Star, ChevronRight } from "lucide-react";

const CareerSchoolsModal = ({
    selectedCareer,
    setShowSchoolsModal,
    getSchoolsForCareer,
    getSchoolBackground,
}) => {
    if (!selectedCareer) return null; // Should not happen if parent handles correctly

    const schoolsForThisCareer = getSchoolsForCareer(selectedCareer);

    return (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full relative border border-gray-200 animate-fade-in-up overflow-hidden">
                <button
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 bg-gray-100 p-2 rounded-full shadow"
                    onClick={() => setShowSchoolsModal(false)}
                    aria-label="Close"
                >
                    <X size={18} />
                </button>
                <div className="h-52 bg-[#2B3E4E] relative overflow-hidden w-full">
                    {schoolsForThisCareer[0]?.name && getSchoolBackground(schoolsForThisCareer[0]?.name) ? (
                        <img
                            src={getSchoolBackground(schoolsForThisCareer[0]?.name)}
                            alt="School background"
                            className="w-full h-full object-cover object-center opacity-40"
                        />
                    ) : (
                        <div className="absolute inset-0 bg-[#2B3E4E] opacity-90"></div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="px-6 py-3 text-center">
                            <h2 className="text-white text-3xl font-bold text-shadow-lg" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.4)' }}>
                                Schools Offering {selectedCareer.careerTitle} Related Programs
                            </h2>
                        </div>
                    </div>
                </div>
                <div className="px-8 pb-8 relative">
                    <ul className="space-y-8 max-h-[420px] overflow-y-auto pt-12">
                        {schoolsForThisCareer.length === 0 ? (
                            <li className="text-gray-500 text-center py-8">No schools found for this career's programs.</li>
                        ) : (
                            schoolsForThisCareer.map((school) => (
                                <li key={school.schoolId} className="relative bg-white rounded-xl shadow-lg border border-gray-100 p-6 flex flex-col md:flex-row gap-6 mb-4">
                                    <div className="absolute -top-12 left-8 w-24 h-24">
                                        <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-lg border-4 border-white overflow-hidden p-1">
                                            <span className="text-4xl font-bold text-[#2B3E4E]">{school.name[0]}</span>
                                        </div>
                                    </div>
                                    <div className="flex-1 pt-8 md:pt-0 md:pl-32">
                                        <h3 className="font-bold text-xl text-[#2B3E4E] mb-2">{school.name}</h3>
                                        <div className="flex flex-wrap gap-4 mb-2">
                                            <div className="flex items-center text-gray-600">
                                                <Globe className="w-5 h-5 mr-2 text-[#FFB71B]" />
                                                {school.location}
                                            </div>
                                            <div className="flex items-center text-gray-600">
                                                <Building className="w-5 h-5 mr-2 text-[#FFB71B]" />
                                                {school.type}
                                            </div>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-4 mb-3">
                                            <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                                                <Star className="w-5 h-5 mr-2 text-[#FFB71B]" />
                                                About the School
                                            </h4>
                                            <p className="text-gray-700 text-sm leading-relaxed">
                                                {school.description || 'No description available for this school.'}
                                            </p>
                                        </div>
                                    </div>
                                </li>
                            ))
                        )}
                    </ul>
                    {/* View All Button */}
                    <div className="mt-8 flex justify-end gap-4">
                        <button
                            className="py-3 px-6 bg-[#FFB71B] hover:bg-[#FFB71B]/90 text-[#2B3E4E] rounded-lg transition shadow-md hover:shadow-lg font-medium flex items-center justify-center"
                            onClick={() => {
                                const programId = selectedCareer.careerPrograms &&
                                    selectedCareer.careerPrograms.length > 0 ?
                                    selectedCareer.careerPrograms[0].program.programId : null;
                                if (programId) {
                                    window.location.href = `/academic-explorer?programId=${programId}`;
                                }
                            }}
                        >
                            <ChevronRight className="w-5 h-5 mr-2" />
                            View All in Academic Explorer
                        </button>
                        <button
                            className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold px-4 py-2 rounded"
                            onClick={() => setShowSchoolsModal(false)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CareerSchoolsModal;