
"use client"

import React, { useState, useEffect } from 'react';
import adminSchoolService from '../../services/adminSchoolService.js';
import {
  School,
  Search,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X,
  Check,
  AlertTriangle,
  MapPin,
  Globe,
  Info,
  Building,
  Loader,
  ChevronDown,
} from 'lucide-react';

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
  
  // Auto-dismiss notifications after 5 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);
  
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
  
  // Helper function for pagination
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
  
  // Get badge color based on school type
  const getTypeBadgeColor = (type) => {
    switch (type) {
      case "Public":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "Private":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "Special":
        return "bg-amber-100 text-amber-800 border-amber-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };
  
  return (
    <div className="container mx-auto px-6 py-8 max-w-[1400px]">
      {/* Header Section */}
      <div className="mb-10">
        <div className="flex items-center mb-4">
          <div className="p-2 rounded-lg bg-[#FFB71B]/20 mr-3">
            <School className="h-6 w-6 text-[#FFB71B]" />
          </div>
          <h1 className="text-3xl font-bold text-[#2B3E4E]">School Management</h1>
        </div>
        <p className="text-gray-600 max-w-3xl">
          Manage all educational institutions in the system. Add new schools, edit details, or remove schools as needed.
        </p>
        <div className="w-24 h-1 bg-[#FFB71B] mt-4"></div>
      </div>

      {/* Search and Add Section */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="w-full md:w-2/3 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="w-full pl-10 pr-16 py-3 border border-gray-200 rounded-xl bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FFB71B] focus:border-[#FFB71B] transition-colors shadow-md"
              placeholder="Search schools by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              onClick={handleSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1.5 bg-[#FFB71B] text-[#2B3E4E] font-medium rounded-lg hover:bg-[#FFB71B]/90 transition-colors shadow-md"
            >
              Search
            </button>
          </div>

          <button
            onClick={handleAddClick}
            className="w-full md:w-auto flex items-center justify-center px-6 py-3 bg-gradient-to-r from-[#FFB71B] to-[#FFB71B]/90 text-[#2B3E4E] font-medium rounded-xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add New School
          </button>
        </div>
      </div>

      {/* Schools Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8 border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gradient-to-r from-[#2B3E4E] to-[#2B3E4E]/90 text-white text-left">
                <th className="px-6 py-4 font-semibold text-sm uppercase tracking-wider text-left">ID</th>
                <th className="px-6 py-4 font-semibold text-sm uppercase tracking-wider text-left">Name</th>
                <th className="px-6 py-4 font-semibold text-sm uppercase tracking-wider text-center">Location</th>
                <th className="px-6 py-4 font-semibold text-sm uppercase tracking-wider text-center">Type</th>
                <th className="px-6 py-4 font-semibold text-sm uppercase tracking-wider text-center">Website</th>
                <th className="px-6 py-4 font-semibold text-sm uppercase tracking-wider text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading && !filteredSchools.length ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Loader className="h-8 w-8 text-[#FFB71B] animate-spin mb-2" />
                      <p className="text-gray-500">Loading schools...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredSchools.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <School className="h-12 w-12 text-gray-300 mb-2" />
                      <p className="text-gray-500 font-medium">No schools found</p>
                      <p className="text-gray-400 text-sm mt-1">Try adjusting your search or add a new school</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedSchools.map((school) => (
                  <tr key={school.schoolId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-500 font-mono text-left">{school.schoolId}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-[#2B3E4E] text-left">{school.name}</div>
                    </td>
                    <td className="px-6 py-4 text-left">
                      <div className="flex items-start">
                        <MapPin className="h-4 w-4 text-gray-400 mt-1 mr-1 flex-shrink-0" />
                        <span className="text-gray-600 text-sm">{school.location}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTypeBadgeColor(school.type)}`}
                      >
                        {school.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {school.schoolWebsiteUrl ? (
                        <a
                          href={school.schoolWebsiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-[#FFB71B] hover:text-[#FFB71B]/80 transition-colors"
                        >
                          <Globe className="h-4 w-4 mr-1" />
                          <span className="underline">Visit</span>
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      ) : (
                        <span className="text-gray-400 text-sm">Not available</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center space-x-3">
                        <button
                          onClick={() => handleEditClick(school)}
                          className="p-2 text-[#2B3E4E] hover:bg-[#2B3E4E]/10 rounded-lg transition-colors"
                          title="Edit School"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(school)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete School"
                        >
                          <Trash2 className="h-4 w-4" />
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
      <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-600">
            Showing {filteredSchools.length > 0 ? page * rowsPerPage + 1 : 0} to{" "}
            {Math.min((page + 1) * rowsPerPage, filteredSchools.length)} of {filteredSchools.length} schools
          </div>

          <div className="flex items-center space-x-1">
            {totalPages > 0 && (
              <div className="flex space-x-1 items-center">
                {/* First page button */}
                <button
                  onClick={() => handleChangePage(0)}
                  disabled={page === 0}
                  className={`p-2 rounded-lg ${page === 0 ? "text-gray-400 cursor-not-allowed" : "text-gray-700 hover:bg-gray-100"} transition-colors`}
                  title="First page"
                >
                  <ChevronsLeft className="h-5 w-5" />
                </button>

                {/* Previous page button */}
                <button
                  onClick={() => handleChangePage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  className={`p-2 rounded-lg ${page === 0 ? "text-gray-400 cursor-not-allowed" : "text-gray-700 hover:bg-gray-100"} transition-colors`}
                  title="Previous page"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                {/* Page numbers */}
                {getPaginationRange(page, totalPages).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => handleChangePage(pageNum)}
                    className={`px-3 py-1 rounded-lg ${pageNum === page ? "bg-[#2B3E4E] text-white" : "text-gray-700 hover:bg-gray-100"} transition-colors`}
                  >
                    {pageNum + 1}
                  </button>
                ))}

                {/* Next page button */}
                <button
                  onClick={() => handleChangePage(Math.min(totalPages - 1, page + 1))}
                  disabled={page >= totalPages - 1}
                  className={`p-2 rounded-lg ${page >= totalPages - 1 ? "text-gray-400 cursor-not-allowed" : "text-gray-700 hover:bg-gray-100"} transition-colors`}
                  title="Next page"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>

                {/* Last page button */}
                <button
                  onClick={() => handleChangePage(totalPages - 1)}
                  disabled={page >= totalPages - 1}
                  className={`p-2 rounded-lg ${page >= totalPages - 1 ? "text-gray-400 cursor-not-allowed" : "text-gray-700 hover:bg-gray-100"} transition-colors`}
                  title="Last page"
                >
                  <ChevronsRight className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Rows per page:</span>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setPage(0);
              }}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#FFB71B] focus:border-[#FFB71B]"
            >
              {[5, 10, 25, 50].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Add/Edit School Dialog */}
      {openDialog && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-auto animate-fadeIn">
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10 flex justify-between items-center">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-[#FFB71B]/20 mr-3">
                  {dialogMode === "add" ? (
                    <Plus className="h-5 w-5 text-[#FFB71B]" />
                  ) : (
                    <Edit className="h-5 w-5 text-[#FFB71B]" />
                  )}
                </div>
                <h3 className="text-xl font-semibold text-[#2B3E4E]">{dialogTitle}</h3>
              </div>
              <button
                onClick={closeDialog}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">School Name *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#FFB71B] focus:border-[#FFB71B] transition-colors"
                      required
                      placeholder="Enter school name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#FFB71B] focus:border-[#FFB71B] transition-colors"
                      required
                      placeholder="Enter school address"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">School Type *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Info className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#FFB71B] focus:border-[#FFB71B] transition-colors appearance-none"
                      required
                    >
                      <option value="">Select Type</option>
                      <option value="Public">Public</option>
                      <option value="Private">Private</option>
                      <option value="Special">Special</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Globe className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="schoolWebsiteUrl"
                      value={formData.schoolWebsiteUrl}
                      onChange={handleInputChange}
                      className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#FFB71B] focus:border-[#FFB71B] transition-colors"
                      placeholder="https://example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                  <input
                    type="number"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleInputChange}
                    step="any"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#FFB71B] focus:border-[#FFB71B] transition-colors"
                    placeholder="e.g. 10.3157"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#FFB71B] focus:border-[#FFB71B] transition-colors"
                    placeholder="e.g. 123.8854"
                  />
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#FFB71B] focus:border-[#FFB71B] transition-colors"
                    placeholder="Enter school description..."
                  ></textarea>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 sticky bottom-0 bg-white z-10 flex justify-end space-x-3">
              <button
                onClick={closeDialog}
                className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-5 py-2.5 bg-gradient-to-r from-[#2B3E4E] to-[#2B3E4E]/90 text-white rounded-lg hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2B3E4E] disabled:opacity-70"
              >
                {loading ? (
                  <div className="flex items-center">
                    <Loader className="animate-spin h-4 w-4 mr-2" />
                    Saving...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Check className="h-4 w-4 mr-2" />
                    Save School
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md animate-fadeIn">
            <div className="p-6 border-b border-gray-200 flex items-center">
              <div className="p-2 rounded-full bg-red-100 mr-3">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">Confirm Delete</h3>
            </div>
            <div className="p-6">
              <p className="text-gray-700">
                Are you sure you want to delete{" "}
                <span className="font-medium text-[#2B3E4E]">{schoolToDelete?.name}</span>? This action cannot be
                undone.
              </p>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={loading}
                className="px-4 py-2 bg-[#FFB71B] text-[#2B3E4E] font-medium rounded-lg hover:bg-[#FFB71B]/90 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFB71B] disabled:opacity-70 shadow-md"
              >
                {loading ? (
                  <div className="flex items-center">
                    <Loader className="animate-spin h-4 w-4 mr-2" />
                    Deleting...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {success && (
        <div className="fixed bottom-4 right-4 bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-lg shadow-lg max-w-md z-50 animate-slideInRight">
          <div className="flex">
            <div className="flex-shrink-0">
              <Check className="h-5 w-5 text-green-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{success}</p>
            </div>
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button
                  onClick={() => setSuccess(null)}
                  className="inline-flex text-green-500 hover:text-green-600 focus:outline-none p-1.5 rounded-full hover:bg-green-100 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Notification */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-lg max-w-md z-50 animate-slideInRight">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button
                  onClick={() => setError(null)}
                  className="inline-flex text-red-500 hover:text-red-600 focus:outline-none p-1.5 rounded-full hover:bg-red-100 transition-colors"
                >
                  <X className="h-4 w-4" />
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