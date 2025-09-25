import React from 'react';
import { X, Briefcase, BookOpen, Building, ChevronRight } from "lucide-react";

const CareerProgramsModal = ({
    selectedProgramsCareer,
    setShowProgramsModal,
    getProgramsForCareer,
    getSchoolsForCareer,
    schoolPrograms,
    getTrendStyle,
    getTrendIcon
}) => {
    if (!selectedProgramsCareer) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden relative border border-[#2B3E4E] animate-fade-in-up flex flex-col">
                {/* Header */}
                <div className="bg-[#2B3E4E] h-20 flex items-center px-8 relative flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="bg-[#FFB71B] rounded-lg p-2 flex items-center justify-center">
                            <Briefcase className="w-6 h-6 text-[#2B3E4E]" />
                        </div>
                        <div>
                            <div className="text-xs text-white font-semibold uppercase tracking-wider">Career Programs</div>
                            <h3 className="text-white font-bold text-xl leading-tight">{selectedProgramsCareer.careerTitle}</h3>
                        </div>
                    </div>
                    <button
                        className="absolute top-4 right-4 border-2 border-[#FFB71B] bg-white text-[#2B3E4E] p-1.5 rounded-lg transition-colors shadow-md focus-visible:ring-2 focus-visible:ring-[#FFB71B] focus-visible:border-[#FFB71B] hover:bg-[#FFB71B] hover:text-[#2B3E4E] active:bg-[#2B3E4E] active:text-[#FFB71B]"
                        style={{ outlineColor: '#FFB71B', borderColor: '#FFB71B' }}
                        onClick={() => setShowProgramsModal(false)}
                        aria-label="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Career Info Section */}
                <div className="px-8 pt-6 pb-2 flex-shrink-0">
                    <div className="flex flex-wrap items-center justify-between mb-2">
                        <div className="text-xl font-bold text-[#2B3E4E]">{selectedProgramsCareer.industry}</div>
                        <span className="bg-[#FFB71B] text-[#2B3E4E] font-bold text-xs px-4 py-1 rounded-full ml-2">
                            {selectedProgramsCareer.jobTrend}
                        </span>
                    </div>
                    <div className="text-sm text-[#2B3E4E] mb-4 max-w-4xl text-left">
                        These academic programs can lead to careers in <span className="font-semibold">{selectedProgramsCareer.industry}</span>. {selectedProgramsCareer.careerDescription}
                    </div>
                </div>

                {/* Academic Programs Section */}
                <div className="px-8 pb-8 flex-1 overflow-y-auto">
                    {getProgramsForCareer(selectedProgramsCareer).map((program) => {
                        const schools = schoolPrograms.filter(sp => sp.program?.programId === program.programId && sp.school);
                        return (
                            <div key={program.programId} className="bg-white border border-[#2B3E4E]/20 rounded-xl p-6 mb-6">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2 gap-2">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-[#2B3E4E]/10 p-2 rounded-lg flex items-center justify-center">
                                            <BookOpen className="w-6 h-6 text-[#2B3E4E]" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-[#2B3E4E] text-base text-left">{program.programName}</div>
                                            <div className="text-xs text-[#2B3E4E] mt-1 text-left">{program.description}</div>
                                        </div>
                                    </div>
                                    <span className="bg-[#FFB71B] text-[#2B3E4E] font-bold text-xs px-4 py-1 rounded-full ml-2 self-start md:self-auto">
                                        {schools.length} Schools
                                    </span>
                                </div>
                                <div className="text-xs text-[#2B3E4E] font-semibold mb-2 mt-2">Available at:</div>
                                <div className="flex flex-col gap-2">
                                    {schools.length === 0 && (
                                        <div className="text-xs text-[#2B3E4E] italic">No schools available</div>
                                    )}
                                    {schools.map((sp, i) => (
                                        <div key={sp.school.schoolId + '-' + i} className="bg-white shadow-md px-4 py-2 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                            <div className="font-semibold text-[#2B3E4E] text-sm truncate">{sp.school.name}</div>
                                            <div className="flex items-center gap-2 mt-1 sm:mt-0">
                                                <span className="text-xs text-[#2B3E4E]">{sp.school.city}</span>
                                                <span className="bg-[#2B3E4E] text-white px-2 py-0.5 rounded-full text-xs ml-1">{sp.school.type || 'public'}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
                {/* Explore Programs Button - always visible at the bottom, inside the modal card */}
                <div className="w-full px-8 pb-6 pt-2 border-t border-[#F1F1F1] bg-white flex justify-end">
                    <button
                        className="bg-[#2B3E4E] text-[#FFB71B] hover:bg-[#FFB71B] hover:text-[#2B3E4E] active:bg-[#2B3E4E] active:text-[#FFB71B] font-bold px-6 py-2.5 rounded-lg transition-colors shadow-md flex items-center gap-2 border-2 border-[#FFB71B] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB71B] focus-visible:border-[#FFB71B]"
                        style={{ outlineColor: '#FFB71B', borderColor: '#FFB71B' }}
                        onClick={() => {
                            setShowProgramsModal(false);
                            const firstProgram = getProgramsForCareer(selectedProgramsCareer)[0];
                            if (firstProgram) {
                                window.location.href = `/academic-explorer?programId=${firstProgram.programId}`;
                            }
                        }}
                    >
                        Explore Programs
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CareerProgramsModal;