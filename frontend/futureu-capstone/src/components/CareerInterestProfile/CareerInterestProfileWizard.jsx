import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  ChevronLeft, 
  Heart, 
  Target, 
  Star, 
  Users, 
  Building, 
  GraduationCap,
  Clock,
  CheckCircle,
  X,
  Sparkles
} from 'lucide-react';
import authService from '../../services/authService';
import careerInterestProfileService from '../../services/careerInterestProfileService';

const CareerInterestProfileWizard = ({ onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({
    mainInterestsHobbies: '',
    dreamCareer: '',
    personalStrengthsSkills: '',
    careerValues: '',
    preferredWorkEnvironment: '',
    educationTrainingAspirations: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Question configuration with icons and placeholders - Updated with app's color scheme
  const questions = [
    {
      id: 'mainInterestsHobbies',
      title: 'What are your main interests and hobbies?',
      subtitle: 'Tell us what you enjoy doing in your free time',
      icon: <Heart className="w-8 h-8" />,
      placeholder: "I enjoy building and fixing computers, reading science fiction books, and playing basketball with friends on the weekends.",
      color: 'from-[#2B3E4E] via-[#1D63A1] to-[#FFB71B]',
      iconBg: 'bg-pink-100',
      iconColor: 'text-pink-600'
    },
    {
      id: 'dreamCareer',
      title: 'What is your dream career or ideal occupation?',
      subtitle: 'Describe your perfect job or career path',
      icon: <Target className="w-8 h-8" />,
      placeholder: "My dream career is to become a mechanical engineer so I can design innovative machines and help solve real-world problems.",
      color: 'from-[#1D63A1] via-[#2B3E4E] to-[#FFB71B]',
      iconBg: 'bg-blue-100',
      iconColor: 'text-[#1D63A1]'
    },
    {
      id: 'personalStrengthsSkills',
      title: 'What personal strengths or skills do you have?',
      subtitle: 'What are you naturally good at?',
      icon: <Star className="w-8 h-8" />,
      placeholder: "I am very good at logical thinking and problem-solving. I also communicate clearly and get along well with others in group projects.",
      color: 'from-[#FFB71B] via-[#1D63A1] to-[#2B3E4E]',
      iconBg: 'bg-amber-100',
      iconColor: 'text-[#FFB71B]'
    },
    {
      id: 'careerValues',
      title: 'What do you value most in a career?',
      subtitle: 'What matters most to you in your future job?',
      icon: <Users className="w-8 h-8" />,
      placeholder: "I value creativity and making a positive difference in society. I hope to work in a career where I can help others and keep learning new things.",
      color: 'from-[#2B3E4E] via-[#FFB71B] to-[#1D63A1]',
      iconBg: 'bg-green-100',
      iconColor: 'text-emerald-600'
    },
    {
      id: 'preferredWorkEnvironment',
      title: 'What type of working environment do you prefer?',
      subtitle: 'Describe your ideal workplace',
      icon: <Building className="w-8 h-8" />,
      placeholder: "I prefer working in a team-based environment where everyone collaborates and supports each other. I also appreciate flexible work hours when possible.",
      color: 'from-[#1D63A1] via-[#FFB71B] to-[#2B3E4E]',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600'
    },
    {
      id: 'educationTrainingAspirations',
      title: 'What are your education or training aspirations?',
      subtitle: 'What do you want to study or learn?',
      icon: <GraduationCap className="w-8 h-8" />,
      placeholder: "I would like to study engineering in college and earn professional certifications in robotics or computer-aided design after graduation.",
      color: 'from-[#FFB71B] via-[#2B3E4E] to-[#1D63A1]',
      iconBg: 'bg-indigo-100',
      iconColor: 'text-indigo-600'
    }
  ];

  const handleInputChange = (value) => {
    setAnswers(prev => ({
      ...prev,
      [questions[currentStep].id]: value
    }));
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      await careerInterestProfileService.createProfile(currentUser.id, answers);
      onComplete();
    } catch (err) {
      console.error('Error creating career interest profile:', err);
      setError('Failed to save your profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isCurrentStepAnswered = () => {
    return answers[questions[currentStep].id]?.trim().length > 0;
  };

  const getCompletedStepsCount = () => {
    return Object.values(answers).filter(answer => answer?.trim().length > 0).length;
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden border border-gray-100"
      >
        {/* Header with App's Signature Design */}
        <div className={`bg-gradient-to-r ${questions[currentStep].color} p-8 text-white relative overflow-hidden`}>
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 right-4">
              <Sparkles className="w-12 h-12" />
            </div>
            <div className="absolute bottom-4 left-8">
              <div className="w-20 h-20 bg-white/20 rounded-full blur-xl"></div>
            </div>
          </div>
          
          
          {/* Header Content */}
          <div className="flex items-center mb-8 relative z-10">
            <div className={`${questions[currentStep].iconBg} p-5 rounded-2xl mr-6 shadow-lg`}>
              <div className={questions[currentStep].iconColor}>
                {questions[currentStep].icon}
              </div>
            </div>
            <div>
              <div className="flex items-center mb-2">
                <h1 className="text-3xl font-bold">Let's Get to Know You!</h1>
                <Sparkles className="w-6 h-6 ml-2 text-[#FFB71B]" />
              </div>
              <p className="text-white/90 text-lg font-medium">
                Help us personalize your career journey with FutureU
              </p>
            </div>
          </div>

          {/* Enhanced Progress Bar */}
          <div className="mb-6 relative z-10">
            <div className="flex justify-between items-center text-sm mb-3">
              <span className="font-semibold">Question {currentStep + 1} of {questions.length}</span>
              <div className="flex items-center space-x-2">
                <span>{getCompletedStepsCount()}/{questions.length} completed</span>
                <div className="bg-white/20 px-2 py-1 rounded-full text-xs font-medium">
                  {Math.round(((currentStep + 1) / questions.length) * 100)}%
                </div>
              </div>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden shadow-inner">
              <motion.div 
                className="bg-white h-3 rounded-full shadow-lg"
                initial={{ width: 0 }}
                animate={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
            
            {/* Step Indicators */}
            <div className="flex justify-between mt-3">
              {questions.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index <= currentStep
                      ? 'bg-white shadow-lg scale-110'
                      : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-[#232D35] mb-4">
                  {questions[currentStep].title}
                </h2>
                <p className="text-gray-600 text-xl leading-relaxed max-w-3xl mx-auto">
                  {questions[currentStep].subtitle}
                </p>
              </div>

              <div className="mb-8">
                <div className="relative">
                  <textarea
                    value={answers[questions[currentStep].id]}
                    onChange={(e) => handleInputChange(e.target.value)}
                    placeholder={questions[currentStep].placeholder}
                    rows={7}
                    className="w-full p-8 border-3 border-gray-200 rounded-3xl focus:ring-4 focus:ring-[#FFB71B]/20 focus:border-[#FFB71B] transition-all duration-300 resize-none text-lg leading-relaxed placeholder-gray-400 shadow-lg"
                    style={{
                      fontFamily: 'inherit',
                      background: 'linear-gradient(to bottom right, #f8f9fa, #ffffff)'
                    }}
                  />
                  {/* Character Counter */}
                  <div className="absolute bottom-4 right-6 text-sm text-gray-400">
                    {answers[questions[currentStep].id]?.length || 0} characters
                  </div>
                </div>
                
                {/* Enhanced Tip */}
                <div className="mt-4 flex items-start space-x-3 bg-gradient-to-r from-[#FFB71B]/10 to-[#1D63A1]/10 p-4 rounded-2xl border border-[#FFB71B]/20">
                  <div className="bg-[#FFB71B]/20 p-2 rounded-lg flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-[#FFB71B]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#232D35] mb-1">💡 Pro Tip</p>
                    <p className="text-sm text-gray-600">
                      Be as detailed as possible to get better career recommendations! The more you share, the more personalized your results will be.
                    </p>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 mb-6 flex items-center space-x-3"
                >
                  <div className="bg-red-100 p-2 rounded-lg">
                    <X className="w-5 h-5 text-red-600" />
                  </div>
                  <p className="text-red-700 font-medium">{error}</p>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="border-t-2 border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100 p-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              {currentStep > 0 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePrevious}
                  className="flex items-center px-6 py-3 border-2 border-gray-300 rounded-2xl text-gray-700 hover:bg-white hover:border-gray-400 transition-all duration-200 font-medium shadow-sm"
                >
                  <ChevronLeft className="w-5 h-5 mr-2" />
                  Previous
                </motion.button>
              )}
              
              <button
                onClick={onSkip}
                className="px-6 py-3 text-gray-500 hover:text-gray-700 transition-colors font-medium"
              >
                Skip for now
              </button>
            </div>

            <div className="flex items-center space-x-4">
              {currentStep < questions.length - 1 ? (
                <motion.button
                  whileHover={{ scale: isCurrentStepAnswered() ? 1.05 : 1 }}
                  whileTap={{ scale: isCurrentStepAnswered() ? 0.95 : 1 }}
                  onClick={handleNext}
                  disabled={!isCurrentStepAnswered()}
                  className={`flex items-center px-8 py-4 rounded-2xl font-bold transition-all duration-300 shadow-lg ${
                    isCurrentStepAnswered()
                      ? 'bg-gradient-to-r from-[#FFB71B] to-[#FFB71B]/90 text-[#2B3E4E] hover:shadow-xl transform hover:-translate-y-0.5'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Continue
                  <ChevronRight className="w-5 h-5 ml-2" />
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: (!isSubmitting && isCurrentStepAnswered()) ? 1.05 : 1 }}
                  whileTap={{ scale: (!isSubmitting && isCurrentStepAnswered()) ? 0.95 : 1 }}
                  onClick={handleSubmit}
                  disabled={isSubmitting || !isCurrentStepAnswered()}
                  className={`flex items-center px-8 py-4 rounded-2xl font-bold transition-all duration-300 shadow-lg ${
                    !isSubmitting && isCurrentStepAnswered()
                      ? 'bg-gradient-to-r from-[#1D63A1] to-[#2B3E4E] text-white hover:shadow-xl transform hover:-translate-y-0.5'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Saving Profile...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Complete Profile
                    </>
                  )}
                </motion.button>
              )}
            </div>
          </div>
          
          {/* Footer Info */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 flex items-center justify-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>Takes about 5 minutes • Your data is secure and private</span>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CareerInterestProfileWizard;