import React, { useState, useEffect } from 'react';
import assessmentService from '../services/assessmentService';

const Assessments = () => {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [expandedDetails, setExpandedDetails] = useState({});
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      let data;
      
      if (filterType) {
        data = await assessmentService.filterByType(filterType);
      } else if (filterStatus) {
        data = await assessmentService.filterByStatus(filterStatus);
      } else {
        data = await assessmentService.getAllAssessments();
      }
      
      setAssessments(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load assessments. Please try again later.');
      setLoading(false);
      console.error('Error fetching assessments:', err);
    }
  };

  const handleAssessmentClick = (assessment) => {
    setSelectedAssessment(assessment);
  };

  const toggleDetails = (id) => {
    setExpandedDetails(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleFilterTypeChange = (e) => {
    setFilterType(e.target.value);
    setFilterStatus('');
  };

  const handleFilterStatusChange = (e) => {
    setFilterStatus(e.target.value);
    setFilterType('');
  };

  const handleApplyFilters = () => {
    fetchAssessments();
  };

  const handleClearFilters = () => {
    setFilterType('');
    setFilterStatus('');
    fetchAssessments();
  };

  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return 'Not set';
    try {
      const date = new Date(dateTimeStr);
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      }).format(date);
    } catch (e) {
      return 'Invalid date';
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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Assessments</h1>
      
      {/* Filters */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow">
        <h2 className="text-lg font-medium mb-3">Filter Assessments</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              By Type
            </label>
            <select
              value={filterType}
              onChange={handleFilterTypeChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="">All Types</option>
              <option value="QUIZ">Quiz</option>
              <option value="EXAM">Exam</option>
              <option value="PRACTICE">Practice</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              By Status
            </label>
            <select
              value={filterStatus}
              onChange={handleFilterStatusChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={handleApplyFilters}
              className="mr-2 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Apply Filters
            </button>
            <button
              onClick={handleClearFilters}
              className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Clear
            </button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column - List of all assessments */}
        <div className="md:col-span-1 bg-white rounded-lg shadow overflow-hidden">
          <div className="px-4 py-5 sm:px-6 bg-gray-50">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              All Assessments
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Click on an assessment to view details
            </p>
          </div>
          <div className="border-t border-gray-200 max-h-[600px] overflow-y-auto">
            <ul className="divide-y divide-gray-200">
              {assessments.length > 0 ? (
                assessments.map((assessment) => (
                  <li 
                    key={assessment.assessmentId}
                    className={`px-4 py-4 hover:bg-gray-50 cursor-pointer ${
                      selectedAssessment?.assessmentId === assessment.assessmentId 
                        ? 'bg-blue-50' 
                        : ''
                    }`}
                    onClick={() => handleAssessmentClick(assessment)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-gray-900">
                        {assessment.title}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleDetails(assessment.assessmentId);
                        }}
                        className="ml-2 px-2 py-1 text-xs rounded-full text-blue-600 hover:text-blue-800"
                      >
                        {expandedDetails[assessment.assessmentId] ? '▲' : '▼'}
                      </button>
                    </div>
                    
                    {expandedDetails[assessment.assessmentId] && (
                      <div className="mt-2 text-xs text-gray-500">
                        <div className="flex justify-between mb-1">
                          <span>Type: <span className="font-semibold">{assessment.type}</span></span>
                          <span>Status: <span className="font-semibold">{assessment.status}</span></span>
                        </div>
                        <p className="truncate">
                          {assessment.description?.length > 80 
                            ? `${assessment.description.substring(0, 80)}...` 
                            : assessment.description || 'No description'}
                        </p>
                      </div>
                    )}
                  </li>
                ))
              ) : (
                <li className="px-4 py-4 text-sm text-gray-500">
                  No assessments found
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Right column - Selected assessment details */}
        <div className="md:col-span-2 bg-white rounded-lg shadow">
          {selectedAssessment ? (
            <div>
              <div className="px-4 py-5 sm:px-6 bg-gray-50">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {selectedAssessment.title}
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Assessment Details
                </p>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Assessment ID</dt>
                    <dd className="mt-1 text-sm text-gray-900">{selectedAssessment.assessmentId}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Type</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {selectedAssessment.type}
                      </span>
                    </dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        selectedAssessment.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' :
                        selectedAssessment.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedAssessment.status}
                      </span>
                    </dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Start Time</dt>
                    <dd className="mt-1 text-sm text-gray-900">{formatDateTime(selectedAssessment.startTime)}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">End Time</dt>
                    <dd className="mt-1 text-sm text-gray-900">{formatDateTime(selectedAssessment.endTime)}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Description</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {selectedAssessment.description || 'No description available.'}
                    </dd>
                  </div>
                  
                  {selectedAssessment.categories && selectedAssessment.categories.length > 0 && (
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">
                        Categories ({selectedAssessment.categories.length})
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                          {selectedAssessment.categories.map(category => (
                            <li key={category.assessmentCategoryId} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                              <div className="w-0 flex-1 flex items-center">
                                <span className="ml-2 flex-1 w-0 truncate">{category.categoryName}</span>
                              </div>
                              <div className="ml-4 flex-shrink-0">
                                <span className="font-medium text-xs">
                                  {category.subCategories?.length || 0} subcategories
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
                  onClick={() => setSelectedAssessment(null)}
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
              <h3 className="mt-2 text-sm font-medium text-gray-900">No assessment selected</h3>
              <p className="mt-1 text-sm text-gray-500">
                Select an assessment from the list to view its details.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Assessments;
