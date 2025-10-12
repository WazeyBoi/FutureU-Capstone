import React from 'react';
import { motion } from 'framer-motion';
import { Target, Edit, CheckCircle, Heart, Star, Users, Building, GraduationCap, Sparkles, Award, TrendingUp, RefreshCw, Zap } from 'lucide-react';
import excited from '../../assets/characters/excited.svg';
import quirky from '../../assets/characters/quirky.svg';

const CareerInterestProfileSection = ({ 
  hasProfile, 
  interestProfile, 
  onSetupProfile,
  onEditProfile 
}) => {
  if (hasProfile && interestProfile) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 relative mb-8 col-span-full"
      >
        {/* Header Section */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-[#FFB71B] to-[#FF9800] rounded-3xl flex items-center justify-center shadow-2xl border-4 border-white">
                <Target className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-[#1D63A1] to-[#2B3E4E] rounded-full flex items-center justify-center shadow-lg">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="ml-6">
              <div className="flex items-center mb-2">
                <h3 className="text-3xl font-bold text-[#232D35]">
                  Career Interest Profile
                </h3>
                <div className="ml-3 bg-gradient-to-r from-green-500 to-emerald-400 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                  COMPLETE
                </div>
              </div>
              <p className="text-lg text-gray-600 font-medium">Your personalized career roadmap and future aspirations</p>
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onEditProfile}
            className="bg-[#232D35] hover:bg-[#1D63A1] text-white px-8 py-4 rounded-2xl font-bold transition-all duration-300 hover:shadow-lg flex items-center shadow-md cursor-pointer"
          >
            <Edit className="w-5 h-5 mr-3" />
            <span>Update Interest Profile </span>
          </motion.button>
        </div>

        <div className="relative z-10">
          {/* Interest Cards Grid - 3 columns for better layout */}
          <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-6 mb-8">
            <InterestCard
              icon={<Target className="w-6 h-6 text-white" />}
              title="Dream Career"
              content={interestProfile.dreamCareer}
              bgGradient="from-[#1D63A1] to-[#2B3E4E]"
              borderColor="border-[#1D63A1]/20"
              glowColor="shadow-[#1D63A1]/20"
            />
            
            <InterestCard
              icon={<Heart className="w-6 h-6 text-white" />}
              title="Main Interests"
              content={interestProfile.mainInterestsHobbies}
              bgGradient="from-pink-500 to-rose-500"
              borderColor="border-pink-200/30"
              glowColor="shadow-pink-500/20"
            />
            
            <InterestCard
              icon={<Star className="w-6 h-6 text-white" />}
              title="Personal Strengths"
              content={interestProfile.personalStrengthsSkills}
              bgGradient="from-[#FFB71B] to-[#FF9800]"
              borderColor="border-[#FFB71B]/20"
              glowColor="shadow-[#FFB71B]/20"
            />
            
            <InterestCard
              icon={<Users className="w-6 h-6 text-white" />}
              title="Career Values"
              content={interestProfile.careerValues}
              bgGradient="from-emerald-500 to-green-600"
              borderColor="border-emerald-200/30"
              glowColor="shadow-emerald-500/20"
            />

            <InterestCard
              icon={<Building className="w-6 h-6 text-white" />}
              title="Work Environment"
              content={interestProfile.preferredWorkEnvironment}
              bgGradient="from-purple-500 to-violet-600"
              borderColor="border-purple-200/30"
              glowColor="shadow-purple-500/20"
            />

            <InterestCard
              icon={<GraduationCap className="w-6 h-6 text-white" />}
              title="Education Goals"
              content={interestProfile.educationTrainingAspirations}
              bgGradient="from-indigo-500 to-blue-600"
              borderColor="border-indigo-200/30"
              glowColor="shadow-indigo-500/20"
            />
          </div>
          
          {/* Enhanced Success Section - Focus on Achievement & Advice */}
          <div className="text-center py-12 relative z-10">
            <div className="max-w-5xl mx-auto">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                {/* Left Side - Mascot and Achievement Message */}
                <div className="text-center md:text-left">
                  <div className="flex justify-center md:justify-start mb-6">
                    <motion.img
                      src={quirky}
                      alt="Success mascot"
                      className="w-28 h-28"
                      style={{
                        filter: 'drop-shadow(0 12px 24px rgba(255, 183, 27, 0.4))'
                      }}
                      animate={{
                        y: [0, -8, 0],
                        rotate: [0, 3, -3, 0]
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  </div>
                  
                  <h4 className="text-3xl font-bold text-[#232D35] mb-4 flex items-center justify-center md:justify-start">
                    Excellent Work! 
                    <span className="text-2xl ml-2">🌟</span>
                  </h4>
                  <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                    Your career interest profile is actively working behind the scenes, generating personalized recommendations and unlocking better career matches just for you.
                  </p>
                  
                  {/* Pro Tip Section */}
                  <div className="bg-gradient-to-r from-[#FFB71B]/10 to-[#FF9800]/5 backdrop-blur-sm rounded-2xl p-6 border border-[#FFB71B]/20 shadow-lg">
                    <div className="flex items-start text-left">
                      <div className="bg-gradient-to-br from-[#FFB71B] to-[#FF9800] p-3 rounded-xl mr-4 shadow-lg flex-shrink-0">
                        <Sparkles className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h5 className="font-bold text-[#232D35] mb-2 flex items-center">
                          <span>💡 Pro Tip</span>
                        </h5>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          Update your profile every 6-12 months as your interests evolve. This keeps your recommendations fresh and aligned with your growing aspirations!
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center md:justify-start text-sm text-gray-500 mt-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                    <span>System actively generating recommendations • Profile optimized</span>
                  </div>
                </div>

                {/* Right Side - Benefits & Status Cards */}
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/5 backdrop-blur-sm rounded-2xl p-6 border border-green-200/30 shadow-lg">
                    <div className="flex items-start">
                      <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-3 rounded-xl mr-4 shadow-lg">
                        <Zap className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h5 className="font-bold text-[#232D35] mb-2">Profile Active & Optimized</h5>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          Your interests are powering our recommendation engine to find the perfect academic and career matches for you.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-[#1D63A1]/10 to-[#2B3E4E]/5 backdrop-blur-sm rounded-2xl p-6 border border-[#1D63A1]/20 shadow-lg">
                    <div className="flex items-start">
                      <div className="bg-gradient-to-br from-[#1D63A1] to-[#2B3E4E] p-3 rounded-xl mr-4 shadow-lg">
                        <TrendingUp className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h5 className="font-bold text-[#232D35] mb-2">3x Better Recommendations</h5>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          Receiving highly accurate career matches and academic pathway suggestions tailored to your unique profile.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-purple-500/10 to-violet-500/5 backdrop-blur-sm rounded-2xl p-6 border border-purple-200/30 shadow-lg">
                    <div className="flex items-start">
                      <div className="bg-gradient-to-br from-purple-500 to-violet-600 p-3 rounded-xl mr-4 shadow-lg">
                        <RefreshCw className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h5 className="font-bold text-[#232D35] mb-2">Continuously Evolving</h5>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          Your profile learns and adapts with your changing interests to provide increasingly better guidance over time.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Enhanced Empty State (remains the same)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20 relative overflow-hidden mb-8 col-span-full"
    >
      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1D63A1]/5 via-white/50 to-[#FFB71B]/5 rounded-3xl"></div>
      <div className="absolute -top-4 -right-4 w-32 h-32 bg-gradient-to-br from-[#FFB71B]/20 to-[#FF9800]/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-4 -left-4 w-28 h-28 bg-gradient-to-br from-[#1D63A1]/20 to-[#2B3E4E]/10 rounded-full blur-2xl animate-pulse"></div>

      {/* Header */}
      <div className="flex items-center mb-10 relative z-10">
        <div className="w-20 h-20 bg-gradient-to-br from-[#FFB71B] to-[#FF9800] rounded-3xl flex items-center justify-center shadow-2xl border-4 border-white mr-6">
          <Target className="w-10 h-10 text-white" />
        </div>
        <div>
          <h3 className="text-3xl font-bold bg-gradient-to-r from-[#1D63A1] via-[#2B3E4E] to-[#FFB71B] bg-clip-text text-transparent mb-2">
            Career Interest Profile
          </h3>
          <p className="text-lg text-gray-600 font-medium">Your personalized career roadmap and future aspirations</p>
        </div>
      </div>

      {/* Enhanced Empty State Content */}
      <div className="text-center py-12 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Side - Mascot and CTA */}
            <div className="text-center md:text-left">
              <div className="flex justify-center md:justify-start mb-6">
                <motion.img
                  src={excited}
                  alt="Excited mascot"
                  className="w-24 h-24"
                  style={{
                    filter: 'drop-shadow(0 12px 24px rgba(255, 183, 27, 0.4))'
                  }}
                  animate={{
                    y: [0, -10, 0],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </div>
              
              <h4 className="text-3xl font-bold text-[#232D35] mb-4">
                Let's Get Started! 🚀
              </h4>
              <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                Complete your career interest profile to unlock personalized recommendations, discover your perfect career matches, and get tailored guidance for your academic journey.
              </p>
              
              <div className="space-y-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onSetupProfile}
                  className="w-full md:w-auto bg-gradient-to-r from-[#1D63A1] via-[#2B3E4E] to-[#1D63A1] hover:from-[#FFB71B] hover:via-[#FF9800] hover:to-[#FFB71B] text-white hover:text-[#232D35] px-10 py-4 rounded-2xl font-bold hover:shadow-2xl transform transition-all duration-500 flex items-center justify-center shadow-xl border-2 border-white/20 cursor-pointer"
                >
                  <Sparkles className="w-6 h-6 mr-3" />
                  <span className="text-lg">Set Up Profile Now</span>
                </motion.button>
                
                <div className="flex items-center justify-center md:justify-start text-sm text-gray-500">
                  <div className="w-2 h-2 bg-[#FFB71B] rounded-full mr-2 animate-pulse"></div>
                  <span>Takes only 3-5 minutes • Completely personalized</span>
                </div>
              </div>
            </div>

            {/* Right Side - Benefits */}
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-[#1D63A1]/10 to-[#2B3E4E]/5 backdrop-blur-sm rounded-2xl p-6 border border-[#1D63A1]/20 shadow-lg">
                <div className="flex items-start">
                  <div className="bg-gradient-to-br from-[#1D63A1] to-[#2B3E4E] p-3 rounded-xl mr-4 shadow-lg">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h5 className="font-bold text-[#232D35] mb-2">Get 3x Better Recommendations</h5>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Unlock personalized academic programs and career paths that perfectly match your interests and goals.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-[#FFB71B]/10 to-[#FF9800]/5 backdrop-blur-sm rounded-2xl p-6 border border-[#FFB71B]/20 shadow-lg">
                <div className="flex items-start">
                  <div className="bg-gradient-to-br from-[#FFB71B] to-[#FF9800] p-3 rounded-xl mr-4 shadow-lg">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h5 className="font-bold text-[#232D35] mb-2">Discover Hidden Opportunities</h5>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Find career paths and educational opportunities you never knew existed, tailored to your unique profile.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/5 backdrop-blur-sm rounded-2xl p-6 border border-green-200/30 shadow-lg">
                <div className="flex items-start">
                  <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-3 rounded-xl mr-4 shadow-lg">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h5 className="font-bold text-[#232D35] mb-2">Build Your Success Path</h5>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Create a personalized roadmap to achieve your career goals with step-by-step guidance.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Enhanced Interest Card Component (remains the same)
const InterestCard = ({ icon, title, content, bgGradient, borderColor, glowColor }) => (
  <motion.div 
    whileHover={{ scale: 1.02, y: -4 }}
    className={`group p-6 bg-white/90 backdrop-blur-sm rounded-2xl border-2 ${borderColor} shadow-xl hover:shadow-2xl hover:${glowColor} transition-all duration-300 relative overflow-hidden`}
  >
    {/* Background Gradient Overlay */}
    <div className={`absolute inset-0 bg-gradient-to-br ${bgGradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-2xl`}></div>
    
    {/* Decorative Elements */}
    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-current/10 to-transparent rounded-full blur-xl"></div>
    
    <div className="relative z-10">
      <div className="flex items-center mb-4">
        <div className={`w-12 h-12 bg-gradient-to-br ${bgGradient} rounded-xl flex items-center justify-center mr-4 shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
          {icon}
        </div>
        <h4 className="text-xl font-bold text-[#232D35] group-hover:text-[#1D63A1] transition-colors duration-300">
          {title}
        </h4>
      </div>
      <div className="bg-gray-50/80 backdrop-blur-sm rounded-xl p-4 border border-gray-100">
        <p className="text-gray-700 leading-relaxed font-medium">
          {content || 'Not specified'}
        </p>
      </div>
    </div>
  </motion.div>
);

export default CareerInterestProfileSection;