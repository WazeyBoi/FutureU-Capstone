import React from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import { 
  Shield, Users, Settings, FileText, Database, 
  MessageSquare, School, GraduationCap, BookOpen, Award, 
  Briefcase, ThumbsUp, BarChart2, CheckCircle, HelpCircle,
  List, ClipboardCheck, PieChart, Folder, FolderPlus, 
  FilePlus, User, LogOut
} from 'lucide-react';

const AdminDashboardTest = () => {
  const navigate = useNavigate();
  const adminUser = authService.getCurrentUser();

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
      case 'Testimony':
        navigate('/admin/testimony');
        break;
      case 'School':
        navigate('/admin/school');
        break;
      case 'School-Program':
        navigate('/admin/school-program');
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
      case 'Recommendation':
        navigate('/admin/recommendation');
        break;
      case 'Assessment-Result':
        navigate('/admin/assessment-result');
        break;
      case 'Answer':
        navigate('/admin/answer');
        break;
      case 'Question':
        navigate('/admin/question');
        break;
      case 'Choice':
        navigate('/admin/choice');
        break;
      case 'User-Assessment':
        navigate('/admin/user-assessment');
        break;
      case 'Assessment':
        navigate('/admin/assessment');
        break;
      case 'User-Assessment-Section-Result':
        navigate('/admin/user-assessment-section-result');
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

  const adminTools = [
    // New tools
    { name: 'Testimony', icon: <MessageSquare className="h-8 w-8 mb-3" /> },
    { name: 'School', icon: <School className="h-8 w-8 mb-3" /> },
    { name: 'School-Program', icon: <GraduationCap className="h-8 w-8 mb-3" /> },
    { name: 'Program', icon: <BookOpen className="h-8 w-8 mb-3" /> },
    { name: 'Accreditation', icon: <Award className="h-8 w-8 mb-3" /> },
    { name: 'Career', icon: <Briefcase className="h-8 w-8 mb-3" /> },
    { name: 'Recommendation', icon: <ThumbsUp className="h-8 w-8 mb-3" /> },
    { name: 'Assessment-Result', icon: <BarChart2 className="h-8 w-8 mb-3" /> },
    { name: 'Answer', icon: <CheckCircle className="h-8 w-8 mb-3" /> },
    { name: 'Question', icon: <HelpCircle className="h-8 w-8 mb-3" /> },
    { name: 'Choice', icon: <List className="h-8 w-8 mb-3" /> },
    { name: 'User-Assessment', icon: <ClipboardCheck className="h-8 w-8 mb-3" /> },
    { name: 'Assessment', icon: <FileText className="h-8 w-8 mb-3" /> },
    { name: 'User-Assessment-Section-Result', icon: <PieChart className="h-8 w-8 mb-3" /> },
    { name: 'Assessment-Category', icon: <Folder className="h-8 w-8 mb-3" /> },
    { name: 'Assessment-Sub-Category', icon: <FolderPlus className="h-8 w-8 mb-3" /> },
    { name: 'Quiz-Sub-Category', icon: <FilePlus className="h-8 w-8 mb-3" /> },
    { name: 'Users', icon: <User className="h-8 w-8 mb-3" /> }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#232D35] text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Shield className="h-10 w-10 text-[#FFB71B]" />
              <div className="ml-3">
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Admin Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {adminTools.map((tool, index) => (
            <div 
              key={index} 
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border border-gray-100 cursor-pointer hover:border-[#1D63A1]/30"
              onClick={() => handleToolClick(tool.name)}
            >
              <div className="flex flex-col items-center text-center">
                <div className="text-[#1D63A1]">
                  {tool.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-800">{tool.name}</h3>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboardTest;