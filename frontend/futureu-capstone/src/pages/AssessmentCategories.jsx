import React, { useState, useEffect } from 'react';
import assessmentCategoryService from '../services/assessmentCategoryService';
import assessmentService from '../services/assessmentService';

const AssessmentCategories = () => {
  const [categories, setCategories] = useState([]);
  const [assessments, setAssessments] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [expandedDetails, setExpandedDetails] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all categories
        const categoriesData = await assessmentCategoryService.getAllAssessmentCategories();
        setCategories(categoriesData);
        
        // Fetch all assessments to map IDs to names
        const assessmentsData = await assessmentService.getAllAssessments();
        const assessmentMap = {};
        assessmentsData.forEach(assessment => {
          assessmentMap[assessment.assessmentId] = assessment;
        });
        setAssessments(assessmentMap);
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load assessment categories. Please try again later.');
        setLoading(false);
        console.error('Error fetching data:', err);
      }
    };

    fetchData();
  }, []);

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };

  const toggleDetails = (id) => {
    setExpandedDetails(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const filteredCategories = categories.filter(category => 
    category.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
      <h1 className="text-3xl font-bold text-center mb-8">Assessment Categories</h1>
      
      {/* Search Bar */}
      <div className="mb-6">
        <div className="max-w-md mx-auto">
          <div className="relative flex items-center w-full h-12 rounded-lg focus-within:shadow-lg bg-white overflow-hidden border border-gray-300">
            <div className="grid place-items-center h-full w-12 text-gray-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              className="peer h-full w-full outline-none text-sm text-gray-700 pl-2 pr-2"
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column - List of all categories */}
        <div className="md:col-span-1 bg-white rounded-lg shadow overflow-hidden">
          <div className="px-4 py-5 sm:px-6 bg-gray-50">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              All Categories
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Click on a category to view details
            </p>
          </div>
          <div className="border-t border-gray-200 max-h-[600px] overflow-y-auto">
            <ul className="divide-y divide-gray-200">
              {filteredCategories.length > 0 ? (
                filteredCategories.map((category) => (
                  <li 
                    key={category.assessmentCategoryId}
                    className={`px-4 py-4 hover:bg-gray-50 cursor-pointer ${
                      selectedCategory?.assessmentCategoryId === category.assessmentCategoryId 
                        ? 'bg-blue-50' 
                        : ''
                    }`}
                    onClick={() => handleCategoryClick(category)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-gray-900">
                        {category.categoryName}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleDetails(category.assessmentCategoryId);
                        }}
                        className="ml-2 px-2 py-1 text-xs rounded-full text-blue-600 hover:text-blue-800"
                      >
                        {expandedDetails[category.assessmentCategoryId] ? '▲' : '▼'}
                      </button>
                    </div>
                    
                    {expandedDetails[category.assessmentCategoryId] && (
                      <div className="mt-2 text-xs text-gray-500">
                        <p className="truncate">
                          {category.description?.length > 100 
                            ? `${category.description.substring(0, 100)}...` 
                            : category.description || 'No description'}
                        </p>
                        <p className="mt-1">
                          <span className="font-semibold">Assessment:</span> {
                            assessments[category.assessment?.assessmentId]?.title || 'Unknown'
                          }
                        </p>
                      </div>
                    )}
                  </li>
                ))
              ) : (
                <li className="px-4 py-4 text-sm text-gray-500">
                  No categories found
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Right column - Selected category details */}
        <div className="md:col-span-2 bg-white rounded-lg shadow">
          {selectedCategory ? (
            <div>
              <div className="px-4 py-5 sm:px-6 bg-gray-50">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {selectedCategory.categoryName}
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Category Details
                </p>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Category ID</dt>
                    <dd className="mt-1 text-sm text-gray-900">{selectedCategory.assessmentCategoryId}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Assessment</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {assessments[selectedCategory.assessment?.assessmentId]?.title || 'Unknown'}
                    </dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Description</dt>
                    <dd className="mt-1 text-sm text-gray-900">{selectedCategory.description || 'No description available.'}</dd>
                  </div>
                  
                  {selectedCategory.subCategories && selectedCategory.subCategories.length > 0 && (
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">Sub-Categories ({selectedCategory.subCategories.length})</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                          {selectedCategory.subCategories.map(subCategory => (
                            <li key={subCategory.assessmentSubCategoryId} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                              <div className="w-0 flex-1 flex items-center">
                                <span className="ml-2 flex-1 w-0 truncate">{subCategory.subCategoryName}</span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </dd>
                    </div>
                  )}
                  
                  {selectedCategory.questions && selectedCategory.questions.length > 0 && (
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">Questions ({selectedCategory.questions.length})</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                          {selectedCategory.questions.map(question => (
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
                  onClick={() => setSelectedCategory(null)}
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
              <h3 className="mt-2 text-sm font-medium text-gray-900">No category selected</h3>
              <p className="mt-1 text-sm text-gray-500">
                Select a category from the list to view its details.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssessmentCategories;
