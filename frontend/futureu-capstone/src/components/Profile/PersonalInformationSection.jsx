import React from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Calendar } from 'lucide-react';

const PersonalInformationSection = ({ 
  user, 
  editMode, 
  editData, 
  onInputChange,
  // Add mascot props
  activeMascot,
  getCurrentMascotImage,
  getMascotMessage,
  mascotWiggle,
  setMascotWiggle
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 md:p-8 border border-white/20 relative overflow-visible"
    >
      {/* Card Background - Responsive */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1D63A1]/5 via-transparent to-[#FFB71B]/5 rounded-2xl sm:rounded-3xl"></div>
      <div className="absolute top-3 sm:top-6 right-3 sm:right-6 w-16 sm:w-20 md:w-24 h-16 sm:h-20 md:h-24 bg-gradient-to-br from-[#1D63A1]/10 to-transparent rounded-full blur-xl"></div>
      
      {/* Overlapping Mascot - Responsive positioning and sizing */}
      <div className="absolute -top-8 sm:-top-12 md:-top-16 -right-6 sm:-right-8 md:-right-12 z-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="relative"
        >
          {/* Speech Bubble - Now positioned at the top of the mascot */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.4 }}
            className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 sm:mb-3 md:mb-4 bg-white/95 backdrop-blur-sm rounded-xl sm:rounded-2xl p-2 sm:p-3 md:p-4 shadow-xl border border-[#FFB71B]/20 min-w-[180px] sm:min-w-[240px] md:min-w-[280px] max-w-[200px] sm:max-w-[260px] md:max-w-[300px] z-30"
          >
            <p className="text-xs sm:text-sm text-gray-700 font-medium leading-relaxed text-center">
              {getMascotMessage()}
            </p>
            {/* Speech bubble arrow pointing down toward mascot - Responsive sizing */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2">
              <div className="w-0 h-0 border-l-4 sm:border-l-6 md:border-l-8 border-l-transparent border-r-4 sm:border-r-6 md:border-r-8 border-r-transparent border-t-4 sm:border-t-6 md:border-t-8 border-t-white"></div>
              <div className="absolute -top-0.5 sm:-top-1 md:-top-1 left-0.5 w-0 h-0 border-l-3 sm:border-l-4 md:border-l-6 border-l-transparent border-r-3 sm:border-r-4 md:border-r-6 border-r-transparent border-t-3 sm:border-t-4 md:border-t-6 border-t-[#FFB71B]/10"></div>
            </div>
          </motion.div>
          
          {/* Mascot - Responsive sizing */}
          <motion.img
            src={getCurrentMascotImage()}
            alt="Profile mascot"
            className={`w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 transition-all duration-300 ${
              mascotWiggle ? 'mascot-wiggle' : 'mascot-float'
            }`}
            style={{
              filter: 'drop-shadow(0 8px 16px rgba(255, 183, 27, 0.4)) drop-shadow(0 4px 8px rgba(255, 183, 27, 0.6))',
              cursor: 'pointer'
            }}
            onClick={() => {
              setMascotWiggle(true);
              setTimeout(() => setMascotWiggle(false), 700);
            }}
            animate={{
              y: [0, -6, 0],
              rotate: [0, 2, -2, 0]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>
      </div>

      {/* Section Header - Responsive spacing and sizing */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 relative z-10 space-y-4 sm:space-y-0">
        <div className="flex items-center">
          <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-[#FFB71B]/20 to-[#FF9800]/20 rounded-xl sm:rounded-2xl flex items-center justify-center mr-4 sm:mr-6 shadow-lg">
            <User className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-[#1D63A1]" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-[#232D35] mb-1">Personal Information</h3>
            <p className="text-sm sm:text-base text-gray-600 leading-tight">Your basic personal details and contact information</p>
          </div>
        </div>
      </div>

      {/* Form Grid - Responsive grid and spacing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 relative z-10">
        {/* First Name */}
        <FormField
          label="First Name"
          value={editData.firstName || ''}
          placeholder="Enter your first name"
          editMode={editMode}
          onChange={(value) => onInputChange('firstName', value)}
          displayValue={user?.firstName || 'Not provided'}
        />

        {/* Last Name */}
        <FormField
          label="Last Name"
          value={editData.lastname || ''}
          placeholder="Enter your last name"
          editMode={editMode}
          onChange={(value) => onInputChange('lastname', value)}
          displayValue={user?.lastname || 'Not provided'}
        />

        {/* Email */}
        <FormField
          label="Email"
          value={editData.email || ''}
          placeholder="Enter your email"
          editMode={editMode}
          onChange={(value) => onInputChange('email', value)}
          displayValue={user?.email || 'Not provided'}
          type="email"
        />

        {/* Contact Number */}
        <FormField
          label="Contact Number"
          value={editData.contactNumber || ''}
          placeholder="Enter your contact number"
          editMode={editMode}
          onChange={(value) => onInputChange('contactNumber', value)}
          displayValue={user?.contactNumber || 'Not provided'}
          type="tel"
        />

        {/* Age */}
        <FormField
          label="Age"
          value={editData.age || ''}
          placeholder="Enter your age"
          editMode={editMode}
          onChange={(value) => onInputChange('age', value)}
          displayValue={`${user?.age || 'Not provided'} ${user?.age ? 'years old' : ''}`}
          type="number"
        />

        {/* School Code */}
        <FormField
          label="School Code"
          value={editData.schoolCode || ''}
          placeholder="Enter your school code"
          editMode={editMode}
          onChange={(value) => onInputChange('schoolCode', value)}
          displayValue={user?.schoolCode || 'Not provided'}
        />

        {/* Address - Full Width - Responsive spacing */}
        <div className="md:col-span-2">
          <label className="block text-sm font-bold text-gray-700 mb-2 sm:mb-3">Address</label>
          {editMode ? (
            <textarea
              value={editData.address || ''}
              onChange={(e) => onInputChange('address', e.target.value)}
              className="w-full p-3 sm:p-4 border-2 border-gray-200/50 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#FFB71B] focus:border-[#FFB71B] transition-all bg-white/70 backdrop-blur-sm focus:bg-white shadow-sm resize-none text-sm sm:text-base"
              placeholder="Enter your full address"
              rows={3}
            />
          ) : (
            <div className="p-3 sm:p-4 bg-gradient-to-r from-gray-50/80 to-white/80 backdrop-blur-sm rounded-lg sm:rounded-xl border border-gray-200/50 shadow-sm min-h-[60px] sm:min-h-[80px]">
              <div className="flex items-start">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-[#FFB71B] mt-0.5 sm:mt-1 flex-shrink-0" />
                <p className="text-sm sm:text-base text-gray-900 font-semibold leading-relaxed">
                  {user?.address || 'Not provided'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Enhanced Reusable FormField component with responsive design
const FormField = ({ label, value, placeholder, editMode, onChange, displayValue, type = "text" }) => (
  <div>
    <label className="block text-sm font-bold text-gray-700 mb-2 sm:mb-3">{label}</label>
    {editMode ? (
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-3 sm:p-4 border-2 border-gray-200/50 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#FFB71B] focus:border-[#FFB71B] transition-all bg-white/70 backdrop-blur-sm focus:bg-white shadow-sm text-sm sm:text-base"
        placeholder={placeholder}
        min={type === "number" ? "1" : undefined}
        max={type === "number" ? "120" : undefined}
      />
    ) : (
      <div className="p-3 sm:p-4 bg-gradient-to-r from-gray-50/80 to-white/80 backdrop-blur-sm rounded-lg sm:rounded-xl border border-gray-200/50 shadow-sm min-h-[44px] sm:min-h-[52px] flex items-center">
        <p className="text-sm sm:text-base text-gray-900 font-semibold">{displayValue}</p>
      </div>
    )}
  </div>
);

export default PersonalInformationSection;