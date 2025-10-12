import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView, useAnimation } from 'framer-motion';
import { Users, Target, Lightbulb, Heart, Award, Globe, BookOpen, GraduationCap, AlertTriangle, CheckCircle, TrendingUp, Brain, ArrowRight, Mail, Phone, MapPin } from 'lucide-react';

// Import team photos
import johnClyde from '../assets/FutureU_Team/John Clyde Bacarisas.png';
import michaelAndre from '../assets/FutureU_Team/Michael Andre Ligan.png';
import sherween from '../assets/FutureU_Team/Sherween Perolino.png';
import christianHans from '../assets/FutureU_Team/Christian Hans Paras.png';
import aeronRaye from '../assets/FutureU_Team/Aeron Raye Tigley.png';

const AboutUsPage = () => {
  const navigate = useNavigate();

  const handleStartAssessment = () => {
    navigate('/assessment-dashboard');
  };

  const handleExplorePrograms = () => {
    navigate('/academic-explorer');
  };

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const fadeInLeft = {
    hidden: { opacity: 0, x: -60 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const fadeInRight = {
    hidden: { opacity: 0, x: 60 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const staggerItem = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const teamMembers = [
    {
      name: "Bacarisas, John Clyde ",
      role: " Lead Front-End Developer",
      image: johnClyde,
      description: "Creating beautiful and intuitive user interfaces."
    },
    {
      name: "Ligan,Michael Andre",
      role: "Front-End Developer",
      image: michaelAndre,
      description: "Designing exceptional user experiences and interfaces."
    },
    {
      name: "Perolino, Sherween ",
      role: "Team Lead",
      image: sherween,
      description: "Leading the FutureU development team with passion and expertise."
      
    },
    {
      name: "Paras, Christian Hans",
      role: "Lead Back-End Developer",
      image: christianHans,
      description: "Building robust backend systems and API integrations."
    },
    {
      name: "Tigley, Aeron Raye",
      role: "Back-End Developer",
      image: aeronRaye,
      description: "Developing end-to-end solutions for the platform."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-20 px-6 bg-[#F5F5F5]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              className="text-left"
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <motion.h1 
                className="text-5xl md:text-6xl font-bold text-[#2B3E4E] mb-6 leading-tight"
                variants={fadeInUp}
              >
                About <motion.span 
                  className="text-[#FFB71B]" 
                  variants={fadeInUp}
                  transition={{ delay: 0.2 }}
                >
                  FutureU
                </motion.span>
              </motion.h1>
              <motion.p 
                className="text-xl text-[#2B3E4E]/80 max-w-3xl leading-relaxed"
                variants={fadeInUp}
                transition={{ delay: 0.3 }}
              >
                FutureU is an intelligent career and academic guidance platform designed to support Grade 9 junior high school students in making well-informed decisions about their future careers, college programs, and SHS strand selection.
              </motion.p>

              <motion.p 
                className="text-xl text-[#2B3E4E]/80 max-w-3xl leading-relaxed mt-4"
                variants={fadeInUp}
                transition={{ delay: 0.4 }}
              >
                Unlike traditional career guidance methods, FutureU leverages personalized career assessments, data-driven recommendations, and educational insights to bridge the gap between student aspirations and academic pathways.
              </motion.p>
              <motion.div 
                className="mt-8"
                variants={fadeInUp}
                transition={{ delay: 0.5 }}
              >
                <motion.div 
                  className="bg-[#FFB71B] text-[#2B3E4E] px-8 py-3 rounded-full font-semibold text-lg shadow-lg inline-block"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Bridging the Gap Between Aspiration and Reality
                </motion.div>
              </motion.div>
            </motion.div>
            <motion.div 
              className="flex justify-center lg:justify-end"
              initial="hidden"
              animate="visible"
              variants={fadeInRight}
              transition={{ delay: 0.6 }}
            >
              <motion.div 
                className="relative group"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.img 
                  src="/src/assets/header_logo_normal.svg" 
                  alt="FutureU Logo" 
                  className="h-64 w-auto max-w-full object-contain transition-all duration-500 ease-in-out transform group-hover:rotate-6 group-hover:drop-shadow-2xl"
                  animate={{ 
                    y: [0, -50, 0, -30, 0],
                    rotate: [0, 8, 0, -5, 0],
                    scale: [1, 1.08, 1, 1.05, 1]
                  }}
                  transition={{ 
                    duration: 2.5,
                    repeat: Infinity,
                    ease: [0.4, 0, 0.2, 1],
                    times: [0, 0.3, 0.6, 0.8, 1]
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#FFB71B]/20 to-[#FF9800]/20 rounded-full blur-xl opacity-30 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
                <motion.div 
                  className="absolute -top-2 -right-2 w-4 h-4 bg-[#FFB71B] rounded-full opacity-60"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <motion.div 
                  className="absolute -bottom-2 -left-2 w-3 h-3 bg-[#FF9800] rounded-full opacity-60"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
                />
                <motion.div 
                  className="absolute top-1/2 -right-4 w-2 h-2 bg-[#FFB71B] rounded-full opacity-40"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                />
                <motion.div 
                  className="absolute top-1/4 -left-4 w-2 h-2 bg-[#FF9800] rounded-full opacity-40"
                  animate={{ scale: [1, 1.4, 1] }}
                  transition={{ duration: 2.8, repeat: Infinity, delay: 1.5 }}
                />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Problem Statement Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, threshold: 0.3 }}
            variants={staggerContainer}
          >
            <motion.div 
              className="flex justify-center mb-6"
              variants={scaleIn}
            >
              <motion.div 
                className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </motion.div>
            </motion.div>
            <motion.h2 
              className="text-4xl font-bold text-[#2B3E4E] mb-4"
              variants={fadeInUp}
            >
              The Problem We're Solving
            </motion.h2>
            <motion.p 
              className="text-xl text-gray-600 max-w-3xl mx-auto"
              variants={fadeInUp}
              transition={{ delay: 0.2 }}
            >
              Students face significant challenges in making informed career and academic decisions
            </motion.p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, threshold: 0.2 }}
            variants={staggerContainer}
          >
            <motion.div 
              className="bg-white border border-red-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
              variants={staggerItem}
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.div 
                className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4"
                whileHover={{ rotate: 10 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </motion.div>
              <h3 className="text-xl font-semibold text-[#2B3E4E] mb-3 text-left">Limited Career Guidance</h3>
              <p className="text-gray-600 text-left leading-relaxed">
                Students often rely on family, peers, or limited school counselors for career advice, 
                leading to decisions based on personal experiences rather than data-driven insights.
              </p>
            </motion.div>

            <motion.div 
              className="bg-white border border-red-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
              variants={staggerItem}
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.div 
                className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4"
                whileHover={{ rotate: 10 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <BookOpen className="w-6 h-6 text-red-600" />
              </motion.div>
              <h3 className="text-xl font-semibold text-[#2B3E4E] mb-3 text-left">Outdated Assessment Methods</h3>
              <p className="text-gray-600 text-left leading-relaxed">
                The NCAE assessment is limited to Grade 10 and only helps with SHS track selection, 
                not providing recommendations for future career paths or college programs.
              </p>
            </motion.div>

            <motion.div 
              className="bg-white border border-red-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
              variants={staggerItem}
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.div 
                className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4"
                whileHover={{ rotate: 10 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <TrendingUp className="w-6 h-6 text-red-600" />
              </motion.div>
              <h3 className="text-xl font-semibold text-[#2B3E4E] mb-3 text-left">Career-Academic Mismatch</h3>
              <p className="text-gray-600 text-left leading-relaxed">
                Many students face misalignment between their SHS track and college programs, 
                resulting in bridging courses, additional costs, and delayed graduation.
              </p>
            </motion.div>

            <motion.div 
              className="bg-white border border-red-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
              variants={staggerItem}
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.div 
                className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4"
                whileHover={{ rotate: 10 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Users className="w-6 h-6 text-red-600" />
              </motion.div>
              <h3 className="text-xl font-semibold text-[#2B3E4E] mb-3 text-left">Overwhelming Choices</h3>
              <p className="text-gray-600 text-left leading-relaxed">
                Students are overwhelmed by the number of available programs and institutions, 
                making it difficult to make informed decisions about their future.
              </p>
            </motion.div>

            <motion.div 
              className="bg-white border border-red-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
              variants={staggerItem}
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.div 
                className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4"
                whileHover={{ rotate: 10 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Globe className="w-6 h-6 text-red-600" />
              </motion.div>
              <h3 className="text-xl font-semibold text-[#2B3E4E] mb-3 text-left">Limited Access to Information</h3>
              <p className="text-gray-600 text-left leading-relaxed">
                Students lack access to comprehensive information about accredited institutions, 
                program quality, and career prospects in their chosen fields.
              </p>
            </motion.div>

            <motion.div 
              className="bg-white border border-red-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
              variants={staggerItem}
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.div 
                className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4"
                whileHover={{ rotate: 10 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Heart className="w-6 h-6 text-red-600" />
              </motion.div>
              <h3 className="text-xl font-semibold text-[#2B3E4E] mb-3 text-left">Evolving Interests</h3>
              <p className="text-gray-600 text-left leading-relaxed">
                By the time students reach college decision-making, their interests and career 
                aspirations may have significantly evolved, but they lack updated guidance.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-[#2B3E4E] to-[#3A4F5A]">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, threshold: 0.3 }}
            variants={staggerContainer}
          >
            <motion.div 
              className="flex justify-center mb-6"
              variants={scaleIn}
            >
              <motion.div 
                className="w-16 h-16 bg-[#FFB71B] rounded-full flex items-center justify-center"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <CheckCircle className="w-8 h-8 text-[#2B3E4E]" />
              </motion.div>
            </motion.div>
            <motion.h2 
              className="text-4xl font-bold text-white mb-4"
              variants={fadeInUp}
            >
              Our AI-Powered Solution
            </motion.h2>
            <motion.p 
              className="text-xl text-white/80 max-w-3xl mx-auto"
              variants={fadeInUp}
              transition={{ delay: 0.2 }}
            >
              FutureU leverages advanced technology to provide personalized, data-driven career guidance
            </motion.p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-2 gap-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, threshold: 0.2 }}
            variants={staggerContainer}
          >
            {/* AI-Powered Assessments */}
            <motion.div 
              className="bg-white/10 backdrop-blur-sm rounded-xl p-8 text-white"
              variants={staggerItem}
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.div 
                className="flex items-center mb-6"
                whileHover={{ x: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div
                  whileHover={{ rotate: 15 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                <Brain className="w-8 h-8 text-[#FFB71B] mr-3" />
                </motion.div>
                <h3 className="text-2xl font-bold">AI-Powered Assessments</h3>
              </motion.div>
              <p className="text-lg leading-relaxed text-white/90 mb-4 text-left">
                Our platform integrates General Scholastic Aptitude (GSA) and RIASEC-based assessments 
                to evaluate students' aptitudes, interests, and strengths, generating tailored career 
                path recommendations.
              </p>
              <motion.ul 
                className="space-y-2 text-white/80 text-left"
                variants={staggerContainer}
              >
                <motion.li 
                  className="flex items-center text-left"
                  variants={staggerItem}
                >
                  <CheckCircle className="w-4 h-4 text-[#FFB71B] mr-2" />
                  Personalized career profiling using NLP
                </motion.li>
                <motion.li 
                  className="flex items-center text-left"
                  variants={staggerItem}
                >
                  <CheckCircle className="w-4 h-4 text-[#FFB71B] mr-2" />
                  Adaptive assessments that evolve with students
                </motion.li>
                <motion.li 
                  className="flex items-center text-left"
                  variants={staggerItem}
                >
                  <CheckCircle className="w-4 h-4 text-[#FFB71B] mr-2" />
                  Real-time analysis of responses and performance
                </motion.li>
              </motion.ul>
            </motion.div>

            {/* Data-Driven Recommendations */}
            <motion.div 
              className="bg-white/10 backdrop-blur-sm rounded-xl p-8 text-white"
              variants={staggerItem}
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.div 
                className="flex items-center mb-6"
                whileHover={{ x: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div
                  whileHover={{ rotate: 15 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                <Target className="w-8 h-8 text-[#FFB71B] mr-3" />
                </motion.div>
                <h3 className="text-2xl font-bold">Data-Driven Recommendations</h3>
              </motion.div>
              <p className="text-lg leading-relaxed text-white/90 mb-4 text-left">
                Our system continuously refines suggestions based on user interaction, academic 
                performance, and career trends, ensuring students receive practical and research-backed guidance.
              </p>
              <motion.ul 
                className="space-y-2 text-white/80 text-left"
                variants={staggerContainer}
              >
                <motion.li 
                  className="flex items-center text-left"
                  variants={staggerItem}
                >
                  <CheckCircle className="w-4 h-4 text-[#FFB71B] mr-2" />
                  Integration with latest job market data
                </motion.li>
                <motion.li 
                  className="flex items-center text-left"
                  variants={staggerItem}
                >
                  <CheckCircle className="w-4 h-4 text-[#FFB71B] mr-2" />
                  Analysis of accredited college programs
                </motion.li>
                <motion.li 
                  className="flex items-center text-left"
                  variants={staggerItem}
                >
                  <CheckCircle className="w-4 h-4 text-[#FFB71B] mr-2" />
                  Career trend analysis and forecasting
                </motion.li>
              </motion.ul>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, threshold: 0.3 }}
            variants={staggerContainer}
          >
            <motion.h2 
              className="text-4xl font-bold text-[#2B3E4E] mb-4"
              variants={fadeInUp}
            >
              How FutureU Benefits You
            </motion.h2>
            <motion.p 
              className="text-xl text-gray-600 max-w-3xl mx-auto"
              variants={fadeInUp}
              transition={{ delay: 0.2 }}
            >
              Comprehensive tools and services designed for different stakeholders in education
            </motion.p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, threshold: 0.1 }}
            variants={staggerContainer}
          >
            {/* For Students */}
            <motion.div 
              className="bg-gradient-to-br from-[#2B3E4E] to-[#3A4F5A] rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              variants={staggerItem}
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.div 
                className="flex items-center mb-4"
                whileHover={{ x: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div
                  whileHover={{ rotate: 15 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                <GraduationCap className="w-8 h-8 text-[#FFB71B] mr-3" />
                </motion.div>
                <h3 className="text-xl font-semibold">For Grade 9 Students</h3>
              </motion.div>
              <ul className="space-y-2 text-white/90 text-left">
                <li className="text-left">• Eliminates guesswork in career planning</li>
                <li className="text-left">• Personalized career recommendations</li>
                <li className="text-left">• Side-by-side program comparisons</li>
                <li className="text-left">• 24/7 accessible career insights</li>
                <li className="text-left">• Virtual campus tours and reviews</li>
              </ul>
            </motion.div>

            {/* For Parents */}
            <motion.div 
              className="bg-gradient-to-br from-[#FFB71B] to-[#FF9800] rounded-xl p-6 text-[#2B3E4E] shadow-lg hover:shadow-xl transition-all duration-300"
              variants={staggerItem}
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.div 
                className="flex items-center mb-4"
                whileHover={{ x: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div
                  whileHover={{ rotate: 15 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                <Heart className="w-8 h-8 text-[#2B3E4E] mr-3" />
                </motion.div>
                <h3 className="text-xl font-semibold">For Parents & Guardians</h3>
              </motion.div>
              <ul className="space-y-2 text-left">
                <li className="text-left">• Data-driven insights for decision support</li>
                <li className="text-left">• Reduced financial risks from course shifting</li>
                <li className="text-left">• School quality and accreditation comparisons</li>
                <li className="text-left">• Evidence-based career guidance</li>
                <li className="text-left">• Cost-benefit analysis of programs</li>
              </ul>
            </motion.div>

            {/* For Schools */}
            <motion.div 
              className="bg-gradient-to-br from-[#2B3E4E] to-[#3A4F5A] rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              variants={staggerItem}
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.div 
                className="flex items-center mb-4"
                whileHover={{ x: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div
                  whileHover={{ rotate: 15 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                <Users className="w-8 h-8 text-[#FFB71B] mr-3" />
                </motion.div>
                <h3 className="text-xl font-semibold">For Schools & Counselors</h3>
              </motion.div>
              <ul className="space-y-2 text-white/90 text-left">
                <li className="text-left">• Structured, scalable guidance tools</li>
                <li className="text-left">• Student analytics and insights</li>
                <li className="text-left">• Reduced counselor workload</li>
                <li className="text-left">• Curriculum development support</li>
                <li className="text-left">• Performance tracking and trends</li>
              </ul>
            </motion.div>

            {/* For Institutions */}
            <motion.div 
              className="bg-gradient-to-br from-[#FFB71B] to-[#FF9800] rounded-xl p-6 text-[#2B3E4E] shadow-lg hover:shadow-xl transition-all duration-300"
              variants={staggerItem}
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.div 
                className="flex items-center mb-4"
                whileHover={{ x: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div
                  whileHover={{ rotate: 15 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                <Award className="w-8 h-8 text-[#2B3E4E] mr-3" />
                </motion.div>
                <h3 className="text-xl font-semibold">For Higher Education</h3>
              </motion.div>
              <ul className="space-y-2 text-left">
                <li className="text-left">• Virtual campus tour platform</li>
                <li className="text-left">• Program promotion opportunities</li>
                <li className="text-left">• Reduced course shifting rates</li>
                <li className="text-left">• CHED accreditation highlighting</li>
                <li className="text-left">• Improved student-institution matching</li>
              </ul>
            </motion.div>

            {/* For Government */}
            <motion.div 
              className="bg-gradient-to-br from-[#2B3E4E] to-[#3A4F5A] rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              variants={staggerItem}
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.div 
                className="flex items-center mb-4"
                whileHover={{ x: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div
                  whileHover={{ rotate: 15 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                <Globe className="w-8 h-8 text-[#FFB71B] mr-3" />
                </motion.div>
                <h3 className="text-xl font-semibold">For Government Agencies</h3>
              </motion.div>
              <ul className="space-y-2 text-white/90 text-left">
                <li className="text-left">• Career trend data for policy making</li>
                <li className="text-left">• Skills gap identification</li>
                <li className="text-left">• Workforce alignment insights</li>
                <li className="text-left">• Evidence-based curriculum development</li>
                <li className="text-left">• National education policy support</li>
              </ul>
            </motion.div>

            {/* Platform Features */}
            <motion.div 
              className="bg-gradient-to-br from-[#FFB71B] to-[#FF9800] rounded-xl p-6 text-[#2B3E4E] shadow-lg hover:shadow-xl transition-all duration-300"
              variants={staggerItem}
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.div 
                className="flex items-center mb-4"
                whileHover={{ x: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div
                  whileHover={{ rotate: 15 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                <Lightbulb className="w-8 h-8 text-[#2B3E4E] mr-3" />
                </motion.div>
                <h3 className="text-xl font-semibold">Platform Features</h3>
              </motion.div>
              <ul className="space-y-2 text-left">
                <li className="text-left">• Interactive career assessments</li>
                <li className="text-left">• Real-time recommendation engine</li>
                <li className="text-left">• Comprehensive school database</li>
                <li className="text-left">• Accreditation information</li>
                <li className="text-left">• Alumni reviews and testimonials</li>
              </ul>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-[#2B3E4E] to-[#3A4F5A]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Meet Our Team</h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Dedicated professionals committed to transforming education through technology
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-50 justify-items-start -ml-45">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center hover:bg-white/20 transition-all duration-300 min-w-[280px]">
                <div className="w-28 h-28 rounded-full mx-auto mb-4 overflow-hidden border-4 border-[#FFB71B]">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-full h-full object-cover"
                    style={{ 
                      objectPosition: member.name === 'Michael Andre Ligan' || member.name === 'Sherween Perolino' ? 'center center' : 'center 15%',
                      transform: member.name === 'Michael Andre Ligan' || member.name === 'Sherween Perolino' || member.name === 'Christian Hans Paras' ? 'scale(2.5)' : 'scale(2.0)',
                      width: '100%',
                      height: '100%'
                    }}
                  />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{member.name}</h3>
                <p className="text-[#FFB71B] font-medium mb-2 text-base whitespace-nowrap">{member.role}</p>
                <p className="text-white/80 text-sm leading-relaxed">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="grid md:grid-cols-2 gap-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, threshold: 0.2 }}
            variants={staggerContainer}
          >
            {/* Mission */}
            <motion.div 
              className="bg-gradient-to-br from-[#2B3E4E] to-[#3A4F5A] rounded-2xl p-8 text-white shadow-2xl"
              variants={staggerItem}
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.div 
                className="flex items-center mb-6"
                whileHover={{ x: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div
                  whileHover={{ rotate: 15 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                <Target className="w-8 h-8 text-[#FFB71B] mr-3" />
                </motion.div>
                <h2 className="text-3xl font-bold">Our Mission</h2>
              </motion.div>
              <p className="text-lg leading-relaxed text-white/90 text-left">
                To revolutionize career guidance by providing Grade 9 students with comprehensive tools, 
                personalized assessments, and expert counseling to help them make informed decisions 
                about their educational and professional futures, reducing career mismatches and 
                empowering confident academic choices.
              </p>
            </motion.div>

            {/* Vision */}
            <motion.div 
              className="bg-gradient-to-br from-[#FFB71B] to-[#FF9800] rounded-2xl p-8 text-[#2B3E4E] shadow-2xl"
              variants={staggerItem}
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.div 
                className="flex items-center mb-6"
                whileHover={{ x: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div
                  whileHover={{ rotate: 15 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                <Lightbulb className="w-8 h-8 text-[#2B3E4E] mr-3" />
                </motion.div>
                <h2 className="text-3xl font-bold">Our Vision</h2>
              </motion.div>
              <p className="text-lg leading-relaxed text-left">
                To become the leading AI-powered platform that bridges the gap between students' 
                aspirations and their career realities, creating a world where every student finds 
                their perfect path to success and fulfillment through data-driven guidance and 
                seamless academic transitions.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-6 bg-[#F5F5F5]">
        <motion.div 
          className="max-w-4xl mx-auto text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, threshold: 0.3 }}
          variants={staggerContainer}
        >
          <motion.h2 
            className="text-4xl font-bold text-[#2B3E4E] mb-6"
            variants={fadeInUp}
          >
            Ready to Transform Your Career Journey?
          </motion.h2>
          <motion.p 
            className="text-xl text-gray-600 mb-8"
            variants={fadeInUp}
            transition={{ delay: 0.2 }}
          >
            Join thousands of students who have discovered their perfect career path with FutureU's 
            AI-powered guidance system
          </motion.p>
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            variants={staggerContainer}
          >
            <motion.button 
              onClick={handleStartAssessment}
              className="!bg-[#2B3E4E] hover:!bg-[#1A2A3A] active:!bg-[#0F1A24] !text-white px-8 py-3 rounded-full font-semibold text-lg transition-all duration-300 hover:shadow-lg hover:shadow-[#2B3E4E]/25 focus:outline-none focus:ring-2 focus:ring-[#2B3E4E] focus:ring-offset-2 !border-0"
              variants={staggerItem}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              Start Your Assessment
            </motion.button>
            <motion.button 
              onClick={handleExplorePrograms}
              className="!bg-[#FFB71B] hover:!bg-[#FF9800] active:!bg-[#FF8F00] !text-[#2B3E4E] px-8 py-3 rounded-full font-semibold text-lg transition-all duration-300 hover:shadow-lg hover:shadow-[#FFB71B]/25 focus:outline-none focus:ring-2 focus:ring-[#FFB71B] focus:ring-offset-2 !border-0"
              variants={staggerItem}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              Explore Programs
            </motion.button>
          </motion.div>
        </motion.div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, threshold: 0.3 }}
            variants={staggerContainer}
          >
            <motion.h2 
              className="text-4xl font-bold text-[#2B3E4E] mb-4"
              variants={fadeInUp}
            >
              Get in Touch
            </motion.h2>
            <motion.p 
              className="text-xl text-gray-600"
              variants={fadeInUp}
              transition={{ delay: 0.2 }}
            >
              Have questions? We'd love to hear from you.
            </motion.p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, threshold: 0.2 }}
            variants={staggerContainer}
          >
            <motion.div 
              className="text-center"
              variants={staggerItem}
              whileHover={{ y: -5, scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.div 
                className="w-16 h-16 bg-[#FFB71B] rounded-full flex items-center justify-center mx-auto mb-4"
                whileHover={{ rotate: 15, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Mail className="w-8 h-8 text-[#2B3E4E]" />
              </motion.div>
              <h3 className="text-xl font-semibold text-[#2B3E4E] mb-2">Email Us</h3>
              <p className="text-gray-600">info@futureu.com</p>
            </motion.div>

            <motion.div 
              className="text-center"
              variants={staggerItem}
              whileHover={{ y: -5, scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.div 
                className="w-16 h-16 bg-[#FFB71B] rounded-full flex items-center justify-center mx-auto mb-4"
                whileHover={{ rotate: 15, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Phone className="w-8 h-8 text-[#2B3E4E]" />
              </motion.div>
              <h3 className="text-xl font-semibold text-[#2B3E4E] mb-2">Call Us</h3>
              <p className="text-gray-600">+63 (32) 123-4567</p>
            </motion.div>

            <motion.div 
              className="text-center"
              variants={staggerItem}
              whileHover={{ y: -5, scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.div 
                className="w-16 h-16 bg-[#FFB71B] rounded-full flex items-center justify-center mx-auto mb-4"
                whileHover={{ rotate: 15, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <MapPin className="w-8 h-8 text-[#2B3E4E]" />
              </motion.div>
              <h3 className="text-xl font-semibold text-[#2B3E4E] mb-2">Visit Us</h3>
              <p className="text-gray-600">Cebu City, Philippines</p>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AboutUsPage;