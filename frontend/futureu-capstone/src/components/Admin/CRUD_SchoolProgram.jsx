import React, { useState, useEffect } from 'react';
import adminSchoolProgramService from '../../services/adminSchoolProgramService';
import adminSchoolService from '../../services/adminSchoolService';
import adminProgramService from '../../services/adminProgramService';
import adminAccreditationService from '../../services/adminAccreditationService';
import {
  School,
  Search,
  Plus,
  Edit,
  Trash2,
  X,
  Check,
  AlertTriangle,
  BookOpen,
  Award,
  Building,
  Loader,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronDown,
  Filter,
} from 'lucide-react';

const CRUD_SchoolProgram = () => {
  const [schoolPrograms, setSchoolPrograms] = useState([]);
  const [schools, setSchools] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [accreditations, setAccreditations] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedSchoolProgram, setSelectedSchoolProgram] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    schoolId: '',
    programId: '',
    accredId: ''
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [schoolProgramToDelete, setSchoolProgramToDelete] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredSchoolPrograms, setFilteredSchoolPrograms] = useState([]);
  const [filterType, setFilterType] = useState('school'); // 'school', 'program', or 'accreditation'
  const [filterValue, setFilterValue] = useState('');

  // Fetch data on component mount
  useEffect(() => {
    fetchSchoolPrograms();
    fetchSchools();
    fetchPrograms();
    fetchAccreditations();
  }, []);

  // Apply filters when search query changes
  useEffect(() => {
    if (searchQuery.trim() === '' && filterValue === '') {
      setFilteredSchoolPrograms(schoolPrograms);
    } else {
      let filtered = [...schoolPrograms];
      
      // Apply text search if provided
      if (searchQuery.trim() !== '') {
        filtered = filtered.filter(sp => 
          (sp.school && sp.school.name && sp.school.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (sp.program && sp.program.programName && sp.program.programName.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      }
      
      // Apply dropdown filter if selected
      if (filterValue !== '') {
        if (filterType === 'school') {
          filtered = filtered.filter(sp => sp.school && sp.school.schoolId === parseInt(filterValue));
        } else if (filterType === 'program') {
          filtered = filtered.filter(sp => sp.program && sp.program.programId === parseInt(filterValue));
        } else if (filterType === 'accreditation') {
          if (filterValue === 'none') {
            filtered = filtered.filter(sp => !sp.accreditation);
          } else {
            filtered = filtered.filter(sp => sp.accreditation && sp.accreditation.accredId === parseInt(filterValue));
          }
        }
      }
      
      setFilteredSchoolPrograms(filtered);
    }
  }, [searchQuery, filterType, filterValue, schoolPrograms]);

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

  const fetchSchoolPrograms = async () => {
    setLoading(true);
    try {
      const data = await adminSchoolProgramService.getAllSchoolPrograms();
      setSchoolPrograms(data);
      setFilteredSchoolPrograms(data);
      setError(null);
    } catch (error) {
      setError('Failed to fetch school programs');
      console.error('Error fetching school programs:', error);
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

  const fetchPrograms = async () => {
    try {
      const data = await adminProgramService.getAllPrograms();
      setPrograms(data);
    } catch (error) {
      console.error('Error fetching programs:', error);
    }
  };

  const fetchAccreditations = async () => {
    try {
      const data = await adminAccreditationService.getAllAccreditations();
      setAccreditations(data);
    } catch (error) {
      console.error('Error fetching accreditations:', error);
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
      schoolId: '',
      programId: '',
      accredId: ''
    });
    setIsEditing(false);
    setSelectedSchoolProgram(null);
    setIsModalVisible(true);
  };

  const handleEditClick = (schoolProgram) => {
    setSelectedSchoolProgram(schoolProgram);
    setFormData({
      schoolId: schoolProgram.school ? schoolProgram.school.schoolId : '',
      programId: schoolProgram.program ? schoolProgram.program.programId : '',
      accredId: schoolProgram.accreditation ? schoolProgram.accreditation.accredId : ''
    });
    setIsEditing(true);
    setIsModalVisible(true);
  };

  const handleDeleteClick = (schoolProgram) => {
    setSchoolProgramToDelete(schoolProgram);
    setDeleteConfirmOpen(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const cancelDelete = () => {
    setDeleteConfirmOpen(false);
    setSchoolProgramToDelete(null);
  };

  const confirmDelete = async () => {
    if (!schoolProgramToDelete) return;
    
    setLoading(true);
    try {
      await adminSchoolProgramService.deleteSchoolProgram(schoolProgramToDelete.schoolProgramId);
      fetchSchoolPrograms(); // Refresh the list
      setSuccess('School Program mapping deleted successfully');
      setDeleteConfirmOpen(false);
      setSchoolProgramToDelete(null);
    } catch (error) {
      console.error('Error deleting school program:', error);
      setError('Failed to delete school program. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    // Basic validation
    if (!formData.schoolId || !formData.programId) {
      setError('School and Program are required');
      return;
    }
    
    setLoading(true);
    try {
      const schoolProgramData = {
        school: {
          schoolId: parseInt(formData.schoolId)
        },
        program: {
          programId: parseInt(formData.programId)
        },
        accreditation: formData.accredId ? {
          accredId: parseInt(formData.accredId)
        } : null
      };
      
      if (isEditing) {
        // Update existing school program
        await adminSchoolProgramService.updateSchoolProgram(selectedSchoolProgram.schoolProgramId, {
          ...schoolProgramData,
          schoolProgramId: selectedSchoolProgram.schoolProgramId
        });
        setSuccess('School Program mapping updated successfully');
      } else {
        // Create new school program
        await adminSchoolProgramService.createSchoolProgram(schoolProgramData);
        setSuccess('School Program mapping created successfully');
      }
      fetchSchoolPrograms(); // Refresh the list
      setIsModalVisible(false);
    } catch (error) {
      console.error('Error saving school program:', error);
      setError(`Failed to ${isEditing ? 'update' : 'create'} school program. Please try again later.`);
    } finally {
      setLoading(false);
    }
  };

  // Handle page change
  const handleChangePage = (newPage) => {
    setPage(newPage);
  };

  // Handle filter change
  const handleFilterTypeChange = (e) => {
    setFilterType(e.target.value);
    setFilterValue('');
  };

  const handleFilterValueChange = (e) => {
    setFilterValue(e.target.value);
  };

  // Calculate pagination
  const paginatedSchoolPrograms = filteredSchoolPrograms.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const totalPages = Math.ceil(filteredSchoolPrograms.length / rowsPerPage);

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

  // Get badge color based on accreditation status
  const getAccreditationBadgeColor = (accreditation) => {
    if (!accreditation) {
      return "bg-gray-100 text-gray-800 border-gray-200";
    }
    return "bg-[#FFB71B]/20 text-[#FFB71B] border-[#FFB71B]/30";
  };

  return (
    <div className="container mx-auto px-6 py-8 max-w-[1400px]">
      {/* Header Section */}
      <div className="mb-10">
        <div className="flex items-center mb-4">
          <div className="p-2 rounded-lg bg-[#FFB71B]/20 mr-3">
            <BookOpen className="h-6 w-6 text-[#FFB71B]" />
          </div>
          <h1 className="text-3xl font-bold text-[#2B3E4E]">School Programs Management</h1>
        </div>
        <p className="text-gray-600 max-w-3xl">
          Manage the relationship between schools and their offered programs. Associate schools with programs and manage accreditations.
        </p>
        <div className="w-24 h-1 bg-[#FFB71B] mt-4"></div>
      </div>
      
      {/* Search and Filter Section */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="w-full md:w-1/2 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="w-full pl-10 pr-16 py-3 border border-gray-200 rounded-xl bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FFB71B] focus:border-[#FFB71B] transition-colors shadow-md"
              placeholder="Search school or program..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && fetchSchoolPrograms()}
            />
          </div>
          
          <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-4 w-4 text-gray-400" />
        </div>
          <select
            value={filterType}
            onChange={handleFilterTypeChange}
                className="pl-10 pr-8 py-3 border border-gray-200 rounded-xl bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FFB71B] focus:border-[#FFB71B] transition-colors shadow-md appearance-none"
          >
            <option value="school">Filter by School</option>
            <option value="program">Filter by Program</option>
            <option value="accreditation">Filter by Accreditation</option>
          </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          
            <div className="relative">
          <select
            value={filterValue}
            onChange={handleFilterValueChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FFB71B] focus:border-[#FFB71B] transition-colors shadow-md appearance-none pr-8"
          >
            <option value="">All</option>
            {filterType === 'school' && schools.map(school => (
              <option key={school.schoolId} value={school.schoolId}>{school.name}</option>
            ))}
            {filterType === 'program' && programs.map(program => (
              <option key={program.programId} value={program.programId}>{program.programName}</option>
            ))}
            {filterType === 'accreditation' && (
              <>
                <option value="none">No Accreditation</option>
                {accreditations.map(accred => (
                  <option key={accred.accredId} value={accred.accredId}>{accred.title}</option>
                ))}
              </>
            )}
          </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </div>
            </div>
        </div>
        
        <button
          onClick={handleAddClick}
          className="whitespace-nowrap h-12 flex items-center justify-center px-4 py-2 bg-gradient-to-r from-[#FFB71B] to-[#FFB71B]/90 text-[#2B3E4E] font-medium rounded-xl hover:shadow-lg transition-all shadow-md"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add School Program
        </button>
        </div>
      </div>
      
      {/* School Programs Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8 border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gradient-to-r from-[#2B3E4E] to-[#2B3E4E]/90 text-white text-left">
                <th className="px-6 py-4 font-semibold text-sm uppercase tracking-wider text-left">ID</th>
                <th className="px-6 py-4 font-semibold text-sm uppercase tracking-wider text-left">School</th>
                <th className="px-6 py-4 font-semibold text-sm uppercase tracking-wider text-left">Program</th>
                <th className="px-6 py-4 font-semibold text-sm uppercase tracking-wider text-center">Accreditation</th>
                <th className="px-6 py-4 font-semibold text-sm uppercase tracking-wider text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading && !filteredSchoolPrograms.length ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Loader className="h-8 w-8 text-[#FFB71B] animate-spin mb-2" />
                      <p className="text-gray-500">Loading school programs...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredSchoolPrograms.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <BookOpen className="h-12 w-12 text-gray-300 mb-2" />
                      <p className="text-gray-500 font-medium">No school programs found</p>
                      <p className="text-gray-400 text-sm mt-1">Try adjusting your search or add a new mapping</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedSchoolPrograms.map((schoolProgram) => (
                  <tr key={schoolProgram.schoolProgramId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-500 font-mono text-left">{schoolProgram.schoolProgramId}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-start">
                        <Building className="h-4 w-4 text-gray-400 mt-1 mr-2 flex-shrink-0" />
                        <div className="font-medium text-[#2B3E4E] text-left">{schoolProgram.school?.name || 'N/A'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start">
                        <BookOpen className="h-4 w-4 text-gray-400 mt-1 mr-2 flex-shrink-0" />
                        <div className="text-gray-600">{schoolProgram.program?.programName || 'N/A'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {schoolProgram.accreditation ? (
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getAccreditationBadgeColor(schoolProgram.accreditation)}`}
                        >
                          <Award className="h-3 w-3 mr-1" />
                          {schoolProgram.accreditation?.title}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center space-x-3">
                        <button
                          onClick={() => handleEditClick(schoolProgram)}
                          className="p-2 text-[#2B3E4E] hover:bg-[#2B3E4E]/10 rounded-lg transition-colors"
                          title="Edit School Program"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(schoolProgram)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete School Program"
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
            Showing {filteredSchoolPrograms.length > 0 ? page * rowsPerPage + 1 : 0} to{" "}
            {Math.min((page + 1) * rowsPerPage, filteredSchoolPrograms.length)} of {filteredSchoolPrograms.length} school program mappings
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
      
      {/* Add/Edit School Program Dialog */}
      {isModalVisible && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md animate-fadeIn">
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10 flex justify-between items-center">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-[#FFB71B]/20 mr-3">
                  {isEditing ? (
                    <Edit className="h-5 w-5 text-[#FFB71B]" />
                  ) : (
                    <Plus className="h-5 w-5 text-[#FFB71B]" />
                  )}
                </div>
                <h3 className="text-xl font-semibold text-[#2B3E4E]">{isEditing ? 'Edit School Program' : 'Add New School Program'}</h3>
              </div>
              <button
                onClick={handleCancel}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">School *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building className="h-5 w-5 text-gray-400" />
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Program *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <BookOpen className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    name="programId"
                    value={formData.programId}
                    onChange={handleInputChange}
                    className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#FFB71B] focus:border-[#FFB71B] transition-colors appearance-none"
                    required
                  >
                    <option value="">Select a program</option>
                    {programs.map(program => (
                      <option key={program.programId} value={program.programId}>
                        {program.programName}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Accreditation (Optional)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Award className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    name="accredId"
                    value={formData.accredId}
                    onChange={handleInputChange}
                    className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#FFB71B] focus:border-[#FFB71B] transition-colors appearance-none"
                  >
                    <option value="">None</option>
                    {accreditations.map(accred => (
                      <option key={accred.accredId} value={accred.accredId}>
                        {accred.title}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
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
                    {isEditing ? 'Update' : 'Save'}
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
                Are you sure you want to delete the mapping between school{" "}
                <span className="font-medium text-[#2B3E4E]">{schoolProgramToDelete?.school?.name}</span> and program{" "}
                <span className="font-medium text-[#2B3E4E]">{schoolProgramToDelete?.program?.programName}</span>? This action cannot be undone.
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

export default CRUD_SchoolProgram;
