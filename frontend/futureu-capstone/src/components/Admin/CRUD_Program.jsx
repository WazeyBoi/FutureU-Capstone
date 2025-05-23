import React, { useState, useEffect } from 'react';
import adminProgramService from '../../services/adminProgramService';
import {
  BookOpen,
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
  FileText,
  Loader,
  ChevronDown,
} from 'lucide-react';

const CRUD_Program = () => {
  const [programs, setPrograms] = useState([]);
  const [filteredPrograms, setFilteredPrograms] = useState([]);
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
  const [selectedProgram, setSelectedProgram] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    programName: '',
    description: ''
  });

  // Delete confirmation dialog
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [programToDelete, setProgramToDelete] = useState(null);

  // Fetch programs on component mount
  useEffect(() => {
    fetchPrograms();
  }, []);

  // Apply filters when search query changes
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredPrograms(programs);
    } else {
      const filtered = programs.filter(program => 
        program.programName.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredPrograms(filtered);
    }
  }, [searchQuery, programs]);
  
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

  const fetchPrograms = async () => {
    setLoading(true);
    try {
      const data = await adminProgramService.getAllPrograms();
      setPrograms(data);
      setFilteredPrograms(data);
      setError(null);
    } catch (error) {
      setError('Failed to fetch programs');
      console.error('Error fetching programs:', error);
    } finally {
      setLoading(false);
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
      programName: '',
      description: ''
    });
    setDialogTitle('Add New Program');
    setDialogMode('add');
    setSelectedProgram(null);
    setOpenDialog(true);
  };

  const handleEditClick = (program) => {
    setSelectedProgram(program);
    setFormData({
      programName: program.programName || '',
      description: program.description || ''
    });
    setDialogTitle('Edit Program');
    setDialogMode('edit');
    setOpenDialog(true);
  };

  const handleDeleteClick = (program) => {
    setProgramToDelete(program);
    setDeleteConfirmOpen(true);
  };

  const closeDialog = () => {
    setOpenDialog(false);
    setFormData({
      programName: '',
      description: ''
    });
  };

  const cancelDelete = () => {
    setDeleteConfirmOpen(false);
    setProgramToDelete(null);
  };

  const confirmDelete = async () => {
    if (!programToDelete) return;
    
    setLoading(true);
    try {
      await adminProgramService.deleteProgram(programToDelete.programId);
      fetchPrograms(); // Refresh the list
      setSuccess('Program deleted successfully');
      setDeleteConfirmOpen(false);
      setProgramToDelete(null);
    } catch (error) {
      console.error('Error deleting program:', error);
      setError('Failed to delete program. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    // Basic validation
    if (!formData.programName || !formData.description) {
      setError('Program name and description are required');
      return;
    }
    
    setLoading(true);
    try {
      if (dialogMode === 'edit') {
        // Update existing program
        await adminProgramService.updateProgram(selectedProgram.programId, {
          ...formData,
          programId: selectedProgram.programId
        });
        setSuccess('Program updated successfully');
      } else {
        // Create new program
        await adminProgramService.createProgram(formData);
        setSuccess('Program created successfully');
      }
      fetchPrograms(); // Refresh the list
      setOpenDialog(false);
    } catch (error) {
      console.error('Error saving program:', error);
      setError(`Failed to ${dialogMode === 'edit' ? 'update' : 'create'} program. Please try again later.`);
    } finally {
      setLoading(false);
    }
  };

  // Handle page change
  const handleChangePage = (newPage) => {
    setPage(newPage);
  };

  // Calculate pagination
  const paginatedPrograms = filteredPrograms.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const totalPages = Math.ceil(filteredPrograms.length / rowsPerPage);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchPrograms();
      return;
    }

    setLoading(true);
    try {
      // Assuming there's a search method in your service
      const response = await adminProgramService.searchPrograms(searchQuery);
      setFilteredPrograms(response);
      setError(null);
    } catch (err) {
      console.error('Error searching programs:', err);
      setError('Failed to search programs. Please try again later.');
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

  return (
    <div className="container mx-auto px-6 py-8 max-w-[1400px]">
      {/* Header Section */}
      <div className="mb-10">
        <div className="flex items-center mb-4">
          <div className="p-2 rounded-lg bg-[#FFB71B]/20 mr-3">
            <BookOpen className="h-6 w-6 text-[#FFB71B]" />
          </div>
          <h1 className="text-3xl font-bold text-[#2B3E4E]">Program Management</h1>
        </div>
        <p className="text-gray-600 max-w-3xl">
          Manage all educational programs in the system. Add new programs, edit details, or remove programs as needed.
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
              placeholder="Search programs by name..."
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
            Add New Program
          </button>
        </div>
      </div>
      
      {/* Programs Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8 border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gradient-to-r from-[#2B3E4E] to-[#2B3E4E]/90 text-white text-left">
                <th className="px-6 py-4 font-semibold text-sm uppercase tracking-wider text-left">ID</th>
                <th className="px-6 py-4 font-semibold text-sm uppercase tracking-wider text-left">Program Name</th>
                <th className="px-6 py-4 font-semibold text-sm uppercase tracking-wider text-left">Description</th>
                <th className="px-6 py-4 font-semibold text-sm uppercase tracking-wider text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading && !filteredPrograms.length ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Loader className="h-8 w-8 text-[#FFB71B] animate-spin mb-2" />
                      <p className="text-gray-500">Loading programs...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredPrograms.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <BookOpen className="h-12 w-12 text-gray-300 mb-2" />
                      <p className="text-gray-500 font-medium">No programs found</p>
                      <p className="text-gray-400 text-sm mt-1">Try adjusting your search or add a new program</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedPrograms.map((program) => (
                  <tr key={program.programId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-500 font-mono text-left">{program.programId}</td>
                    <td className="px-6 py-4 font-medium text-[#2B3E4E] text-left">{program.programName}</td>
                    <td className="px-6 py-4 text-gray-600 text-left truncate max-w-xs">{program.description}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center space-x-3">
                        <button
                          onClick={() => handleEditClick(program)}
                          className="p-2 text-[#2B3E4E] hover:bg-[#2B3E4E]/10 rounded-lg transition-colors"
                          title="Edit Program"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(program)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Program"
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
            Showing {filteredPrograms.length > 0 ? page * rowsPerPage + 1 : 0} to{" "}
            {Math.min((page + 1) * rowsPerPage, filteredPrograms.length)} of {filteredPrograms.length} programs
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
      
      {/* Add/Edit Program Dialog */}
      {openDialog && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-auto animate-fadeIn">
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
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Program Name *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <BookOpen className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="programName"
                      value={formData.programName}
                      onChange={handleInputChange}
                      className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#FFB71B] focus:border-[#FFB71B] transition-colors"
                      required
                      placeholder="Enter program name"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 pt-3 pointer-events-none">
                      <FileText className="h-5 w-5 text-gray-400" />
                    </div>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="4"
                      className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#FFB71B] focus:border-[#FFB71B] transition-colors"
                      required
                      placeholder="Enter program description"
                    ></textarea>
                  </div>
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
                    Save Program
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
                <span className="font-medium text-[#2B3E4E]">{programToDelete?.programName}</span>? This action cannot be
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

export default CRUD_Program;