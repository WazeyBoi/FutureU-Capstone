import React from 'react';
import { TrendingUp, TrendingDown, Minus, Circle, ChevronUp } from "lucide-react"; 

const CareerLegend = ({ getTrendStyle, getTrendIcon }) => {
    return (
        <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex flex-wrap gap-3 items-center">
                <span className="text-sm font-medium text-gray-700">Job Demand:</span>
                <div className="flex items-center px-3 py-1.5 bg-purple-100 rounded-full">
                    <TrendingUp className="w-3.5 h-3.5 text-purple-600 mr-1.5" />
                    <span className="text-xs font-medium text-purple-800">Very High Demand</span>
                </div>
                <div className="flex items-center px-3 py-1.5 bg-green-100 rounded-full">
                    <ChevronUp className="w-3.5 h-3.5 text-green-600 mr-1.5" />
                    <span className="text-xs font-medium text-green-800">High Demand</span>
                </div>
                <div className="flex items-center px-3 py-1.5 bg-blue-100 rounded-full">
                    <Circle className="w-3.5 h-3.5 text-blue-600 mr-1.5" />
                    <span className="text-xs font-medium text-blue-800">Moderate Demand</span>
                </div>
                <div className="flex items-center px-3 py-1.5 bg-yellow-100 rounded-full">
                    <Minus className="w-3.5 h-3.5 text-yellow-600 mr-1.5" />
                    <span className="text-xs font-medium text-yellow-800">Stable Demand</span>
                </div>
                <div className="flex items-center px-3 py-1.5 bg-orange-100 rounded-full">
                    <TrendingUp className="w-3.5 h-3.5 text-orange-600 mr-1.5" />
                    <span className="text-xs font-medium text-orange-800">Growing Demand</span>
                </div>
                <span className="ml-4 text-sm font-medium text-gray-700 border-l border-gray-300 pl-4">Salary:</span>
                <span className="text-xs text-gray-600">All values shown in PHP (₱)</span>
            </div>
        </div>
    );
};

export default CareerLegend;