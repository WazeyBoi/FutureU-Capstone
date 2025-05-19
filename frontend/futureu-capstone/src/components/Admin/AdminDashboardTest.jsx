import React from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import { Shield, Users, Settings, FileText, Database, LogOut } from 'lucide-react';

const AdminDashboardTest = () => {
  const navigate = useNavigate();
  const adminUser = authService.getCurrentUser();

  const handleLogout = () => {
    authService.signout();
    navigate('/admin-login');
  };

  const adminTools = [
    { name: 'User Management', icon: <Users className="h-8 w-8 mb-3" />, description: 'Manage user accounts and permissions' },
    { name: 'Assessment Editor', icon: <FileText className="h-8 w-8 mb-3" />, description: 'Create and edit assessment questions' },
    { name: 'System Settings', icon: <Settings className="h-8 w-8 mb-3" />, description: 'Configure system parameters' },
    { name: 'Database Tools', icon: <Database className="h-8 w-8 mb-3" />, description: 'Backup and restore data' },
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
                <p className="text-sm text-gray-300">Welcome, {adminUser?.firstName || 'Administrator'}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="bg-[#1D63A1] hover:bg-[#1D63A1]/90 text-white py-2 px-4 rounded-lg flex items-center"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Dashboard Overview</h2>
          <p className="text-gray-600">
            This is a test admin dashboard that's only accessible to users with the ADMIN role.
            You're successfully logged in as an administrator.
          </p>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-6">Admin Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {adminTools.map((tool, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border border-gray-100">
              <div className="flex flex-col items-center text-center">
                <div className="text-[#1D63A1]">
                  {tool.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{tool.name}</h3>
                <p className="text-gray-600 text-sm">{tool.description}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboardTest;