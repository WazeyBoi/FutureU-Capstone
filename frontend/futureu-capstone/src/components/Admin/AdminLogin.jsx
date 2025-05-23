import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import authService from '../../services/authService';
import { Mail, Lock, LogIn, AlertCircle, Shield, Eye, EyeOff } from 'lucide-react';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const userData = await authService.signin(email, password);
      
      // Check if user has admin role (case-insensitive)
      const role = authService.getUserRole();

      if (!role || role.toUpperCase() !== 'ADMIN') {
        setError('Access denied. Admin privileges required.');
        authService.signout(); 
        setLoading(false);
        return;
      }
      
      // Navigate to admin dashboard
      navigate('/admin-dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center backdrop-blur-md p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden"
      >
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#FFB71B] via-[#FFB71B]/80 to-[#FFB71B]/50 z-10"></div>
        <div className="h-1.5 bg-gradient-to-r from-[#2B3E4E]/50 via-[#2B3E4E]/80 to-[#2B3E4E] absolute bottom-0 left-0 right-0 z-10"></div>
        
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#2B3E4E]/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#FFB71B]/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>

        <div className="p-10 md:p-12 relative z-10">
          <div className="flex items-center mb-10 justify-start">
            <div className="bg-gradient-to-br from-[#2B3E4E] to-[#2B3E4E]/90 p-4 rounded-2xl mr-5 shadow-lg">
              <Shield className="text-[#FFB71B] text-2xl" />
            </div>
            <div className="text-left">
              <h3 className="text-3xl font-bold text-[#2B3E4E] dark:text-blue-400">Admin Portal</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Sign in with administrator credentials</p>
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-400 p-3 rounded-lg mb-6 flex items-center"
            >
              <AlertCircle className="w-5 h-5 mr-2" />
              <span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ml-1 text-left">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-[#FFB71B] transition-colors" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-12 w-full px-5 py-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-[#FFB71B] focus:border-[#FFB71B] transition-all focus:bg-white dark:focus:bg-gray-700 dark:text-white text-base"
                    placeholder="admin@example.com"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 ml-1 text-left">
                    Password
                  </label>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-[#FFB71B] transition-colors" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-12 pr-14 w-full py-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-[#FFB71B] focus:border-[#FFB71B] transition-all focus:bg-white dark:focus:bg-gray-700 dark:text-white text-base"
                    placeholder="••••••••"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none pointer-events-auto bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      style={{ boxShadow: 'none', border: 'none' }}
                      onMouseDown={(e) => e.preventDefault()}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex justify-center items-center py-4 px-5 rounded-2xl text-white bg-gradient-to-r from-[#2B3E4E] to-[#2B3E4E]/90 hover:from-[#2B3E4E]/95 hover:to-[#2B3E4E]/85 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFB71B] disabled:opacity-50 transition-all shadow-lg hover:shadow-xl text-lg font-medium"
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <span className="flex items-center">
                    <span>Sign In as Admin</span>
                    <LogIn className="ml-2 h-5 w-5" />
                  </span>
                )}
              </motion.button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              <Link 
                to="/login" 
                className="flex items-center justify-center mt-1"
                style={{ color: "#2B3E4E", fontWeight: 500 }}
                onMouseOver={(e) => e.currentTarget.style.color = "#FFB71B"}
                onMouseLeave={(e) => e.currentTarget.style.color = "#2B3E4E"}
              >
                <LogIn className="w-4 h-4 mr-1" />
                Back to Student Login
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;