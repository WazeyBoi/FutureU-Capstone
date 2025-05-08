import React from 'react';
import { Link } from 'react-router-dom';
import studentsImage from '../assets/Students.png';
import backgroundImage from '../assets/SchoolBackground.png';
import { FaUserGraduate, FaUsers, FaChartLine, FaBriefcase, FaSearch, FaClipboardList } from 'react-icons/fa';
//import Footer from './Footer';

const LandingPage = () => {
  return (
    <>
      <div className="w-full overflow-hidden">
        {/* Hero Section */}
        <div
          className="flex items-center justify-center gap-64 h-screen relative bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        >
          <div>
            <h1 className="text-5xl font-bold leading-tight">
              Empowering <span className="text-yellow-500">Your</span>
            </h1>
            <h1 className="text-5xl font-bold leading-tight">College Journey</h1>
            <p className="text-sm text-gray-600 mt-5 max-w-md">
              Discover your ideal college program, explore career pathways, and gain insights
              from alumni—all in one place.
            </p>
            <Link to="/register">
              <button className="mt-8 bg-yellow-500 text-black font-bold py-2 px-6 rounded hover:bg-yellow-400">
                Start Your Path
              </button>
            </Link>
          </div>
          <div>
            <img
              src={studentsImage}
              alt="Group of students"
              className="w-[500px] h-[500px] object-cover"
            />
          </div>
        </div>

        {/* What is FutureU Section */}
        <div className="flex items-center px-10 py-10 bg-gray-100 rounded-lg mx-10 my-5">
          <div className="w-1/2">
            <p className="text-sm text-gray-500 font-bold mb-4">WHAT IS FUTUREU?</p>
            <h2 className="text-4xl font-bold leading-tight mb-6">
              An <span className="bg-yellow-500 text-black px-2 py-1 rounded">all-in-one decision-making hub</span> for your college journey.
            </h2>
          </div>
          <div className="w-1/2">
            <ul className="space-y-4">
              {[
                "Suggests programs and schools based on your unique skills, interests, and career goals.",
                "Provides interactive assessments to align your academic choices with potential career pathways.",
                "Offers firsthand insights into campus life and academic quality from alumni and current students.",
                "Enables side-by-side comparisons of tuition fees, program details, location, and alumni feedback.",
                "Displays official CHED ratings and accreditations to ensure quality and credibility.",
              ].map((feature, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-green-500 mr-2">✔</span>
                  <p className="text-sm font-medium">{feature}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* What We Offer Section */}
        <div className="mt-10 text-center">
          <h2 className="text-4xl font-bold">What We Offer</h2>
        </div>

        {/* Why Us Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-10 py-10">
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
            <div
              key={index}
              className="bg-white shadow-lg rounded-lg p-6 hover:scale-105 transform transition-transform duration-300"
            >
              <div className="flex flex-col items-center">
                {item.icon}
                <h3 className="text-lg font-semibold mt-4">{item.title}</h3>
                <p className="text-sm text-gray-600 text-center mt-2">{item.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Subjects/Assessments Offered Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-10 py-10">
          {[
            {
              icon: <FaBriefcase size={48} className="text-yellow-500" />,
              title: "Career Pathways",
              description: "Explore the right career paths based on your unique strengths.",
            },
            {
              icon: <FaSearch size={48} className="text-yellow-500" />,
              title: "Program Finder",
              description: "Discover the best college programs tailored to your goals.",
            },
            {
              icon: <FaClipboardList size={48} className="text-yellow-500" />,
              title: "Assessments",
              description: "Evaluate your skills and preferences with our assessments.",
            },
          ].map((item, index) => (
            <div
              key={index}
              className="bg-white shadow-lg rounded-lg p-6 hover:scale-105 transform transition-transform duration-300"
            >
              <div className="flex flex-col items-center">
                {item.icon}
                <h3 className="text-lg font-semibold mt-4">{item.title}</h3>
                <p className="text-sm text-gray-600 text-center mt-2">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default LandingPage;