import React, { useState, useEffect } from 'react';
import adminQuestionService from '../../services/adminQuestionService';
import adminAssessmentCategoryService from '../../services/adminAssessmentCategoryService';
import adminAssessmentSubCategoryService from '../../services/adminAssessmentSubCategoryService';
import adminQuizSubCatService from '../../services/adminQuizSubCatService';

const CRUD_Question = () => {
  // State variables
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [quizSubCategories, setQuizSubCategories] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    questionText: '',
    category: '',
    difficultyLevel: '',
    correctAnswer: '',
    questionType: '',
    assessmentCategoryId: '',
    assessmentSubCategoryId: '',
    quizSubCategoryCategoryId: '',
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('');
  const [filterType, setFilterType] = useState('');

  // Constants
  const DIFFICULTY_LEVELS = ['Easy', 'Medium', 'Hard'];
  const QUESTION_TYPES = ['Multiple Choice', 'True/False', 'Likert'];

  // Fetch data on component mount
  useEffect(() => {
    fetchQuestions();
    fetchCategories();
    fetchSubCategories();
    fetchQuizSubCategories();
  }, []);

  // Apply filters when search query or filters change
  useEffect(() => {
    if (searchQuery.trim() === '' && !filterCategory && !filterDifficulty && !filterType) {
      setFilteredQuestions(questions);
    } else {
      let filtered = [...questions];
      
      // Apply text search if provided
      if (searchQuery.trim() !== '') {
        filtered = filtered.filter(question => 
          question.questionText?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          question.category?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      // Apply category filter if selected
      if (filterCategory) {
        filtered = filtered.filter(question => 
          question.assessmentCategory?.assessmentCategoryId === parseInt(filterCategory)
        );
      }
      
      // Apply difficulty level filter if selected
      if (filterDifficulty) {
        filtered = filtered.filter(question => 
          question.difficultyLevel === filterDifficulty
        );
      }
      
      // Apply question type filter if selected
      if (filterType) {
        filtered = filtered.filter(question => 
          question.questionType === filterType
        );
      }
      
      setFilteredQuestions(filtered);
    }
  }, [searchQuery, filterCategory, filterDifficulty, filterType, questions]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const data = await adminQuestionService.getAllQuestions();
      setQuestions(data);
      setFilteredQuestions(data);
      setError(null);
    } catch (error) {
      setError('Failed to fetch questions');
      console.error('Error fetching questions:', error);
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

  const fetchSubCategories = async () => {
    try {
      const data = await adminAssessmentSubCategoryService.getAllAssessmentSubCategories();
      setSubCategories(data);
    } catch (error) {
      console.error('Error fetching assessment sub-categories:', error);
    }
  };

  const fetchQuizSubCategories = async () => {
    try {
      const data = await adminQuizSubCatService.getAllQuizSubCategories();
      setQuizSubCategories(data);
    } catch (error) {
      console.error('Error fetching quiz sub-categories:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFilterChange = (filterName, value) => {
    switch(filterName) {
      case 'category':
        setFilterCategory(value);
        break;
      case 'difficulty':
        setFilterDifficulty(value);
        break;
      case 'type':
        setFilterType(value);
        break;
      default:
        break;
    }
    setPage(0); // Reset to first page when changing filters
  };

  const handleAddClick = () => {
    setFormData({
      questionText: '',
      category: '',
      difficultyLevel: 'Medium',
      correctAnswer: '',
      questionType: 'Multiple Choice',
      assessmentCategoryId: '',
      assessmentSubCategoryId: '',
      quizSubCategoryCategoryId: '',
    });
    setIsEditing(false);
    setSelectedQuestion(null);
    setIsModalVisible(true);
  };

  const handleEditClick = (question) => {
    setSelectedQuestion(question);
    setFormData({
      questionText: question.questionText || '',
      category: question.category || '',
      difficultyLevel: question.difficultyLevel || 'Medium',
      correctAnswer: question.correctAnswer || '',
      questionType: question.questionType || 'Multiple Choice',
      assessmentCategoryId: question.assessmentCategory?.assessmentCategoryId?.toString() || '',
      assessmentSubCategoryId: question.assessmentSubCategory?.assessmentSubCategoryId?.toString() || '',
      quizSubCategoryCategoryId: question.quizSubCategoryCategory?.quizSubCategoryCategoryId?.toString() || '',
    });
    setIsEditing(true);
    setIsModalVisible(true);
  };

  const handleDeleteClick = (question) => {
    setQuestionToDelete(question);
    setDeleteConfirmOpen(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const cancelDelete = () => {
    setDeleteConfirmOpen(false);
    setQuestionToDelete(null);
  };

  const confirmDelete = async () => {
    if (!questionToDelete) return;
    
    setLoading(true);
    try {
      await adminQuestionService.deleteQuestion(questionToDelete.questionId);
      fetchQuestions(); // Refresh the list
      setSuccess('Question deleted successfully');
      setDeleteConfirmOpen(false);
      setQuestionToDelete(null);
    } catch (error) {
      console.error('Error deleting question:', error);
      setError('Failed to delete question. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    // Basic validation
    if (!formData.questionText || !formData.assessmentSubCategoryId) {
      setError('Question text and assessment sub-category are required');
      return;
    }
    
    setLoading(true);
    try {
      const questionData = {
        questionText: formData.questionText,
        category: formData.category,
        difficultyLevel: formData.difficultyLevel,
        correctAnswer: formData.correctAnswer,
        questionType: formData.questionType
      };
      
      // Add relationships if provided
      if (formData.assessmentCategoryId) {
        questionData.assessmentCategory = { 
          assessmentCategoryId: parseInt(formData.assessmentCategoryId) 
        };
      }
      
      if (formData.assessmentSubCategoryId) {
        questionData.assessmentSubCategory = { 
          assessmentSubCategoryId: parseInt(formData.assessmentSubCategoryId) 
        };
      }
      
      if (formData.quizSubCategoryCategoryId) {
        questionData.quizSubCategoryCategory = { 
          quizSubCategoryCategoryId: parseInt(formData.quizSubCategoryCategoryId) 
        };
      }
      
      if (isEditing) {
        // Update existing question
        await adminQuestionService.updateQuestion(selectedQuestion.questionId, questionData);
        setSuccess('Question updated successfully');
      } else {
        // Create new question
        await adminQuestionService.createQuestion(questionData);
        setSuccess('Question created successfully');
      }
      fetchQuestions(); // Refresh the list
      setIsModalVisible(false);
    } catch (error) {
      console.error('Error saving question:', error);
      setError(`Failed to ${isEditing ? 'update' : 'create'} question. Please try again later.`);
    } finally {
      setLoading(false);
    }
  };

  // Filter sub-categories based on selected category
  const getFilteredSubCategories = () => {
    if (!formData.assessmentCategoryId) return subCategories;
    
    return subCategories.filter(
      subCat => subCat.assessmentCategory?.assessmentCategoryId === parseInt(formData.assessmentCategoryId)
    );
  };
  
  // Filter quiz sub-categories based on selected sub-category
  const getFilteredQuizSubCategories = () => {
    if (!formData.assessmentSubCategoryId) return quizSubCategories;
    
    return quizSubCategories.filter(
      quizSubCat => quizSubCat.assesssmentSubCategory?.assessmentSubCategoryId === parseInt(formData.assessmentSubCategoryId)
    );
  };

  // Handle page change
  const handleChangePage = (newPage) => {
    setPage(newPage);
  };

  // Calculate pagination
  const paginatedQuestions = filteredQuestions.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const totalPages = Math.ceil(filteredQuestions.length / rowsPerPage);
  
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

  // Helper function to truncate long text
  const truncateText = (text, maxLength = 50) => {
    if (!text) return '';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  // Helper function to get category name from ID
  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.assessmentCategoryId === categoryId);
    return category ? category.categoryName : 'Unknown';
  };

  // Helper function to get sub-category name from ID
  const getSubCategoryName = (subCategoryId) => {
    const subCategory = subCategories.find(subCat => subCat.assessmentSubCategoryId === subCategoryId);
    return subCategory ? subCategory.subCategoryName : 'Unknown';
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">Question Management</h1>
        <div className="w-24 h-1 bg-yellow-500 dark:bg-yellow-400"></div>
      </div>
      
      {/* Search and Filter Section */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-grow">
          <div className="relative">
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1D63A1] dark:focus:ring-[#FFB71B]"
              placeholder="Search questions..."
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
        
        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <select
            value={filterCategory}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1D63A1] dark:focus:ring-[#FFB71B]"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category.assessmentCategoryId} value={category.assessmentCategoryId}>
                {category.categoryName}
              </option>
            ))}
          </select>
          
          <select
            value={filterDifficulty}
            onChange={(e) => handleFilterChange('difficulty', e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1D63A1] dark:focus:ring-[#FFB71B]"
          >
            <option value="">All Difficulties</option>
            {DIFFICULTY_LEVELS.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
          
          <select
            value={filterType}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1D63A1] dark:focus:ring-[#FFB71B]"
          >
            <option value="">All Types</option>
            {QUESTION_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        
        <button
          onClick={handleAddClick}
          className="inline-flex items-center px-4 py-2 bg-[#FFB71B] dark:bg-[#1D63A1] text-white dark:text-gray-100 rounded-md hover:bg-[#FFB71B]/90 dark:hover:bg-[#1D63A1]/90 transition-colors shadow-md"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Question
        </button>
      </div>
      
      {/* Questions Table */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-[#1D63A1] dark:bg-[#FFB71B] text-white dark:text-gray-900 text-left">
                <th className="px-6 py-3 font-semibold">ID</th>
                <th className="px-6 py-3 font-semibold">Question Text</th>
                <th className="px-6 py-3 font-semibold">Type</th>
                <th className="px-6 py-3 font-semibold">Difficulty</th>
                <th className="px-6 py-3 font-semibold">Category</th>
                <th className="px-6 py-3 font-semibold">Sub-Category</th>
                <th className="px-6 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading && !filteredQuestions.length ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1D63A1] dark:border-[#FFB71B]"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredQuestions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    No questions found
                  </td>
                </tr>
              ) : (
                paginatedQuestions.map((question) => (
                  <tr key={question.questionId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4">{question.questionId}</td>
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">
                      {truncateText(question.questionText)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        question.questionType === 'Multiple Choice' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                        question.questionType === 'True/False' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                      }`}>
                        {question.questionType || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        question.difficultyLevel === 'Easy' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        question.difficultyLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {question.difficultyLevel || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {question.assessmentCategory ? (
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-full text-xs">
                          {question.assessmentCategory.categoryName}
                        </span>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {question.assessmentSubCategory ? (
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-full text-xs">
                          {question.assessmentSubCategory.subCategoryName}
                        </span>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditClick(question)}
                          className="p-1 text-[#1D63A1] dark:text-[#FFB71B] hover:bg-[#1D63A1]/10 dark:hover:bg-[#FFB71B]/10 rounded"
                          title="Edit"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteClick(question)}
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
          Showing {filteredQuestions.length > 0 ? page * rowsPerPage + 1 : 0} to {Math.min((page + 1) * rowsPerPage, filteredQuestions.length)} of {filteredQuestions.length} questions
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
      
      {/* Add/Edit Question Modal */}
      {isModalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                {isEditing ? 'Edit Question' : 'Add New Question'}
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Question Text *</label>
                  <textarea
                    name="questionText"
                    value={formData.questionText}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1D63A1] dark:focus:ring-[#FFB71B] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    required
                  ></textarea>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Question Type</label>
                    <select
                      name="questionType"
                      value={formData.questionType}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1D63A1] dark:focus:ring-[#FFB71B] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    >
                      {QUESTION_TYPES.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Difficulty Level</label>
                    <select
                      name="difficultyLevel"
                      value={formData.difficultyLevel}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1D63A1] dark:focus:ring-[#FFB71B] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    >
                      {DIFFICULTY_LEVELS.map((level) => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1D63A1] dark:focus:ring-[#FFB71B] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assessment Category</label>
                    <select
                      name="assessmentCategoryId"
                      value={formData.assessmentCategoryId}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1D63A1] dark:focus:ring-[#FFB71B] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    >
                      <option value="">Select a category</option>
                      {categories.map((category) => (
                        <option key={category.assessmentCategoryId} value={category.assessmentCategoryId}>
                          {category.categoryName}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assessment Sub-Category *</label>
                    <select
                      name="assessmentSubCategoryId"
                      value={formData.assessmentSubCategoryId}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1D63A1] dark:focus:ring-[#FFB71B] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      required
                    >
                      <option value="">Select a sub-category</option>
                      {getFilteredSubCategories().map((subCategory) => (
                        <option key={subCategory.assessmentSubCategoryId} value={subCategory.assessmentSubCategoryId}>
                          {subCategory.subCategoryName}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quiz Sub-Category</label>
                    <select
                      name="quizSubCategoryCategoryId"
                      value={formData.quizSubCategoryCategoryId}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1D63A1] dark:focus:ring-[#FFB71B] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    >
                      <option value="">Select a quiz sub-category</option>
                      {getFilteredQuizSubCategories().map((quizSubCat) => (
                        <option key={quizSubCat.quizSubCategoryCategoryId} value={quizSubCat.quizSubCategoryCategoryId}>
                          {quizSubCat.quizSubCategoryCategoryName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Correct Answer</label>
                  <input
                    type="text"
                    name="correctAnswer"
                    value={formData.correctAnswer}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1D63A1] dark:focus:ring-[#FFB71B] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    placeholder="For True/False questions or as fallback"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    * Note: For multiple choice questions, choices are managed separately.
                  </p>
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
                Are you sure you want to delete this question? This action cannot be undone.
              </p>
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                <p className="text-sm text-gray-800 dark:text-gray-200">
                  <span className="font-medium">Question:</span> {truncateText(questionToDelete?.questionText, 100)}
                </p>
              </div>
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

export default CRUD_Question;