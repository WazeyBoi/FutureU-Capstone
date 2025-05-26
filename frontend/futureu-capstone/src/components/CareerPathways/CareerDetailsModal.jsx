import React from 'react';
import { X, Building, BookOpen, Info, TrendingUp, TrendingDown, Minus, Briefcase, ChevronRight } from "lucide-react";

const CareerDetailsModal = ({
    selectedCareer,
    setShowCareerModal,
    setShowProgramsModal,
    setSelectedProgramsCareer,
    setShowSchoolsModal,
    getProgramsForCareer,
    getTrendStyle,
    getTrendIcon
}) => {
    if (!selectedCareer) return null; // Should not happen if parent handles correctly

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full relative border border-gray-200 overflow-hidden animate-fade-in-up">
                {/* Header with navy blue background similar to Academic Explorer */}
                <div className="h-32 bg-[#2B3E4E] relative overflow-hidden w-full">
                    <div className="absolute inset-0 bg-gradient-to-b from-[#2B3E4E]/60 to-[#2B3E4E]/90"></div>

                    {/* Close button */}
                    <button
                        onClick={() => setShowCareerModal(false)}
                        className="absolute top-3 right-3 bg-white/80 text-gray-700 p-1.5 rounded-full hover:bg-white z-10 shadow"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Career Icon centered on the header bottom border */}
                <div className="absolute top-32 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="w-20 h-20 rounded-full bg-[#2B3E4E] flex items-center justify-center mx-auto border-4 border-white shadow-lg">
                        <Briefcase className="w-10 h-10 text-[#FFB71B]" />
                    </div>
                </div>

                {/* Content with padding for the icon */}
                <div className="px-8 py-6 pt-12">
                    {/* ACADEMIC PROGRAM text */}
                    <div className="text-sm uppercase tracking-wider text-[#2B3E4E] font-semibold text-center mb-1">
                        CAREER PATH
                    </div>

                    {/* Career Title */}
                    <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
                        {selectedCareer.careerTitle}
                    </h2>

                    {/* Rest of your content - keep the grid and cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
                        {/* Industry Card - With text wrapping and color scheme */}
                        <div className="rounded-lg shadow-sm bg-white hover:bg-gray-50 transition-all duration-200 p-3 flex flex-col border border-gray-100 hover:border-[#2B3E4E]/30 hover:shadow">
                            <div className="flex items-center gap-1.5 mb-1">
                                <div className="bg-[#2B3E4E]/10 p-1.5 rounded-md">
                                    <Building className="h-3.5 w-3.5 text-[#2B3E4E]" />
                                </div>
                                <p className="text-xs font-medium text-gray-600">Industry</p>
                            </div>
                            <div className="text-base font-bold text-[#2B3E4E] mt-1 break-words">
                                {selectedCareer.industry}
                            </div>
                            <p className="text-[10px] text-gray-500 mt-1">
                                Career field classification
                            </p>
                        </div>

                        {/* Salary Range Card - With color scheme */}
                        <div className="rounded-lg shadow-sm bg-white hover:bg-gray-50 transition-all duration-200 p-3 flex flex-col border border-gray-100 hover:border-[#FFB71B]/30 hover:shadow">
                            <div className="flex items-center gap-1.5 mb-1">
                                <div className="bg-[#FFB71B]/10 p-1.5 rounded-md">
                                    <BookOpen className="h-3.5 w-3.5 text-[#FFB71B]" />
                                </div>
                                <p className="text-xs font-medium text-gray-600">Salary Range</p>
                            </div>
                            <div className="text-base font-bold text-[#FFB71B] mt-1">
                                {selectedCareer.salary ? `₱${selectedCareer.salary.toLocaleString()}` : 'N/A'}
                            </div>
                            <p className="text-[10px] text-gray-500 mt-1">
                                Monthly compensation in PHP
                            </p>
                        </div>

                        {/* Job Trend Card - With color scheme based on trend */}
                        <div className="rounded-lg shadow-sm bg-white hover:bg-gray-50 transition-all duration-200 p-3 flex flex-col border border-gray-100 hover:shadow">
                            <div className="flex items-center gap-1.5 mb-1">
                                <div className={`p-1.5 rounded-md ${
                                    selectedCareer.jobTrend === 'Growing' ? 'bg-green-50' :
                                    selectedCareer.jobTrend === 'Stable' ? 'bg-blue-50' :
                                    selectedCareer.jobTrend === 'Declining' ? 'bg-red-50' :
                                    'bg-gray-50'
                                }`}>
                                    {selectedCareer.jobTrend === 'Growing' && <TrendingUp className="h-3.5 w-3.5 text-green-600" />}
                                    {selectedCareer.jobTrend === 'Stable' && <Minus className="h-3.5 w-3.5 text-blue-600" />}
                                    {selectedCareer.jobTrend === 'Declining' && <TrendingDown className="h-3.5 w-3.5 text-red-600" />}
                                    {!selectedCareer.jobTrend && <Info className="h-3.5 w-3.5 text-gray-500" />}
                                </div>
                                <p className="text-xs font-medium text-gray-600">Job Trend</p>
                            </div>
                            <div className={`text-base font-bold mt-1 ${
                                selectedCareer.jobTrend === 'Growing' ? 'text-green-600' :
                                selectedCareer.jobTrend === 'Stable' ? 'text-blue-600' :
                                selectedCareer.jobTrend === 'Declining' ? 'text-red-600' :
                                'text-gray-600'
                            }`}>
                                {selectedCareer.jobTrend || 'N/A'}
                            </div>
                            <p className="text-[10px] text-gray-500 mt-1">
                                Current employment market trend
                            </p>
                        </div>
                    </div>

                    {/* Description */}
                    {selectedCareer.careerDescription && (
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 mb-6">
                            <div className="flex items-start">
                                <div className="bg-indigo-50 p-2 rounded-lg mr-3 flex-shrink-0 mt-0.5">
                                    <Info className="h-4 w-4 text-indigo-600" />
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-gray-700 mb-1">Description</div>
                                    <div className="text-sm text-gray-600 leading-relaxed">
                                        {selectedCareer.careerDescription}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Programs Section */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-gray-700 font-medium">Associated Programs</h3>
                            <div className="text-sm text-gray-500">
                                {getProgramsForCareer(selectedCareer).length} program{getProgramsForCareer(selectedCareer).length !== 1 ? 's' : ''}
                            </div>
                        </div>

                        <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2 mb-4">
                            {getProgramsForCareer(selectedCareer).length === 0 ? (
                                <div className="text-center py-4 bg-gray-50 rounded-xl text-gray-500 text-sm">
                                    No programs associated with this career.
                                </div>
                            ) : (
                                getProgramsForCareer(selectedCareer).slice(0, 3).map((program) => (
                                    <div
                                        key={program.programId}
                                        className="bg-gray-50 hover:bg-gray-100 rounded-xl p-3 transition-colors border border-gray-100 flex items-start"
                                    >
                                        <div className="bg-yellow-100 p-1.5 rounded-lg mr-2.5 flex-shrink-0">
                                            <BookOpen className="h-4 w-4 text-yellow-700" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-gray-800">{program.programName}</div>
                                            {program.description && (
                                                <div className="text-xs text-gray-600 mt-0.5 line-clamp-1">{program.description}</div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}

                            {getProgramsForCareer(selectedCareer).length > 3 && (
                                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 text-center">
                                    <span className="text-sm text-gray-500">
                                        +{getProgramsForCareer(selectedCareer).length - 3} more programs
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* View all programs button */}
                        {getProgramsForCareer(selectedCareer).length > 0 && (
                            <button
                                onClick={() => {
                                    setShowCareerModal(false);
                                    setSelectedProgramsCareer(selectedCareer);
                                    setShowProgramsModal(true);
                                }}
                                className="w-full py-2.5 px-4 bg-[#2B3E4E]/10 hover:bg-[#2B3E4E]/20 text-[#2B3E4E] rounded-lg transition-colors flex items-center justify-center group"
                            >
                                <BookOpen className="h-4 w-4 mr-2" />
                                View All Programs
                                <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
                            </button>
                        )}
                    </div>

                    {/* Action Button */}
                    <div className="mt-6 border-t border-gray-200 pt-6 flex justify-end">
                        <button
                            className="bg-[#FFB71B] hover:bg-[#FFB71B]/90 text-[#2B3E4E] font-medium px-6 py-3 rounded-lg transition shadow-md hover:shadow-lg flex items-center justify-center"
                            onClick={() => {
                                setShowCareerModal(false);
                                setShowSchoolsModal(true);
                            }}
                        >
                            <Building className="w-5 h-5 mr-2" />
                            View Schools Offering Programs
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CareerDetailsModal;