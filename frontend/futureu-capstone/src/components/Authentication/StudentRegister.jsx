import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import authService from '../../services/authService';
import { User, Mail, Lock, Home, Phone, Calendar, UserPlus, LogIn, AlertCircle, CheckCircle, GraduationCap, Eye, EyeOff } from 'lucide-react';

const StudentRegister = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastname: '',
    email: '',
    password: '',
    age: '',
    address: '',
    contactNumber: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Basic validation example (add more as needed)
    if (parseInt(formData.age) < 0 || parseInt(formData.age) > 120) {
        setError('Please enter a valid age.');
        setLoading(false);
        return;
    }
    if (formData.password.length < 6) {
        setError('Password must be at least 6 characters long.');
        setLoading(false);
        return;
    }


    try {
      await authService.signup(formData);
      setSuccess('Registration successful! Please sign in.');
      // Optionally, redirect to login after a delay or clear form
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputFields = [
    { name: 'firstName', type: 'text', placeholder: 'First Name', icon: <User className="h-5 w-5 text-gray-400 group-focus-within:text-[#FFB71B] transition-colors" /> },
    { name: 'middleName', type: 'text', placeholder: 'Middle Name (Optional)', icon: <User className="h-5 w-5 text-gray-400 group-focus-within:text-[#FFB71B] transition-colors" /> },
    { name: 'lastname', type: 'text', placeholder: 'Last Name', icon: <User className="h-5 w-5 text-gray-400 group-focus-within:text-[#FFB71B] transition-colors" /> },
    { name: 'email', type: 'email', placeholder: 'Email Address', icon: <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-[#FFB71B] transition-colors" /> },
    { name: 'password', type: 'password', placeholder: 'Password', icon: <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-[#FFB71B] transition-colors" /> },
    { name: 'age', type: 'number', placeholder: 'Age', icon: <Calendar className="h-5 w-5 text-gray-400 group-focus-within:text-[#FFB71B] transition-colors" /> },
    { name: 'address', type: 'text', placeholder: 'Address', icon: <Home className="h-5 w-5 text-gray-400 group-focus-within:text-[#FFB71B] transition-colors" /> },
    { name: 'contactNumber', type: 'tel', placeholder: 'Contact Number', icon: <Phone className="h-5 w-5 text-gray-400 group-focus-within:text-[#FFB71B] transition-colors" /> },
  ];

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

        <div className="p-8 md:p-10 relative z-10">
          <div className="flex items-center mb-8">
            <div className="bg-gradient-to-br from-[#2B3E4E] to-[#2B3E4E]/90 p-4 rounded-2xl mr-5 shadow-lg">
              <GraduationCap className="text-[#FFB71B] text-2xl" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-[#2B3E4E] dark:text-blue-400">Create Your Account</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Join FutureU and start planning your academic future.</p>
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
          
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 text-green-600 dark:text-green-400 p-3 rounded-lg mb-6 flex items-center"
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              <span>{success}</span>
            </motion.div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
              {inputFields.map(field => (
                <div key={field.name} className={field.name === 'address' || field.name === 'contactNumber' ? 'md:col-span-2' : ''}>
                  <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ml-1 text-left">
                    {field.placeholder}
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      {field.icon}
                    </div>
                    {field.name === 'password' ? (
                      <>
                        <input
                          id={field.name}
                          name={field.name}
                          type={showPassword ? "text" : "password"}
                          required
                          value={formData[field.name]}
                          onChange={handleChange}
                          className="pl-12 w-full py-3 pr-14 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-[#FFB71B] focus:border-[#FFB71B] transition-all focus:bg-white dark:focus:bg-gray-700 dark:text-white text-base"
                          placeholder={field.placeholder}
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <button
                            type="button"
                            className="text-gray-400 hover:text-[#2B3E4E] dark:hover:text-[#2B3E4E] bg-transparent pointer-events-auto"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                            style={{ 
                              boxShadow: 'none', 
                              outline: 'none',
                              border: 'none'
                            }}
                            onMouseDown={(e) => e.preventDefault()}
                            onFocus={(e) => e.target.style.outline = 'none'}
                          >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </>
                    ) : (
                      <input
                        id={field.name}
                        name={field.name}
                        type={field.type}
                        required={field.name !== 'middleName'}
                        value={formData[field.name]}
                        onChange={handleChange}
                        className="pl-12 w-full px-5 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-[#FFB71B] focus:border-[#FFB71B] transition-all focus:bg-white dark:focus:bg-gray-700 dark:text-white text-base"
                        placeholder={field.placeholder}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2">
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
                    <span>Creating account...</span>
                  </div>
                ) : (
                  <span className="flex items-center">
                    <span>Sign Up</span>
                    <UserPlus className="ml-2 h-5 w-5" />
                  </span>
                )}
              </motion.button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link 
                to="/login" 
                style={{ color: "#FFB71B", fontWeight: 500 }}
                onMouseOver={(e) => e.currentTarget.style.color = "#e6a519"}
                onMouseLeave={(e) => e.currentTarget.style.color = "#FFB71B"}
                className="flex items-center justify-center mt-1"
              >
                <LogIn className="w-4 h-4 mr-1" />
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default StudentRegister;