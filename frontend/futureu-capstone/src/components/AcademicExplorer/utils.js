import { schoolBackgroundMap } from './constants';

// Function to get the school background based on name
export const getSchoolBackground = (schoolName) => {
  if (!schoolName) return null;
  
  const normalizedName = schoolName.toLowerCase();
  
  // Check each key in our map to see if it's in the school name
  for (const [key, background] of Object.entries(schoolBackgroundMap)) {
    if (normalizedName.includes(key.toLowerCase())) {
      return background;
    }
  }
  
  return null;
};

// Animation class generator
export const getAnimationClass = (index) => {
  const baseDelay = 50;
  const delay = index * baseDelay;
  return `animate-fade-in-up animation-delay-${delay}`;
};

// Filter schools utility
export const filterSchools = (schools, filterOptions, searchTerm, selectedProgram) => {
  return schools.filter(school => {
    // If a program is selected, use the schoolNameFilter for filtering by school name
    const matchesSchoolName = selectedProgram
      ? (filterOptions.schoolNameFilter === '' || school.name.toLowerCase().includes(filterOptions.schoolNameFilter.toLowerCase()))
      : (searchTerm === '' || school.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesLocation = filterOptions.locationSearch === '' || (school.location && school.location.toLowerCase().includes(filterOptions.locationSearch.toLowerCase()));
    const matchesSchoolType = filterOptions.schoolType === 'all' ||
      (filterOptions.schoolType === 'public' && school.type?.toLowerCase() === 'public') ||
      (filterOptions.schoolType === 'private' && school.type?.toLowerCase() === 'private');
    return matchesSchoolName && matchesLocation && matchesSchoolType;
  }).sort((a, b) => a.name.localeCompare(b.name));
};

// Filter programs utility
export const filterPrograms = (programs, searchTerm) => {
  return programs
    .filter(program =>
      program.programName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => a.programName.localeCompare(b.name));
};