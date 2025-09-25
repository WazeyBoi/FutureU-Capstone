import React from 'react';
import { TrendingUp, TrendingDown, Minus, Circle, ChevronUp } from "lucide-react"; 

const CareerLegend = ({ getTrendStyle, getTrendIcon }) => {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex flex-wrap gap-4 items-center">
                <span className="text-sm font-semibold text-[#2B3E4E]">Demand Levels:</span>
                {/* Very High Demand */}
                <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#FFB71B] text-white">
                        Very High
                    </span>
                    <span className="text-xs text-gray-600">Very High Demand</span>
                </div>
                {/* Stable Demand */}
                <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-600 text-white">
                        Stable
                    </span>
                    <span className="text-xs text-gray-600">Stable Demand</span>
                </div>
                {/* High Demand */}
                <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#FFB71B] text-white">
                        High
                    </span>
                    <span className="text-xs text-gray-600">High Demand</span>
                </div>
                {/* Moderate Demand */}
                <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500 text-white">
                        Moderate
                    </span>
                    <span className="text-xs text-gray-600">Moderate Demand</span>
                </div>
                {/* Growing Demand */}
                <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#2B3E4E] text-white">
                        Growing
                    </span>
                    <span className="text-xs text-gray-600">Growing Demand</span>
                </div>
                <div className="flex items-center gap-2 border-gray-300">
                    <span className="text-sm font-semibold text-[#2B3E4E]">Salary:</span>
                    <span className="text-xs text-gray-600">All values shown in PHP (₱)</span>
                </div>
            </div>
        </div>
    );
};

export default CareerLegend;