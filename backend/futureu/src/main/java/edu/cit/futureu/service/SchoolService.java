package edu.cit.futureu.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import edu.cit.futureu.entity.SchoolEntity;
import edu.cit.futureu.repository.SchoolRepository;

@Service
public class SchoolService {

    @Autowired
    private SchoolRepository schoolRepository;
    
    // Create operations
    public SchoolEntity createSchool(SchoolEntity school) {
        return schoolRepository.save(school);
    }
    
    // Read operations
    public List<SchoolEntity> getAllSchools() {
        return schoolRepository.findAll();
    }
    
    public Optional<SchoolEntity> getSchoolById(int id) {
        return schoolRepository.findById(id);
    }
    
    public List<SchoolEntity> searchSchoolsByName(String name) {
        return schoolRepository.findByNameContainingIgnoreCase(name);
    }
    
    public List<SchoolEntity> filterSchoolsByLocation(String location) {
        return schoolRepository.findByLocationContainingIgnoreCase(location);
    }
    
    public List<SchoolEntity> filterSchoolsByType(String type) {
        return schoolRepository.findByType(type);
    }
    
    // Update operations
    public SchoolEntity updateSchool(SchoolEntity school) {
        if (schoolRepository.existsById(school.getSchoolId())) {
            return schoolRepository.save(school);
        }
        return null; // School not found
    }
    
    // Delete operations
    public boolean deleteSchool(int id) {
        if (schoolRepository.existsById(id)) {
            schoolRepository.deleteById(id);
            return true;
        }
        return false; // School not found
    }
}
