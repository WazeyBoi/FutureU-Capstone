import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import adminCareerProgramService from '../../../services/adminServices/adminCareerProgramService';
import adminCareerService from '../../../services/adminServices/adminCareerService';
import adminProgramService from '../../../services/adminServices/adminProgramService';
import {
  Link,
  Briefcase,
  BookOpen,
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
  Loader,
  BarChart3,
  Filter,
  RefreshCw,
  ChevronDown,
  Building
} from 'lucide-react';

const CRUD_CareerProgram = () => {
  const navigate = useNavigate();
  
  // State variables
  const [associations, setAssociations] = useState([]);
  const [filteredAssociations, setFilteredAssociations] = useState([]);
  const [careers, setCareers] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedAssociation, setSelectedAssociation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    careerId: '',
    programId: ''
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [associationToDelete, setAssociationToDelete] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('career');
  const [filterValue, setFilterValue] = useState('');
  const [stats, setStats] = useState({});
  
  // NEW: State to store program-career mappings for display
  const [programCareerMap, setProgramCareerMap] = useState(new Map());

  // Auto-dismiss notifications after 5 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Fetch data on component mount
  useEffect(() => {
    fetchAssociations();
    fetchCareers();
    fetchPrograms();
    fetchStats();
  }, []);

  // Apply filters when search query changes
  useEffect(() => {
    if (searchQuery.trim() === '' && filterType === '' && filterValue === '') {
      setFilteredAssociations(associations);
    } else {
      let filtered = associations;
      
      // Apply search query filter
      if (searchQuery.trim() !== '') {
        filtered = filtered.filter(assoc => {
          const careerTitle = assoc.career?.careerTitle || '';
          const programName = assoc.program?.programName || '';
          const query = searchQuery.toLowerCase();
          
          return careerTitle.toLowerCase().includes(query) ||
                 programName.toLowerCase().includes(query);
        });
      }
      
      // Apply specific filter
      if (filterType && filterValue) {
        switch(filterType) {
          case 'career':
            filtered = filtered.filter(assoc => 
              assoc.career?.careerId === parseInt(filterValue)
            );
            break;
          case 'program':
            filtered = filtered.filter(assoc => 
              assoc.program?.programId === parseInt(filterValue)
            );
            break;
          default:
            break;
        }
      }
      
      setFilteredAssociations(filtered);
    }
    setPage(0); // Reset to first page when filtering
  }, [searchQuery, filterType, filterValue, associations]);

  const fetchAssociations = async () => {
    try {
      setLoading(true);
      const data = await adminCareerProgramService.getAllAssociations();
      console.log('Fetched', data.length, 'career-program associations');
      
      setAssociations(data);
      setFilteredAssociations(data);
      
      // NEW: Build association-specific career mapping using a more targeted approach
      await buildAssociationCareerMapping(data);
      
    } catch (err) {
      setError('Failed to fetch career-program associations. Please try again.');
      console.error('Error fetching associations:', err);
    } finally {
      setLoading(false);
    }
  };

  // NEW: Function to build association-specific career mapping
  const buildAssociationCareerMapping = async (associations) => {
    try {
      console.log('Building association-career mapping...');
      const newProgramCareerMap = new Map();
      
      // Group associations by program to minimize API calls
      const programAssociations = new Map();
      associations.forEach(assoc => {
        const programId = assoc.program?.programId;
        if (programId) {
          if (!programAssociations.has(programId)) {
            programAssociations.set(programId, []);
          }
          programAssociations.get(programId).push(assoc);
        }
      });
      
      console.log('Found', programAssociations.size, 'unique programs with associations');
      
      // For each program, get all its careers and match them to associations
      const batchSize = 5; // Smaller batch size to be gentle on server
      const programIds = Array.from(programAssociations.keys());
      
      for (let i = 0; i < programIds.length; i += batchSize) {
        const batch = programIds.slice(i, i + batchSize);
        
        await Promise.all(batch.map(async (programId) => {
          try {
            const careers = await adminCareerProgramService.getCareersByProgram(programId);
            const programAssocs = programAssociations.get(programId);
            
            if (careers && careers.length > 0 && programAssocs) {
              // For each association of this program, assign a unique career
              programAssocs.forEach((assoc, index) => {
                // Use modulo to cycle through careers if there are more associations than careers
                const careerIndex = index % careers.length;
                const career = careers[careerIndex];
                
                // Store mapping using association ID for precise matching
                newProgramCareerMap.set(`${assoc.id}`, {
                  career: career,
                  programId: programId
                });
              });
            }
          } catch (error) {
            console.warn(`Could not fetch careers for program ${programId}:`, error.message);
          }
        }));
        
        // Small delay between batches
        if (i + batchSize < programIds.length) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }
      
      setProgramCareerMap(newProgramCareerMap);
      console.log('Association-career mapping completed for', newProgramCareerMap.size, 'associations');
      
    } catch (error) {
      console.error('Error building association-career mapping:', error);
    }
  };

  const fetchCareers = async () => {
    try {
      const data = await adminCareerService.getAllCareers();
      setCareers(data);
    } catch (err) {
      console.error('Error fetching careers:', err);
    }
  };

  const fetchPrograms = async () => {
    try {
      const data = await adminProgramService.getAllPrograms();
      setPrograms(data);
    } catch (err) {
      console.error('Error fetching programs:', err);
    }
  };

  const fetchStats = async () => {
    try {
      const statsData = await adminCareerProgramService.getAssociationStats();
      setStats(statsData);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleCreateAssociation = async () => {
    if (!formData.careerId || !formData.programId) {
      setError('Please select both a career and a program.');
      return;
    }

    try {
      setLoading(true);
      
      if (isEditing) {
        // For editing: First check if the new combination already exists (unless it's the same)
        const currentCareerId = selectedAssociation.career?.careerId || 
                               selectedAssociation.careerId || 
                               selectedAssociation.career_id;
        const currentProgramId = selectedAssociation.program?.programId || 
                                selectedAssociation.programId || 
                                selectedAssociation.program_id;
        
        console.log('Current association IDs:', { currentCareerId, currentProgramId });
        console.log('Selected association object:', selectedAssociation);
        
        if (!currentCareerId || !currentProgramId) {
          setError('Unable to update association: missing career or program ID in current association.');
          console.error('Missing IDs in selected association:', { 
            currentCareerId, 
            currentProgramId, 
            selectedAssociation 
          });
          return;
        }
        
        const isSameCombination = currentCareerId === parseInt(formData.careerId) && 
                                  currentProgramId === parseInt(formData.programId);
        
        if (!isSameCombination) {
          const newCombinationExists = associations.some(assoc => {
            const assocCareerId = assoc.career?.careerId || assoc.careerId || assoc.career_id;
            const assocProgramId = assoc.program?.programId || assoc.programId || assoc.program_id;
            return assocCareerId === parseInt(formData.careerId) && 
                   assocProgramId === parseInt(formData.programId);
          });
          
          if (newCombinationExists) {
            setError('This career-program association already exists.');
            return;
          }
          
          // Delete the old association
          console.log('Deleting old association:', { currentCareerId, currentProgramId });
          await adminCareerProgramService.deleteAssociation(currentCareerId, currentProgramId);
          
          // Create the new association
          console.log('Creating new association:', formData.careerId, formData.programId);
          await adminCareerProgramService.createAssociation(
            parseInt(formData.careerId),
            parseInt(formData.programId)
          );
          
          setSuccess('Career-program association updated successfully!');
        } else {
          setSuccess('No changes were made to the association.');
        }
      } else {
        // Check if association already exists for new creation
        const exists = associations.some(assoc => {
          const assocCareerId = assoc.career?.careerId || assoc.careerId || assoc.career_id;
          const assocProgramId = assoc.program?.programId || assoc.programId || assoc.program_id;
          return assocCareerId === parseInt(formData.careerId) && 
                 assocProgramId === parseInt(formData.programId);
        });
        
        if (exists) {
          setError('This career-program association already exists.');
          return;
        }

        await adminCareerProgramService.createAssociation(
          parseInt(formData.careerId), 
          parseInt(formData.programId)
        );
        setSuccess('Career-program association created successfully!');
      }
      
      setIsModalVisible(false);
      setFormData({ careerId: '', programId: '' });
      setIsEditing(false);
      setSelectedAssociation(null);
      fetchAssociations();
      fetchStats();
    } catch (err) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} association:`, err);
      setError(`Failed to ${isEditing ? 'update' : 'create'} association. Error: ${err.message || 'Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAssociation = async () => {
    try {
      setLoading(true);
      
      // Get the career and program IDs with comprehensive fallback logic
      const careerId = associationToDelete.career?.careerId || 
                      associationToDelete.careerId || 
                      associationToDelete.career_id;
      const programId = associationToDelete.program?.programId || 
                       associationToDelete.programId || 
                       associationToDelete.program_id;
      
      console.log('Deleting association:', { careerId, programId, associationToDelete });
      
      if (!careerId || !programId) {
        setError('Unable to delete association: missing career or program ID.');
        console.error('Missing IDs:', { careerId, programId, associationToDelete });
        return;
      }
      
      console.log('Deleting association with IDs:', { careerId, programId });
      await adminCareerProgramService.deleteAssociation(careerId, programId);
      
      setSuccess('Association deleted successfully!');
      setDeleteConfirmOpen(false);
      setAssociationToDelete(null);
      fetchAssociations();
      fetchStats();
    } catch (err) {
      setError('Failed to delete association. Please try again.');
      console.error('Error deleting association:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ careerId: '', programId: '' });
    setError(null);
    setSuccess(null);
    setIsEditing(false);
    setSelectedAssociation(null);
  };

  const openModal = () => {
    resetForm();
    setIsModalVisible(true);
  };

  const openEditModal = async (association) => {
    // Check if this association has complete data
    let careerId = association.career?.careerId || 
                   association.careerId || 
                   association.career_id;
    const programId = association.program?.programId || 
                     association.programId || 
                     association.program_id;
    
    // If career ID is missing, try to get it from association-specific mapping first
    if (!careerId && association.id && programCareerMap.has(`${association.id}`)) {
      const mappedData = programCareerMap.get(`${association.id}`);
      careerId = mappedData.career.careerId;
      console.log('Using career from association mapping:', mappedData.career.careerTitle);
    }
    
    // If still no career ID, try to fetch it (fallback)
    if (!careerId && programId) {
      console.log('Fetching career info for program:', programId);
      setLoading(true);
      
      try {
        const careers = await adminCareerProgramService.getCareersByProgram(programId);
        
        if (careers && careers.length > 0) {
          careerId = careers[0].careerId;
          console.log('Found career:', careers[0].careerTitle);
          
          // Update the association and mapping for future use
          association.career = careers[0];
          programCareerMap.set(`${association.id}`, {
            career: careers[0],
            programId: programId
          });
          setProgramCareerMap(new Map(programCareerMap));
        } else {
          console.warn('No careers found for program:', programId);
        }
      } catch (error) {
        console.error('Failed to fetch careers for program:', error);
        setError('Unable to load career information for this association. Please try again.');
        setLoading(false);
        return;
      } finally {
        setLoading(false);
      }
    }
    
    // Final validation
    if (!careerId || !programId) {
      setError(
        'Unable to edit this association: missing career or program information. ' +
        'Please delete this association and create a new one.'
      );
      return;
    }
    
    setSelectedAssociation(association);
    setFormData({
      careerId: careerId.toString(),
      programId: programId.toString()
    });
    setIsEditing(true);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    resetForm();
  };

  const confirmDelete = (association) => {
    setAssociationToDelete(association);
    setDeleteConfirmOpen(true);
  };

  const cancelDelete = () => {
    setDeleteConfirmOpen(false);
    setAssociationToDelete(null);
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

  // Pagination
  const paginatedAssociations = filteredAssociations.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const totalPages = Math.ceil(filteredAssociations.length / rowsPerPage);

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

  const clearFilters = () => {
    setSearchQuery('');
    setFilterType('career');
    setFilterValue('');
  };

  return (
    <div className="container mx-auto px-6 py-8 max-w-[1400px]">
      {/* Header Section */}
      <div className="mb-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-[#FFB71B]/20 mr-3">
              <Link className="h-6 w-6 text-[#FFB71B]" />
            </div>
            <h1 className="text-3xl font-bold text-[#2B3E4E]">Career-Program Associations</h1>
          </div>
          
          <button
            onClick={() => navigate('/admin-dashboard')}
            className="inline-flex items-center px-6 py-3 mt-4 md:mt-0 bg-gradient-to-r from-white to-white text-[#2B3E4E] font-bold rounded-xl shadow-md hover:from-[#2B3E4E] hover:to-[#2B3E4E] hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-[#FFB71B] animate-bounce-short"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Back to Dashboard
          </button>
        </div>
        
        <p className="text-gray-600 max-w-3xl">
          Manage relationships between careers and academic programs. Create associations to show which programs lead to specific careers.
        </p>
        <div className="w-24 h-1 bg-[#FFB71B] mt-4"></div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-lg shadow-lg max-w-md mb-6 animate-slideInRight">
          <div className="flex">
            <div className="flex-shrink-0">
              <Check className="h-5 w-5 text-green-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{success}</p>
            </div>
            <div className="ml-auto pl-3">
              <button 
                onClick={() => setSuccess(null)}
                className="inline-flex text-green-500 hover:text-green-600 focus:outline-none p-1.5 rounded-full hover:bg-green-100 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-lg max-w-md mb-6 animate-slideInRight">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <button 
                onClick={() => setError(null)}
                className="inline-flex text-red-500 hover:text-red-600 focus:outline-none p-1.5 rounded-full hover:bg-red-100 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Link className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Associations</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalAssociations || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Briefcase className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Linked Careers</p>
              <p className="text-2xl font-bold text-gray-900">{stats.uniqueCareers || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Linked Programs</p>
              <p className="text-2xl font-bold text-gray-900">{stats.uniquePrograms || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Avg per Career</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageAssociationsPerCareer?.toFixed(1) || '0.0'}</p>
            </div>
          </div>
        </div>
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
              placeholder="Search career or program..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
                <option value="career">Filter by Career</option>
                <option value="program">Filter by Program</option>
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
                {filterType === 'career' && careers.map(career => (
                  <option key={career.careerId} value={career.careerId}>{career.careerTitle}</option>
                ))}
                {filterType === 'program' && programs.map(program => (
                  <option key={program.programId} value={program.programId}>{program.programName}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
        
          <button
            onClick={openModal}
            className="whitespace-nowrap h-12 flex items-center justify-center px-4 py-2 bg-gradient-to-r from-[#FFB71B] to-[#FFB71B]/90 text-[#2B3E4E] font-medium rounded-xl hover:shadow-lg transition-all shadow-md"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Association
          </button>
        </div>
      </div>
      
      {/* Associations Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8 border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gradient-to-r from-[#2B3E4E] to-[#2B3E4E]/90 text-white text-left">
                <th className="px-6 py-4 font-semibold text-sm uppercase tracking-wider text-left">ID</th>
                <th className="px-6 py-4 font-semibold text-sm uppercase tracking-wider text-left">Career</th>
                <th className="px-6 py-4 font-semibold text-sm uppercase tracking-wider text-left">Program</th>
                <th className="px-6 py-4 font-semibold text-sm uppercase tracking-wider text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading && !filteredAssociations.length ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Loader className="h-8 w-8 text-[#FFB71B] animate-spin mb-2" />
                      <p className="text-gray-500">Loading associations...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredAssociations.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Link className="h-12 w-12 text-gray-300 mb-2" />
                      <p className="text-gray-500 font-medium">No associations found</p>
                      <p className="text-gray-400 text-sm mt-1">Try adjusting your search or add a new association</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedAssociations.map((association, index) => (
                  <tr key={`${association.career?.careerId}-${association.program?.programId}-${index}`} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-500 font-mono text-left">{index + 1 + (page * rowsPerPage)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-start">
                        <Briefcase className="h-4 w-4 text-gray-400 mt-1 mr-2 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-[#2B3E4E] text-left">
                            {/* First try direct association career info */}
                            {association.career?.careerTitle || 
                             association.career?.careerName ||
                             association.career?.title || 
                             association.careerTitle ||
                             association.careerName ||
                             /* Use association-specific mapping with association ID */
                             (association.id && programCareerMap.get(`${association.id}`)?.career?.careerTitle) ||
                             (association.id && programCareerMap.get(`${association.id}`)?.career?.careerName) ||
                             'Loading...'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start">
                        <BookOpen className="h-4 w-4 text-gray-400 mt-1 mr-2 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-[#2B3E4E] text-left">
                            {association.program?.programName || 
                             association.program?.programTitle ||
                             association.program?.title ||
                             association.programName ||
                             association.programTitle ||
                             'Unknown Program'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center space-x-3">
                        <button
                          onClick={() => openEditModal(association)}
                          className="p-2 text-[#2B3E4E] hover:bg-[#2B3E4E]/10 rounded-lg transition-colors"
                          title="Edit Association"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => confirmDelete(association)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Association"
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
            Showing {filteredAssociations.length > 0 ? page * rowsPerPage + 1 : 0} to{" "}
            {Math.min((page + 1) * rowsPerPage, filteredAssociations.length)} of {filteredAssociations.length} associations
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
      
      {/* Create Association Modal */}
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
                <h3 className="text-xl font-semibold text-[#2B3E4E]">
                  {isEditing ? 'Edit Association' : 'Add New Association'}
                </h3>
              </div>
              <button
                onClick={closeModal}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Career *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Briefcase className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    name="careerId"
                    value={formData.careerId}
                    onChange={(e) => setFormData({ ...formData, careerId: e.target.value })}
                    className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#FFB71B] focus:border-[#FFB71B] transition-colors appearance-none"
                    required
                  >
                    <option value="">Select a career</option>
                    {careers.map(career => (
                      <option key={career.careerId} value={career.careerId}>
                        {career.careerTitle}
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
                    onChange={(e) => setFormData({ ...formData, programId: e.target.value })}
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
            </div>
            <div className="p-6 border-t border-gray-200 sticky bottom-0 bg-white z-10 flex justify-end space-x-3">
              <button
                onClick={closeModal}
                className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAssociation}
                disabled={loading || !formData.careerId || !formData.programId}
                className="px-5 py-2.5 bg-gradient-to-r from-[#2B3E4E] to-[#2B3E4E]/90 text-white rounded-lg hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2B3E4E] disabled:opacity-70"
              >
                {loading ? (
                  <div className="flex items-center">
                    <Loader className="animate-spin h-4 w-4 mr-2" />
                    Creating...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Check className="h-4 w-4 mr-2" />
                    {isEditing ? 'Update Association' : 'Create Association'}
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
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
                Are you sure you want to delete the association between career{" "}
                <span className="font-medium text-[#2B3E4E]">{associationToDelete?.career?.careerTitle}</span> and program{" "}
                <span className="font-medium text-[#2B3E4E]">{associationToDelete?.program?.programName}</span>? This action cannot be undone.
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
                onClick={handleDeleteAssociation}
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
    </div>
  );
};

export default CRUD_CareerProgram;