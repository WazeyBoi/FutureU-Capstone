package edu.cit.futureu.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import edu.cit.futureu.entity.AccreditationEntity;
import edu.cit.futureu.entity.ProgramEntity;
import edu.cit.futureu.entity.SchoolEntity;

@Repository
public interface AccreditationRepository extends JpaRepository<AccreditationEntity, Integer> {
    // Find accreditations by school
    List<AccreditationEntity> findBySchool(SchoolEntity school);
    
    // Find accreditations by program
    List<AccreditationEntity> findByProgram(ProgramEntity program);
    
    // Find accreditations by school and program
    List<AccreditationEntity> findBySchoolAndProgram(SchoolEntity school, ProgramEntity program);
    
    // Find accreditations by title
    List<AccreditationEntity> findByTitleContainingIgnoreCase(String title);
    
    // Find accreditations by recognition status
    List<AccreditationEntity> findByRecognitionStatus(String recognitionStatus);
    
    // Find accreditations by accrediting body
    List<AccreditationEntity> findByAccreditingBody(String accreditingBody);
    
    // Find accreditations by accreditation level
    List<AccreditationEntity> findByAccreditationLevel(String accreditationLevel);
}