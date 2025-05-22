
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import adminUserService from '../../services/adminUserService';
import adminSchoolService from '../../services/adminSchoolService';
import adminProgramService from '../../services/adminProgramService';
import adminAccreditationService from '../../services/adminAccreditationService';
import adminCareerService from '../../services/adminCareerService';
import adminQuestionService from '../../services/adminQuestionService';
import adminChoiceService from '../../services/adminChoiceService';
import adminAssessmentService from '../../services/adminAssessmentService';
import adminAssessmentCategoryService from '../../services/adminAssessmentCategoryService';
import adminAssessmentSubCategoryService from '../../services/adminAssessmentSubCategoryService';
import adminQuizSubCatService from '../../services/adminQuizSubCatService';
import { 
  Shield, Users, Settings, FileText, Search, Bell,
  School, GraduationCap, BookOpen, Award, Clock,
  Briefcase, HelpCircle, List, Folder, FolderPlus, 
  FilePlus, User, LogOut, TrendingUp
} from 'lucide-react';

const AdminDashboardTest = () => {
  const navigate = useNavigate();
  const adminUser = authService.getCurrentUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // States for storing real data counts
  const [schoolCount, setSchoolCount] = useState(0);
  const [programCount, setProgramCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [assessmentCount, setAssessmentCount] = useState(0);
  const [accreditationCount, setAccreditationCount] = useState(0);
  const [careerCount, setCareerCount] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [choiceCount, setChoiceCount] = useState(0);
  const [assessmentCategoryCount, setAssessmentCategoryCount] = useState(0);
  const [assessmentSubCategoryCount, setAssessmentSubCategoryCount] = useState(0);
  const [quizSubCategoryCount, setQuizSubCategoryCount] = useState(0);
  
  // Loading state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Log the admin user data to see what's available
  useEffect(() => {
    console.log("Admin user data:", adminUser);
  }, [adminUser]);

  // Fetch all counts on component mount
  useEffect(() => {
    const fetchCounts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch all data in parallel
        const [
          schools,
          programs,
          users,
          assessments,
          accreditations,
          careers,
          questions,
          choices,
          assessmentCategories,
          assessmentSubCategories,
          quizSubCategories
        ] = await Promise.all([
          adminSchoolService.getAllSchools(),
          adminProgramService.getAllPrograms(),
          adminUserService.getAllUsers(),
          adminAssessmentService.getAllAssessments(),
          adminAccreditationService.getAllAccreditations(),
          adminCareerService.getAllCareers(),
          adminQuestionService.getAllQuestions(),
          adminChoiceService.getAllChoices(),
          adminAssessmentCategoryService.getAllAssessmentCategories(),
          adminAssessmentSubCategoryService.getAllAssessmentSubCategories(),
          adminQuizSubCatService.getAllQuizSubCategories()
        ]);
        
        // Update state with actual counts
        setSchoolCount(schools.length);
        setProgramCount(programs.length);
        setUserCount(users.length);
        setAssessmentCount(assessments.length);
        setAccreditationCount(accreditations.length);
        setCareerCount(careers.length);
        setQuestionCount(questions.length);
        setChoiceCount(choices.length);
        setAssessmentCategoryCount(assessmentCategories.length);
        setAssessmentSubCategoryCount(assessmentSubCategories.length);
        setQuizSubCategoryCount(quizSubCategories.length);
      } catch (err) {
        console.error("Error fetching counts:", err);
        setError("Failed to load dashboard data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCounts();
  }, []);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Format time as HH:MM AM/PM
  const formattedTime = currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const formattedDate = currentTime.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });

  const handleLogout = () => {
    authService.signout();
    navigate('/admin-login');
  };

  // Handle tool click to navigate to the corresponding page
  const handleToolClick = (toolName) => {
    // Add navigation logic for each tool
    switch(toolName) {
      case 'Users':
        navigate('/admin/users');
        break;
      case 'School':
        navigate('/admin/school');
        break;
      case 'School-Program':
        navigate('/admin/schoolprogram');
        break;
      case 'Program':
        navigate('/admin/program');
        break;
      case 'Accreditation':
        navigate('/admin/accreditation');
        break;
      case 'Career':
        navigate('/admin/career');
        break;
      case 'Question':
        navigate('/admin/question');
        break;
      case 'Choice':
        navigate('/admin/choice');
        break;
      case 'Assessment':
        navigate('/admin/assessment');
        break;
      case 'Assessment-Category':
        navigate('/admin/assessment-category');
        break;
      case 'Assessment-Sub-Category':
        navigate('/admin/assessment-sub-category');
        break;
      case 'Quiz-Sub-Category':
        navigate('/admin/quiz-sub-category');
        break;
      default:
        // For tools not yet implemented
        alert(`${toolName} management coming soon!`);
    }
  };

  // Quick stats for the dashboard with real data
  const quickStats = [
    {
      name: "Total Schools",
      value: schoolCount.toString(),
      icon: <School className="h-6 w-6" />,
      color: "bg-gradient-to-br from-blue-500 to-blue-600",
      increase: "+12%", // Note: This would ideally be calculated from historical data
      isUp: true,
    },
    {
      name: "Total Programs",
      value: programCount.toString(),
      icon: <BookOpen className="h-6 w-6" />,
      color: "bg-gradient-to-br from-emerald-500 to-emerald-600",
      increase: "+8%",
      isUp: true,
    },
    {
      name: "Total Users",
      value: userCount.toString(),
      icon: <Users className="h-6 w-6" />,
      color: "bg-gradient-to-br from-purple-500 to-purple-600",
      increase: "+24%",
      isUp: true,
    },
    {
      name: "Assessments",
      value: assessmentCount.toString(),
      icon: <FileText className="h-6 w-6" />,
      color: "bg-gradient-to-br from-amber-500 to-amber-600",
      increase: "-3%",
      isUp: false,
    },
  ];

  // Admin tools array with real counts
  const adminTools = [
    { name: 'School', icon: <School className="h-8 w-8 mb-3" />, count: schoolCount },
    { name: 'School-Program', icon: <GraduationCap className="h-8 w-8 mb-3" />, count: programCount }, // Assumption: School-Program count is same as program count
    { name: 'Program', icon: <BookOpen className="h-8 w-8 mb-3" />, count: programCount },
    { name: 'Accreditation', icon: <Award className="h-8 w-8 mb-3" />, count: accreditationCount },
    { name: 'Career', icon: <Briefcase className="h-8 w-8 mb-3" />, count: careerCount },
    { name: 'Question', icon: <HelpCircle className="h-8 w-8 mb-3" />, count: questionCount },
    { name: 'Choice', icon: <List className="h-8 w-8 mb-3" />, count: choiceCount },
    { name: 'Assessment', icon: <FileText className="h-8 w-8 mb-3" />, count: assessmentCount },
    { name: 'Assessment-Category', icon: <Folder className="h-8 w-8 mb-3" />, count: assessmentCategoryCount },
    { name: 'Assessment-Sub-Category', icon: <FolderPlus className="h-8 w-8 mb-3" />, count: assessmentSubCategoryCount },
    { name: 'Quiz-Sub-Category', icon: <FilePlus className="h-8 w-8 mb-3" />, count: quizSubCategoryCount },
    { name: 'Users', icon: <User className="h-8 w-8 mb-3" />, count: userCount }
  ];

  // Filter tools based on search term
  const filteredTools = adminTools.filter((tool) => {
    return tool.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Show loading spinner while data is being fetched
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1D63A1]"></div>
          <p className="mt-4 text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // Show error message if data fetching failed
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-md max-w-md">
          <div className="text-red-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-center mb-4">Dashboard Error</h2>
          <p className="text-gray-600 text-center mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="w-full py-2 px-4 bg-[#1D63A1] text-white rounded-lg hover:bg-[#1D63A1]/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with welcome message and search bar */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-start">
              <p className="text-lg font-bold text-[#2B3E4E]">Welcome back, <span className="text-[#1D63A1]">{adminUser && adminUser.firstName ? adminUser.firstName : "Admin"}</span></p>
              <div className="flex items-center text-gray-500 mt-1">
                <Clock className="h-4 w-4 mr-1.5" />
                <span className="text-xs">{formattedTime}</span>
                <span className="mx-1.5">•</span>
                <span className="text-xs">{formattedDate}</span>
              </div>
            </div>

            <div className="relative w-2/5 mx-auto">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search tools..."
                className="pl-12 pr-4 py-3 rounded-xl border border-gray-200 w-full bg-white text-gray-900 shadow-lg focus:ring-2 focus:ring-[#FFB71B] focus:border-[#FFB71B]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <button className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 border-2 border-white"></span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`p-3 rounded-xl ${stat.color} mr-4 shadow-lg`}>
                    <div className="text-white">{stat.icon}</div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{stat.name}</p>
                    <h3 className="text-2xl font-bold text-[#2B3E4E]">{stat.value}</h3>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Admin Tools Section with enhanced styling */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[#2B3E4E]">Admin Tools</h2>
            <div className="text-sm text-gray-500">
              {filteredTools.length} tools available
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredTools.map((tool, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-[#FFB71B] cursor-pointer group overflow-hidden transform hover:-translate-y-1"
                onClick={() => handleToolClick(tool.name)}
              >
                <div className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="p-4 rounded-xl bg-[#2B3E4E]/5 group-hover:bg-[#FFB71B]/10 mb-4 transition-colors">
                      <div className="text-[#2B3E4E] group-hover:text-[#FFB71B] transition-colors">
                        {tool.icon}
                      </div>
                    </div>
                    <h3 className="text-base font-semibold text-gray-800 group-hover:text-[#2B3E4E]">
                      {tool.name}
                    </h3>
                    <span className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {tool.count} items
                    </span>
                  </div>
                </div>
                <div className="h-1 w-full bg-gradient-to-r from-[#2B3E4E] to-[#FFB71B] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboardTest;

