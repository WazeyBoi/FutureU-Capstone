import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import apiClient from '../../services/api';
import authService from '../../services/authService';
import schoolProgramService from '../../services/schoolProgramService';

export const useAcademicExplorerData = () => {
  const [programs, setPrograms] = useState([]);
  const [schools, setSchools] = useState([]);
  const [filteredSchools, setFilteredSchools] = useState([]);
  const [schoolProgramCounts, setSchoolProgramCounts] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const location = useLocation();
  const navigate = useNavigate();

  // Check authentication
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login', { state: { from: location.pathname } });
    }
  }, [navigate, location.pathname]);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [programsResponse, schoolsResponse] = await Promise.all([
          apiClient.get('/program/getAllPrograms'),
          apiClient.get('/school/getAllSchools')
        ]);
        
        if (Array.isArray(programsResponse.data)) {
          const transformedPrograms = programsResponse.data.map((program) => ({
            programId: program.programId,
            programName: program.programName,
          }));
          setPrograms(transformedPrograms);
        } else {
          setError('Failed to load programs. Please try again later.');
        }
        
        if (Array.isArray(schoolsResponse.data)) {
          setSchools(schoolsResponse.data);
          try {
            const schoolProgramResponse = await apiClient.get('/schoolprogram/getAllSchoolPrograms');
            if (Array.isArray(schoolProgramResponse.data)) {
              const counts = {};
              schoolProgramResponse.data.forEach(schoolProgram => {
                const schoolId = schoolProgram.school.schoolId;
                if (!counts[schoolId]) {
                  counts[schoolId] = 1;
                } else {
                  counts[schoolId]++;
                }
              });
              setSchoolProgramCounts(counts);
            }
          } catch (error) {
            // ignore school program counts error
          }
        } else {
          setError('Failed to load schools. Please try again later.');
        }
      } catch (error) {
        if (error.response?.status === 401) {
          authService.signout();
          navigate('/login', { state: { from: location.pathname } });
        }
        setError('Failed to load data. Please check your connection or login status.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate, location.pathname]);

  return {
    programs,
    schools,
    filteredSchools,
    setFilteredSchools,
    schoolProgramCounts,
    error,
    setError,
    loading,
    setLoading
  };
};

export const useProgramSelection = (programs, schools, navigate, location) => {
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [selectedProgramDetails, setSelectedProgramDetails] = useState(null);
  const [loadingProgramDetails, setLoadingProgramDetails] = useState(false);

  // Handle URL parameters for program selection
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const programId = params.get("programId");
    if (programId) {
      setSelectedProgram(Number(programId));
    }
  }, [location.search]);

  // Fetch program details when selected
  useEffect(() => {
    if (selectedProgram && !selectedProgramDetails) {
      setLoadingProgramDetails(true);
      apiClient.get(`/program/getProgram/${selectedProgram}`)
        .then(response => {
          setSelectedProgramDetails(response.data);
        })
        .catch(error => {
          const programName = programs.find(p => p.programId === selectedProgram)?.programName;
          if (programName) {
            setSelectedProgramDetails({ programId: selectedProgram, programName });
          }
        })
        .finally(() => {
          setLoadingProgramDetails(false);
        });
    }
  }, [selectedProgram, selectedProgramDetails, programs]);

  return {
    selectedProgram,
    setSelectedProgram,
    selectedProgramDetails,
    setSelectedProgramDetails,
    loadingProgramDetails,
    setLoadingProgramDetails
  };
};

export const useSchoolSearch = (schools, navigate, location) => {
  const [searchedSchool, setSearchedSchool] = useState(null);
  const [schoolPrograms, setSchoolPrograms] = useState([]);
  const [isSearchingSchool, setIsSearchingSchool] = useState(false);
  const [showSchoolSearchResults, setShowSchoolSearchResults] = useState(false);

  const searchSchool = async (searchTerm) => {
    if (!searchTerm.trim()) return;
    
    try {
      setIsSearchingSchool(true);
      // Don't set showSchoolSearchResults to false initially to prevent flash of "No schools found"
      
      const matchingSchool = schools.find(school =>
        school.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      if (matchingSchool) {
        const schoolProgramsResponse = await schoolProgramService.getSchoolProgramsBySchool(matchingSchool.schoolId);
        if (Array.isArray(schoolProgramsResponse)) {
          // Debug: Log raw API response to verify department field
          console.log('🔍 Raw API Response:', schoolProgramsResponse.slice(0, 3));
          
          // Simply map the API response - department field comes directly from SchoolProgramEntity
          const programsData = schoolProgramsResponse.map((sp) => ({
            ...sp.program,
            schoolProgramURL: sp.schoolProgramURL,
            schoolProgramURLType: sp.schoolProgramURLType,
            department: sp.department, // Department from school_program table
          }));
          
          // Debug: Log mapped data to verify department is passed through
          console.log('✅ Mapped Programs with Departments:', programsData.slice(0, 3));
          
          setSchoolPrograms(programsData);
          setSearchedSchool(matchingSchool);
          setShowSchoolSearchResults(true);
          return { success: true, school: matchingSchool };
        } else {
          setShowSchoolSearchResults(false);
          return { success: false, error: `No programs found for "${searchTerm}". Please try another school name.` };
        }
      } else {
        setShowSchoolSearchResults(false);
        return { success: false, error: `School "${searchTerm}" not found. Please check the spelling and try again.` };
      }
    } catch (error) {
      setShowSchoolSearchResults(false);
      return { success: false, error: "Failed to search for school programs. Please try again later." };
    } finally {
      setIsSearchingSchool(false);
    }
  };

  return {
    searchedSchool,
    setSearchedSchool,
    schoolPrograms,
    setSchoolPrograms,
    isSearchingSchool,
    showSchoolSearchResults,
    setShowSchoolSearchResults,
    searchSchool
  };
};