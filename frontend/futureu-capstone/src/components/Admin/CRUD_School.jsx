import React, { useState, useEffect } from 'react';

import adminSchoolService from '../../services/adminSchoolService.js'; 

const CRUD_School = () => {
  // State variables
  const [schools, setSchools] = useState([]);
  const [filteredSchools, setFilteredSchools] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogMode, setDialogMode] = useState(''); // 'add' or 'edit'
  const [selectedSchool, setSelectedSchool] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    type: '',
    description: '',
    schoolWebsiteUrl: '',
    latitude: '',
    longitude: '',
  });

  // Delete confirmation dialog
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [schoolToDelete, setSchoolToDelete] = useState(null);
  
  // Fetch schools on component mount
  useEffect(() => {
    fetchSchools();
  }, []);
  
  // Apply filters when search query changes
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredSchools(schools);
    } else {
      const filtered = schools.filter(school => 
        school.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredSchools(filtered);
    }
  }, [searchQuery, schools]);
  
  // Fetch all schools with error handling improvements
  const fetchSchools = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('futureu_token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      const data = await adminSchoolService.getAllSchools();
      setSchools(data);
      setFilteredSchools(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching schools:', err);
      setError(`Failed to fetch schools: ${err.message || 'Unknown error'}`);

      // Show detailed error information if available
      if (err.response) {
        console.error('Server response:', err.response.status, err.response.data);
        setError(`Server error: ${err.response.status} ${err.response.statusText}`);
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Search schools by name
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchSchools();
      return;
    }

    setLoading(true);
    try {
      const response = await adminSchoolService.searchSchoolsByName(searchQuery);
      setFilteredSchools(response);
      setError(null);
    } catch (err) {
      console.error('Error searching schools:', err);
      setError('Failed to search schools. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle input change for form fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Open dialog for adding a new school
  const handleAddClick = () => {
    setFormData({
      name: '',
      location: '',
      type: '',
      description: '',
      schoolWebsiteUrl: '',
      latitude: '',
      longitude: '',
    });
    setDialogTitle('Add New School');
    setDialogMode('add');
    setOpenDialog(true);
  };
  
  // Open dialog for editing a school
  const handleEditClick = (school) => {
    setSelectedSchool(school);
    setFormData({
      name: school.name || '',
      location: school.location || '',
      type: school.type || '',
      description: school.description || '',
      schoolWebsiteUrl: school.schoolWebsiteUrl || '',
      latitude: school.latitude || '',
      longitude: school.longitude || '',
    });
    setDialogTitle('Edit School');
    setDialogMode('edit');
    setOpenDialog(true);
  };
  
  // Handle delete button click
  const handleDeleteClick = (school) => {
    setSchoolToDelete(school);
    setDeleteConfirmOpen(true);
  };
  
  // Confirm delete school
  const confirmDelete = async () => {
    if (!schoolToDelete) return;
    
    setLoading(true);
    try {
      await adminSchoolService.deleteSchool(schoolToDelete.schoolId);
      fetchSchools(); // Refresh the list
      setSuccess('School deleted successfully');
      setDeleteConfirmOpen(false);
      setSchoolToDelete(null);
    } catch (err) {
      console.error('Error deleting school:', err);
      setError('Failed to delete school. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  // Cancel delete
  const cancelDelete = () => {
    setDeleteConfirmOpen(false);
    setSchoolToDelete(null);
  };

  const closeDialog = () => {
    setOpenDialog(false);
    setFormData({
      name: '',
      location: '',
      type: '',
      description: '',
      schoolWebsiteUrl: '',
      latitude: '',
      longitude: '',
    });
  };
  
  // Submit form for adding or editing a school
  const handleSubmit = async () => {
    // Basic validation
    if (!formData.name || !formData.location || !formData.type) {
      setError('Name, location, and type are required');
      return;
    }
    
    setLoading(true);
    try {
      if (dialogMode === 'add') {
        // Create a new school
        await adminSchoolService.createSchool(formData);
        setSuccess('School added successfully');
      } else {
        // Update existing school
        await adminSchoolService.updateSchool(selectedSchool.schoolId, {
          ...formData,
          schoolId: selectedSchool.schoolId
        });
        setSuccess('School updated successfully');
      }
      fetchSchools(); // Refresh the list
      setOpenDialog(false);
    } catch (err) {
      console.error('Error saving school:', err);
      setError(`Failed to ${dialogMode === 'add' ? 'add' : 'update'} school. Please try again later.`);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle page change
  const handleChangePage = (newPage) => {
    setPage(newPage);
  };
  
  // Calculate pagination
  const paginatedSchools = filteredSchools.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  
  const totalPages = Math.ceil(filteredSchools.length / rowsPerPage);
  
  // Add this helper function after your state declarations
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
  
  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">School Management</h1>
        <div className="w-24 h-1 bg-yellow-500 dark:bg-yellow-400"></div>
      </div>
      
      {/* Search and Add Section */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-grow">
          <div className="relative">
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1D63A1] dark:focus:ring-[#FFB71B]"
              placeholder="Search schools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              onClick={handleSearch}
              className="absolute right-0 top-0 h-full px-4 bg-[#1D63A1] dark:bg-[#FFB71B] text-white dark:text-gray-900 rounded-r-md hover:bg-[#1D63A1]/90 dark:hover:bg-[#FFB71B]/90"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>
        <button
          onClick={handleAddClick}
          className="inline-flex items-center px-4 py-2 bg-[#FFB71B] dark:bg-[#1D63A1] text-white dark:text-gray-100 rounded-md hover:bg-[#FFB71B]/90 dark:hover:bg-[#1D63A1]/90 transition-colors shadow-md"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add School
        </button>
      </div>
      
      {/* Schools Table */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-[#1D63A1] dark:bg-[#FFB71B] text-white dark:text-gray-900 text-left">
                <th className="px-6 py-3 font-semibold">ID</th>
                <th className="px-6 py-3 font-semibold">Name</th>
                <th className="px-6 py-3 font-semibold">Location</th>
                <th className="px-6 py-3 font-semibold">Type</th>
                <th className="px-6 py-3 font-semibold">Website</th>
                <th className="px-6 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading && !filteredSchools.length ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1D63A1] dark:border-[#FFB71B]"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredSchools.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    No schools found
                  </td>
                </tr>
              ) : (
                paginatedSchools.map((school) => (
                  <tr key={school.schoolId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4">{school.schoolId}</td>
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">{school.name}</td>
                    <td className="px-6 py-4">{school.location}</td>
                    <td className="px-6 py-4">{school.type}</td>
                    <td className="px-6 py-4">
                      {school.schoolWebsiteUrl ? (
                        <a
                          href={school.schoolWebsiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#1D63A1] dark:text-[#FFB71B] hover:underline"
                        >
                          Visit
                        </a>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditClick(school)}
                          className="p-1 text-[#1D63A1] dark:text-[#FFB71B] hover:bg-[#1D63A1]/10 dark:hover:bg-[#FFB71B]/10 rounded"
                          title="Edit"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteClick(school)}
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
          Showing {filteredSchools.length > 0 ? page * rowsPerPage + 1 : 0} to {Math.min((page + 1) * rowsPerPage, filteredSchools.length)} of {filteredSchools.length} schools
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
            
            {/* Previous page button */}
            <button
              onClick={() => handleChangePage(Math.max(0, page - 1))}
              disabled={page === 0}
              className={`px-2 py-1 rounded ${page === 0 ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
              title="Previous page"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            {/* Page numbers */}
            {getPaginationRange(page, totalPages).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => handleChangePage(pageNum)}
                className={`px-3 py-1 rounded ${pageNum === page ? 'bg-[#1D63A1] dark:bg-[#FFB71B] text-white dark:text-gray-900' : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
              >
                {pageNum + 1}
              </button>
            ))}
            
            {/* Next page button */}
            <button
              onClick={() => handleChangePage(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
              className={`px-2 py-1 rounded ${page >= totalPages - 1 ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
              title="Next page"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
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
            {[5, 10, 25].map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Add/Edit School Dialog */}
      {openDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800">{dialogTitle}</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">School Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1D63A1]"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1D63A1]"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">School Type *</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1D63A1]"
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="Public">Public</option>
                    <option value="Private">Private</option>
                    <option value="Special">Special</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
                  <input
                    type="text"
                    name="schoolWebsiteUrl"
                    value={formData.schoolWebsiteUrl}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1D63A1]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                  <input
                    type="number"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleInputChange}
                    step="any"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1D63A1]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                  <input
                    type="number"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleInputChange}
                    step="any"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1D63A1]"
                  />
                </div>
                
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1D63A1]"
                  ></textarea>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setOpenDialog(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-4 py-2 bg-[#1D63A1] text-white rounded-md hover:bg-[#1D63A1]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1D63A1]"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </div>
                ) : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Dialog */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800">Confirm Delete</h3>
            </div>
            <div className="p-6">
              <p className="text-gray-700">
                Are you sure you want to delete the school "{schoolToDelete?.name}"? This action cannot be undone.
              </p>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
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

export default CRUD_School;