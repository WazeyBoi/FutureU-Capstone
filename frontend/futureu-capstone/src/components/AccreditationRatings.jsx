import React from 'react';
import { Trophy, Star, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';

const AccreditationRatings = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div 
        className="relative h-[500px] bg-cover bg-center"
        style={{
          backgroundImage: "linear-gradient(rgba(33, 46, 54, 0.85), rgba(33, 46, 54, 0.85)), url('/images/graduation-caps.jpg')"
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="max-w-3xl px-4 text-center">
            <h1 className="text-5xl font-bold text-white mb-6">CHED Accreditation Ratings</h1>
            <p className="text-xl text-white opacity-90">
              Fostering academic distinction through world-class accreditation across our distinguished schools.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 -mt-32 relative z-10 pb-16">
        <div className="grid md:grid-cols-3 gap-8">
          {/* CHED Accreditation Card */}
          <Link 
            to="/accreditation/ched"
            className="bg-white rounded-lg p-8 text-center hover:shadow-lg transition-all duration-300 group cursor-pointer"
          >
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-white border-2 border-[#ffb402] flex items-center justify-center mb-6 group-hover:bg-[#ffb402] transition-colors duration-300">
                <Trophy className="w-10 h-10 text-[#ffb402] group-hover:text-white transition-colors duration-300" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-[#212e36] mb-3">CHED Accreditation</h2>
            <p className="text-gray-600">Recognized excellence in higher education standards</p>
          </Link>

          {/* Culture of Excellence Card */}
          <Link 
            to="/accreditation/excellence"
            className="bg-white rounded-lg p-8 text-center hover:shadow-lg transition-all duration-300 group cursor-pointer"
          >
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-white border-2 border-[#ffb402] flex items-center justify-center mb-6 group-hover:bg-[#ffb402] transition-colors duration-300">
                <Star className="w-10 h-10 text-[#ffb402] group-hover:text-white transition-colors duration-300" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-[#212e36] mb-3">Culture of Excellence</h2>
            <p className="text-gray-600">Setting benchmarks in academic achievement</p>
          </Link>

          {/* Culture of Development Card */}
          <Link 
            to="/accreditation/development"
            className="bg-white rounded-lg p-8 text-center hover:shadow-lg transition-all duration-300 group cursor-pointer"
          >
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-white border-2 border-[#ffb402] flex items-center justify-center mb-6 group-hover:bg-[#ffb402] transition-colors duration-300">
                <GraduationCap className="w-10 h-10 text-[#ffb402] group-hover:text-white transition-colors duration-300" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-[#212e36] mb-3">Culture of Development</h2>
            <p className="text-gray-600">Continuous growth and improvement initiatives</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AccreditationRatings;