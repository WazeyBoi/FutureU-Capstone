import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Sparkles } from 'lucide-react';

const ProfileHeader = ({ getMascotMessage }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 relative"
    >
      {/* Header Card */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center">
          {/* Logo Icon */}
          <div className="relative mr-4">
            <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center shadow-sm">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
              <Sparkles className="w-2 h-2 text-white" />
            </div>
          </div>

          {/* Title and Description */}
          <div className="text-left">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              My Profile
            </h1>
            <p className="text-sm text-gray-600">
              Manage your personal information and career preferences to unlock your full potential
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfileHeader;