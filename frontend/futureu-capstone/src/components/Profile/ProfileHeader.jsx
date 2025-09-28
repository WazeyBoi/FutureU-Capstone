import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Sparkles } from 'lucide-react';

const ProfileHeader = ({ getMascotMessage }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center mb-12 relative"
    >
      {/* Main Header Content */}
      <div className="relative mb-8">
        {/* Logo Icon */}
        <div className="relative inline-block mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-[#FFB71B] to-[#FF9800] rounded-2xl flex items-center justify-center shadow-xl border-4 border-white mx-auto">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#1D63A1] rounded-full flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-white" />
          </div>
        </div>

        {/* Centered Title */}
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#1D63A1] via-[#2B3E4E] to-[#FFB71B] bg-clip-text text-transparent drop-shadow-lg mb-2">
            My Profile
          </h1>
          <p className="text-lg text-gray-600 max-w-md mx-auto leading-relaxed">
            Manage your personal information and career preferences to unlock your full potential
          </p>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-[#FFB71B] to-transparent rounded-full"></div>
    </motion.div>
  );
};

export default ProfileHeader;