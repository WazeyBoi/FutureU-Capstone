import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, School, Play, Info } from 'lucide-react';

// Float from left animation variants
const slideInLeft = {
  hidden: { 
    opacity: 0, 
    x: -100 
  },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { 
      duration: 0.8, 
      ease: "easeOut" 
    }
  }
};

const slideInLeftDelayed = {
  hidden: { 
    opacity: 0, 
    x: -80 
  },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { 
      duration: 0.7, 
      ease: "easeOut",
      delay: 0.2
    }
  }
};

const slideInLeftSlow = {
  hidden: { 
    opacity: 0, 
    x: -60 
  },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { 
      duration: 0.6, 
      ease: "easeOut",
      delay: 0.4
    }
  }
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15, delayChildren: 0.1 }
  }
};

const slideInCards = {
  hidden: { 
    opacity: 0, 
    x: -50 
  },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { 
      duration: 0.5, 
      ease: "easeOut" 
    }
  }
};

const HeroHeader = ({ totalPrograms, totalSchools }) => {
  return (
    <div className="relative w-full h-[70vh] min-h-[600px] overflow-hidden">
      {/* Background Image with Netflix-style gradient overlay */}
      <div className="absolute inset-0">
        <img 
          src="/src/assets/Academic Explorer Hero Section Background.png" 
          alt="Academic Explorer Background"
          className="w-full h-full object-cover"
        />
        {/* Netflix-style gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30"></div>
      </div>

      {/* Content Container - Netflix style positioning */}
      <div className="relative z-10 h-full flex items-center py-16">
        <div className="max-w-7xl mx-auto pl-4 pr-4 sm:pl-6 sm:pr-6 lg:pl-8 lg:pr-8 w-full">
          <motion.div 
            className="max-w-3xl ml-0 -ml-8 md:-ml-14 lg:-ml-24"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            {/* Main Title - Left aligned */}
            <motion.div className="mb-6" variants={slideInLeft}>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-none text-left">
                <span className="text-white">Academic </span>
                <span className="text-[#FFB71B]">Explorer</span>
              </h1>
            </motion.div>
            
            {/* Subtitle - Left aligned */}
            <motion.p 
              className="text-base md:text-lg lg:text-xl text-gray-200 mb-8 leading-relaxed max-w-2xl text-left"
              variants={slideInLeftDelayed}
            >
              Discover, compare, and explore top schools and programs in Cebu. 
              <span className="block mt-1">
                Find your perfect academic path with powerful search and insights.
              </span>
            </motion.p>

            {/* Stats and Action Button Layout */}
            <motion.div 
              className="flex flex-wrap items-center gap-4"
              variants={slideInLeftSlow}
            >
              {/* Stats Cards - Wider containers with inline text */}
              <motion.div 
                className="bg-black/40 backdrop-blur-sm rounded-lg px-6 py-4 border border-gray-700/30 min-w-[180px]"
                variants={slideInCards}
                whileHover={{ 
                  scale: 1.05, 
                  transition: { duration: 0.2 } 
                }}
              >
                <div className="flex items-center gap-3">
                  <BookOpen className="text-[#FFB71B] w-7 h-7 flex-shrink-0" />
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-white">
                      {totalPrograms}
                    </span>
                    <span className="text-sm text-gray-300">Programs</span>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                className="bg-black/40 backdrop-blur-sm rounded-lg px-6 py-4 border border-gray-700/30 min-w-[180px]"
                variants={slideInCards}
                whileHover={{ 
                  scale: 1.05, 
                  transition: { duration: 0.2 } 
                }}
              >
                <div className="flex items-center gap-3">
                  <School className="text-[#FFB71B] w-7 h-7 flex-shrink-0" />
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-white">
                      {totalSchools}
                    </span>
                    <span className="text-sm text-gray-300">Schools</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Bottom fade - Netflix style */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#f9fafb] to-transparent pointer-events-none"></div>
    </div>
  );
};

export default HeroHeader;