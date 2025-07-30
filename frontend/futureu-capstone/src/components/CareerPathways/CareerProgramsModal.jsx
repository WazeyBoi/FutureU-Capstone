import React, { useState } from 'react';
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

    const [selectedProgram, setSelectedProgram] = useState(null);

    const handleProgramClick = (program) => {
        setSelectedProgram(program);
    };

    const handleExplorePrograms = () => {
        setShowProgramsModal(false);
        if (selectedProgram) {
            window.location.href = `/academic-explorer?programId=${selectedProgram.programId}`;
        } else {
            const firstProgram = getProgramsForCareer(selectedProgramsCareer)[0];
            if (firstProgram) {
                window.location.href = `/academic-explorer?programId=${firstProgram.programId}`;
            }
        }
    };

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
                                    className={`rounded-xl p-5 transition-all border cursor-pointer group ${
                                        selectedProgram?.programId === program.programId
                                            ? 'bg-[#2B3E4E]/10 border-[#2B3E4E]/30 shadow-md'
                                            : 'bg-gray-50 hover:bg-[#2B3E4E]/5 border-gray-100 hover:border-[#2B3E4E]/20 hover:shadow-md'
                                    }`}
                                    onClick={() => handleProgramClick(program)}
                                >
                                    <div className="flex items-start">
                                        <div className={`p-2.5 rounded-lg mr-3 flex-shrink-0 transition-colors ${
                                            selectedProgram?.programId === program.programId
                                                ? 'bg-[#2B3E4E]/20'
                                                : 'bg-[#2B3E4E]/10 group-hover:bg-[#2B3E4E]/15'
                                        }`}>
                                            <BookOpen className={`w-6 h-6 transition-colors ${
                                                selectedProgram?.programId === program.programId
                                                    ? 'text-[#2B3E4E]'
                                                    : 'text-[#2B3E4E] group-hover:text-[#2B3E4E]'
                                            }`} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <h4 className={`font-semibold text-lg transition-colors ${
                                                    selectedProgram?.programId === program.programId
                                                        ? 'text-[#2B3E4E]'
                                                        : 'text-gray-800 group-hover:text-[#2B3E4E]'
                                                }`}>{program.programName}</h4>
                                                <ChevronRight className={`w-5 h-5 transition-all ${
                                                    selectedProgram?.programId === program.programId
                                                        ? 'text-[#2B3E4E] opacity-100 translate-x-0'
                                                        : 'text-gray-400 group-hover:text-[#2B3E4E] opacity-0 group-hover:opacity-100 transform translate-x-1 group-hover:translate-x-0'
                                                }`} />
                                            </div>
                                            {program.description && (
                                                <p className="text-sm text-gray-600 mb-4 leading-relaxed line-clamp-2">{program.description}</p>
                                            )}

                                            {/* Program stats */}
                                            <div className="flex flex-wrap gap-2 mt-1 items-center">
                                                <div className={`rounded-md px-3 py-1.5 text-xs font-medium flex items-center transition-colors ${
                                                    selectedProgram?.programId === program.programId
                                                        ? 'bg-[#2B3E4E]/20 text-[#2B3E4E]'
                                                        : 'bg-[#2B3E4E]/10 group-hover:bg-[#2B3E4E]/15 text-[#2B3E4E]'
                                                }`}>
                                                    <Building className="w-3.5 h-3.5 mr-1.5" />
                                                    {schoolPrograms.filter(sp => sp.program?.programId === program.programId && sp.school).length} Schools
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Schools that offer this program */}
                                    <div className={`mt-4 pl-12 pt-4 border-t transition-colors ${
                                        selectedProgram?.programId === program.programId
                                            ? 'border-[#2B3E4E]/30'
                                            : 'border-gray-200 group-hover:border-[#2B3E4E]/20'
                                    }`}>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs text-gray-500 font-medium">Available at:</span>
                                            <span className={`text-xs transition-colors ${
                                                selectedProgram?.programId === program.programId
                                                    ? 'text-[#2B3E4E]'
                                                    : 'text-[#2B3E4E] group-hover:text-[#2B3E4E]'
                                            }`}>
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
                                                        className="bg-yellow-50 group-hover:bg-yellow-100 border border-yellow-100 group-hover:border-yellow-200 px-2.5 py-1 rounded-md text-xs font-medium text-yellow-800 max-w-[150px] truncate transition-colors"
                                                        title={sp.school.name}
                                                    >
                                                        {sp.school.name}
                                                    </div>
                                                ))}
                                            {schoolPrograms.filter(sp => sp.program?.programId === program.programId && sp.school).length > 5 && (
                                                <div className="bg-gray-100 group-hover:bg-gray-200 px-2.5 py-1 rounded-md text-xs font-medium text-gray-600 flex items-center transition-colors">
                                                    +{schoolPrograms.filter(sp => sp.program?.programId === program.programId && sp.school).length - 5} more
                                                </div>
                                            )}
                                            {schoolPrograms.filter(sp => sp.program?.programId === program.programId && sp.school).length === 0 && (
                                                <div className="text-xs text-gray-500 italic">No schools available</div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Click hint */}
                                    <div className={`mt-3 pl-12 transition-opacity ${
                                        selectedProgram?.programId === program.programId
                                            ? 'opacity-100'
                                            : 'opacity-0 group-hover:opacity-100'
                                    }`}>
                                        <div className="text-xs text-[#2B3E4E] font-medium flex items-center">
                                            {selectedProgram?.programId === program.programId ? 'Selected program' : 'Click to select this program'}
                                            <ChevronRight className="w-3 h-3 ml-1" />
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="border-t border-gray-200 pt-6 flex justify-end">
                        <button
                            className="bg-black !text-white hover:bg-gray-800 px-5 py-2.5 rounded-lg transition-colors shadow-md hover:shadow-lg flex items-center"
                            onClick={handleExplorePrograms}
                            style={{ backgroundColor: 'black' }}
                        >
                            Explore {selectedProgram ? 'Selected Program' : 'Programs'}
                            <ChevronRight className="w-4 h-4 ml-1.5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CareerProgramsModal;