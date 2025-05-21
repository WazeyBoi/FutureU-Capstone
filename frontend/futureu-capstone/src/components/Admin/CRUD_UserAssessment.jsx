import React, { useState, useEffect } from 'react';
import adminUserAssessmentService from '../../services/adminUserAssessmentService';
import adminUserService from '../../services/adminUserService';
import adminAssessmentService from '../../services/adminAssessmentService';

const CRUD_UserAssessment = () => {
  // State variables
  const [userAssessments, setUserAssessments] = useState([]);
  const [filteredUserAssessments, setFilteredUserAssessments] = useState([]);
  const [users, setUsers] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedUserAssessment, setSelectedUserAssessment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    userId: '',
    assessmentId: '',
    attemptNo: 1,
    score: 0.0,
    status: 'IN_PROGRESS',
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userAssessmentToDelete, setUserAssessmentToDelete] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterUser, setFilterUser] = useState('');
  const [filterAssessment, setFilterAssessment] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Fetch data on component mount
  useEffect(() => {
    fetchUserAssessments();
    fetchUsers();
    fetchAssessments();
  }, []);

  // Apply filters when search query or filters change
  useEffect(() => {
    if (searchQuery.trim() === '' && !filterUser && !filterAssessment && !filterStatus) {
      setFilteredUserAssessments(userAssessments);
    } else {
      let filtered = [...userAssessments];
      
      // Apply text search if provided
      if (searchQuery.trim() !== '') {
        filtered = filtered.filter(ua => 
          (ua.user && ua.user.username && ua.user.username.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (ua.assessment && ua.assessment.title && ua.assessment.title.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      }
      
      // Apply user filter if selected
      if (filterUser) {
        filtered = filtered.filter(ua => ua.user && ua.user.userId === parseInt(filterUser));
      }
      
      // Apply assessment filter if selected
      if (filterAssessment) {
        filtered = filtered.filter(ua => ua.assessment && ua.assessment.assessmentId === parseInt(filterAssessment));
      }
      
      // Apply status filter if selected
      if (filterStatus) {
        filtered = filtered.filter(ua => ua.status === filterStatus);
      }
      
      setFilteredUserAssessments(filtered);
    }
  }, [searchQuery, filterUser, filterAssessment, filterStatus, userAssessments]);

  const fetchUserAssessments = async () => {
    setLoading(true);
    try {
      const data = await adminUserAssessmentService.getAllUserAssessments();
      setUserAssessments(data);
      setFilteredUserAssessments(data);
      setError(null);
    } catch (error) {
      setError('Failed to fetch user assessments');
      console.error('Error fetching user assessments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await adminUserService.getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchAssessments = async () => {
    try {
      const data = await adminAssessmentService.getAllAssessments();
      setAssessments(data);
    } catch (error) {
      console.error('Error fetching assessments:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleAddClick = () => {
    setFormData({
      userId: '',
      assessmentId: '',
      attemptNo: 1,
      score: 0.0,
      status: 'IN_PROGRESS',
    });
    setIsEditing(false);
    setSelectedUserAssessment(null);
    setIsModalVisible(true);
  };

  const handleEditClick = (userAssessment) => {
    setSelectedUserAssessment(userAssessment);
    setFormData({
      userId: userAssessment.user?.userId?.toString() || '',
      assessmentId: userAssessment.assessment?.assessmentId?.toString() || '',
      attemptNo: userAssessment.attemptNo || 1,
      score: userAssessment.score || 0.0,
      status: userAssessment.status || 'IN_PROGRESS',
    });
    setIsEditing(true);
    setIsModalVisible(true);
  };

  const handleDeleteClick = (userAssessment) => {
    setUserAssessmentToDelete(userAssessment);
    setDeleteConfirmOpen(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const cancelDelete = () => {
    setDeleteConfirmOpen(false);
    setUserAssessmentToDelete(null);
  };

  const confirmDelete = async () => {
    if (!userAssessmentToDelete) return;
    
    setLoading(true);
    try {
      await adminUserAssessmentService.deleteUserAssessment(userAssessmentToDelete.userQuizAssessment);
      fetchUserAssessments(); // Refresh the list
      setSuccess('User assessment deleted successfully');
      setDeleteConfirmOpen(false);
      setUserAssessmentToDelete(null);
    } catch (error) {
      console.error('Error deleting user assessment:', error);
      setError('Failed to delete user assessment. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    // Basic validation
    if (!formData.userId || !formData.assessmentId) {
      setError('User and Assessment are required');
      return;
    }
    
    setLoading(true);
    try {
      const userAssessmentData = {
        user: { userId: parseInt(formData.userId) },
        assessment: { assessmentId: parseInt(formData.assessmentId) },
        attemptNo: parseInt(formData.attemptNo),
        score: parseFloat(formData.score),
        status: formData.status,
      };
      
      if (isEditing) {
        // Update existing user assessment
        await adminUserAssessmentService.updateUserAssessment(selectedUserAssessment.userQuizAssessment, userAssessmentData);
        setSuccess('User assessment updated successfully');
      } else {
        // Create new user assessment
        await adminUserAssessmentService.createUserAssessment(userAssessmentData);
        setSuccess('User assessment created successfully');
      }
      fetchUserAssessments(); // Refresh the list
      setIsModalVisible(false);
    } catch (error) {
      console.error('Error saving user assessment:', error);
      setError(`Failed to ${isEditing ? 'update' : 'create'} user assessment. Please try again later.`);
    } finally {
      setLoading(false);
    }
  };

  // Handle page change
  const handleChangePage = (newPage) => {
    setPage(newPage);
  };

  // Handle filter changes
  const handleFilterUserChange = (e) => {
    setFilterUser(e.target.value);
  };

  const handleFilterAssessmentChange = (e) => {
    setFilterAssessment(e.target.value);
  };

  const handleFilterStatusChange = (e) => {
    setFilterStatus(e.target.value);
  };

  // Calculate pagination
  const paginatedUserAssessments = filteredUserAssessments.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const totalPages = Math.ceil(filteredUserAssessments.length / rowsPerPage);
  
  // Helper function to get pagination range
  const getPaginationRange = (current, totalPages) => {
    const MAX_VISIBLE_PAGES = 5;
    let start = Math.max(0, current - Math.floor(MAX_VISIBLE_PAGES / 2));
    let end = Math.min(totalPages - 1, start + MAX_VISIBLE_PAGES - 1);
    
    // Adjust start if we're near the end
    if (end - start + 1 < MAX_VISIBLE_PAGES) {
      start = Math.max(0, end - MAX_VISIBLE_PAGES + 1);
    }
    
    const range = [];
    for (let i = start; i <= end; i++) {
      range.push(i);
    }
    
    return range;
  };

  // Helper functions to get user/assessment names
  const getUsernameById = (userId) => {
    const user = users.find(user => user.userId === userId);
    return user ? user.username : 'Unknown';
  };

  const getAssessmentTitleById = (assessmentId) => {
    const assessment = assessments.find(assessment => assessment.assessmentId === assessmentId);
    return assessment ? assessment.title : 'Unknown';
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">User Assessment Management</h1>
        <div className="w-24 h-1 bg-yellow-500 dark:bg-yellow-400"></div>
      </div>
      
      {/* Search and Filter Section */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-grow">
          <div className="relative">
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1D63A1] dark:focus:ring-[#FFB71B]"
              placeholder="Search by user or assessment..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              type="button"
              className="absolute right-0 top-0 h-full px-4 bg-[#1D63A1] dark:bg-[#FFB71B] text-white dark:text-gray-900 rounded-r-md hover:bg-[#1D63A1]/90 dark:hover:bg-[#FFB71B]/90"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Filter Dropdowns */}
        <div className="flex flex-col sm:flex-row gap-2">
          <select
            value={filterUser}
            onChange={handleFilterUserChange}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1D63A1] dark:focus:ring-[#FFB71B]"
          >
            <option value="">All Users</option>
            {users.map((user) => (
              <option key={user.userId} value={user.userId}>{user.username}</option>
            ))}
          </select>
          
          <select
            value={filterAssessment}
            onChange={handleFilterAssessmentChange}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1D63A1] dark:focus:ring-[#FFB71B]"
          >
            <option value="">All Assessments</option>
            {assessments.map((assessment) => (
              <option key={assessment.assessmentId} value={assessment.assessmentId}>{assessment.title}</option>
            ))}
          </select>
          
          <select
            value={filterStatus}
            onChange={handleFilterStatusChange}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1D63A1] dark:focus:ring-[#FFB71B]"
          >
            <option value="">All Statuses</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="ABANDONED">Abandoned</option>
          </select>
        </div>
        
        <button
          onClick={handleAddClick}
          className="inline-flex items-center px-4 py-2 bg-[#FFB71B] dark:bg-[#1D63A1] text-white dark:text-gray-100 rounded-md hover:bg-[#FFB71B]/90 dark:hover:bg-[#1D63A1]/90 transition-colors shadow-md"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add User Assessment
        </button>
      </div>
      
      {/* User Assessments Table */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-[#1D63A1] dark:bg-[#FFB71B] text-white dark:text-gray-900 text-left">
                <th className="px-6 py-3 font-semibold">ID</th>
                <th className="px-6 py-3 font-semibold">User</th>
                <th className="px-6 py-3 font-semibold">Assessment</th>
                <th className="px-6 py-3 font-semibold">Attempt</th>
                <th className="px-6 py-3 font-semibold">Score</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 font-semibold">Date Taken</th>
                <th className="px-6 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading && !filteredUserAssessments.length ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1D63A1] dark:border-[#FFB71B]"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredUserAssessments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    No user assessments found
                  </td>
                </tr>
              ) : (
                paginatedUserAssessments.map((userAssessment) => (
                  <tr key={userAssessment.userQuizAssessment} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4">{userAssessment.userQuizAssessment}</td>
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">
                      {userAssessment.user ? userAssessment.user.username : 'Unknown'}
                    </td>
                    <td className="px-6 py-4">
                      {userAssessment.assessment ? userAssessment.assessment.title : 'Unknown'}
                    </td>
                    <td className="px-6 py-4">{userAssessment.attemptNo}</td>
                    <td className="px-6 py-4">{userAssessment.score ? userAssessment.score.toFixed(2) : '0.00'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium 
                        ${userAssessment.status === 'COMPLETED' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                          userAssessment.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 
                          userAssessment.status === 'ABANDONED' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 
                          'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'}`}>
                        {userAssessment.status || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {userAssessment.dateTaken ? new Date(userAssessment.dateTaken).toLocaleString('en-US', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                    }) : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditClick(userAssessment)}
                          className="p-1 text-[#1D63A1] dark:text-[#FFB71B] hover:bg-[#1D63A1]/10 dark:hover:bg-[#FFB71B]/10 rounded"
                          title="Edit"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteClick(userAssessment)}
                          className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                          title="Delete"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Pagination */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-700 dark:text-gray-300">
          Showing {filteredUserAssessments.length > 0 ? page * rowsPerPage + 1 : 0} to {Math.min((page + 1) * rowsPerPage, filteredUserAssessments.length)} of {filteredUserAssessments.length} user assessments
        </div>
        
        {totalPages > 0 && (
          <div className="flex space-x-1 items-center">
            {/* First page button */}
            <button
              onClick={() => handleChangePage(0)}
              disabled={page === 0}
              className={`px-2 py-1 rounded ${page === 0 ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
              title="First page"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
            
            {/* Previous page button */}
            <button
              onClick={() => handleChangePage(page - 1)}
              disabled={page === 0}
              className={`px-2 py-1 rounded ${page === 0 ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
              title="Previous page"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            {/* Page buttons */}
            {getPaginationRange(page, totalPages).map((pageNumber) => (
              <button
                key={pageNumber}
                onClick={() => handleChangePage(pageNumber)}
                className={`px-3 py-1 rounded ${pageNumber === page ? 'bg-[#1D63A1] dark:bg-[#FFB71B] text-white dark:text-gray-900' : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
              >
                {pageNumber + 1}
              </button>
            ))}
            
            {/* Next page button */}
            <button
              onClick={() => handleChangePage(page + 1)}
              disabled={page >= totalPages - 1}
              className={`px-2 py-1 rounded ${page >= totalPages - 1 ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
              title="Next page"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            
            {/* Last page button */}
            <button
              onClick={() => handleChangePage(totalPages - 1)}
              disabled={page >= totalPages - 1}
              className={`px-2 py-1 rounded ${page >= totalPages - 1 ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
              title="Last page"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-700 dark:text-gray-300">Rows per page:</span>
          <select
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setPage(0);
            }}
            className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
          >
            {[5, 10, 25, 50].map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Add/Edit User Assessment Modal */}
      {isModalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                {isEditing ? 'Edit User Assessment' : 'Add New User Assessment'}
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">User *</label>
                  <select
                    name="userId"
                    value={formData.userId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1D63A1] dark:focus:ring-[#FFB71B] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    required
                  >
                    <option value="">Select a user</option>
                    {users.map((user) => (
                      <option key={user.userId} value={user.userId}>
                        {user.username} ({user.firstName} {user.lastName})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assessment *</label>
                  <select
                    name="assessmentId"
                    value={formData.assessmentId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1D63A1] dark:focus:ring-[#FFB71B] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    required
                  >
                    <option value="">Select an assessment</option>
                    {assessments.map((assessment) => (
                      <option key={assessment.assessmentId} value={assessment.assessmentId}>
                        {assessment.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Attempt Number</label>
                  <input
                    type="number"
                    name="attemptNo"
                    value={formData.attemptNo}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1D63A1] dark:focus:ring-[#FFB71B] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Score</label>
                  <input
                    type="number"
                    name="score"
                    value={formData.score}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1D63A1] dark:focus:ring-[#FFB71B] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1D63A1] dark:focus:ring-[#FFB71B] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  >
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="ABANDONED">Abandoned</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-4 py-2 bg-[#1D63A1] dark:bg-[#FFB71B] text-white dark:text-gray-900 rounded-md hover:bg-[#1D63A1]/90 dark:hover:bg-[#FFB71B]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1D63A1] dark:focus:ring-[#FFB71B]"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white dark:border-gray-900 mr-2"></div>
                    Saving...
                  </div>
                ) : isEditing ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Dialog */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Confirm Delete</h3>
            </div>
            <div className="p-6">
              <p className="text-gray-700 dark:text-gray-300">
                Are you sure you want to delete this user assessment? This action cannot be undone.
              </p>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Deleting...
                  </div>
                ) : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Success Notification */}
      {success && (
        <div className="fixed bottom-4 right-4 bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-md max-w-md z-50">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm">{success}</p>
            </div>
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button 
                  onClick={() => setSuccess(null)}
                  className="inline-flex text-green-500 hover:text-green-600 focus:outline-none"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Error Notification */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-md max-w-md z-50">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button 
                  onClick={() => setError(null)}
                  className="inline-flex text-red-500 hover:text-red-600 focus:outline-none"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CRUD_UserAssessment;