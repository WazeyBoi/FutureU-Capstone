import React, { useState, useEffect } from 'react';
import assessmentSubCategoryService from '../services/assessmentSubCategoryService';
import assessmentCategoryService from '../services/assessmentCategoryService';

const AssessmentSubCategories = () => {
  const [subCategories, setSubCategories] = useState([]);
  const [categories, setCategories] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [expandedDetails, setExpandedDetails] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all sub-categories
        const subCategoriesData = await assessmentSubCategoryService.getAllAssessmentSubCategories();
        setSubCategories(subCategoriesData);
        
        // Fetch all categories to map IDs to names
        const categoriesData = await assessmentCategoryService.getAllAssessmentCategories();
        const categoryMap = {};
        categoriesData.forEach(category => {
          categoryMap[category.assessmentCategoryId] = category;
        });
        setCategories(categoryMap);
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load assessment sub-categories. Please try again later.');
        setLoading(false);
        console.error('Error fetching data:', err);
      }
    };

    fetchData();
  }, []);

  const handleSubCategoryClick = (subCategory) => {
    setSelectedSubCategory(subCategory);
  };

  const toggleDetails = (id) => {
    setExpandedDetails(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Assessment Sub-Categories</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column - List of all sub-categories */}
        <div className="md:col-span-1 bg-white rounded-lg shadow overflow-hidden">
          <div className="px-4 py-5 sm:px-6 bg-gray-50">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              All Sub-Categories
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Click on a sub-category to view details
            </p>
          </div>
          <div className="border-t border-gray-200">
            <ul className="divide-y divide-gray-200">
              {subCategories.length > 0 ? (
                subCategories.map((subCategory) => (
                  <li 
                    key={subCategory.assessmentSubCategoryId}
                    className={`px-4 py-4 hover:bg-gray-50 cursor-pointer ${
                      selectedSubCategory?.assessmentSubCategoryId === subCategory.assessmentSubCategoryId 
                        ? 'bg-blue-50' 
                        : ''
                    }`}
                    onClick={() => handleSubCategoryClick(subCategory)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-gray-900">
                        {subCategory.subCategoryName}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleDetails(subCategory.assessmentSubCategoryId);
                        }}
                        className="ml-2 px-2 py-1 text-xs rounded-full text-blue-600 hover:text-blue-800"
                      >
                        {expandedDetails[subCategory.assessmentSubCategoryId] ? '▲' : '▼'}
                      </button>
                    </div>
                    
                    {expandedDetails[subCategory.assessmentSubCategoryId] && (
                      <div className="mt-2 text-xs text-gray-500">
                        <p className="truncate">
                          {subCategory.description.length > 100 
                            ? `${subCategory.description.substring(0, 100)}...` 
                            : subCategory.description}
                        </p>
                        <p className="mt-1">
                          <span className="font-semibold">Category:</span> {
                            categories[subCategory.assessmentCategory?.assessmentCategoryId]?.categoryName || 'Unknown'
                          }
                        </p>
                      </div>
                    )}
                  </li>
                ))
              ) : (
                <li className="px-4 py-4 text-sm text-gray-500">
                  No sub-categories found
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Right column - Selected sub-category details */}
        <div className="md:col-span-2 bg-white rounded-lg shadow">
          {selectedSubCategory ? (
            <div>
              <div className="px-4 py-5 sm:px-6 bg-gray-50">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {selectedSubCategory.subCategoryName}
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Sub-Category Details
                </p>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">ID</dt>
                    <dd className="mt-1 text-sm text-gray-900">{selectedSubCategory.assessmentSubCategoryId}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Parent Category</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {categories[selectedSubCategory.assessmentCategory?.assessmentCategoryId]?.categoryName || 'Unknown'}
                    </dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Description</dt>
                    <dd className="mt-1 text-sm text-gray-900">{selectedSubCategory.description}</dd>
                  </div>
                  
                  {selectedSubCategory.quizSubCategoryCategories && selectedSubCategory.quizSubCategoryCategories.length > 0 && (
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">Quiz Sub-Categories ({selectedSubCategory.quizSubCategoryCategories.length})</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                          {selectedSubCategory.quizSubCategoryCategories.map(quiz => (
                            <li key={quiz.quizSubCategoryCategoryId} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                              <div className="w-0 flex-1 flex items-center">
                                <span className="ml-2 flex-1 w-0 truncate">{quiz.quizSubCategoryCategoryName}</span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </dd>
                    </div>
                  )}
                  
                  {selectedSubCategory.questions && selectedSubCategory.questions.length > 0 && (
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">Questions ({selectedSubCategory.questions.length})</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                          {selectedSubCategory.questions.map(question => (
                            <li key={question.questionId} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                              <div className="w-0 flex-1 flex items-center">
                                <span className="ml-2 flex-1 w-0 truncate">{question.questionText}</span>
                              </div>
                              <div className="ml-4 flex-shrink-0">
                                <span className="font-medium text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                                  {question.difficultyLevel || 'N/A'}
                                </span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
              
              <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                <button
                  type="button"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={() => setSelectedSubCategory(null)}
                >
                  Close Details
                </button>
              </div>
            </div>
          ) : (
            <div className="px-4 py-16 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No sub-category selected</h3>
              <p className="mt-1 text-sm text-gray-500">
                Select a sub-category from the list to view its details.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssessmentSubCategories;
