import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';

const AccreditationSection = () => {
  const { section } = useParams();

  const sections = {
    ched: {
      title: "CHED Accreditation",
      description: "Our highest level of institutional recognition for academic excellence.",
      items: [
        {
          title: "Level IV Accreditation",
          description: "Our highest level of institutional recognition for academic excellence.",
          image: "/images/classroom.jpg",
          features: [
            "Center of Excellence Status",
            "Outstanding Program Performance",
            "Research Excellence Recognition"
          ]
        },
        {
          title: "Institutional Recognition",
          description: "Leading the way in Philippine higher education standards.",
          image: "/images/students.jpg",
          features: [
            "CHED Autonomous Status",
            "International Accreditation",
            "Quality Assurance Certification"
          ]
        }
      ]
    },
    excellence: {
      title: "Culture of Excellence",
      description: "Setting new standards in academic achievement and innovation.",
      items: [
        {
          title: "Academic Excellence",
          description: "Setting new standards in academic achievement and innovation.",
          image: "/images/research.jpg",
          features: [
            "Research Publications: 500+",
            "Research Grants: ₱500M+",
            "International Partners: 50+"
          ]
        },
        {
          title: "Faculty Excellence",
          description: "Our distinguished faculty leads with expertise and innovation.",
          image: "/images/faculty.jpg",
          features: [
            "PhD Faculty: 80%",
            "Teaching Experience: 15+ years avg.",
            "Student Satisfaction: 95%"
          ]
        }
      ]
    },
    development: {
      title: "Culture of Development",
      description: "Continuous growth and improvement initiatives for sustained excellence.",
      items: [
        {
          title: "Professional Growth",
          description: "Continuous development programs for faculty and staff excellence.",
          image: "/images/development.jpg",
          features: [
            "Faculty Development Programs",
            "International Training Opportunities",
            "Research Support Initiatives"
          ]
        },
        {
          title: "Infrastructure Growth",
          description: "State-of-the-art facilities and continuous improvement.",
          image: "/images/infrastructure.jpg",
          features: [
            "Modern Research Facilities",
            "Smart Classrooms",
            "Digital Infrastructure"
          ]
        }
      ]
    }
  };

  const currentSection = sections[section];

  if (!currentSection) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Section not found</h1>
          <Link 
            to="/accreditation"
            className="text-[#ffb402] hover:text-[#212e36] transition-colors"
          >
            Return to Accreditation Ratings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Back Navigation */}
      <div className="bg-[#212e36] py-6">
        <div className="container mx-auto px-4 flex justify-start">
          <Link 
            to="/accreditation"
            className="inline-flex items-center text-[#ffb402] hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Overview
          </Link>
        </div>
      </div>

      {/* Section Header */}
      <header className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-[#212e36] mb-4">{currentSection.title}</h1>
        <p className="text-xl text-gray-600">{currentSection.description}</p>
      </header>

      {/* Section Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-12">
          {currentSection.items.map((item, index) => (
            <div key={index} className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100">
              <div className="aspect-w-16 aspect-h-9">
                <img 
                  src={item.image} 
                  alt={item.title}
                  className="w-full h-64 object-cover"
                />
              </div>
              <div className="p-8">
                <h2 className="text-2xl font-bold text-[#212e36] mb-4">{item.title}</h2>
                <p className="text-gray-600 mb-6">{item.description}</p>
                <ul className="space-y-4">
                  {item.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <div className="mt-1">
                        <Check className="w-5 h-5 text-[#ffb402] mr-3 flex-shrink-0" />
                      </div>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AccreditationSection;