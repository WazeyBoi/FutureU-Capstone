import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Target, Star, ChevronRight, Clock, Sparkles } from 'lucide-react';

const ProfilePrompt = ({ onSetupNow, onSetupLater }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 max-w-2xl mx-auto"
    >
      {/* Header with navy blue background */}
      <div className="bg-[#2B3E4E] p-8 text-white relative">
        <div className="relative z-10 text-center">
          <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl w-fit mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-[#FFB71B]" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-shadow">
            Complete Your Career Profile
          </h2>
          <p className="text-blue-100 leading-relaxed">
            Get personalized recommendations tailored just for you
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        {/* Feature cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="flex items-center p-4 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl border border-pink-100">
            <div className="bg-pink-100 p-2 rounded-xl mr-3">
              <Heart className="w-5 h-5 text-pink-600" />
            </div>
            <div>
              <h3 className="font-semibold text-[#232D35] text-sm">Interests</h3>
              <p className="text-xs text-gray-600">Share what you love</p>
            </div>
          </div>
          
          <div className="flex items-center p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-100">
            <div className="bg-amber-100 p-2 rounded-xl mr-3">
              <Star className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-[#232D35] text-sm">Strengths</h3>
              <p className="text-xs text-gray-600">Highlight your skills</p>
            </div>
          </div>
          
          <div className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
            <div className="bg-blue-100 p-2 rounded-xl mr-3">
              <Target className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-[#232D35] text-sm">Goals</h3>
              <p className="text-xs text-gray-600">Define your dreams</p>
            </div>
          </div>
        </div>

        {/* Benefits section */}
        <div className="bg-gradient-to-r from-[#FFB71B]/10 to-[#FF9800]/10 rounded-2xl p-6 mb-8 border border-[#FFB71B]/20">
          <div className="flex items-start">
            <div className="bg-[#FFB71B]/20 p-3 rounded-xl mr-4 flex-shrink-0">
              <Sparkles className="w-6 h-6 text-[#FFB71B]" />
            </div>
            <div>
              <h4 className="font-bold text-[#232D35] mb-2">Why complete your profile?</h4>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-[#1D63A1] rounded-full mr-3"></div>
                  <span>Get <strong>3x more relevant</strong> career recommendations</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-[#1D63A1] rounded-full mr-3"></div>
                  <span>Access personalized academic pathways</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-[#1D63A1] rounded-full mr-3"></div>
                  <span>Discover matching career opportunities</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={onSetupNow}
            className="flex-1 bg-[#2B3E4E] hover:bg-[#FFB71B] text-white px-8 py-4 rounded-xl font-bold hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center group cursor-pointer"
          >
            <span>Set Up Now</span>
            <ChevronRight className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" />
          </button>
          
          <button
            onClick={onSetupLater}
            className="flex-1 sm:flex-none bg-white border-2 border-gray-200 text-[#232D35] px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 hover:border-[#FFB71B] transition-all duration-300 flex items-center justify-center group cursor-pointer"
          >
            <Clock className="w-5 h-5 mr-2 text-gray-500 group-hover:text-[#FFB71B] transition-colors duration-300" />
            <span>Setup Later</span>
          </button>
        </div>

        {/* Footer note */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            Takes about 5 minutes • You can always update this later
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfilePrompt;