import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from "framer-motion";
import studentsImage from '../assets/Students.png';
import backgroundImage from '../assets/SchoolBackground.png';
import statisticsService from '../services/statisticsService';
import {
  FaUserGraduate,
  FaUsers,
  FaChartLine,
  FaBriefcase,
  FaSearch,
  FaClipboardList,
  FaQuoteLeft,
  FaQuoteRight,
  FaArrowRight,
  FaStar,
  FaGraduationCap,
  FaUniversity,
  FaLaptop,
  FaChevronRight,
  FaUserCircle,
} from "react-icons/fa";

// Add these imports for Career Interest Profile integration
import { useCareerInterestProfile } from '../hooks/useCareerInterestProfile';
import CareerInterestProfileWizard from './CareerInterestProfile/CareerInterestProfileWizard';
import ProfilePrompt from './CareerInterestProfile/ProfilePrompt';
import authService from '../services/authService';
import { getAllTestimonials } from '../services/testimonialService';
import apiConfig from '../config/apiConfig';

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const LandingPage = () => {
  const [scrollY, setScrollY] = useState(0);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // Add these state variables for Career Interest Profile
  const [showProfileWizard, setShowProfileWizard] = useState(false);
  const [showProfilePrompt, setShowProfilePrompt] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const { hasProfile, loading: profileLoading, refreshProfile } = useCareerInterestProfile();

  // Real testimonials state
  const [testimonials, setTestimonials] = useState([]);
  const [testimonialsLoading, setTestimonialsLoading] = useState(true);

  // Fetch real testimonials on mount and when a submission broadcast occurs
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setTestimonialsLoading(true);
        const res = await getAllTestimonials();
        const data = Array.isArray(res?.data) ? res.data : [];

        // Sort newest first using createdAt then id
        const sorted = data.sort((a, b) => (
          new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        ) || ((Number(b.testimonyId ?? b.id ?? 0)) - (Number(a.testimonyId ?? a.id ?? 0))));

        const apiOrigin = (apiConfig.baseURL || '').replace(/\/?api\/?$/i, '');
        const mapped = sorted.slice(0, 6).map((t, i) => {
          const first = (t.studentFirstName || '').trim();
          const last = (t.studentLastName || '').trim();
          const fullFromParts = `${first}${first && last ? ' ' : ''}${last}`.trim();
          const displayName = fullFromParts || t.studentName || t.fullName || t.name || 'Anonymous';
          const rawAvatar = t.profilePictureUrl || null;
          const avatarUrl = rawAvatar
            ? (rawAvatar.startsWith('http') ? rawAvatar : `${apiOrigin}${rawAvatar}`)
            : null;

        return ({
          id: t.testimonyId ?? t.id ?? i,
          name: displayName,
          role: t.studentRole ?? t.role ?? 'Student',
          school: t.schoolName ?? t.school ?? t.institutionName ?? '—',
          quote: t.testimonyContent ?? t.description ?? t.quote ?? '',
          rating: Number(t.rating ?? t.starRating ?? 5),
          avatarUrl,
        });
        });

        setTestimonials(mapped);
      } catch (err) {
        console.error('Testimonials fetch failed', err);
        setTestimonials([]);
      } finally {
        setTestimonialsLoading(false);
      }
    };

    fetchTestimonials();
    
    const onStorage = (e) => {
      if (e.key === 'futureu_refresh_testimonials') fetchTestimonials();
    };
    const onTestimonialUpdate = () => {
      fetchTestimonials();
    };
    
    window.addEventListener('storage', onStorage);
    window.addEventListener('futureu_testimonials_updated', onTestimonialUpdate);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('futureu_testimonials_updated', onTestimonialUpdate);
    };
  }, []);

  // Check authentication status
  useEffect(() => {
    const authenticated = authService.isAuthenticated();
    setIsAuthenticated(authenticated);
  }, []);

  // Session-based profile prompt logic
  useEffect(() => {
    if (isAuthenticated && !profileLoading && hasProfile === false) {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) return;

      // Create session-specific key for this user
      const sessionKey = `futureu_profile_prompt_shown_${currentUser.id}`;
      const promptShown = sessionStorage.getItem(sessionKey);

      // Only show prompt if it hasn't been shown this session
      if (!promptShown) {
        const timer = setTimeout(() => {
          setShowProfilePrompt(true);
          // Mark prompt as shown for this session
          sessionStorage.setItem(sessionKey, 'true');
        }, 3000); // Show after 3 seconds

        return () => clearTimeout(timer);
      }
    }
  }, [isAuthenticated, hasProfile, profileLoading]);

  // Add these handler functions
  const handleProfileComplete = () => {
    setShowProfileWizard(false);
    setShowProfilePrompt(false);
    refreshProfile();
  };

  const handleProfileSkip = () => {
    setShowProfileWizard(false);
    setShowProfilePrompt(false);
  };

  const handleSetupNow = () => {
    setShowProfilePrompt(false);
    setShowProfileWizard(true);
  };

  const handleSetupLater = () => {
    setShowProfilePrompt(false);
  };

  // Manual trigger for showing profile prompt (for the banner button)
  const handleManualProfilePrompt = () => {
    setShowProfilePrompt(true);
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [testimonials.length]);

  // Stats counter animation
  const [counters, setCounters] = useState({
    schools: 0,
    programs: 0,
    alumni: 0,
    students: 0,
  });

  const [targetCounters, setTargetCounters] = useState({
    schools: 0,
    programs: 0,
    alumni: 0,
    students: 0,
  });

  const [statsLoaded, setStatsLoaded] = useState(false);

  // Fetch real statistics data
  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const stats = await statisticsService.getAllStatistics();
        setTargetCounters(stats);
        setStatsLoaded(true);
      } catch (error) {
        console.error('Error fetching statistics:', error);
        // Fallback to default values if API fails
        setTargetCounters({
    schools: 11,
    programs: 200,
          alumni: 50,
          students: 500,
        });
        setStatsLoaded(true);
      }
    };

    fetchStatistics();
  }, []);

  useEffect(() => {
    const statsSection = document.getElementById("stats-section");
    if (!statsSection || !statsLoaded) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          const interval = setInterval(() => {
            setCounters((prev) => {
              const newCounters = { ...prev };
              let allComplete = true;

              Object.keys(targetCounters).forEach((key) => {
                if (newCounters[key] < targetCounters[key]) {
                  const increment = Math.ceil(targetCounters[key] / 50) || 1;
                  newCounters[key] += increment;
                  if (newCounters[key] > targetCounters[key]) {
                    newCounters[key] = targetCounters[key];
                  } else {
                    allComplete = false;
                  }
                }
              });

              if (allComplete) clearInterval(interval);
              return newCounters;
            });
          }, 50);

          return () => clearInterval(interval);
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(statsSection);
    return () => observer.disconnect();
  }, [targetCounters, statsLoaded]);

  return (
    <div className="w-full overflow-hidden bg-white">
      {/* Career Interest Profile Wizard */}
      <AnimatePresence>
        {showProfileWizard && (
          <CareerInterestProfileWizard
            onComplete={handleProfileComplete}
            onSkip={handleProfileSkip}
          />
        )}
      </AnimatePresence>

      {/* Profile Setup Prompt */}
      <AnimatePresence>
        {showProfilePrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-2xl"
            >
              <ProfilePrompt
                onSetupNow={handleSetupNow}
                onSetupLater={handleSetupLater}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

        {/* Hero Section */}
        <div
        className="relative min-h-screen flex items-start pt-0 md:pt-10 justify-center bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        >
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 to-gray-900/40"></div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <motion.div className="md:w-1/2 text-white text-center md:text-left" initial="hidden" animate="visible" variants={staggerContainer}>
              <motion.h1 
                className="font-bold leading-tight" 
                style={{ fontSize: "4.5rem" }}
                variants={fadeIn}
              >
              Empowering <span className="text-yellow-500">Your</span>
              </motion.h1>
              <motion.h1 
                className="font-bold leading-tight" 
                style={{ fontSize: "4.5rem" }}
                variants={fadeIn}
              >
                College Journey
              </motion.h1>

              <motion.p className="text-2xl text-gray-300 mt-8 max-w-xl" variants={fadeIn}>
                Discover your ideal college program, explore career pathways, and gain insights from alumni—all in one
                place.
              </motion.p>

              <motion.div className="mt-10" variants={fadeIn}>
            <Link to="/register">
                  <motion.button
                    className="bg-gradient-to-r from-[#FFB71B] to-[#FFB71B] hover:from-[#2B3E4E] hover:to-[#2B3E4E] hover:text-white text-[#2B3E4E] py-2.5 px-4 rounded-xl font-bold shadow-md transition-all flex items-center justify-center gap-2 animate-bounce-short"
                    style={{ backgroundColor: '#ffc107' }} 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                Start Your Path
                    <FaArrowRight className="ml-3 text-xl" />
                  </motion.button>
            </Link>
              </motion.div>
            </motion.div>

            <motion.div
              className="md:w-1/2 mt-12 md:mt-0"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
            <img
              src={studentsImage}
              alt="Group of students"
                className="w-full max-w-lg mx-auto rounded-lg shadow-2xl transform -rotate-2 hover:rotate-0 transition-transform duration-500"
              />
            </motion.div>
          </div>
        </div>

        {/* Profile Status Banner for users without profile */}
        {isAuthenticated && !profileLoading && hasProfile === false && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="absolute bottom-20 left-1/2 transform -translate-x-1/2"
          >
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 max-w-md mx-auto">
              <p className="text-white text-center text-sm">
                💡 Complete your career interest profile to get personalized recommendations
              </p>
              <button
                onClick={handleManualProfilePrompt}
                className="mt-2 w-full bg-[#FFB71B] text-[#2B3E4E] px-4 py-2 rounded-lg font-medium hover:bg-[#FFB71B]/90 transition-colors"
              >
                Set Up Profile
              </button>
            </div>
          </motion.div>
        )}

        {/* Profile Complete Badge for users with profile */}
        {isAuthenticated && !profileLoading && hasProfile === true && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="absolute bottom-20 left-1/2 transform -translate-x-1/2"
          >
            <div className="bg-green-500/20 backdrop-blur-sm border border-green-400/30 rounded-2xl p-4 max-w-md mx-auto">
              <p className="text-white text-center text-sm flex items-center justify-center">
                <span className="mr-2">✅</span>
                Career interest profile complete - getting personalized recommendations
              </p>
            </div>
          </motion.div>
        )}

        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
            <path
              fill="#ffffff"
              fillOpacity="1"
              d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,149.3C960,160,1056,160,1152,138.7C1248,117,1344,75,1392,53.3L1440,32L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            ></path>
          </svg>
          </div>
        </div>

        {/* What is FutureU Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <motion.div
            className="bg-gray-50 rounded-2xl shadow-xl overflow-hidden"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, amount: 0.3 }}
          >
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/2 p-8 md:p-12">
                <p className="text-sm text-gray-500 font-bold mb-4 tracking-wider">WHAT IS FUTUREU?</p>
                <h2 className="text-3xl md:text-4xl font-bold leading-tight mb-6 text-gray-800">
                  An <span className="bg-yellow-500 text-black px-2 py-1 rounded">all-in-one decision-making hub</span>{" "}
                  for your college journey.
            </h2>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/about-us"
                    className="inline-flex items-center font-semibold transition-colors"
                    style={{ color: '#FFB71B' }}
                    onMouseOver={(e) => (e.currentTarget.style.color = '#e09b00')}
                    onMouseOut={(e) => (e.currentTarget.style.color = '#FFB71B')}
                  >
                    Learn more about us
                    <FaChevronRight className="ml-2" />
                  </Link>
                </motion.div>
          </div>

              <div className="md:w-1/2 bg-white p-8 md:p-12">
                <ul className="space-y-5">
              {[
                "Suggests programs and schools based on your unique skills, interests, and career goals.",
                "Provides interactive assessments to align your academic choices with potential career pathways.",
                "Offers firsthand insights into campus life and academic quality from alumni and current students.",
                "Enables side-by-side comparisons of tuition fees, program details, location, and alumni feedback.",
                "Displays official CHED ratings and accreditations to ensure quality and credibility.",
              ].map((feature, index) => (
                    <motion.li
                      key={index}
                      className="flex items-start"
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <span className="text-green-500 mr-3 mt-1">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          ></path>
                        </svg>
                      </span>
                      <p className="text-gray-700 font-medium">{feature}</p>
                    </motion.li>
              ))}
            </ul>
          </div>
        </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats-section" className="py-16 bg-gradient-to-r from-yellow-500 to-yellow-400 text-gray-900">
        <div className="container mx-auto px-6">
          {!statsLoaded ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
            </div>
          ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: "Schools", value: counters.schools, icon: <FaUniversity className="text-4xl mb-3" /> },
              { label: "Programs", value: counters.programs, icon: <FaGraduationCap className="text-4xl mb-3" /> },
              { label: "Alumni Reviews", value: counters.alumni, icon: <FaUsers className="text-4xl mb-3" /> },
              { label: "Students", value: counters.students, icon: <FaLaptop className="text-4xl mb-3" /> },
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="flex justify-center">{stat.icon}</div>
                <h3 className="text-4xl font-bold">{stat.value.toLocaleString()}{stat.value > 0 ? '+' : ''}</h3>
                <p className="text-lg font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </div>
          )}
        </div>
      </section>

      {/* What We Offer Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-gray-800">What We Offer</h2>
            <div className="w-24 h-1 bg-yellow-500 mx-auto mt-4"></div>
            <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
              Tools and resources designed to help you make informed decisions about your academic future
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <FaUserGraduate size={48} className="text-yellow-500" />,
              title: "Personalized Guidance",
              description: "Get tailored recommendations based on your strengths and goals.",
            },
            {
              icon: <FaUsers size={48} className="text-yellow-500" />,
              title: "Community Support",
              description: "Connect with alumni and mentors to gain insights into your desired fields.",
            },
            {
              icon: <FaChartLine size={48} className="text-yellow-500" />,
              title: "Data-Driven Insights",
              description: "Make confident choices with insights backed by data and real experiences.",
            },
          ].map((item, index) => (
              <motion.div
              key={index}
                className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 border border-gray-100"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true, amount: 0.3 }}
                whileHover={{ y: -10 }}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="bg-yellow-100 p-4 rounded-full mb-6">{item.icon}</div>
                  <h3 className="text-xl font-bold mb-4 text-gray-800">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
              </div>
              </motion.div>
            ))}
            </div>
        </div>
      </section>

        {/* Subjects/Assessments Offered Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-gray-800">Explore Our Tools</h2>
            <div className="w-24 h-1 bg-yellow-500 mx-auto mt-4"></div>
            <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
              Discover the right path for your academic and career journey
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <FaBriefcase size={48} className="text-yellow-500" />,
              title: "Career Pathways",
              description: "Explore the right career paths based on your unique strengths.",
                link: "/career-pathways",
            },
            {
              icon: <FaSearch size={48} className="text-yellow-500" />,
              title: "Program Finder",
              description: "Discover the best college programs tailored to your goals.",
                link: "/academic-explorer",
            },
            {
              icon: <FaClipboardList size={48} className="text-yellow-500" />,
              title: "Assessments",
              description: "Evaluate your skills and preferences with our assessments.",
                link: "/assessment-dashboard",
            },
          ].map((item, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-xl shadow-lg overflow-hidden"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true, amount: 0.3 }}
                whileHover={{ y: -10 }}
              >
                <div className="h-2 bg-yellow-500"></div>
                <div className="p-8">
                  <div className="flex flex-col items-center text-center">
                    <div className="bg-yellow-100 p-4 rounded-full mb-6">{item.icon}</div>
                    <h3 className="text-xl font-bold mb-4 text-gray-800">{item.title}</h3>
                    <p className="text-gray-600 mb-6">{item.description}</p>
                    <Link to={item.link}>
                      <motion.button
                        className="bg-gray-100 hover:bg-yellow-100 text-gray-800 font-medium py-2 px-6 rounded-full transition duration-300 flex items-center"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Explore
                        <FaArrowRight className="ml-2" />
                      </motion.button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Alumni and Student Reviews Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-gray-800">Alumni & Student Reviews</h2>
            <div className="w-24 h-1 bg-yellow-500 mx-auto mt-4"></div>
            <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
              Hear from those who have used FutureU to shape their academic journey
            </p>
          </motion.div>

          <div className="relative">
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${activeTestimonial * 100}%)` }}
              >
                {testimonials.map((testimonial) => (
                  <div key={testimonial.id} className="w-full flex-shrink-0">
                    <div className="max-w-4xl mx-auto">
                      <div className="bg-white rounded-2xl p-8 md:p-10 shadow-lg ring-1 ring-gray-100">
                        <div className="flex items-start gap-5">
                          {/* Avatar on the upper-left */}
                          <div className="relative flex-shrink-0">
                            <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-yellow-400 bg-gray-100 flex items-center justify-center">
                              {testimonial.avatarUrl ? (
                                <img src={testimonial.avatarUrl} alt={testimonial.name} className="w-full h-full object-cover" />
                              ) : (
                                <FaUserCircle className="w-14 h-14 text-gray-400" />
                              )}
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-yellow-500 rounded-full p-1 shadow">
                              <FaGraduationCap className="text-white text-sm" />
                            </div>
                          </div>

                          {/* Right column: rating + quote + identity info below */}
                          <div className="flex-1">
                            {/* Rating */}
                            <div className="flex items-center mb-3">
                              {[...Array(5)].map((_, i) => (
                                <FaStar
                                  key={i}
                                  className={`${i < testimonial.rating ? "text-yellow-500" : "text-gray-300"} text-2xl mr-1`}
                                />
                              ))}
                            </div>

                            {/* Quote */}
                            <div className="relative text-left w-full overflow-hidden">
                              <FaQuoteLeft className="absolute -top-6 -left-1 text-yellow-200 text-4xl opacity-60" />
                              <p className="text-gray-700 text-lg md:text-xl leading-relaxed whitespace-pre-wrap break-all px-2 md:px-6">
                                {testimonial.quote}
                              </p>
                              <FaQuoteRight className="absolute -bottom-6 -right-1 text-yellow-200 text-4xl opacity-60" />
                            </div>

                            {/* Identity below, left-aligned */}
                            <div className="mt-5 text-left">
                              <h4 className="font-semibold text-lg text-gray-900">{testimonial.name}</h4>
                              <p className="text-gray-600 text-sm">{testimonial.role}</p>
                              <p className="text-yellow-600 font-medium text-sm">{testimonial.school}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center mt-8">
              {testimonials.map((_, index) => (
                <button
              key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`w-3 h-3 mx-2 rounded-full ${activeTestimonial === index ? "bg-yellow-500" : "bg-gray-300"}`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <motion.div
              className="md:w-2/3 mb-8 md:mb-0"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-left text-3xl md:text-4xl font-bold mb-4">Ready to Start Your Academic Journey?</h2>
              <p className="text-left text-xl text-gray-300">
                Join thousands of students who have found their perfect academic path with FutureU.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Link to="/register">
                <motion.button
                  className="bg-gradient-to-r from-[#FFB71B] to-[#FFB71B] hover:from-[#2B3E4E] hover:to-[#2B3E4E] hover:text-white text-[#2B3E4E] py-2.5 px-4 rounded-xl font-bold shadow-md transition-all flex items-center justify-center gap-2 animate-bounce-short"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Get Started Now
                  <FaArrowRight className="ml-2" />
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-15">
            <div>
              <div className="flex items-center mb-4">
                <FaGraduationCap className="text-yellow-500 text-3xl mr-2" />
                <span className="font-bold text-2xl">FutureU</span>
              </div>
              <p className=" text-left text-gray-400">
                Empowering students to make informed decisions about their academic and career paths.
              </p>
            </div>

            <div>
              <h3 className=" text-left font-bold text-lg mb-4">Quick Links</h3>
              <ul className="text-left space-y-2">
                {[
                  { name: "Home", path: isAuthenticated ? "/student-home" : "/" },
                  { name: "Academic Explorer", path: "/academic-explorer" },
                  { name: "Testimonials", path: "/testimonials" },
                  { name: "Accreditation", path: "/accreditation" },
                  { name: "Career Pathways", path: "/career-pathways" }
                ].map((item, index) => (
                  <li key={index}>
                    <Link to={item.path} className="text-gray-400 hover:text-yellow-500 transition-colors">
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-left font-bold text-lg mb-4">Resources</h3>
              <ul className="text-left space-y-2">
                {[
                  { name: "Assessment Dashboard", path: "/assessment-dashboard" },
                  { name: "Academic Explorer", path: "/academic-explorer" },
                  { name: "Career Pathways", path: "/career-pathways" },
                  { name: "Alumni Reviews", path: "/testimonials" },
                  { name: "Virtual Tours", path: "/virtual-campus-tours" }
                ].map((item, index) => (
                  <li key={index}>
                    <Link to={item.path} className="text-gray-400 hover:text-yellow-500 transition-colors">
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-left font-bold text-lg mb-4">Contact</h3>
              <ul className="text-left space-y-2 text-gray-400">
                <li>Email: info@futureu.edu</li>
                <li>Phone: +63 (32) 123-4567</li>
                <li>Address: Cebu City, Philippines</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500">© 2023 FutureU. All rights reserved.</p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              {["Facebook", "Twitter", "Instagram", "LinkedIn"].map((platform, index) => (
                <a key={index} href="#" className="text-gray-400 hover:text-yellow-500 transition-colors">
                  {platform}
                </a>
          ))}
        </div>
      </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;