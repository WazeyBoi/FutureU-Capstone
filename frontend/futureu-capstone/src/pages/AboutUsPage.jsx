import React from 'react';
import { useNavigate } from 'react-router-dom';
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
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
          opacity: 0;
        }
        
        .animate-fade-in-left {
          animation: fadeInLeft 0.8s ease-out forwards;
          opacity: 0;
        }
      `}</style>

      {/* Hero Section */}
      <section className="relative py-20 px-6 bg-[#F5F5F5]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-left">
              <h1 className="text-5xl md:text-6xl font-bold text-[#2B3E4E] mb-6 leading-tight animate-fade-in-up">
                About <span className="text-[#FFB71B] animate-fade-in-up" style={{animationDelay: '0.3s'}}>FutureU</span>
              </h1>
              <p className="text-xl text-[#2B3E4E]/80 max-w-3xl leading-relaxed animate-fade-in-up" style={{animationDelay: '0.6s'}}>
                FutureU is an intelligent career and academic guidance platform designed to support Grade 9 junior high school students in making well-informed decisions about their future careers, college programs, and SHS strand selection.
              </p>

              <p className="text-xl text-[#2B3E4E]/80 max-w-3xl leading-relaxed animate-fade-in-up mt-4" style={{animationDelay: '0.8s'}}>
                Unlike traditional career guidance methods, FutureU leverages personalized career assessments, data-driven recommendations, and educational insights to bridge the gap between student aspirations and academic pathways.
              </p>
              <div className="mt-8 animate-fade-in-up" style={{animationDelay: '0.9s'}}>
                <div className="bg-[#FFB71B] text-[#2B3E4E] px-8 py-3 rounded-full font-semibold text-lg shadow-lg inline-block">
                  Bridging the Gap Between Aspiration and Reality
                </div>
              </div>
            </div>
            <div className="flex justify-center lg:justify-end">
              <div className="relative group">
                <img 
                  src="/src/assets/header_logo_normal.svg" 
                  alt="FutureU Logo" 
                  className="h-64 w-auto max-w-full object-contain transition-all duration-500 ease-in-out transform animate-bounce group-hover:scale-110 group-hover:rotate-6 group-hover:drop-shadow-2xl group-hover:animate-none"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#FFB71B]/20 to-[#FF9800]/20 rounded-full blur-xl opacity-30 animate-pulse group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-[#FFB71B] rounded-full opacity-60 animate-ping group-hover:opacity-100 transition-all duration-300 delay-100"></div>
                <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-[#FF9800] rounded-full opacity-60 animate-ping group-hover:opacity-100 transition-all duration-300 delay-200" style={{animationDelay: '1s'}}></div>
                <div className="absolute top-1/2 -right-4 w-2 h-2 bg-[#FFB71B] rounded-full opacity-40 animate-pulse" style={{animationDelay: '0.5s'}}></div>
                <div className="absolute top-1/4 -left-4 w-2 h-2 bg-[#FF9800] rounded-full opacity-40 animate-pulse" style={{animationDelay: '1.5s'}}></div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Problem Statement Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </div>
            <h2 className="text-4xl font-bold text-[#2B3E4E] mb-4">The Problem We're Solving</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Students face significant challenges in making informed career and academic decisions
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white border border-red-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-[#2B3E4E] mb-3 text-left">Limited Career Guidance</h3>
              <p className="text-gray-600 text-left leading-relaxed">
                Students often rely on family, peers, or limited school counselors for career advice, 
                leading to decisions based on personal experiences rather than data-driven insights.
              </p>
            </div>

            <div className="bg-white border border-red-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-[#2B3E4E] mb-3 text-left">Outdated Assessment Methods</h3>
              <p className="text-gray-600 text-left leading-relaxed">
                The NCAE assessment is limited to Grade 10 and only helps with SHS track selection, 
                not providing recommendations for future career paths or college programs.
              </p>
            </div>

            <div className="bg-white border border-red-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-[#2B3E4E] mb-3 text-left">Career-Academic Mismatch</h3>
              <p className="text-gray-600 text-left leading-relaxed">
                Many students face misalignment between their SHS track and college programs, 
                resulting in bridging courses, additional costs, and delayed graduation.
              </p>
            </div>

            <div className="bg-white border border-red-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-[#2B3E4E] mb-3 text-left">Overwhelming Choices</h3>
              <p className="text-gray-600 text-left leading-relaxed">
                Students are overwhelmed by the number of available programs and institutions, 
                making it difficult to make informed decisions about their future.
              </p>
            </div>

            <div className="bg-white border border-red-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <Globe className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-[#2B3E4E] mb-3 text-left">Limited Access to Information</h3>
              <p className="text-gray-600 text-left leading-relaxed">
                Students lack access to comprehensive information about accredited institutions, 
                program quality, and career prospects in their chosen fields.
              </p>
            </div>

            <div className="bg-white border border-red-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-[#2B3E4E] mb-3 text-left">Evolving Interests</h3>
              <p className="text-gray-600 text-left leading-relaxed">
                By the time students reach college decision-making, their interests and career 
                aspirations may have significantly evolved, but they lack updated guidance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-[#2B3E4E] to-[#3A4F5A]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-[#FFB71B] rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-[#2B3E4E]" />
              </div>
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">Our AI-Powered Solution</h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              FutureU leverages advanced technology to provide personalized, data-driven career guidance
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* AI-Powered Assessments */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 text-white">
              <div className="flex items-center mb-6">
                <Brain className="w-8 h-8 text-[#FFB71B] mr-3" />
                <h3 className="text-2xl font-bold">AI-Powered Assessments</h3>
              </div>
              <p className="text-lg leading-relaxed text-white/90 mb-4 text-left">
                Our platform integrates General Scholastic Aptitude (GSA) and RIASEC-based assessments 
                to evaluate students' aptitudes, interests, and strengths, generating tailored career 
                path recommendations.
              </p>
              <ul className="space-y-2 text-white/80 text-left">
                <li className="flex items-center text-left">
                  <CheckCircle className="w-4 h-4 text-[#FFB71B] mr-2" />
                  Personalized career profiling using NLP
                </li>
                <li className="flex items-center text-left">
                  <CheckCircle className="w-4 h-4 text-[#FFB71B] mr-2" />
                  Adaptive assessments that evolve with students
                </li>
                <li className="flex items-center text-left">
                  <CheckCircle className="w-4 h-4 text-[#FFB71B] mr-2" />
                  Real-time analysis of responses and performance
                </li>
              </ul>
            </div>

            {/* Data-Driven Recommendations */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 text-white">
              <div className="flex items-center mb-6">
                <Target className="w-8 h-8 text-[#FFB71B] mr-3" />
                <h3 className="text-2xl font-bold">Data-Driven Recommendations</h3>
              </div>
              <p className="text-lg leading-relaxed text-white/90 mb-4 text-left">
                Our system continuously refines suggestions based on user interaction, academic 
                performance, and career trends, ensuring students receive practical and research-backed guidance.
              </p>
              <ul className="space-y-2 text-white/80 text-left">
                <li className="flex items-center text-left">
                  <CheckCircle className="w-4 h-4 text-[#FFB71B] mr-2" />
                  Integration with latest job market data
                </li>
                <li className="flex items-center text-left">
                  <CheckCircle className="w-4 h-4 text-[#FFB71B] mr-2" />
                  Analysis of accredited college programs
                </li>
                <li className="flex items-center text-left">
                  <CheckCircle className="w-4 h-4 text-[#FFB71B] mr-2" />
                  Career trend analysis and forecasting
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#2B3E4E] mb-4">How FutureU Benefits You</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive tools and services designed for different stakeholders in education
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* For Students */}
            <div className="bg-gradient-to-br from-[#2B3E4E] to-[#3A4F5A] rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center mb-4">
                <GraduationCap className="w-8 h-8 text-[#FFB71B] mr-3" />
                <h3 className="text-xl font-semibold">For Grade 9 Students</h3>
              </div>
              <ul className="space-y-2 text-white/90 text-left">
                <li className="text-left">• Eliminates guesswork in career planning</li>
                <li className="text-left">• Personalized career recommendations</li>
                <li className="text-left">• Side-by-side program comparisons</li>
                <li className="text-left">• 24/7 accessible career insights</li>
                <li className="text-left">• Virtual campus tours and reviews</li>
              </ul>
            </div>

            {/* For Parents */}
            <div className="bg-gradient-to-br from-[#FFB71B] to-[#FF9800] rounded-xl p-6 text-[#2B3E4E] shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center mb-4">
                <Heart className="w-8 h-8 text-[#2B3E4E] mr-3" />
                <h3 className="text-xl font-semibold">For Parents & Guardians</h3>
              </div>
              <ul className="space-y-2 text-left">
                <li className="text-left">• Data-driven insights for decision support</li>
                <li className="text-left">• Reduced financial risks from course shifting</li>
                <li className="text-left">• School quality and accreditation comparisons</li>
                <li className="text-left">• Evidence-based career guidance</li>
                <li className="text-left">• Cost-benefit analysis of programs</li>
              </ul>
            </div>

            {/* For Schools */}
            <div className="bg-gradient-to-br from-[#2B3E4E] to-[#3A4F5A] rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center mb-4">
                <Users className="w-8 h-8 text-[#FFB71B] mr-3" />
                <h3 className="text-xl font-semibold">For Schools & Counselors</h3>
              </div>
              <ul className="space-y-2 text-white/90 text-left">
                <li className="text-left">• Structured, scalable guidance tools</li>
                <li className="text-left">• Student analytics and insights</li>
                <li className="text-left">• Reduced counselor workload</li>
                <li className="text-left">• Curriculum development support</li>
                <li className="text-left">• Performance tracking and trends</li>
              </ul>
            </div>

            {/* For Institutions */}
            <div className="bg-gradient-to-br from-[#FFB71B] to-[#FF9800] rounded-xl p-6 text-[#2B3E4E] shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center mb-4">
                <Award className="w-8 h-8 text-[#2B3E4E] mr-3" />
                <h3 className="text-xl font-semibold">For Higher Education</h3>
              </div>
              <ul className="space-y-2 text-left">
                <li className="text-left">• Virtual campus tour platform</li>
                <li className="text-left">• Program promotion opportunities</li>
                <li className="text-left">• Reduced course shifting rates</li>
                <li className="text-left">• CHED accreditation highlighting</li>
                <li className="text-left">• Improved student-institution matching</li>
              </ul>
            </div>

            {/* For Government */}
            <div className="bg-gradient-to-br from-[#2B3E4E] to-[#3A4F5A] rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center mb-4">
                <Globe className="w-8 h-8 text-[#FFB71B] mr-3" />
                <h3 className="text-xl font-semibold">For Government Agencies</h3>
              </div>
              <ul className="space-y-2 text-white/90 text-left">
                <li className="text-left">• Career trend data for policy making</li>
                <li className="text-left">• Skills gap identification</li>
                <li className="text-left">• Workforce alignment insights</li>
                <li className="text-left">• Evidence-based curriculum development</li>
                <li className="text-left">• National education policy support</li>
              </ul>
            </div>

            {/* Platform Features */}
            <div className="bg-gradient-to-br from-[#FFB71B] to-[#FF9800] rounded-xl p-6 text-[#2B3E4E] shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center mb-4">
                <Lightbulb className="w-8 h-8 text-[#2B3E4E] mr-3" />
                <h3 className="text-xl font-semibold">Platform Features</h3>
              </div>
              <ul className="space-y-2 text-left">
                <li className="text-left">• Interactive career assessments</li>
                <li className="text-left">• Real-time recommendation engine</li>
                <li className="text-left">• Comprehensive school database</li>
                <li className="text-left">• Accreditation information</li>
                <li className="text-left">• Alumni reviews and testimonials</li>
              </ul>
            </div>
          </div>
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
          <div className="grid md:grid-cols-2 gap-12">
            {/* Mission */}
            <div className="bg-gradient-to-br from-[#2B3E4E] to-[#3A4F5A] rounded-2xl p-8 text-white shadow-2xl">
              <div className="flex items-center mb-6">
                <Target className="w-8 h-8 text-[#FFB71B] mr-3" />
                <h2 className="text-3xl font-bold">Our Mission</h2>
              </div>
              <p className="text-lg leading-relaxed text-white/90 text-left">
                To revolutionize career guidance by providing Grade 9 students with comprehensive tools, 
                personalized assessments, and expert counseling to help them make informed decisions 
                about their educational and professional futures, reducing career mismatches and 
                empowering confident academic choices.
              </p>
            </div>

            {/* Vision */}
            <div className="bg-gradient-to-br from-[#FFB71B] to-[#FF9800] rounded-2xl p-8 text-[#2B3E4E] shadow-2xl">
              <div className="flex items-center mb-6">
                <Lightbulb className="w-8 h-8 text-[#2B3E4E] mr-3" />
                <h2 className="text-3xl font-bold">Our Vision</h2>
              </div>
              <p className="text-lg leading-relaxed text-left">
                To become the leading AI-powered platform that bridges the gap between students' 
                aspirations and their career realities, creating a world where every student finds 
                their perfect path to success and fulfillment through data-driven guidance and 
                seamless academic transitions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-6 bg-[#F5F5F5]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-[#2B3E4E] mb-6">
            Ready to Transform Your Career Journey?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of students who have discovered their perfect career path with FutureU's 
            AI-powered guidance system
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={handleStartAssessment}
              className="!bg-[#2B3E4E] hover:!bg-[#1A2A3A] active:!bg-[#0F1A24] !text-white px-8 py-3 rounded-full font-semibold text-lg transition-all duration-300 hover:shadow-lg hover:shadow-[#2B3E4E]/25 focus:outline-none focus:ring-2 focus:ring-[#2B3E4E] focus:ring-offset-2 !border-0"
            >
              Start Your Assessment
            </button>
            <button 
              onClick={handleExplorePrograms}
              className="!bg-[#FFB71B] hover:!bg-[#FF9800] active:!bg-[#FF8F00] !text-[#2B3E4E] px-8 py-3 rounded-full font-semibold text-lg transition-all duration-300 hover:shadow-lg hover:shadow-[#FFB71B]/25 focus:outline-none focus:ring-2 focus:ring-[#FFB71B] focus:ring-offset-2 !border-0"
            >
              Explore Programs
            </button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#2B3E4E] mb-4">Get in Touch</h2>
            <p className="text-xl text-gray-600">
              Have questions? We'd love to hear from you.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#FFB71B] rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-[#2B3E4E]" />
              </div>
              <h3 className="text-xl font-semibold text-[#2B3E4E] mb-2">Email Us</h3>
              <p className="text-gray-600">info@futureu.com</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#FFB71B] rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-[#2B3E4E]" />
              </div>
              <h3 className="text-xl font-semibold text-[#2B3E4E] mb-2">Call Us</h3>
              <p className="text-gray-600">+63 (32) 123-4567</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#FFB71B] rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-[#2B3E4E]" />
              </div>
              <h3 className="text-xl font-semibold text-[#2B3E4E] mb-2">Visit Us</h3>
              <p className="text-gray-600">Cebu City, Philippines</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUsPage;