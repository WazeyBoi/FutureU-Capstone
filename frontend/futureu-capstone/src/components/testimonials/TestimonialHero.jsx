import React from 'react';
import { motion } from 'framer-motion';
import { FaStar, FaUserGraduate, FaGraduationCap } from 'react-icons/fa';

const TestimonialHero = () => {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  const statsData = [
    { 
      icon: <FaUserGraduate className="text-yellow-500 text-2xl" />,
      count: "1,200+",
      label: "Alumni Stories"
    },
    { 
      icon: <FaStar className="text-yellow-500 text-2xl" />,
      count: "4.8",
      label: "Average Rating"
    },
    { 
      icon: <FaGraduationCap className="text-yellow-500 text-2xl" />,
      count: "25+",
      label: "Schools"
    }
  ];

  return (
    <div className="relative bg-[#0a1930] text-white">
      <div className="absolute inset-0 bg-[url('/src/assets/pattern-bg.png')] opacity-10"></div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <motion.h1 
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <span className="text-yellow-400">Testimonials</span>
          </motion.h1>

          <motion.p 
            className="text-xl md:text-2xl max-w-3xl mx-auto mb-12"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ delay: 0.2 }}
          >
            Real experiences from alumni and current students to guide your college journey
          </motion.p>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ delay: 0.4 }}
          >
            {statsData.map((stat, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-6 backdrop-filter">
                <div className="flex justify-center mb-3">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-white">{stat.count}</div>
                <div className="text-gray-300">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
      
      {/* Wave divider */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full">
          <path
            fill="#f9fafb" /* This should match your gray-50 background */
            fillOpacity="1"
            d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,149.3C960,160,1056,160,1152,138.7C1248,117,1344,75,1392,53.3L1440,32L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
      </div>
    </div>
  );
};

export default TestimonialHero; 