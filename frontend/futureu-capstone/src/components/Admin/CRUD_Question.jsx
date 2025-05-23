import React, { useState, useEffect } from 'react';
import adminQuestionService from '../../services/adminQuestionService';
import adminAssessmentCategoryService from '../../services/adminAssessmentCategoryService';
import adminAssessmentSubCategoryService from '../../services/adminAssessmentSubCategoryService';
import adminQuizSubCatService from '../../services/adminQuizSubCatService';
import {
  HelpCircle,
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
  Filter,
  BookOpen,
  BookOpen as Book,
  BrainCircuit,
  ChevronDown,
  Sparkles,
  ListFilter,
  Bookmark
} from 'lucide-react';

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
      // Use the enriched method to get complete data for questions
      const data = await adminQuestionService.getAllQuestionsEnriched();
      console.log('Enriched questions data:', data);
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
      console.log('Initial load of all sub-categories:', data);
      if (Array.isArray(data)) {
        setSubCategories(data);
      } else {
        console.error('Invalid data format for sub-categories:', data);
        setSubCategories([]);
      }
    } catch (error) {
      console.error('Error fetching assessment sub-categories:', error);
      setSubCategories([]);
    }
  };

  const fetchQuizSubCategories = async () => {
    try {
      const data = await adminQuizSubCatService.getAllQuizSubCategories();
      console.log('Initial load of all quiz sub-categories:', data);
      if (Array.isArray(data)) {
        // Log the structure of the first item if available
        if (data.length > 0) {
          console.log('Sample quiz sub-category structure:', data[0]);
          console.log('Property names in sample:', Object.keys(data[0]));
        }
        setQuizSubCategories(data);
      } else {
        console.error('Invalid data format for quiz sub-categories:', data);
        setQuizSubCategories([]);
      }
    } catch (error) {
      console.error('Error fetching quiz sub-categories:', error);
      setQuizSubCategories([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // When assessment category changes, fetch relevant sub-categories
    if (name === 'assessmentCategoryId' && value) {
      console.log('Selected assessment category ID:', value);
      fetchSubCategoriesByCategory(parseInt(value));
      
      // Clear sub-category selections when category changes
      setFormData(prev => ({
        ...prev,
        [name]: value,
        assessmentSubCategoryId: '',
        quizSubCategoryCategoryId: ''
      }));
    }
    
    // When assessment sub-category changes, filter relevant quiz sub-categories
    if (name === 'assessmentSubCategoryId' && value) {
      console.log('Selected assessment sub-category ID:', value);
      
      // Clear quiz sub-category selection
      setFormData(prev => ({
        ...prev,
        [name]: value,
        quizSubCategoryCategoryId: ''
      }));
      
      // Fetch quiz sub-categories for the selected assessment sub-category
      fetchQuizSubCategoriesBySubCategory(parseInt(value));
    }
  };
  
  // Fetch sub-categories filtered by category ID
  const fetchSubCategoriesByCategory = async (categoryId) => {
    try {
      console.log('Fetching sub-categories for category ID:', categoryId);
      const data = await adminAssessmentSubCategoryService.getAssessmentSubCategoriesByCategory(categoryId);
      console.log('Sub-categories for selected category:', data);
      
      // Update sub-categories state with the filtered data
      if (Array.isArray(data)) {
        setSubCategories(data);
      } else {
        console.error('Invalid data format for sub-categories:', data);
        setSubCategories([]);
      }
    } catch (error) {
      console.error('Error fetching sub-categories for category:', error);
      setSubCategories([]);
    }
  };

  // Fetch quiz sub-categories filtered by assessment sub-category ID
  const fetchQuizSubCategoriesBySubCategory = async (subCategoryId) => {
    try {
      console.log('Fetching quiz sub-categories for sub-category ID:', subCategoryId);
      
      // Use the new service method
      const filteredQuizSubCats = await adminQuizSubCatService.getQuizSubCategoriesBySubCategory(subCategoryId);
      console.log('Filtered quiz sub-categories from service:', filteredQuizSubCats);
      
      // If we got results, update the state with only these filtered results
      // This makes getFilteredQuizSubCategories() simpler because we've already filtered the data
      if (Array.isArray(filteredQuizSubCats) && filteredQuizSubCats.length > 0) {
        setQuizSubCategories(filteredQuizSubCats);
      } else {
        console.log('No quiz sub-categories found for the selected assessment sub-category');
      }
    } catch (error) {
      console.error('Error fetching quiz sub-categories for sub-category:', error);
    }
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
    // We don't need to filter here anymore since we're fetching the
    // filtered sub-categories directly in fetchSubCategoriesByCategory
    return subCategories;
  };
  
  // Filter quiz sub-categories based on selected sub-category
  const getFilteredQuizSubCategories = () => {
    // We're now handling the filtering in fetchQuizSubCategoriesBySubCategory
    // Just return the state directly since it's already filtered
    return quizSubCategories;
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
  const getPaginationRange = () => {
    const MAX_VISIBLE_PAGES = 5;
    let start = Math.max(0, Math.min(page - Math.floor(MAX_VISIBLE_PAGES / 2), totalPages - MAX_VISIBLE_PAGES));
    let end = Math.min(start + MAX_VISIBLE_PAGES - 1, totalPages - 1);
    
    // Adjust start if we're at the end
    if (end === totalPages - 1 && totalPages > MAX_VISIBLE_PAGES) {
      start = Math.max(0, end - MAX_VISIBLE_PAGES + 1);
    }
    
    const range = [];
    for (let i = start; i <= end; i++) {
      range.push(i);
    }
    
    return range;
  };

  // Helper function to truncate long text
  const truncateText = (text, maxLength = 60) => {
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

  // Helper function to get style for difficulty badge
  const getDifficultyBadgeStyle = (difficulty) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Hard':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Helper function to get style for question type badge
  const getTypeBadgeStyle = (type) => {
    switch (type) {
      case 'Multiple Choice':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'True/False':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Likert':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="container mx-auto px-6 py-8 max-w-[1400px]">
      {/* Header Section */}
      <div className="mb-10">
        <div className="flex items-center mb-4">
          <div className="p-2.5 rounded-lg bg-[#FFB71B]/20 mr-3">
            <HelpCircle className="h-6 w-6 text-[#FFB71B]" />
          </div>
          <h1 className="text-3xl font-bold text-[#2B3E4E]">Question Management</h1>
        </div>
        <p className="text-gray-600 max-w-3xl">
          Manage assessment and quiz questions. Create, edit, or delete questions across different categories and difficulty levels.
        </p>
        <div className="w-32 h-1.5 bg-[#FFB71B] mt-4"></div>
      </div>
      
      {/* Search and Filter Section */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4 mb-4 items-center">
          {/* Search Input */}
          <div className="w-full md:w-2/5 relative"> {/* Adjusted width for search */}
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FFB71B] focus:border-[#FFB71B] transition-colors shadow-sm"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {/* Search button can be re-added here if needed, currently removed for space with 3 filters */}
          </div>

          {/* Filter Dropdowns - All in one line */}
          <div className="w-full md:w-3/5 flex flex-col sm:flex-row gap-2 items-center"> {/* Adjusted width for filters and items-center */}
            {/* Category Filter */}
            <div className="flex items-center w-full sm:w-1/3">
              <select
                value={filterCategory}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="px-4 py-3 border-t border-b border-l border-gray-200 rounded-l-xl bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FFB71B] focus:border-[#FFB71B] transition-colors shadow-sm flex-grow"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.assessmentCategoryId} value={cat.assessmentCategoryId}>
                    {cat.categoryName}
                  </option>
                ))}
              </select>
              <div className="bg-gray-100 px-3 h-full flex items-center rounded-r-xl border-t border-b border-r border-gray-200 py-3">
                <Filter className="h-5 w-5 text-gray-500" />
              </div>
            </div>

            {/* Difficulty Filter */}
            <div className="flex items-center w-full sm:w-1/3">
              <select
                value={filterDifficulty}
                onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                className="px-4 py-3 border-t border-b border-l border-gray-200 rounded-l-xl bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FFB71B] focus:border-[#FFB71B] transition-colors shadow-sm flex-grow"
              >
                <option value="">All Difficulties</option>
                {DIFFICULTY_LEVELS.map((level) => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
              <div className="bg-gray-100 px-3 h-full flex items-center rounded-r-xl border-t border-b border-r border-gray-200 py-3">
                <Sparkles className="h-5 w-5 text-gray-500" />
              </div>
            </div>

            {/* Type Filter */}
            <div className="flex items-center w-full sm:w-1/3">
              <select
                value={filterType}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="px-4 py-3 border-t border-b border-l border-gray-200 rounded-l-xl bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FFB71B] focus:border-[#FFB71B] transition-colors shadow-sm flex-grow"
              >
                <option value="">All Types</option>
                {QUESTION_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <div className="bg-gray-100 px-3 h-full flex items-center rounded-r-xl border-t border-b border-r border-gray-200 py-3">
                <ListFilter className="h-5 w-5 text-gray-500" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <button
            onClick={handleAddClick}
            className="flex items-center justify-center px-6 py-2.5 bg-gradient-to-r from-[#FFB71B] to-[#FFB71B]/90 text-[#2B3E4E] font-medium rounded-xl hover:shadow-lg transition-all shadow-sm"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Question
          </button>
        </div>
      </div>
      
      {/* Questions Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8 border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gradient-to-r from-[#2B3E4E] to-[#2B3E4E]/90 text-white text-left">
                <th className="px-6 py-4 font-semibold text-sm uppercase tracking-wider text-left">ID</th>
                <th className="px-6 py-4 font-semibold text-sm uppercase tracking-wider text-left">Question Text</th>
                <th className="px-6 py-4 font-semibold text-sm uppercase tracking-wider text-left">Type</th>
                <th className="px-6 py-4 font-semibold text-sm uppercase tracking-wider text-left">Difficulty</th>
                <th className="px-6 py-4 font-semibold text-sm uppercase tracking-wider text-left">Category</th>
                <th className="px-6 py-4 font-semibold text-sm uppercase tracking-wider text-left">Sub-Category</th>
                <th className="px-6 py-4 font-semibold text-sm uppercase tracking-wider text-center w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading && !filteredQuestions.length ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Loader className="h-8 w-8 text-[#FFB71B] animate-spin mb-2" />
                      <p className="text-gray-500">Loading questions...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredQuestions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <FileText className="h-12 w-12 text-gray-300 mb-2" />
                      <p className="text-gray-500 font-medium">No questions found</p>
                      <p className="text-gray-400 text-sm mt-1">Try adjusting your search or add a new question</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedQuestions.map((question) => (
                  <tr key={question.questionId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-500 font-mono text-sm text-left">{question.questionId}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-start">
                        <HelpCircle className="h-4 w-4 text-[#FFB71B] mt-1 mr-2 flex-shrink-0" />
                        <div className="font-medium text-[#2B3E4E] text-left">{truncateText(question.questionText)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTypeBadgeStyle(question.questionType)}`}>
                        {question.questionType || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getDifficultyBadgeStyle(question.difficultyLevel)}`}>
                        {question.difficultyLevel || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {question.assessmentCategory ? (
                        <div className="flex items-center">
                          <Bookmark className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                          <span className="text-gray-700 text-sm">{question.assessmentCategory.categoryName}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic text-sm">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {question.assessmentSubCategory ? (
                        <div className="flex items-center">
                          <BookOpen className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                          <span className="text-gray-700 text-sm">{question.assessmentSubCategory.subCategoryName}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic text-sm">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center space-x-3">
                        <button
                          onClick={() => handleEditClick(question)}
                          className="p-2 text-[#2B3E4E] hover:bg-[#2B3E4E]/10 rounded-lg transition-colors"
                          title="Edit Question"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(question)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Question"
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
            Showing {filteredQuestions.length > 0 ? page * rowsPerPage + 1 : 0} to{" "}
            {Math.min((page + 1) * rowsPerPage, filteredQuestions.length)} of {filteredQuestions.length} questions
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
                {getPaginationRange().map((pageNum) => (
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
      
      {/* Add/Edit Question Modal */}
      {isModalVisible && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-auto animate-fadeIn">
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
                  {isEditing ? 'Edit Question' : 'Add New Question'}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Question Text *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <HelpCircle className="h-5 w-5 text-gray-400" />
                  </div>
                  <textarea
                    name="questionText"
                    value={formData.questionText}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#FFB71B] focus:border-[#FFB71B] transition-colors"
                    required
                    placeholder="Enter question text..."
                  ></textarea>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Question Type</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <BrainCircuit className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      name="questionType"
                      value={formData.questionType}
                      onChange={handleInputChange}
                      className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#FFB71B] focus:border-[#FFB71B] transition-colors appearance-none"
                    >
                      {QUESTION_TYPES.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty Level</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Sparkles className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      name="difficultyLevel"
                      value={formData.difficultyLevel}
                      onChange={handleInputChange}
                      className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#FFB71B] focus:border-[#FFB71B] transition-colors appearance-none"
                    >
                      {DIFFICULTY_LEVELS.map((level) => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category (Optional)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Filter className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#FFB71B] focus:border-[#FFB71B] transition-colors"
                    placeholder="Enter category keyword"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assessment Category</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Bookmark className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      name="assessmentCategoryId"
                      value={formData.assessmentCategoryId}
                      onChange={handleInputChange}
                      className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#FFB71B] focus:border-[#FFB71B] transition-colors appearance-none"
                    >
                      <option value="">Select a category</option>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assessment Sub-Category *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Book className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      name="assessmentSubCategoryId"
                      value={formData.assessmentSubCategoryId}
                      onChange={handleInputChange}
                      className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#FFB71B] focus:border-[#FFB71B] transition-colors appearance-none"
                      required
                    >
                      <option value="">Select a sub-category</option>
                      {getFilteredSubCategories().map((subCategory) => (
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quiz Sub-Category</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <BookOpen className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      name="quizSubCategoryCategoryId"
                      value={formData.quizSubCategoryCategoryId}
                      onChange={handleInputChange}
                      className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#FFB71B] focus:border-[#FFB71B] transition-colors appearance-none"
                    >
                      <option value="">Select a quiz sub-category</option>
                      {getFilteredQuizSubCategories().map((quizSubCat) => (
                        <option key={quizSubCat.quizSubCategoryCategoryId} value={quizSubCat.quizSubCategoryCategoryId}>
                          {quizSubCat.quizSubCategoryCategoryName}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Correct Answer</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Check className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="correctAnswer"
                    value={formData.correctAnswer}
                    onChange={handleInputChange}
                    className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#FFB71B] focus:border-[#FFB71B] transition-colors"
                    placeholder="For True/False questions or as fallback"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  * Note: For multiple choice questions, choices are managed separately.
                </p>
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
                Are you sure you want to delete this question? This action cannot be undone.
              </p>
              <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-200">
                <p className="text-sm text-gray-800 italic">
                  <span className="font-medium text-[#2B3E4E] not-italic">Question:</span> {truncateText(questionToDelete?.questionText, 100)}
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

export default CRUD_Question;