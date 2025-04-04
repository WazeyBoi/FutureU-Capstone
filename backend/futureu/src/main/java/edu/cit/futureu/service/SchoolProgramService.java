package edu.cit.futureu.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import edu.cit.futureu.entity.AccreditationEntity;
import edu.cit.futureu.entity.ProgramEntity;
import edu.cit.futureu.entity.SchoolEntity;
import edu.cit.futureu.entity.SchoolProgramEntity;
import edu.cit.futureu.repository.SchoolProgramRepository;

@Service
public class SchoolProgramService {
    
    @Autowired
    private SchoolProgramRepository schoolProgramRepository;
    
    // Create operations
    public SchoolProgramEntity createSchoolProgram(SchoolProgramEntity schoolProgram) {
        return schoolProgramRepository.save(schoolProgram);
    }
    
    // Read operations
    public List<SchoolProgramEntity> getAllSchoolPrograms() {
        return schoolProgramRepository.findAll();
    }
    
    public Optional<SchoolProgramEntity> getSchoolProgramById(int id) {
        return schoolProgramRepository.findById(id);
    }
    
    public List<SchoolProgramEntity> getSchoolProgramsBySchool(SchoolEntity school) {
        return schoolProgramRepository.findBySchool(school);
    }
    
    public List<SchoolProgramEntity> getSchoolProgramsByProgram(ProgramEntity program) {
        return schoolProgramRepository.findByProgram(program);
    }
    
    public List<SchoolProgramEntity> getSchoolProgramsByAccreditation(AccreditationEntity accreditation) {
        return schoolProgramRepository.findByAccreditation(accreditation);
    }
    
    public SchoolProgramEntity getSchoolProgramBySchoolAndProgram(SchoolEntity school, ProgramEntity program) {
        return schoolProgramRepository.findBySchoolAndProgram(school, program);
    }
    
    // Update operations
    public SchoolProgramEntity updateSchoolProgram(SchoolProgramEntity schoolProgram) {
        if (schoolProgramRepository.existsById(schoolProgram.getSchoolProgramId())) {
            return schoolProgramRepository.save(schoolProgram);
        }
        return null; // SchoolProgram not found
    }
    
    // Delete operations
    public boolean deleteSchoolProgram(int id) {
        if (schoolProgramRepository.existsById(id)) {
            schoolProgramRepository.deleteById(id);
            return true;
        }
        return false; // SchoolProgram not found
    }
}
