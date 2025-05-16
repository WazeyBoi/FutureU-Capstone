import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import authService from '../../services/authService';
import { User, Mail, Lock, Home, Phone, Calendar, UserPlus, LogIn, AlertCircle, CheckCircle } from 'lucide-react';

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
    { name: 'firstName', type: 'text', placeholder: 'First Name', icon: <User className="w-5 h-5 text-gray-400 dark:text-gray-500" /> },
    { name: 'middleName', type: 'text', placeholder: 'Middle Name (Optional)', icon: <User className="w-5 h-5 text-gray-400 dark:text-gray-500" /> },
    { name: 'lastname', type: 'text', placeholder: 'Last Name', icon: <User className="w-5 h-5 text-gray-400 dark:text-gray-500" /> },
    { name: 'email', type: 'email', placeholder: 'Email Address', icon: <Mail className="w-5 h-5 text-gray-400 dark:text-gray-500" /> },
    { name: 'password', type: 'password', placeholder: 'Password', icon: <Lock className="w-5 h-5 text-gray-400 dark:text-gray-500" /> },
    { name: 'age', type: 'number', placeholder: 'Age', icon: <Calendar className="w-5 h-5 text-gray-400 dark:text-gray-500" /> },
    { name: 'address', type: 'text', placeholder: 'Address', icon: <Home className="w-5 h-5 text-gray-400 dark:text-gray-500" /> },
    { name: 'contactNumber', type: 'tel', placeholder: 'Contact Number', icon: <Phone className="w-5 h-5 text-gray-400 dark:text-gray-500" /> },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900 p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-gray-800 p-8 md:p-12 rounded-xl shadow-2xl w-full max-w-lg border border-gray-200 dark:border-gray-700"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#1D63A1] dark:text-blue-400 mt-8">Create Your Account</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Join FutureU and start planning your academic future.</p>
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

        <form onSubmit={handleRegister} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-5">
            {inputFields.map(field => (
              <div key={field.name} className={field.name === 'address' ? 'md:col-span-2' : ''}>
                <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {field.placeholder}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {field.icon}
                  </div>
                  <input
                    id={field.name}
                    name={field.name}
                    type={field.type}
                    required={field.name !== 'middleName'}
                    value={formData[field.name]}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-[#FFB71B] focus:border-[#FFB71B] dark:bg-gray-700 dark:text-white transition-colors"
                    placeholder={field.placeholder}
                  />
                </div>
              </div>
            ))}
          </div>

          <div>
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-gradient-to-r from-[#FFB71B] to-amber-500 hover:from-[#FFB71B]/90 hover:to-amber-500/90 text-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1D63A1] disabled:opacity-50 transition-opacity"
            >
              {loading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-slate-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <UserPlus className="w-5 h-5 mr-2" />
              )}
              Sign Up
            </motion.button>
          </div>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-[#1D63A1] hover:text-[#FFB71B] dark:text-blue-400 dark:hover:text-yellow-400 flex items-center justify-center mt-1">
              <LogIn className="w-4 h-4 mr-1" />
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default StudentRegister;