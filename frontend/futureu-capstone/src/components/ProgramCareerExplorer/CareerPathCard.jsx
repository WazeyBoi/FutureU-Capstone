import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  Target, 
  Briefcase, 
  TrendingUp, 
  TrendingDown,
  Minus,
  DollarSign,
  Users,
  X,
  Building,
  Info,
  ExternalLink,
  Eye,
  ChevronDown,
  ChevronUp,
  Star,
  Award,
  BarChart3,
  BookOpen
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { schoolLogos } from '../AcademicExplorer/constants';

const CareerPathCard = ({ careerPath, index, onCareerSelect }) => {
  const [showCareersModal, setShowCareersModal] = useState(false);
  const [selectedCareer, setSelectedCareer] = useState(null);
  const [showDescription, setShowDescription] = useState(false);

  const getTrendIcon = (trend) => {
    if (!trend) return <Minus className="w-4 h-4" />;
    const lowerTrend = trend.toLowerCase();
    if (lowerTrend.includes('growing') || lowerTrend.includes('high')) {
      return <TrendingUp className="w-4 h-4" />;
    } else if (lowerTrend.includes('declining') || lowerTrend.includes('low')) {
      return <TrendingDown className="w-4 h-4" />;
    }
    return <Minus className="w-4 h-4" />;
  };

  const getTrendColor = (trend) => {
    if (!trend) return 'text-gray-500 bg-gray-100';
    const lowerTrend = trend.toLowerCase();
    if (lowerTrend.includes('growing') || lowerTrend.includes('high')) {
      return 'text-green-700 bg-green-100';
    } else if (lowerTrend.includes('declining') || lowerTrend.includes('low')) {
      return 'text-red-700 bg-red-100';
    }
    return 'text-blue-700 bg-blue-100';
  };

  const formatSalary = (salary) => {
    if (!salary) return 'Not specified';
    
    // Handle salary ranges - check for different "to" patterns
    const toPatterns = [' to ', 'to', ' to', 'to '];
    let foundPattern = null;
    
    for (const pattern of toPatterns) {
      if (salary.includes(pattern)) {
        foundPattern = pattern;
        break;
      }
    }
    
    if (foundPattern) {
      // Split the range
      const parts = salary.split(foundPattern);
      if (parts.length === 2) {
        let lowerBound = parts[0].trim();
        let upperBound = parts[1].trim();
        
        // Remove existing P or ₱ signs to clean them up
        lowerBound = lowerBound.replace(/^[P₱]\s*/, '');
        upperBound = upperBound.replace(/^[P₱]\s*/, '');
        
        // Add ₱ to both bounds
        return `₱ ${lowerBound} - ₱ ${upperBound}`;
      }
    }
    
    // Handle single salary value
    let cleanSalary = salary.replace(/^[P₱]\s*/, ''); // Remove existing P or ₱
    return `₱ ${cleanSalary}`;
  };

  const getSchoolLogo = (schoolId) => {
    return schoolLogos[schoolId] || null;
  };

  // Career Details Component - Enhanced Design
  const CareerDetails = ({ career }) => {
    const [isHeaderVisible, setIsHeaderVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    const handleScroll = (e) => {
      const currentScrollY = e.target.scrollTop;
      
      // Hide header when scrolling down, show when scrolling up
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsHeaderVisible(false);
      } else if (currentScrollY < lastScrollY || currentScrollY <= 50) {
        setIsHeaderVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    if (!career) {
      return (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center text-gray-500">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Target className="w-10 h-10 text-gray-300" />
            </div>
            <p className="text-xl font-semibold text-gray-600 mb-2">Select a career</p>
            <p className="text-sm text-gray-500">Choose a career from the list to view details</p>
          </div>
        </div>
      );
    }

    return (
      <>
        {/* Career Header - Enhanced */}
        <motion.div 
          initial={{ opacity: 1, y: 0 }}
          animate={{ 
            opacity: isHeaderVisible ? 1 : 0, 
            y: isHeaderVisible ? 0 : -100,
            height: isHeaderVisible ? 'auto' : 0
          }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="p-6 border-b border-gray-200 flex-shrink-0 bg-gradient-to-br from-gray-50 to-blue-50/30 overflow-hidden"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-[#232D35] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Briefcase className="w-8 h-8 text-[#FFB71B]" />
            </div>
            <h3 className="text-2xl font-bold text-[#2B3E4E] mb-2">
              {career.careerTitle}
            </h3>
            <div className="inline-flex items-center px-3 py-1 bg-[#FFB71B]/10 text-[#2B3E4E] rounded-full text-xs font-semibold uppercase tracking-wider">
              <Star className="w-3 h-3 mr-1" />
              Career Details
            </div>
          </div>
        </motion.div>

        {/* Career Content - Enhanced Design */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div 
            className="flex-1 overflow-y-auto p-6 bg-gray-50/30"
            onScroll={handleScroll}
          >
            {/* Enhanced Career Stats Grid */}
            <div className="grid grid-cols-1 gap-4 mb-6">
              {/* Industry - Enhanced */}
              {career.industry && (
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="group relative overflow-hidden bg-gradient-to-br from-white to-[#2B3E4E]/5 rounded-2xl p-5 border border-[#2B3E4E]/10 hover:border-[#2B3E4E]/30 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {/* Background Pattern */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#2B3E4E]/5 to-transparent rounded-full transform translate-x-12 -translate-y-12"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#2B3E4E] to-[#1D63A1] rounded-xl flex items-center justify-center mr-3 shadow-md group-hover:scale-110 transition-transform duration-300">
                        <Building className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[#2B3E4E] uppercase tracking-wider block">Industry Sector</span>
                        <div className="flex items-center mt-1">
                          <div className="w-2 h-2 bg-[#2B3E4E] rounded-full mr-2"></div>
                          <span className="text-xs text-gray-600 font-medium">Professional Field</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-[#2B3E4E] group-hover:text-[#1D63A1] transition-colors duration-300">
                        {career.industry}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Salary - Enhanced */}
              {career.salary && (
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="group relative overflow-hidden bg-gradient-to-br from-white to-[#FFB71B]/5 rounded-2xl p-5 border border-[#FFB71B]/20 hover:border-[#FFB71B]/50 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {/* Background Pattern */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#FFB71B]/10 to-transparent rounded-full transform translate-x-12 -translate-y-12"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-[#FFB71B] rounded-xl flex items-center justify-center mr-3 shadow-md group-hover:scale-110 transition-transform duration-300">
                        <TrendingUp className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[#FFB71B] uppercase tracking-wider block">Salary Range</span>
                        <div className="flex items-center mt-1">
                          <div className="w-2 h-2 bg-[#FFB71B] rounded-full mr-2"></div>
                          <span className="text-xs text-gray-600 font-medium">Monthly Income</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-[#FFB71B] group-hover:text-[#FF9800] transition-colors duration-300">
                        {formatSalary(career.salary)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Job Trend - Enhanced */}
              {career.jobTrend && (
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className={`group relative overflow-hidden rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 ${
                    career.jobTrend.toLowerCase().includes('growing') 
                      ? 'bg-gradient-to-br from-white to-green-50 border border-green-200 hover:border-green-300' 
                      : career.jobTrend.toLowerCase().includes('declining') 
                      ? 'bg-gradient-to-br from-white to-red-50 border border-red-200 hover:border-red-300'
                      : 'bg-gradient-to-br from-white to-blue-50 border border-blue-200 hover:border-blue-300'
                  }`}
                >
                  {/* Background Pattern */}
                  <div className={`absolute top-0 right-0 w-24 h-24 rounded-full transform translate-x-12 -translate-y-12 ${
                    career.jobTrend.toLowerCase().includes('growing') 
                      ? 'bg-gradient-to-br from-green-100/50 to-transparent' 
                      : career.jobTrend.toLowerCase().includes('declining') 
                      ? 'bg-gradient-to-br from-red-100/50 to-transparent'
                      : 'bg-gradient-to-br from-blue-100/50 to-transparent'
                  }`}></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center mb-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-3 shadow-md group-hover:scale-110 transition-transform duration-300 ${
                        career.jobTrend.toLowerCase().includes('growing') 
                          ? 'bg-gradient-to-br from-green-500 to-green-600' 
                          : career.jobTrend.toLowerCase().includes('declining') 
                          ? 'bg-gradient-to-br from-red-500 to-red-600'
                          : 'bg-gradient-to-br from-blue-500 to-blue-600'
                      }`}>
                        {career.jobTrend.toLowerCase().includes('growing') ? (
                          <TrendingUp className="w-5 h-5 text-white" />
                        ) : career.jobTrend.toLowerCase().includes('declining') ? (
                          <TrendingDown className="w-5 h-5 text-white" />
                        ) : (
                          <BarChart3 className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <div>
                        <span className={`text-xs font-bold uppercase tracking-wider block ${
                          career.jobTrend.toLowerCase().includes('growing') 
                            ? 'text-green-600'
                            : career.jobTrend.toLowerCase().includes('declining') 
                            ? 'text-red-600'
                            : 'text-blue-600'
                        }`}>Market Outlook</span>
                        <div className="flex items-center mt-1">
                          <div className={`w-2 h-2 rounded-full mr-2 ${
                            career.jobTrend.toLowerCase().includes('growing') 
                              ? 'bg-green-500' 
                              : career.jobTrend.toLowerCase().includes('declining') 
                              ? 'bg-red-500'
                              : 'bg-blue-500'
                          }`}></div>
                          <span className="text-xs text-gray-600 font-medium">Employment Trend</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className={`text-xl font-bold mb-2 transition-colors duration-300 ${
                        career.jobTrend.toLowerCase().includes('growing') 
                          ? 'text-green-600 group-hover:text-green-700' 
                          : career.jobTrend.toLowerCase().includes('declining') 
                          ? 'text-red-600 group-hover:text-red-700'
                          : 'text-blue-600 group-hover:text-blue-700'
                      }`}>
                        {career.jobTrend}
                      </p>
                      {career.jobTrend.toLowerCase().includes('growing') && (
                        <div className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                          <Award className="w-3 h-3 mr-1" />
                          High Demand
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Description - Enhanced */}
            {career.careerDescription && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <div className="bg-gradient-to-br from-white to-indigo-50/30 rounded-2xl p-6 border border-indigo-100 shadow-lg">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mr-3 shadow-md">
                      <Info className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-[#2B3E4E]">Career Overview</h4>
                      <span className="text-xs text-indigo-600 font-medium uppercase tracking-wider">Detailed Description</span>
                    </div>
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/50">
                    <p className="text-gray-700 leading-relaxed text-justify">
                      {career.careerDescription}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Enhanced Action Buttons */}
          <div className="flex gap-4 bg-white pt-8 pb-4 border-t border-gray-200 z-20 relative flex-shrink-0 justify-end px-6">
            <button
              onClick={() => {

                // Close the modal first
                setShowCareersModal(false);
                setSelectedCareer(null);
                setShowDescription(false);

                // Trigger the parent component's career selection with 'top' scroll
                if (onCareerSelect) {
                  onCareerSelect(career, 'hero');
                } else {
                  // Fallback: Dispatch a custom event with scroll target
                  window.dispatchEvent(new CustomEvent('selectCareerFromModal', {
                    detail: { career, scrollTarget: 'top' }
                  }));
                }
              }}
              className="bg-[#232D35] text-white px-6 py-3 rounded-xl font-semibold hover:shadow-xl transition-all duration-300 flex items-center justify-center group transform hover:scale-[1.02] cursor-pointer min-w-[160px]"
            >
              <ExternalLink className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              Explore Career
            </button>
            <button
              onClick={() => {

                // Close the modal first
                setShowCareersModal(false);
                setSelectedCareer(null);
                setShowDescription(false);

                // Trigger the parent component's career selection with 'programs' scroll
                if (onCareerSelect) {
                  onCareerSelect(career, 'programs');
                } else {
                  // Fallback: Dispatch a custom event with scroll target
                  window.dispatchEvent(new CustomEvent('selectCareerFromModal', {
                    detail: { career, scrollTarget: 'programs' }
                  }));
                }
              }}
              className="bg-[#FFB71B] text-[#2B3E4E] px-6 py-3 rounded-xl font-semibold hover:shadow-xl transition-all duration-300 flex items-center justify-center group transform hover:scale-[1.02] cursor-pointer min-w-[180px]"
            >
              <BookOpen className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              View Related Programs
            </button>
          </div>
        </div>
      </>
    );
  };

  const CareersModal = () => (
    <AnimatePresence>
      {showCareersModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowCareersModal(false);
              setSelectedCareer(null);
              setShowDescription(false);
            }
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl h-[95vh] overflow-hidden flex flex-col"
          >
            {/* Modal Header - Enhanced */}
            <div className="bg-[#232D35] p-6 text-white flex-shrink-0 relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-[url('/src/assets/pattern-bg.png')] opacity-10"></div>
              
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mr-4 shadow-lg">
                    <Target className="w-6 h-6 text-[#FFB71B]" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{careerPath.careerPathName}</h2>
                    <div className="flex items-center text-white/80 mt-1">
                      <Users className="w-4 h-4 mr-1" />
                      <span>{careerPath.careers.length} careers available</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {/* View Description Button */}
                  {careerPath.careerPathDescription && (
                    <button
                      onClick={() => setShowDescription(!showDescription)}
                      className="flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm font-medium backdrop-blur-sm"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">Description</span>
                      {showDescription ? (
                        <ChevronUp className="w-4 h-4 ml-1" />
                      ) : (
                        <ChevronDown className="w-4 h-4 ml-1" />
                      )}
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setShowCareersModal(false);
                      setSelectedCareer(null);
                      setShowDescription(false);
                    }}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors backdrop-blur-sm"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Expandable Description */}
              <AnimatePresence>
                {showDescription && careerPath.careerPathDescription && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 p-4 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20">
                      <h3 className="text-sm font-semibold text-white/90 mb-2 uppercase tracking-wider flex items-center">
                        <Info className="w-4 h-4 mr-2" />
                        Career Path Description
                      </h3>
                      <p className="text-white/90 leading-relaxed text-sm text-justify">
                        {careerPath.careerPathDescription}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Modal Content - Flexible Height */}
            <div className="flex flex-1 min-h-0">
              {/* Careers List - Scrollable */}
              <div className="w-1/2 border-r border-gray-200 flex flex-col bg-gray-50/30">
                <div className="p-6 border-b border-gray-200 flex-shrink-0 bg-white">
                  <h3 className="text-lg font-semibold text-[#2B3E4E] flex items-center">
                    <Star className="w-5 h-5 mr-2 text-[#FFB71B]" />
                    Select a Career
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Choose from {careerPath.careers.length} available career{careerPath.careers.length !== 1 ? 's' : ''}
                  </p>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6">
                  {careerPath.careers.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Briefcase className="w-10 h-10 text-gray-300" />
                      </div>
                      <p className="text-lg font-medium">No careers available</p>
                      <p className="text-sm">This career path doesn't have any specific careers yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {careerPath.careers.map((career, index) => (
                        <button
                          key={`${careerPath.careerPathId}-${career.careerId}-${index}`}
                          onClick={() => setSelectedCareer(career)}
                          className={`w-full p-4 rounded-xl border-2 transition-all text-left group transform hover:scale-[1.02] ${
                            selectedCareer?.careerId === career.careerId
                              ? 'border-[#FFB71B] bg-gradient-to-r from-[#FFB71B]/10 to-[#FF9800]/5 shadow-lg'
                              : 'border-gray-200 hover:border-[#FFB71B]/50 hover:bg-white shadow-sm hover:shadow-md'
                          }`}
                        >
                          <div className="flex items-start cursor-pointer">
                            <div className="w-10 h-10 bg-[#FFB71B] rounded-lg flex items-center justify-center mr-3 flex-shrink-0 group-hover:scale-110 transition-transform shadow-md">
                              <Briefcase className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-[#2B3E4E] mb-1 group-hover:text-[#1D63A1] transition-colors">
                                {career.careerTitle}
                              </h4>
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                {career.industry && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#2B3E4E]/10 text-[#2B3E4E]">
                                    <Building className="w-3 h-3 mr-1" />
                                    {career.industry}
                                  </span>
                                )}
                                {career.jobTrend && (
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTrendColor(career.jobTrend)}`}>
                                    {getTrendIcon(career.jobTrend)}
                                    <span className="ml-1">{career.jobTrend}</span>
                                  </span>
                                )}
                              </div>
                              {career.salary && (
                                <div className="flex items-center text-sm text-[#FFB71B] font-medium">
                                  <span>{formatSalary(career.salary)}</span>
                                </div>
                              )}
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 group-hover:text-[#FFB71B] transition-colors" />
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Career Details */}
              <div className="w-1/2 flex flex-col">
                <CareerDetails career={selectedCareer} />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300"
      >
        {/* Career Path Header */}
        <div className="p-6 bg-white border-b border-gray-100 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-14 h-14 bg-[#232D35] rounded-xl flex items-center justify-center mr-4 shadow-lg">
                <Target className="w-7 h-7 text-[#FFB71B]" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#2B3E4E] mb-1"> 
                  {careerPath.careerPathName}
                </h3>
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="w-4 h-4 mr-1" />
                  {careerPath.careers.length} career{careerPath.careers.length !== 1 ? 's' : ''} available
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setShowCareersModal(true)}
              className="flex items-center px-4 py-2 bg-[#FFB71B] text-white rounded-lg font-medium transition-all duration-300 hover:scale-105 transform shadow-md hover:shadow-lg cursor-pointer"
            >
              <span className="mr-2">View Careers</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Full Description Preview */}
          {careerPath.careerPathDescription && (
            <div className="mt-4 p-4 bg-white rounded-xl border border-gray-100 shadow-lg">
              <div className="flex items-center mb-3">
                <div className="w-6 h-6 bg-[#1D63A1]/10 rounded-lg flex items-center justify-center mr-2">
                  <Info className="w-3 h-3 text-[#1D63A1]" />
                </div>
                <h4 className="text-sm font-semibold text-[#2B3E4E] uppercase tracking-wider">
                  Career Path Overview
                </h4>
              </div>
              <p className="text-gray-700 leading-relaxed text-justify text-sm hyphens-auto">
                {careerPath.careerPathDescription}
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Careers Modal */}
      <CareersModal />
    </>
  );
};

export default CareerPathCard;