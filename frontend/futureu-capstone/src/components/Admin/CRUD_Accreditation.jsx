import React, { useState, useEffect } from 'react';
import adminAccreditationService from '../../services/adminAccreditationService';
import adminSchoolService from '../../services/adminSchoolService';
import adminSchoolProgramService from '../../services/adminSchoolProgramService';
import {
  Award,
  Search,
  Plus,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X,
  Check,
  AlertTriangle,
  Building,
  FileText,
  Loader,
  ChevronDown,
  School,
  ListChecks,
  Medal,
  GraduationCap,
} from 'lucide-react';

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

  // Auto-dismiss success notification after 5 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Auto-dismiss error notification after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

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
    <div className="container mx-auto px-6 py-8 max-w-[1400px]">
      {/* Header Section */}
      <div className="mb-10">
        <div className="flex items-center mb-4">
          <div className="p-2 rounded-lg bg-[#FFB71B]/20 mr-3">
            <Award className="h-6 w-6 text-[#FFB71B]" />
          </div>
          <h1 className="text-3xl font-bold text-[#2B3E4E]">Accreditation Management</h1>
        </div>
        <p className="text-gray-600 max-w-3xl">
          Manage all educational accreditations in the system. Add new accreditations, edit details, or remove accreditations as needed.
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
              placeholder="Search accreditations by title..."
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
            Add New Accreditation
          </button>
        </div>
      </div>
      
      {/* Accreditations Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8 border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gradient-to-r from-[#2B3E4E] to-[#2B3E4E]/90 text-white text-left">
                <th className="px-6 py-4 font-semibold text-sm uppercase tracking-wider text-left">ID</th>
                <th className="px-6 py-4 font-semibold text-sm uppercase tracking-wider text-left">Title</th>
                <th className="px-6 py-4 font-semibold text-sm uppercase tracking-wider text-left">School</th>
                <th className="px-6 py-4 font-semibold text-sm uppercase tracking-wider text-left">Description</th>
                <th className="px-6 py-4 font-semibold text-sm uppercase tracking-wider text-center">Level</th>
                <th className="px-6 py-4 font-semibold text-sm uppercase tracking-wider text-center">Body</th>
                <th className="px-6 py-4 font-semibold text-sm uppercase tracking-wider text-center">Status</th>
                <th className="px-6 py-4 font-semibold text-sm uppercase tracking-wider text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading && !filteredAccreditations.length ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Loader className="h-8 w-8 text-[#FFB71B] animate-spin mb-2" />
                      <p className="text-gray-500">Loading accreditations...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredAccreditations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Award className="h-12 w-12 text-gray-300 mb-2" />
                      <p className="text-gray-500 font-medium">No accreditations found</p>
                      <p className="text-gray-400 text-sm mt-1">Try adjusting your search or add a new accreditation</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedAccreditations.map((accreditation) => (
                  <tr key={accreditation.accredId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-500 font-mono text-left">{accreditation.accredId}</td>
                    <td className="px-6 py-4 font-medium text-[#2B3E4E] text-left">{accreditation.title}</td>
                    <td className="px-6 py-4 text-gray-600 text-left">{accreditation.school?.name || 'N/A'}</td>
                    <td className="px-6 py-4 text-gray-600 truncate max-w-xs text-left">{accreditation.description}</td>
                    <td className="px-6 py-4 text-center">
                      {accreditation.accreditationLevel && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                          {accreditation.accreditationLevel}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {accreditation.accreditingBody && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                          {accreditation.accreditingBody}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {accreditation.recognitionStatus ? (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          accreditation.recognitionStatus === 'COE' 
                            ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}>
                          {accreditation.recognitionStatus}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center space-x-3">
                        <button
                          onClick={() => handleEditClick(accreditation)}
                          className="p-2 text-[#2B3E4E] hover:bg-[#2B3E4E]/10 rounded-lg transition-colors"
                          title="Edit Accreditation"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(accreditation)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Accreditation"
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
            Showing {filteredAccreditations.length > 0 ? page * rowsPerPage + 1 : 0} to{" "}
            {Math.min((page + 1) * rowsPerPage, filteredAccreditations.length)} of {filteredAccreditations.length} accreditations
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
                    className={`px-3 py-1 rounded-lg ${
                      pageNum === page
                        ? "bg-[#FFB71B] text-[#2B3E4E] font-semibold"
                        : "text-gray-700 hover:bg-gray-100"
                    } transition-colors`}
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
      
      {/* Add/Edit Accreditation Dialog */}
      {isModalVisible && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-auto animate-fadeIn">
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10 flex justify-between items-center">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-[#FFB71B]/20 mr-3">
                  {isEditing ? (
                    <Edit className="h-5 w-5 text-[#FFB71B]" />
                  ) : (
                    <Plus className="h-5 w-5 text-[#FFB71B]" />
                  )}
                </div>
                <h3 className="text-xl font-semibold text-[#2B3E4E]">{isEditing ? 'Edit Accreditation' : 'Add New Accreditation'}</h3>
              </div>
              <button
                onClick={handleCancel}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Award className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#FFB71B] focus:border-[#FFB71B] transition-colors"
                      required
                      placeholder="Enter accreditation title"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">School *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <School className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      name="schoolId"
                      value={formData.schoolId}
                      onChange={handleInputChange}
                      className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#FFB71B] focus:border-[#FFB71B] transition-colors appearance-none"
                      required
                    >
                      <option value="">Select a school</option>
                      {schools.map(school => (
                        <option key={school.schoolId} value={school.schoolId}>
                          {school.name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Accreditation Level</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <ListChecks className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      name="accreditationLevel"
                      value={formData.accreditationLevel}
                      onChange={handleInputChange}
                      className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#FFB71B] focus:border-[#FFB71B] transition-colors appearance-none"
                    >
                      <option value="">Select a level</option>
                      {accreditationLevelOptions.map(level => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Accrediting Body</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      name="accreditingBody"
                      value={formData.accreditingBody}
                      onChange={handleInputChange}
                      className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#FFB71B] focus:border-[#FFB71B] transition-colors appearance-none"
                    >
                      <option value="">Select an accrediting body</option>
                      {accreditingBodyOptions.map(body => (
                        <option key={body} value={body}>
                          {body}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>
                
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Recognition Status</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Medal className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      name="recognitionStatus"
                      value={formData.recognitionStatus}
                      onChange={handleInputChange}
                      className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#FFB71B] focus:border-[#FFB71B] transition-colors appearance-none"
                    >
                      <option value="">None</option>
                      <option value="COE">COE (Center of Excellence)</option>
                      <option value="COD">COD (Center of Development)</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>
                
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 pt-3 pointer-events-none">
                      <FileText className="h-5 w-5 text-gray-400" />
                    </div>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#FFB71B] focus:border-[#FFB71B] transition-colors"
                      required
                      placeholder="Enter accreditation description"
                    ></textarea>
                  </div>
                </div>
                
                {formData.schoolId && (
                  <div className="col-span-1 md:col-span-2">
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700">Assign to Programs</label>
                      <button
                        type="button"
                        onClick={handleSelectAllProgramsInForm}
                        className="text-sm text-[#2B3E4E] hover:underline"
                      >
                        {selectedSchoolPrograms.length === formSchoolPrograms.length && formSchoolPrograms.length > 0 
                          ? 'Deselect All' 
                          : 'Select All'}
                      </button>
                    </div>
                    
                    {loadingPrograms ? (
                      <div className="flex justify-center py-4">
                        <Loader className="h-8 w-8 text-[#FFB71B] animate-spin" />
                      </div>
                    ) : formSchoolPrograms.length === 0 ? (
                      <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
                        <GraduationCap className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                        <p className="font-medium">No programs found for this school</p>
                        <div className="text-xs mt-1">Please make sure programs are added to this school</div>
                      </div>
                    ) : (
                      <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg bg-gray-50">
                        {formSchoolPrograms.map(program => (
                          <div 
                            key={program.schoolProgramId}
                            className="flex items-center px-3 py-2 hover:bg-gray-100 border-b border-gray-200 last:border-b-0 transition-colors"
                          >
                            <input
                              type="checkbox"
                              id={`form-program-${program.schoolProgramId}`}
                              className="h-4 w-4 text-[#FFB71B] border-gray-300 rounded focus:ring-[#FFB71B]"
                              checked={selectedSchoolPrograms.includes(program.schoolProgramId)}
                              onChange={() => handleProgramSelectionInForm(program.schoolProgramId)}
                            />
                            <label htmlFor={`form-program-${program.schoolProgramId}`} className="ml-2 block text-sm text-gray-700 cursor-pointer">
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
            <div className="p-6 border-t border-gray-200 sticky bottom-0 bg-white z-10 flex justify-end space-x-3">
              <button
                onClick={handleCancel}
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
                    {isEditing ? 'Update Accreditation' : 'Create Accreditation'}
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
                <span className="font-medium text-[#2B3E4E]">"{accreditationToDelete?.title}"</span>? This action cannot be undone.
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

export default CRUD_Accreditation;
