import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, X, TrendingUp, TrendingDown, List } from 'lucide-react';

const TopCareerPathsModal = ({ isOpen, onClose, topCareerPaths, totalRecommendations }) => {
  const [showFilter, setShowFilter] = useState('all'); // 'top', 'bottom', or 'all'

  if (!isOpen) return null;

  // Get filtered data based on selected filter
  const getFilteredData = () => {
    if (showFilter === 'top') {
      return topCareerPaths.slice(0, 5);
    } else if (showFilter === 'bottom') {
      return [...topCareerPaths].reverse().slice(0, 5);
    }
    return topCareerPaths; // Show all
  };

  const filteredData = getFilteredData();

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" 
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-[#2B3E4E] p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {/* <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mr-3">
                <GraduationCap className="w-5 h-5" />
              </div> */}
              <div>
                <h3 className="text-left text-xl font-bold">All Top Career Paths</h3>
                <p className="text-sm text-white/80">Institution-wide career pathway trends</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#FFB71B] text-[#FFB71B] hover:text-white rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Toggle */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 font-medium">Show:</span>
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilter('top')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  showFilter === 'top'
                    ? 'bg-[#FFB71B] text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                Top 5
              </button>
              <button
                onClick={() => setShowFilter('bottom')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  showFilter === 'bottom'
                    ? 'bg-[#FFB71B] text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <TrendingDown className="w-4 h-4" />
                Bottom 5
              </button>
              <button
                onClick={() => setShowFilter('all')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  showFilter === 'all'
                    ? 'bg-[#FFB71B] text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <List className="w-4 h-4" />
                Show All ({topCareerPaths.length})
              </button>
            </div>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-180px)]">
          <div className="space-y-2">
            {filteredData.map((cp, i) => {
              const percent = totalRecommendations > 0 ? ((cp.count / totalRecommendations) * 100).toFixed(1) : '0';
              return (
                <div 
                  key={i} 
                  className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-[#FFB71B]/5 to-transparent hover:from-[#FFB71B]/10 transition-colors border border-[#FFB71B]/20"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="flex-shrink-0 w-8 h-8 rounded-lg shadow-inner text-[#2B3E4E] font-bold text-sm flex items-center justify-center">
                      {i + 1}
                    </span>
                    <span className="font-medium text-[#2B3E4E] truncate">{cp.name}</span>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-sm text-[#2B3E4E]/70">{cp.count} recommendations</span>
                    <span className="text-lg font-bold text-[#FFB71B]">{percent}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TopCareerPathsModal;
