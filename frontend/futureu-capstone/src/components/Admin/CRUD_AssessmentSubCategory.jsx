import React, { useState, useEffect } from 'react';
import adminAssessmentSubCategoryService from '../../services/adminAssessmentSubCategoryService';
import adminAssessmentCategoryService from '../../services/adminAssessmentCategoryService';
import {
  FolderTree,
  Search,
  Plus,
  Edit,
  Trash2,
  X,
  Check,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  FileText,
  Loader,
  Folders,
  Filter,
  ChevronDown,
  MapPin
} from 'lucide-react';

const CRUD_AssessmentSubCategory = () => {
  // State variables
  const [subCategories, setSubCategories] = useState([]);
  const [filteredSubCategories, setFilteredSubCategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    subCategoryName: '',
    description: '',
    assessmentCategoryId: ''
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [subCategoryToDelete, setSubCategoryToDelete] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

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

  // Fetch data on component mount
  useEffect(() => {
    fetchSubCategories();
    fetchCategories();
  }, []);

  // Apply filters when search query or filter changes
  useEffect(() => {
    if (searchQuery.trim() === '' && !filterCategory) {
      setFilteredSubCategories(subCategories);
    } else {
      let filtered = [...subCategories];
      
      // Apply text search if provided
      if (searchQuery.trim() !== '') {
        filtered = filtered.filter(subCat => 
          subCat.subCategoryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (subCat.description && subCat.description.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      }
      
      // Apply category filter if selected
      if (filterCategory) {
        filtered = filtered.filter(subCat => 
          subCat.assessmentCategory && subCat.assessmentCategory.assessmentCategoryId === parseInt(filterCategory)
        );
      }
      
      setFilteredSubCategories(filtered);
    }
  }, [searchQuery, filterCategory, subCategories]);

  const fetchSubCategories = async () => {
    setLoading(true);
    try {
      const data = await adminAssessmentSubCategoryService.getAllAssessmentSubCategories();
      setSubCategories(data);
      setFilteredSubCategories(data);
      setError(null);
    } catch (error) {
      setError('Failed to fetch assessment sub-categories');
      console.error('Error fetching assessment sub-categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await adminAssessmentCategoryService.getAllAssessmentCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching assessment categories:', error);
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
      subCategoryName: '',
      description: '',
      assessmentCategoryId: ''
    });
    setIsEditing(false);
    setSelectedSubCategory(null);
    setIsModalVisible(true);
  };

  const handleEditClick = (subCategory) => {
    setSelectedSubCategory(subCategory);
    setFormData({
      subCategoryName: subCategory.subCategoryName || '',
      description: subCategory.description || '',
      assessmentCategoryId: subCategory.assessmentCategory?.assessmentCategoryId?.toString() || ''
    });
    setIsEditing(true);
    setIsModalVisible(true);
  };

  const handleDeleteClick = (subCategory) => {
    setSubCategoryToDelete(subCategory);
    setDeleteConfirmOpen(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const cancelDelete = () => {
    setDeleteConfirmOpen(false);
    setSubCategoryToDelete(null);
  };

  const confirmDelete = async () => {
    if (!subCategoryToDelete) return;
    
    setLoading(true);
    try {
      await adminAssessmentSubCategoryService.deleteAssessmentSubCategory(subCategoryToDelete.assessmentSubCategoryId);
      fetchSubCategories(); // Refresh the list
      setSuccess('Sub-category deleted successfully');
      setDeleteConfirmOpen(false);
      setSubCategoryToDelete(null);
    } catch (error) {
      console.error('Error deleting sub-category:', error);
      setError('Failed to delete sub-category. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    // Basic validation
    if (!formData.subCategoryName || !formData.assessmentCategoryId) {
      setError('Sub-category name and parent category are required');
      return;
    }
    
    setLoading(true);
    try {
      const subCategoryData = {
        subCategoryName: formData.subCategoryName,
        description: formData.description,
        assessmentCategory: { assessmentCategoryId: parseInt(formData.assessmentCategoryId) }
      };
      
      if (isEditing) {
        // Update existing sub-category
        await adminAssessmentSubCategoryService.updateAssessmentSubCategory(selectedSubCategory.assessmentSubCategoryId, subCategoryData);
        setSuccess('Sub-category updated successfully');
      } else {
        // Create new sub-category
        await adminAssessmentSubCategoryService.createAssessmentSubCategory(subCategoryData);
        setSuccess('Sub-category created successfully');
      }
      fetchSubCategories(); // Refresh the list
      setIsModalVisible(false);
    } catch (error) {
      console.error('Error saving sub-category:', error);
      setError(`Failed to ${isEditing ? 'update' : 'create'} sub-category. Please try again later.`);
    } finally {
      setLoading(false);
    }
  };

  // Handle page change
  const handleChangePage = (newPage) => {
    setPage(newPage);
  };

  // Calculate pagination
  const paginatedSubCategories = filteredSubCategories.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const totalPages = Math.ceil(filteredSubCategories.length / rowsPerPage);
  
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

  // Helper function to get category name
  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.assessmentCategoryId === categoryId);
    return category ? category.categoryName : 'Unknown';
  };

  return (
    <div className="container mx-auto px-6 py-8 max-w-[1400px]">
      {/* Header Section */}
      <div className="mb-10">
        <div className="flex items-center mb-4">
          <div className="p-2.5 rounded-lg bg-[#FFB71B]/20 mr-3">
            <FolderTree className="h-6 w-6 text-[#FFB71B]" />
          </div>
          <h1 className="text-3xl font-bold text-[#2B3E4E]">Assessment Sub-Category Management</h1>
        </div>
        <p className="text-gray-600 max-w-3xl">
          Manage sub-categories for assessments. Create, edit, or delete assessment sub-categories to further organize your assessment content.
        </p>
        <div className="w-32 h-1.5 bg-[#FFB71B] mt-4"></div>
      </div>
      
      {/* Search and Filter Section */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="w-full md:w-1/2 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="w-full pl-10 pr-16 py-3 border border-gray-200 rounded-xl bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FFB71B] focus:border-[#FFB71B] transition-colors shadow-sm"
              placeholder="Search sub-categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1.5 bg-[#FFB71B] text-[#2B3E4E] font-medium rounded-lg hover:bg-[#FFB71B]/90 transition-colors shadow-sm"
            >
              Search
            </button>
          </div>
          
          {/* Filter Dropdowns */}
          <div className="w-full md:w-1/2 flex flex-wrap gap-2">
            <div className="flex items-center w-full">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2.5 border border-gray-200 rounded-l-xl bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FFB71B] focus:border-[#FFB71B] transition-colors shadow-sm flex-grow"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.assessmentCategoryId} value={category.assessmentCategoryId}>
                    {category.categoryName}
                  </option>
                ))}
              </select>
              <div className="bg-gray-100 px-2 py-2.5 rounded-r-xl border border-l-0 border-gray-200">
                <Filter className="h-5 w-5 text-gray-500" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={handleAddClick}
            className="flex items-center justify-center px-6 py-2.5 bg-gradient-to-r from-[#FFB71B] to-[#FFB71B]/90 text-[#2B3E4E] font-medium rounded-xl hover:shadow-lg transition-all shadow-sm"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Sub-Category
          </button>
        </div>
      </div>
      
      {/* Sub-Categories Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8 border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gradient-to-r from-[#2B3E4E] to-[#2B3E4E]/90 text-white text-left">
                <th className="px-6 py-4 font-semibold text-sm uppercase tracking-wider text-left">ID</th>
                <th className="px-6 py-4 font-semibold text-sm uppercase tracking-wider text-left">Sub-Category Name</th>
                <th className="px-6 py-4 font-semibold text-sm uppercase tracking-wider text-left">Parent Category</th>
                <th className="px-6 py-4 font-semibold text-sm uppercase tracking-wider text-left">Description</th>
                <th className="px-6 py-4 font-semibold text-sm uppercase tracking-wider text-center w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading && !filteredSubCategories.length ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Loader className="h-8 w-8 text-[#FFB71B] animate-spin mb-2" />
                      <p className="text-gray-500">Loading sub-categories...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredSubCategories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <FolderTree className="h-12 w-12 text-gray-300 mb-2" />
                      <p className="text-gray-500 font-medium">No assessment sub-categories found</p>
                      <p className="text-gray-400 text-sm mt-1">Try adjusting your search or add a new sub-category</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedSubCategories.map((subCategory) => (
                  <tr key={subCategory.assessmentSubCategoryId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-500 font-mono text-sm text-left">{subCategory.assessmentSubCategoryId}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-start">
                        <FolderTree className="h-4 w-4 text-[#FFB71B] mt-1 mr-2 flex-shrink-0" />
                        <div className="font-medium text-[#2B3E4E] text-left">{subCategory.subCategoryName}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Folders className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="px-2.5 py-1 bg-[#2B3E4E]/10 text-[#2B3E4E] rounded-full text-xs font-medium">
                          {subCategory.assessmentCategory ? subCategory.assessmentCategory.categoryName : 'None'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 truncate max-w-xs text-gray-600 text-sm">
                      {subCategory.description || 'No description'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center space-x-3">
                        <button
                          onClick={() => handleEditClick(subCategory)}
                          className="p-2 text-[#2B3E4E] hover:bg-[#2B3E4E]/10 rounded-lg transition-colors"
                          title="Edit Sub-Category"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(subCategory)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Sub-Category"
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
            Showing {filteredSubCategories.length > 0 ? page * rowsPerPage + 1 : 0} to{" "}
            {Math.min((page + 1) * rowsPerPage, filteredSubCategories.length)} of {filteredSubCategories.length} sub-categories
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
      
      {/* Add/Edit Sub-Category Modal */}
      {isModalVisible && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-auto animate-fadeIn">
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10 flex justify-between items-center">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-[#FFB71B]/20 mr-3">
                  {isEditing ? (
                    <Edit className="h-5 w-5 text-[#FFB71B]" />
                  ) : (
                    <Plus className="h-5 w-5 text-[#FFB71B]" />
                  )}
                </div>
                <h3 className="text-xl font-semibold text-[#2B3E4E]">
                  {isEditing ? 'Edit Sub-Category' : 'Add New Sub-Category'}
                </h3>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Sub-Category Name *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FolderTree className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="subCategoryName"
                    value={formData.subCategoryName}
                    onChange={handleInputChange}
                    className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#FFB71B] focus:border-[#FFB71B] transition-colors"
                    required
                    placeholder="Enter sub-category name"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Folders className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    name="assessmentCategoryId"
                    value={formData.assessmentCategoryId}
                    onChange={handleInputChange}
                    className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#FFB71B] focus:border-[#FFB71B] transition-colors appearance-none"
                    required
                  >
                    <option value="">Select a parent category</option>
                    {categories.map((category) => (
                      <option key={category.assessmentCategoryId} value={category.assessmentCategoryId}>
                        {category.categoryName}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 pt-3 flex items-start pointer-events-none">
                    <FileText className="h-5 w-5 text-gray-400" />
                  </div>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#FFB71B] focus:border-[#FFB71B] transition-colors"
                    placeholder="Enter sub-category description"
                  ></textarea>
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
                    {isEditing ? 'Update Sub-Category' : 'Save Sub-Category'}
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Dialog */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md animate-fadeIn">
            <div className="p-6 border-b border-gray-200 flex items-center">
              <div className="p-2 rounded-full bg-red-100 mr-3">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">Confirm Delete</h3>
            </div>
            <div className="p-6">
              <p className="text-gray-700">
                Are you sure you want to delete this sub-category? This action cannot be undone.
              </p>
              <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-200">
                <p className="text-sm text-gray-800 italic">
                  <span className="font-medium text-[#2B3E4E] not-italic">Sub-Category:</span> {subCategoryToDelete?.subCategoryName}
                </p>
              </div>
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

export default CRUD_AssessmentSubCategory;