import React, { useState, useEffect } from 'react';
import questionService from '../services/questionService';
import choiceService from '../services/choiceService';
import assessmentCategoryService from '../services/assessmentCategoryService';
import assessmentSubCategoryService from '../services/assessmentSubCategoryService';

const Questions = () => {
  const [questions, setQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [questionChoices, setQuestionChoices] = useState([]);
  const [expandedDetails, setExpandedDetails] = useState({});
  
  // Filter states
  const [filterCategory, setFilterCategory] = useState('');
  const [filterSubCategory, setFilterSubCategory] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('');
  const [filterType, setFilterType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // UI states
  const [categoryView, setCategoryView] = useState(true); // true: group by category, false: flat list

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch all questions
      const questionsData = await questionService.getAllQuestions();
      setQuestions(questionsData);
      
      // Fetch all categories
      const categoriesData = await assessmentCategoryService.getAllAssessmentCategories();
      setCategories(categoriesData);
      
      // Fetch all sub-categories
      const subCategoriesData = await assessmentSubCategoryService.getAllAssessmentSubCategories();
      setSubCategories(subCategoriesData);
      
      setLoading(false);
    } catch (err) {
      setError('Failed to load questions. Please try again later.');
      setLoading(false);
      console.error('Error fetching data:', err);
    }
  };

  const handleQuestionClick = async (question) => {
    setSelectedQuestion(question);
    
    try {
      // Fetch choices for the selected question
      const choicesData = await choiceService.getChoicesByQuestion(question.questionId);
      setQuestionChoices(choicesData);
    } catch (err) {
      console.error('Error fetching choices:', err);
      setQuestionChoices([]);
    }
  };

  const toggleDetails = (id) => {
    setExpandedDetails(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Apply filters to questions
  const filteredQuestions = questions.filter(question => {
    const matchesCategory = !filterCategory || 
      (question.assessmentCategory && question.assessmentCategory.assessmentCategoryId.toString() === filterCategory);
    
    const matchesSubCategory = !filterSubCategory || 
      (question.assessmentSubCategory && question.assessmentSubCategory.assessmentSubCategoryId.toString() === filterSubCategory);
    
    const matchesDifficulty = !filterDifficulty || question.difficultyLevel === filterDifficulty;
    
    const matchesType = !filterType || question.questionType === filterType;
    
    const matchesSearch = !searchTerm || 
      question.questionText.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCategory && matchesSubCategory && matchesDifficulty && matchesType && matchesSearch;
  });

  // Group questions by category for category view
  const questionsByCategory = {};
  if (categoryView && filteredQuestions.length > 0) {
    filteredQuestions.forEach(question => {
      const categoryId = question.assessmentCategory ? question.assessmentCategory.assessmentCategoryId : 'uncategorized';
      const categoryName = question.assessmentCategory ? question.assessmentCategory.categoryName : 'Uncategorized';
      
      if (!questionsByCategory[categoryId]) {
        questionsByCategory[categoryId] = {
          name: categoryName,
          questions: []
        };
      }
      
      questionsByCategory[categoryId].questions.push(question);
    });
  }

  const getDifficultyBadgeColor = (difficultyLevel) => {
    switch (difficultyLevel) {
      case 'EASY': return 'bg-green-100 text-green-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'HARD': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getQuestionTypeBadgeColor = (type) => {
    switch (type) {
      case 'MULTIPLE_CHOICE': return 'bg-blue-100 text-blue-800';
      case 'TRUE_FALSE': return 'bg-purple-100 text-purple-800';
      case 'SHORT_ANSWER': return 'bg-indigo-100 text-indigo-800';
      case 'ESSAY': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Question Management</h1>
      
      {/* Filters */}
      <div className="mb-6 p-5 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
          <h2 className="text-lg font-medium text-gray-800">Filter Questions</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setCategoryView(true)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${categoryView ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Category View
            </button>
            <button
              onClick={() => setCategoryView(false)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${!categoryView ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              List View
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
          {/* Search */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Questions
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search question text..."
                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-12 py-2 sm:text-sm border-gray-300 rounded-md"
              />
              {searchTerm && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Category filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              By Category
            </label>
            <select
              value={filterCategory}
              onChange={(e) => {
                setFilterCategory(e.target.value);
                setFilterSubCategory('');
              }}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category.assessmentCategoryId} value={category.assessmentCategoryId}>
                  {category.categoryName}
                </option>
              ))}
            </select>
          </div>
          
          {/* Sub-category filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              By Sub-Category
            </label>
            <select
              value={filterSubCategory}
              onChange={(e) => setFilterSubCategory(e.target.value)}
              disabled={!filterCategory}
              className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md ${!filterCategory ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}`}
            >
              <option value="">All Sub-Categories</option>
              {subCategories
                .filter(sub => !filterCategory || 
                  (sub.assessmentCategory && sub.assessmentCategory.assessmentCategoryId.toString() === filterCategory))
                .map(subCategory => (
                  <option key={subCategory.assessmentSubCategoryId} value={subCategory.assessmentSubCategoryId}>
                    {subCategory.subCategoryName}
                  </option>
                ))
              }
            </select>
          </div>
          
          {/* Difficulty filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              By Difficulty
            </label>
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="">All Difficulties</option>
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </div>
          
          {/* Question type filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              By Type
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="">All Types</option>
              <option value="MULTIPLE_CHOICE">Multiple Choice</option>
              <option value="TRUE_FALSE">True/False</option>
              <option value="SHORT_ANSWER">Short Answer</option>
              <option value="ESSAY">Essay</option>
            </select>
          </div>
        </div>
        
        <div className="mt-5 flex justify-end">
          <button
            onClick={() => {
              setFilterCategory('');
              setFilterSubCategory('');
              setFilterDifficulty('');
              setFilterType('');
              setSearchTerm('');
            }}
            className="inline-flex justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Clear Filters
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column - List of questions */}
        <div className="md:col-span-1 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-4 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-md font-medium text-gray-900">
                {categoryView ? 'Questions by Category' : 'All Questions'}
              </h3>
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                {filteredQuestions.length} found
              </span>
            </div>
          </div>
          <div className="max-h-[650px] overflow-y-auto">
            {categoryView ? (
              // Category view
              Object.keys(questionsByCategory).length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {Object.keys(questionsByCategory).map(categoryId => (
                    <div key={categoryId}>
                      <div className="px-4 py-3 font-medium text-gray-900 bg-gray-50 border-b border-gray-200">
                        {questionsByCategory[categoryId].name} ({questionsByCategory[categoryId].questions.length})
                      </div>
                      <ul className="divide-y divide-gray-100">
                        {questionsByCategory[categoryId].questions.map(question => (
                          <li 
                            key={question.questionId}
                            className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                              selectedQuestion?.questionId === question.questionId 
                                ? 'bg-blue-50 border-l-4 border-blue-500' 
                                : ''
                            }`}
                            onClick={() => handleQuestionClick(question)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="text-sm font-medium text-gray-900 truncate" style={{ maxWidth: "80%" }}>
                                {question.questionText}
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleDetails(question.questionId);
                                }}
                                className="ml-2 p-1 text-xs rounded-full text-gray-500 hover:bg-gray-100"
                              >
                                {expandedDetails[question.questionId] ? '▲' : '▼'}
                              </button>
                            </div>
                            
                            {expandedDetails[question.questionId] && (
                              <div className="mt-2 text-xs text-gray-500">
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {question.difficultyLevel && (
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getDifficultyBadgeColor(question.difficultyLevel)}`}>
                                      {question.difficultyLevel}
                                    </span>
                                  )}
                                  {question.questionType && (
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getQuestionTypeBadgeColor(question.questionType)}`}>
                                      {question.questionType.replace('_', ' ')}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-4 text-sm text-gray-500">No questions found</div>
              )
            ) : (
              // List view
              <ul className="divide-y divide-gray-200">
                {filteredQuestions.length > 0 ? (
                  filteredQuestions.map(question => (
                    <li 
                      key={question.questionId}
                      className={`px-4 py-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                        selectedQuestion?.questionId === question.questionId 
                          ? 'bg-blue-50 border-l-4 border-blue-500' 
                          : ''
                      }`}
                      onClick={() => handleQuestionClick(question)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium text-gray-900 truncate" style={{ maxWidth: "80%" }}>
                          {question.questionText}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleDetails(question.questionId);
                          }}
                          className="ml-2 p-1 text-xs rounded-full text-gray-500 hover:bg-gray-100"
                        >
                          {expandedDetails[question.questionId] ? '▲' : '▼'}
                        </button>
                      </div>
                      
                      {expandedDetails[question.questionId] && (
                        <div className="mt-2 text-xs text-gray-500 pl-2">
                          <p className="mt-1">
                            <span className="font-semibold">Category:</span> {
                              question.assessmentCategory?.categoryName || 'Uncategorized'
                            }
                          </p>
                          <p className="mt-1">
                            <span className="font-semibold">Sub-Category:</span> {
                              question.assessmentSubCategory?.subCategoryName || 'None'
                            }
                          </p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {question.difficultyLevel && (
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getDifficultyBadgeColor(question.difficultyLevel)}`}>
                                {question.difficultyLevel}
                              </span>
                            )}
                            {question.questionType && (
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getQuestionTypeBadgeColor(question.questionType)}`}>
                                {question.questionType.replace('_', ' ')}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </li>
                  ))
                ) : (
                  <li className="px-4 py-4 text-sm text-gray-500">
                    No questions found
                  </li>
                )}
              </ul>
            )}
          </div>
        </div>

        {/* Right column - Selected question details and choices */}
        <div className="md:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200">
          {selectedQuestion ? (
            <div>
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">
                    Question #{selectedQuestion.questionId}
                  </h3>
                  <div className="flex gap-1">
                    {selectedQuestion.difficultyLevel && (
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getDifficultyBadgeColor(selectedQuestion.difficultyLevel)}`}>
                        {selectedQuestion.difficultyLevel}
                      </span>
                    )}
                    {selectedQuestion.questionType && (
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getQuestionTypeBadgeColor(selectedQuestion.questionType)}`}>
                        {selectedQuestion.questionType.replace('_', ' ')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="px-6 py-5">
                <dl className="grid grid-cols-1 gap-x-6 gap-y-6">
                  <div>
                    <dt className="text-base font-medium text-gray-900 mb-2">Question</dt>
                    <dd className="text-sm text-gray-900 p-4 bg-gray-50 rounded-md border border-gray-200 shadow-inner">
                      {selectedQuestion.questionText}
                    </dd>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                    <div>
                      <dt className="text-base font-medium text-gray-900 mb-2">Category Information</dt>
                      <dd>
                        <ul className="border border-gray-200 rounded-md overflow-hidden">
                          <li className="pl-4 pr-4 py-3 bg-gray-50 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-sm text-gray-600">Category</span>
                              <span className="text-sm text-gray-900">{selectedQuestion.assessmentCategory?.categoryName || 'Uncategorized'}</span>
                            </div>
                          </li>
                          <li className="pl-4 pr-4 py-3 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-sm text-gray-600">Sub-Category</span>
                              <span className="text-sm text-gray-900">{selectedQuestion.assessmentSubCategory?.subCategoryName || 'None'}</span>
                            </div>
                          </li>
                          {selectedQuestion.quizSubCategoryCategory && (
                            <li className="pl-4 pr-4 py-3">
                              <div className="flex justify-between items-center">
                                <span className="font-medium text-sm text-gray-600">Quiz Sub-Category</span>
                                <span className="text-sm text-gray-900">{selectedQuestion.quizSubCategoryCategory.quizSubCategoryCategoryName}</span>
                              </div>
                            </li>
                          )}
                        </ul>
                      </dd>
                    </div>
                    
                    {questionChoices && questionChoices.length > 0 && (
                      <div>
                        <dt className="text-base font-medium text-gray-900 mb-2">Choices</dt>
                        <dd>
                          <ul className="border border-gray-200 rounded-md divide-y divide-gray-200 overflow-hidden">
                            {questionChoices.map((choice, index) => (
                              <li 
                                key={choice.choiceId}
                                className={`px-4 py-3 flex items-center text-sm ${
                                  choice.correct ? 'bg-green-50' : index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                }`}
                              >
                                <div className="mr-3 flex-shrink-0">
                                  {choice.correct ? (
                                    <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                  ) : (
                                    <div className="h-5 w-5 border-2 border-gray-300 rounded-full flex items-center justify-center">
                                      <span className="text-xs font-medium text-gray-500">{String.fromCharCode(65 + index)}</span>
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 text-gray-900">
                                  {choice.choiceText}
                                </div>
                                {choice.correct && (
                                  <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                    Correct
                                  </span>
                                )}
                              </li>
                            ))}
                          </ul>
                        </dd>
                      </div>
                    )}
                  </div>
                  
                  {selectedQuestion.correctAnswer && (
                    <div className="mt-2">
                      <dt className="text-sm font-medium text-gray-700">Correct Answer</dt>
                      <dd className="mt-1 text-sm text-gray-900 pl-3 border-l-2 border-green-500">{selectedQuestion.correctAnswer}</dd>
                    </div>
                  )}
                </dl>
              </div>
              
              <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex justify-end">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  onClick={() => setSelectedQuestion(null)}
                >
                  Close Details
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col justify-center items-center h-[500px] px-4">
              <div className="bg-gray-100 rounded-full p-4">
                <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 className="mt-5 text-md font-medium text-gray-900">No question selected</h3>
              <p className="mt-2 text-sm text-gray-500 max-w-md">
                Select a question from the list to view its details and answer choices. Use the filters above to narrow down the list.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Questions;
