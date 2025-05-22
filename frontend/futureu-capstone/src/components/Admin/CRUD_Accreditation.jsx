
import React, { useState, useEffect } from 'react';
import adminAccreditationService from '../../services/adminAccreditationService';
import adminSchoolService from '../../services/adminSchoolService';
import adminSchoolProgramService from '../../services/adminSchoolProgramService';

const CRUD_Accreditation = () => {
  const [accreditations, setAccreditations] = useState([]);
  const [schools, setSchools] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedAccreditation, setSelectedAccreditation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    schoolId: '',
    accreditationLevel: '',
    accreditingBody: '',
    recognitionStatus: ''
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [accreditationToDelete, setAccreditationToDelete] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredAccreditations, setFilteredAccreditations] = useState([]);
  const [selectedSchoolPrograms, setSelectedSchoolPrograms] = useState([]);
  const [schoolPrograms, setSchoolPrograms] = useState([]);
  const [loadingPrograms, setLoadingPrograms] = useState(false);
  const [formSchoolPrograms, setFormSchoolPrograms] = useState([]);
  
  // Define accreditation options
  const accreditingBodyOptions = ['PACUCOA', 'PAASCU', 'AACCUP', 'DOST-SEI'];
  const accreditationLevelOptions = ['Level I', 'Level II', 'Level III', 'Level IV'];
  const recognitionStatusOptions = ['COE', 'COD', ''];

  // Fetch accreditations and schools on component mount
  useEffect(() => {
    fetchAccreditations();
    fetchSchools();
  }, []);

  // Apply filters when search query changes
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredAccreditations(accreditations);
    } else {
      const filtered = accreditations.filter(accreditation => 
        accreditation.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredAccreditations(filtered);
    }
  }, [searchQuery, accreditations]);

  const fetchAccreditations = async () => {
    setLoading(true);
    try {
      const data = await adminAccreditationService.getAllAccreditations();
      setAccreditations(data);
      setFilteredAccreditations(data);
      setError(null);
    } catch (error) {
      setError('Failed to fetch accreditations');
      console.error('Error fetching accreditations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSchools = async () => {
    try {
      const data = await adminSchoolService.getAllSchools();
      setSchools(data);
    } catch (error) {
      console.error('Error fetching schools:', error);
    }
  };

  const fetchSchoolProgramsBySchool = async (schoolId) => {
    setLoadingPrograms(true);
    try {
      console.log('Fetching programs for school ID:', schoolId);
      // Fetch all programs for this school
      const programs = await adminSchoolProgramService.getSchoolProgramsBySchool(schoolId);
      console.log('Programs retrieved:', programs);
      
      // Ensure programs is an array and handle empty or null response
      const validPrograms = Array.isArray(programs) ? programs : [];
      
      setSchoolPrograms(validPrograms);
      setFormSchoolPrograms(validPrograms);
      
      if (validPrograms.length === 0) {
        console.log('No programs found for school ID:', schoolId);
      }
      
      setError(null);
    } catch (error) {
      console.error('Error fetching school programs:', error);
      setError('Failed to fetch school programs');
      setFormSchoolPrograms([]);
    } finally {
      setLoadingPrograms(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // When school changes, fetch its programs
    if (name === 'schoolId' && value) {
      console.log('School selected, fetching programs for ID:', value);
      // Clear previous selections when school changes
      setSelectedSchoolPrograms([]);
      fetchSchoolProgramsBySchool(parseInt(value));
    }
  };

  const handleAddClick = () => {
    setFormData({
      title: '',
      description: '',
      schoolId: '',
      accreditationLevel: '',
      accreditingBody: '',
      recognitionStatus: ''
    });
    setIsEditing(false);
    setSelectedAccreditation(null);
    setSelectedSchoolPrograms([]);
    setFormSchoolPrograms([]);
    setIsModalVisible(true);
  };

  const handleEditClick = (accreditation) => {
    setSelectedAccreditation(accreditation);
    setFormData({
      title: accreditation.title || '',
      description: accreditation.description || '',
      schoolId: accreditation.school ? accreditation.school.schoolId : '',
      accreditationLevel: accreditation.accreditationLevel || '',
      accreditingBody: accreditation.accreditingBody || '',
      recognitionStatus: accreditation.recognitionStatus || ''
    });
    
    // If editing, fetch the school programs
    if (accreditation.school) {
      fetchSchoolProgramsBySchool(accreditation.school.schoolId);
    } else {
      setFormSchoolPrograms([]);
    }
    
    setIsEditing(true);
    setSelectedSchoolPrograms([]);
    setIsModalVisible(true);
  };

  const handleDeleteClick = (accreditation) => {
    setAccreditationToDelete(accreditation);
    setDeleteConfirmOpen(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const cancelDelete = () => {
    setDeleteConfirmOpen(false);
    setAccreditationToDelete(null);
  };

  const confirmDelete = async () => {
    if (!accreditationToDelete) return;
    
    setLoading(true);
    try {
      await adminAccreditationService.deleteAccreditation(accreditationToDelete.accredId);
      fetchAccreditations(); // Refresh the list
      setSuccess('Accreditation deleted successfully');
      setDeleteConfirmOpen(false);
      setAccreditationToDelete(null);
    } catch (error) {
      console.error('Error deleting accreditation:', error);
      let errorMessage = 'Failed to delete accreditation. Please try again later.';
      
      // Check for specific error messages
      if (error.message && error.message.includes('foreign key constraint fails')) {
        errorMessage = 'Cannot delete this accreditation because it is assigned to programs. Please unassign it first.';
      } else if (error.response && error.response.data) {
        errorMessage = error.response.data;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    // Basic validation
    if (!formData.title || !formData.description || !formData.schoolId) {
      setError('Title, description, and school are required');
      return;
    }
    
    setLoading(true);
    try {
      const schoolData = {
        schoolId: parseInt(formData.schoolId)
      };
      
      const accreditationData = {
        title: formData.title,
        description: formData.description,
        school: schoolData,
        accreditationLevel: formData.accreditationLevel,
        accreditingBody: formData.accreditingBody,
        recognitionStatus: formData.recognitionStatus
      };
      
      let createdOrUpdatedAccreditation;
      
      if (isEditing) {
        // Update existing accreditation
        createdOrUpdatedAccreditation = await adminAccreditationService.updateAccreditation(selectedAccreditation.accredId, {
          ...accreditationData,
          accredId: selectedAccreditation.accredId
        });
        setSuccess('Accreditation updated successfully');
      } else {
        // Create new accreditation
        createdOrUpdatedAccreditation = await adminAccreditationService.createAccreditation(accreditationData);
        setSuccess('Accreditation created successfully');
      }
      
      // If programs were selected, assign the accreditation to them
      if (selectedSchoolPrograms.length > 0 && createdOrUpdatedAccreditation) {
        const accredId = createdOrUpdatedAccreditation.accredId;
        const schoolId = parseInt(formData.schoolId);
        
        try {
          // Assign to each selected program
          for (const programId of selectedSchoolPrograms) {
            await adminAccreditationService.assignAccreditationToPrograms(accredId, schoolId, programId);
          }
          
          setSuccess((isEditing ? 'Accreditation updated' : 'Accreditation created') + 
            ' and assigned to selected programs successfully');
        } catch (assignError) {
          console.error('Error assigning to programs:', assignError);
          setSuccess((isEditing ? 'Accreditation updated' : 'Accreditation created') + 
            ' but there was an issue assigning to programs');
        }
      }
      
      fetchAccreditations(); // Refresh the list
      setIsModalVisible(false);
    } catch (error) {
      console.error('Error saving accreditation:', error);
      setError(`Failed to ${isEditing ? 'update' : 'create'} accreditation. Please try again later.`);
    } finally {
      setLoading(false);
    }
  };

  // Handle page change
  const handleChangePage = (newPage) => {
    setPage(newPage);
  };

  // Calculate pagination
  const paginatedAccreditations = filteredAccreditations.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const totalPages = Math.ceil(filteredAccreditations.length / rowsPerPage);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchAccreditations();
      return;
    }

    setLoading(true);
    try {
      const response = await adminAccreditationService.searchAccreditations(searchQuery);
      setFilteredAccreditations(response);
      setError(null);
    } catch (err) {
      console.error('Error searching accreditations:', err);
      setError('Failed to search accreditations. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

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

  const handleProgramSelectionInForm = (programId) => {
    setSelectedSchoolPrograms(prev => {
      if (prev.includes(programId)) {
        return prev.filter(id => id !== programId);
      } else {
        return [...prev, programId];
      }
    });
  };

  const handleSelectAllProgramsInForm = () => {
    if (selectedSchoolPrograms.length === formSchoolPrograms.length && formSchoolPrograms.length > 0) {
      // Deselect all
      setSelectedSchoolPrograms([]);
    } else {
      // Select all
      setSelectedSchoolPrograms(formSchoolPrograms.map(program => program.schoolProgramId));
    }
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">Accreditation Management</h1>
        <div className="w-24 h-1 bg-yellow-500 dark:bg-yellow-400"></div>
      </div>
      
      {/* Search and Add Section */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-grow">
          <div className="relative">
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1D63A1] dark:focus:ring-[#FFB71B]"
              placeholder="Search accreditations..."
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
          Add Accreditation
        </button>
      </div>
      
      {/* Accreditations Table */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-[#1D63A1] dark:bg-[#FFB71B] text-white dark:text-gray-900 text-left">
                <th className="px-6 py-3 font-semibold">ID</th>
                <th className="px-6 py-3 font-semibold">Title</th>
                <th className="px-6 py-3 font-semibold">School</th>
                <th className="px-6 py-3 font-semibold">Description</th>
                <th className="px-6 py-3 font-semibold">Level</th>
                <th className="px-6 py-3 font-semibold">Body</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading && !filteredAccreditations.length ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1D63A1] dark:border-[#FFB71B]"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredAccreditations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    No accreditations found
                  </td>
                </tr>
              ) : (
                paginatedAccreditations.map((accreditation) => (
                  <tr key={accreditation.accredId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4">{accreditation.accredId}</td>
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">{accreditation.title}</td>
                    <td className="px-6 py-4">{accreditation.school?.name || 'N/A'}</td>
                    <td className="px-6 py-4 truncate max-w-xs">{accreditation.description}</td>
                    <td className="px-6 py-4">{accreditation.accreditationLevel || 'N/A'}</td>
                    <td className="px-6 py-4">{accreditation.accreditingBody || 'N/A'}</td>
                    <td className="px-6 py-4">{accreditation.recognitionStatus || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditClick(accreditation)}
                          className="p-1 text-[#1D63A1] dark:text-[#FFB71B] hover:bg-[#1D63A1]/10 dark:hover:bg-[#FFB71B]/10 rounded"
                          title="Edit"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteClick(accreditation)}
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
          Showing {filteredAccreditations.length > 0 ? page * rowsPerPage + 1 : 0} to {Math.min((page + 1) * rowsPerPage, filteredAccreditations.length)} of {filteredAccreditations.length} accreditations
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
      </div>
      
      {/* Add/Edit Accreditation Dialog */}
      {isModalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800">{isEditing ? 'Edit Accreditation' : 'Add New Accreditation'}</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1D63A1]"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">School *</label>
                  <select
                    name="schoolId"
                    value={formData.schoolId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1D63A1]"
                    required
                  >
                    <option value="">Select a school</option>
                    {schools.map(school => (
                      <option key={school.schoolId} value={school.schoolId}>
                        {school.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Accreditation Level</label>
                  <select
                    name="accreditationLevel"
                    value={formData.accreditationLevel}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1D63A1]"
                  >
                    <option value="">Select a level</option>
                    {accreditationLevelOptions.map(level => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Accrediting Body</label>
                  <select
                    name="accreditingBody"
                    value={formData.accreditingBody}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1D63A1]"
                  >
                    <option value="">Select an accrediting body</option>
                    {accreditingBodyOptions.map(body => (
                      <option key={body} value={body}>
                        {body}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Recognition Status</label>
                  <select
                    name="recognitionStatus"
                    value={formData.recognitionStatus}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1D63A1]"
                  >
                    <option value="">None</option>
                    <option value="COE">COE (Center of Excellence)</option>
                    <option value="COD">COD (Center of Development)</option>
                  </select>
                </div>
                
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1D63A1]"
                    required
                  ></textarea>
                </div>
                
                {formData.schoolId && (
                  <div className="col-span-1 md:col-span-2">
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700">Assign to Programs</label>
                      <button
                        type="button"
                        onClick={handleSelectAllProgramsInForm}
                        className="text-sm text-[#1D63A1] hover:underline"
                      >
                        {selectedSchoolPrograms.length === formSchoolPrograms.length && formSchoolPrograms.length > 0 
                          ? 'Deselect All' 
                          : 'Select All'}
                      </button>
                    </div>
                    
                    {loadingPrograms ? (
                      <div className="flex justify-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1D63A1]"></div>
                      </div>
                    ) : formSchoolPrograms.length === 0 ? (
                      <div className="text-center py-4 text-gray-500">
                        No programs found for this school (School ID: {formData.schoolId})
                        <div className="text-xs mt-1">Please make sure programs are added to this school</div>
                      </div>
                    ) : (
                      <div className="max-h-36 overflow-y-auto border border-gray-300 rounded-md">
                        {formSchoolPrograms.map(program => (
                          <div 
                            key={program.schoolProgramId}
                            className="flex items-center px-3 py-2 hover:bg-gray-50 border-b border-gray-200 last:border-b-0"
                          >
                            <input
                              type="checkbox"
                              id={`form-program-${program.schoolProgramId}`}
                              className="h-4 w-4 text-[#1D63A1] border-gray-300 rounded"
                              checked={selectedSchoolPrograms.includes(program.schoolProgramId)}
                              onChange={() => handleProgramSelectionInForm(program.schoolProgramId)}
                            />
                            <label htmlFor={`form-program-${program.schoolProgramId}`} className="ml-2 block text-sm text-gray-700">
                              {program.program?.programName || 'Unknown Program'}
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="mt-2 text-xs text-gray-500">
                      {formSchoolPrograms.length > 0 ? (
                        selectedSchoolPrograms.length === 0 ? 
                          'Select programs to assign this accreditation to' : 
                          `Selected ${selectedSchoolPrograms.length} of ${formSchoolPrograms.length} program(s)`
                      ) : null}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={handleCancel}
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
                ) : isEditing ? 'Update' : 'Create'}
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
                Are you sure you want to delete the accreditation "{accreditationToDelete?.title}"? This action cannot be undone.
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
                className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 font-medium"
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

export default CRUD_Accreditation;
