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
      className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 relative h-full"
    >
      {/* Mascot Section */}
      <div className="absolute -top-8 -right-8 z-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          className="relative"
        >
          {/* Speech Bubble */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
            className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 bg-white rounded-xl p-3 shadow-lg border border-yellow-200 min-w-[200px] max-w-[250px] z-30"
          >
            <p className="text-sm text-gray-700 font-medium leading-relaxed text-center">
              {getMascotMessage()}
            </p>
            {/* Speech bubble arrow */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2">
              <div className="w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-white"></div>
            </div>
          </motion.div>
          
          {/* Mascot */}
          <motion.img
            src={getCurrentMascotImage()}
            alt="Profile mascot"
            className={`w-20 h-20 transition-all duration-300 ${
              mascotWiggle ? 'mascot-wiggle' : 'mascot-float'
            }`}
            style={{
              filter: 'drop-shadow(0 4px 8px rgba(255, 183, 27, 0.3)) drop-shadow(0 8px 16px rgba(255, 183, 27, 0.2))',
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

      {/* Header Section */}
      <div className="flex items-center mb-6">
        <div className="w-12 h-12 bg-[#232D35] rounded-full flex items-center justify-center shadow-sm mr-4">
          <User className="w-6 h-6 text-white" />
        </div>
        <div className="text-left">
          <h3 className="text-2xl font-bold text-[#232D35] mb-1">Personal Information</h3>
          <p className="text-gray-600 text-sm">Your basic personal details and contact information</p>
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

        {/* Address - Full Width */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-[#232D35] mb-2 text-left">Address</label>
          {editMode ? (
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-4 h-4 text-[#232D35]" />
              <textarea
                value={editData.address || ''}
                onChange={(e) => onInputChange('address', e.target.value)}
                className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#232D35] focus:border-[#232D35] transition-all bg-gray-50 text-sm resize-none text-left"
                placeholder="Enter your full address"
                rows={3}
              />
            </div>
          ) : (
            <div className="p-3 bg-gray-50 border border-gray-300 rounded-lg min-h-[60px] flex items-start">
              <MapPin className="w-4 h-4 text-[#232D35] mr-2 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-[#232D35] font-medium leading-relaxed text-left">
                {user?.address || 'Not provided'}
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// FormField component with clean design
const FormField = ({ label, value, placeholder, editMode, onChange, displayValue, type = "text" }) => (
  <div>
    <label className="block text-sm font-medium text-[#232D35] mb-2 text-left">{label}</label>
    {editMode ? (
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#232D35] focus:border-[#232D35] transition-all bg-gray-50 text-sm text-left"
        placeholder={placeholder}
        min={type === "number" ? "1" : undefined}
        max={type === "number" ? "120" : undefined}
      />
    ) : (
      <div className="p-3 bg-gray-50 border border-gray-300 rounded-lg min-h-[44px] flex items-center">
        <p className="text-sm text-[#232D35] font-medium text-left">{displayValue}</p>
      </div>
    )}
  </div>
);

export default PersonalInformationSection;