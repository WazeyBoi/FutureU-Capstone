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
      className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20 relative overflow-visible"
    >
      {/* Card Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1D63A1]/5 via-transparent to-[#FFB71B]/5 rounded-3xl"></div>
      <div className="absolute top-6 right-6 w-24 h-24 bg-gradient-to-br from-[#1D63A1]/10 to-transparent rounded-full blur-xl"></div>
      
      {/* Overlapping Mascot - Top Right */}
      <div className="absolute -top-16 -right-12 z-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="relative"
        >
          {/* Mascot */}
          <motion.img
            src={getCurrentMascotImage()}
            alt="Profile mascot"
            className={`w-40 h-40 transition-all duration-300 ${
              mascotWiggle ? 'mascot-wiggle' : 'mascot-float'
            }`}
            style={{
              filter: 'drop-shadow(0 16px 24px rgba(255, 183, 27, 0.5))',
              cursor: 'pointer'
            }}
            onClick={() => {
              setMascotWiggle(true);
              setTimeout(() => setMascotWiggle(false), 700);
            }}
            animate={{
              y: [0, -10, 0],
              rotate: [0, 3, -3, 0]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {/* Speech Bubble - Positioned to the Right of Mascot - Made Wider */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, duration: 0.4 }}
            className="absolute top-1/2 left-full transform -translate-y-1/2 ml-4 bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-[#FFB71B]/20 min-w-[340px] max-w-[380px] z-30"
          >
            <p className="text-sm text-gray-700 font-medium leading-relaxed">
              {getMascotMessage()}
            </p>
            {/* Speech bubble arrow pointing left toward mascot */}
            <div className="absolute right-full top-1/2 transform -translate-y-1/2">
              <div className="w-0 h-0 border-t-8 border-t-transparent border-r-8 border-r-white border-b-8 border-b-transparent"></div>
              <div className="absolute top-1 right-0.5 w-0 h-0 border-t-6 border-t-transparent border-r-6 border-r-[#FFB71B]/10 border-b-6 border-b-transparent"></div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Section Header */}
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center">
          <div className="w-16 h-16 bg-gradient-to-br from-[#FFB71B]/20 to-[#FF9800]/20 rounded-2xl flex items-center justify-center mr-6 shadow-lg">
            <User className="w-8 h-8 text-[#1D63A1]" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-[#232D35] mb-1">Personal Information</h3>
            <p className="text-gray-600">Your basic personal details and contact information</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
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
        />

        {/* Contact Number */}
        <FormField
          label="Contact Number"
          value={editData.contactNumber || ''}
          placeholder="Enter your contact number"
          editMode={editMode}
          onChange={(value) => onInputChange('contactNumber', value)}
          displayValue={user?.contactNumber || 'Not provided'}
        />

        {/* Age */}
        <FormField
          label="Age"
          value={editData.age || ''}
          placeholder="Enter your age"
          editMode={editMode}
          onChange={(value) => onInputChange('age', value)}
          displayValue={`${user?.age || 'Not provided'} ${user?.age ? 'years old' : ''}`}
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

        {/* Address - Full Width */}
        <div className="md:col-span-2">
          <label className="block text-sm font-bold text-gray-700 mb-3">Address</label>
          {editMode ? (
            <textarea
              value={editData.address || ''}
              onChange={(e) => onInputChange('address', e.target.value)}
              className="w-full p-4 border-2 border-gray-200/50 rounded-xl focus:ring-2 focus:ring-[#FFB71B] focus:border-[#FFB71B] transition-all bg-white/70 backdrop-blur-sm focus:bg-white shadow-sm resize-none"
              placeholder="Enter your full address"
              rows={3}
            />
          ) : (
            <div className="p-4 bg-gradient-to-r from-gray-50/80 to-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm min-h-[80px]">
              <div className="flex items-start">
                <MapPin className="w-5 h-5 mr-3 text-[#FFB71B] mt-1 flex-shrink-0" />
                <p className="text-gray-900 font-semibold leading-relaxed">
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

// Reusable FormField component
const FormField = ({ label, value, placeholder, editMode, onChange, displayValue }) => (
  <div>
    <label className="block text-sm font-bold text-gray-700 mb-3">{label}</label>
    {editMode ? (
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-4 border-2 border-gray-200/50 rounded-xl focus:ring-2 focus:ring-[#FFB71B] focus:border-[#FFB71B] transition-all bg-white/70 backdrop-blur-sm focus:bg-white shadow-sm"
        placeholder={placeholder}
      />
    ) : (
      <div className="p-4 bg-gradient-to-r from-gray-50/80 to-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm">
        <p className="text-gray-900 font-semibold">{displayValue}</p>
      </div>
    )}
  </div>
);

export default PersonalInformationSection;