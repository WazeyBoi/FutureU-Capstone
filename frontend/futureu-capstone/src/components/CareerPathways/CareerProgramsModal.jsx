import React from 'react';
import { X, Briefcase, BookOpen, Building, TrendingUp, TrendingDown, Minus, ChevronRight } from "lucide-react";

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
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full relative border border-gray-200 animate-fade-in-up overflow-hidden">
                {/* Header with gradient - enhanced with pattern */}
                <div className="bg-gradient-to-r from-[#2B3E4E] to-[#1a2530] h-24 flex items-center px-8 relative">
                    <div className="absolute inset-0 opacity-10"></div>
                    <div className="bg-white/10 backdrop-blur-md rounded-lg px-4 py-2 inline-flex items-center border border-white/10">
                        <div className="bg-yellow-500 rounded-full p-2 mr-3">
                            <Briefcase className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <div className="text-xs text-yellow-300 font-semibold uppercase tracking-wider">Career Programs</div>
                            <h3 className="text-white font-bold text-lg">{selectedProgramsCareer.careerTitle}</h3>
                        </div>
                    </div>
                    <button
                        className="absolute top-4 right-4 bg-white text-gray-700 hover:bg-gray-100 hover:text-gray-900 p-1.5 rounded-full transition-colors shadow-lg border border-gray-200"
                        onClick={() => setShowProgramsModal(false)}
                        aria-label="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Programs list - enhanced design */}
                <div className="px-8 py-6">
                    <div className="mb-6">
                        <div className="text-sm text-gray-500 mb-1">These academic programs can lead to careers in:</div>
                        <div className="flex items-center justify-between">
                            <div className="text-lg font-medium text-[#2B3E4E] flex items-center">
                                <span className="mr-2">{selectedProgramsCareer.industry}</span>
                            </div>
                            <span className={`text-xs px-2.5 py-1.5 rounded-full flex items-center ${
                                getTrendStyle(selectedProgramsCareer.jobTrend)
                            }`}>
                                {getTrendIcon(selectedProgramsCareer.jobTrend)}
                                {selectedProgramsCareer.jobTrend}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 mb-6">
                        {getProgramsForCareer(selectedProgramsCareer).length === 0 ? (
                            <div className="text-center py-8 text-gray-500">No programs associated with this career.</div>
                        ) : (
                            getProgramsForCareer(selectedProgramsCareer).map((program) => (
                                <div
                                    key={program.programId}
                                    className="bg-gray-50 hover:bg-gray-100 rounded-xl p-5 transition-colors border border-gray-100 hover:border-gray-200 hover:shadow-sm"
                                >
                                    <div className="flex items-start">
                                        <div className="bg-[#2B3E4E]/10 p-2.5 rounded-lg mr-3 flex-shrink-0">
                                            <BookOpen className="w-6 h-6 text-[#2B3E4E]" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-gray-800 text-lg mb-1">{program.programName}</h4>
                                            {program.description && (
                                                <p className="text-sm text-gray-600 mb-4 leading-relaxed line-clamp-2">{program.description}</p>
                                            )}

                                            {/* Program stats */}
                                            <div className="flex flex-wrap gap-2 mt-1 items-center">
                                                <div className="bg-blue-50 rounded-md px-3 py-1.5 text-xs text-blue-700 font-medium flex items-center">
                                                    <Building className="w-3.5 h-3.5 mr-1.5" />
                                                    {schoolPrograms.filter(sp => sp.program?.programId === program.programId && sp.school).length} Schools
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Schools that offer this program */}
                                    <div className="mt-4 pl-12 pt-4 border-t border-gray-200">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs text-gray-500 font-medium">Available at:</span>
                                            <span className="text-xs text-blue-600">
                                                {schoolPrograms.filter(sp => sp.program?.programId === program.programId && sp.school).length} schools
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {schoolPrograms
                                                .filter(sp => sp.program?.programId === program.programId && sp.school)
                                                .slice(0, 5)
                                                .map((sp, i) => (
                                                    <div
                                                        key={`${sp.school.schoolId}-${i}`}
                                                        className="bg-yellow-50 border border-yellow-100 px-2.5 py-1 rounded-md text-xs font-medium text-yellow-800 max-w-[150px] truncate"
                                                        title={sp.school.name}
                                                    >
                                                        {sp.school.name}
                                                    </div>
                                                ))}
                                            {schoolPrograms.filter(sp => sp.program?.programId === program.programId && sp.school).length > 5 && (
                                                <div className="bg-gray-100 px-2.5 py-1 rounded-md text-xs font-medium text-gray-600 flex items-center">
                                                    +{schoolPrograms.filter(sp => sp.program?.programId === program.programId && sp.school).length - 5} more
                                                </div>
                                            )}
                                            {schoolPrograms.filter(sp => sp.program?.programId === program.programId && sp.school).length === 0 && (
                                                <div className="text-xs text-gray-500 italic">No schools available</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="border-t border-gray-200 pt-6 flex justify-end">
                        <button
                            className="bg-black !text-white hover:bg-gray-800 px-5 py-2.5 rounded-lg transition-colors shadow-md hover:shadow-lg flex items-center"
                            onClick={() => {
                                setShowProgramsModal(false);
                                const firstProgram = getProgramsForCareer(selectedProgramsCareer)[0];
                                if (firstProgram) {
                                    window.location.href = `/academic-explorer?programId=${firstProgram.programId}`;
                                }
                            }}
                            style={{ backgroundColor: 'black' }}
                        >
                            Explore Programs
                            <ChevronRight className="w-4 h-4 ml-1.5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CareerProgramsModal;