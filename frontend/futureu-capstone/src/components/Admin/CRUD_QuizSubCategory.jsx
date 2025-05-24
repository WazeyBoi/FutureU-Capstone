import React, { useState, useEffect } from 'react';
import adminQuizSubCatService from '../../services/adminQuizSubCatService';
import adminAssessmentSubCategoryService from '../../services/adminAssessmentSubCategoryService';
import {
  Layers,
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
  FolderTree,
  Filter,
  ChevronDown,
  BookOpen
} from 'lucide-react';

const CRUD_QuizSubCategory = () => {
  // State variables
  const [quizSubCategories, setQuizSubCategories] = useState([]);
  const [filteredQuizSubCategories, setFilteredQuizSubCategories] = useState([]);
  const [assessmentSubCategories, setAssessmentSubCategories] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedQuizSubCategory, setSelectedQuizSubCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    quizSubCategoryCategoryName: '',
    quizSubCategoryCategoryDescription: '',
    assessmentSubCategoryId: ''
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [quizSubCategoryToDelete, setQuizSubCategoryToDelete] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubCategory, setFilterSubCategory] = useState('');

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
    fetchQuizSubCategories();
    fetchAssessmentSubCategories();
  }, []);

  // Apply filters when search query or filter changes
  useEffect(() => {
    if (searchQuery.trim() === '' && !filterSubCategory) {
      setFilteredQuizSubCategories(quizSubCategories);
    } else {
      let filtered = [...quizSubCategories];
      
      // Apply text search if provided
      if (searchQuery.trim() !== '') {
        filtered = filtered.filter(quizSub => 
          quizSub.quizSubCategoryCategoryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (quizSub.quizSubCategoryCategoryDescription && 
            quizSub.quizSubCategoryCategoryDescription.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      }
      
      // Apply sub-category filter if selected
      if (filterSubCategory) {
        filtered = filtered.filter(quizSub => 
          quizSub.assesssmentSubCategory && 
          quizSub.assesssmentSubCategory.assessmentSubCategoryId === parseInt(filterSubCategory)
        );
      }
      
      setFilteredQuizSubCategories(filtered);
    }
  }, [searchQuery, filterSubCategory, quizSubCategories]);

  const fetchQuizSubCategories = async () => {
    setLoading(true);
    try {
      const data = await adminQuizSubCatService.getAllQuizSubCategories();
      setQuizSubCategories(data);
      setFilteredQuizSubCategories(data);
      setError(null);
    } catch (error) {
      setError('Failed to fetch quiz sub-categories');
      console.error('Error fetching quiz sub-categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssessmentSubCategories = async () => {
    try {
      const data = await adminAssessmentSubCategoryService.getAllAssessmentSubCategories();
      setAssessmentSubCategories(data);
    } catch (error) {
      console.error('Error fetching assessment sub-categories:', error);
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
      quizSubCategoryCategoryName: '',
      quizSubCategoryCategoryDescription: '',
      assessmentSubCategoryId: ''
    });
    setIsEditing(false);
    setSelectedQuizSubCategory(null);
    setIsModalVisible(true);
  };

  const handleEditClick = (quizSubCategory) => {
    setSelectedQuizSubCategory(quizSubCategory);
    setFormData({
      quizSubCategoryCategoryName: quizSubCategory.quizSubCategoryCategoryName || '',
      quizSubCategoryCategoryDescription: quizSubCategory.quizSubCategoryCategoryDescription || '',
      assessmentSubCategoryId: quizSubCategory.assesssmentSubCategory?.assessmentSubCategoryId?.toString() || ''
    });
    setIsEditing(true);
    setIsModalVisible(true);
  };

  const handleDeleteClick = (quizSubCategory) => {
    setQuizSubCategoryToDelete(quizSubCategory);
    setDeleteConfirmOpen(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const cancelDelete = () => {
    setDeleteConfirmOpen(false);
    setQuizSubCategoryToDelete(null);
  };

  const confirmDelete = async () => {
    if (!quizSubCategoryToDelete) return;
    
    setLoading(true);
    try {
      await adminQuizSubCatService.deleteQuizSubCategory(quizSubCategoryToDelete.quizSubCategoryCategoryId);
      fetchQuizSubCategories(); // Refresh the list
      setSuccess('Quiz sub-category deleted successfully');
      setDeleteConfirmOpen(false);
      setQuizSubCategoryToDelete(null);
    } catch (error) {
      console.error('Error deleting quiz sub-category:', error);
      setError('Failed to delete quiz sub-category. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    // Basic validation
    if (!formData.quizSubCategoryCategoryName || !formData.assessmentSubCategoryId) {
      setError('Quiz sub-category name and parent sub-category are required');
      return;
    }
    
    setLoading(true);
    try {
      const quizSubCategoryData = {
        quizSubCategoryCategoryName: formData.quizSubCategoryCategoryName,
        quizSubCategoryCategoryDescription: formData.quizSubCategoryCategoryDescription,
        assesssmentSubCategory: { assessmentSubCategoryId: parseInt(formData.assessmentSubCategoryId) }
      };
      
      if (isEditing) {
        // Update existing quiz sub-category
        await adminQuizSubCatService.updateQuizSubCategory(
          selectedQuizSubCategory.quizSubCategoryCategoryId, 
          quizSubCategoryData
        );
        setSuccess('Quiz sub-category updated successfully');
      } else {
        // Create new quiz sub-category
        await adminQuizSubCatService.createQuizSubCategory(quizSubCategoryData);
        setSuccess('Quiz sub-category created successfully');
      }
      fetchQuizSubCategories(); // Refresh the list
      setIsModalVisible(false);
    } catch (error) {
      console.error('Error saving quiz sub-category:', error);
      setError(`Failed to ${isEditing ? 'update' : 'create'} quiz sub-category. Please try again later.`);
    } finally {
      setLoading(false);
    }
  };

  // Handle page change
  const handleChangePage = (newPage) => {
    setPage(newPage);
  };

  // Calculate pagination
  const paginatedQuizSubCategories = filteredQuizSubCategories.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const totalPages = Math.ceil(filteredQuizSubCategories.length / rowsPerPage);
  
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

  // Helper function to get assessment sub-category name
  const getAssessmentSubCategoryName = (subCategoryId) => {
    const subCategory = assessmentSubCategories.find(sc => sc.assessmentSubCategoryId === subCategoryId);
    return subCategory ? subCategory.subCategoryName : 'Unknown';
  };

  return (
    <div className="container mx-auto px-6 py-8 max-w-[1400px]">
      {/* Header Section */}
      <div className="mb-10">
        <div className="flex items-center mb-4">
          <div className="p-2.5 rounded-lg bg-[#FFB71B]/20 mr-3">
            <Layers className="h-6 w-6 text-[#FFB71B]" />
          </div>
          <h1 className="text-3xl font-bold text-[#2B3E4E]">Quiz Sub-Category Management</h1>
        </div>
        <p className="text-gray-600 max-w-3xl">
          Manage quiz sub-categories. Create, edit, or delete quiz sub-categories to organize quiz content within assessment sub-categories.
        </p>
        <div className="w-32 h-1.5 bg-[#FFB71B] mt-4"></div>
      </div>
      
      {/* Search and Filter Section */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4 mb-4 items-center">
          <div className="w-full md:w-1/2 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="w-full pl-10 pr-28 py-3 border border-gray-200 rounded-xl bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FFB71B] focus:border-[#FFB71B] transition-colors shadow-sm"
              placeholder="Search quiz sub-categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 px-5 py-1.5 bg-[#FFB71B] text-[#2B3E4E] font-medium rounded-lg hover:bg-[#FFB71B]/90 transition-colors shadow-sm"
            >
              Search
            </button>
          </div>
          
          {/* Filter Dropdowns */}
          <div className="w-full md:w-1/2 flex flex-wrap gap-2">
            <div className="flex items-center w-full">
              <select
                value={filterSubCategory}
                onChange={(e) => setFilterSubCategory(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-l-xl bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FFB71B] focus:border-[#FFB71B] transition-colors shadow-sm flex-grow"
              >
                <option value="">All Assessment Sub-Categories</option>
                {assessmentSubCategories.map((subCategory) => (
                  <option key={subCategory.assessmentSubCategoryId} value={subCategory.assessmentSubCategoryId}>
                    {subCategory.subCategoryName}
                  </option>
                ))}
              </select>
              <div className="bg-gray-100 px-3 py-3 h-full flex items-center rounded-r-xl border border-l-0 border-gray-200">
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
            Add Quiz Sub-Category
          </button>
        </div>
      </div>
      
      {/* Quiz Sub-Categories Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8 border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gradient-to-r from-[#2B3E4E] to-[#2B3E4E]/90 text-white text-left">
                <th className="px-6 py-4 font-semibold text-sm uppercase tracking-wider text-left">ID</th>
                <th className="px-6 py-4 font-semibold text-sm uppercase tracking-wider text-left">Quiz Sub-Category Name</th>
                <th className="px-6 py-4 font-semibold text-sm uppercase tracking-wider text-left">Parent Sub-Category</th>
                <th className="px-6 py-4 font-semibold text-sm uppercase tracking-wider text-left">Description</th>
                <th className="px-6 py-4 font-semibold text-sm uppercase tracking-wider text-center w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading && !filteredQuizSubCategories.length ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Loader className="h-8 w-8 text-[#FFB71B] animate-spin mb-2" />
                      <p className="text-gray-500">Loading quiz sub-categories...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredQuizSubCategories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Layers className="h-12 w-12 text-gray-300 mb-2" />
                      <p className="text-gray-500 font-medium">No quiz sub-categories found</p>
                      <p className="text-gray-400 text-sm mt-1">Try adjusting your search or add a new quiz sub-category</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedQuizSubCategories.map((quizSubCategory) => (
                  <tr key={quizSubCategory.quizSubCategoryCategoryId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-500 font-mono text-sm text-left">{quizSubCategory.quizSubCategoryCategoryId}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-start">
                        <Layers className="h-4 w-4 text-[#FFB71B] mt-1 mr-2 flex-shrink-0" />
                        <div className="font-medium text-[#2B3E4E] text-left">{quizSubCategory.quizSubCategoryCategoryName}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <FolderTree className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="px-2.5 py-1 bg-[#2B3E4E]/10 text-[#2B3E4E] rounded-full text-xs font-medium">
                          {quizSubCategory.assesssmentSubCategory ? quizSubCategory.assesssmentSubCategory.subCategoryName : 'None'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 truncate max-w-xs text-gray-600 text-sm">
                      {quizSubCategory.quizSubCategoryCategoryDescription || 'No description'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center space-x-3">
                        <button
                          onClick={() => handleEditClick(quizSubCategory)}
                          className="p-2 text-[#2B3E4E] hover:bg-[#2B3E4E]/10 rounded-lg transition-colors"
                          title="Edit Quiz Sub-Category"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(quizSubCategory)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Quiz Sub-Category"
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
            Showing {filteredQuizSubCategories.length > 0 ? page * rowsPerPage + 1 : 0} to{" "}
            {Math.min((page + 1) * rowsPerPage, filteredQuizSubCategories.length)} of {filteredQuizSubCategories.length} quiz sub-categories
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
      
      {/* Add/Edit Quiz Sub-Category Modal */}
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
                  {isEditing ? 'Edit Quiz Sub-Category' : 'Add New Quiz Sub-Category'}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Quiz Sub-Category Name *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Layers className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="quizSubCategoryCategoryName"
                    value={formData.quizSubCategoryCategoryName}
                    onChange={handleInputChange}
                    className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#FFB71B] focus:border-[#FFB71B] transition-colors"
                    required
                    placeholder="Enter quiz sub-category name"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parent Assessment Sub-Category *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FolderTree className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    name="assessmentSubCategoryId"
                    value={formData.assessmentSubCategoryId}
                    onChange={handleInputChange}
                    className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#FFB71B] focus:border-[#FFB71B] transition-colors appearance-none"
                    required
                  >
                    <option value="">Select a parent sub-category</option>
                    {assessmentSubCategories.map((subCategory) => (
                      <option key={subCategory.assessmentSubCategoryId} value={subCategory.assessmentSubCategoryId}>
                        {subCategory.subCategoryName}
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
                    name="quizSubCategoryCategoryDescription"
                    value={formData.quizSubCategoryCategoryDescription}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#FFB71B] focus:border-[#FFB71B] transition-colors"
                    placeholder="Enter quiz sub-category description"
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
                    {isEditing ? 'Update Quiz Sub-Category' : 'Save Quiz Sub-Category'}
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
                Are you sure you want to delete this quiz sub-category? This action cannot be undone.
              </p>
              <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-200">
                <p className="text-sm text-gray-800 italic">
                  <span className="font-medium text-[#2B3E4E] not-italic">Quiz Sub-Category:</span> {quizSubCategoryToDelete?.quizSubCategoryCategoryName}
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

export default CRUD_QuizSubCategory;