package edu.cit.futureu.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import edu.cit.futureu.entity.AccreditationEntity;
import edu.cit.futureu.entity.SchoolProgramEntity;

@Repository
public interface AccreditationRepository extends JpaRepository<AccreditationEntity, Integer> {
    // Find accreditations by schoolProgram
    List<AccreditationEntity> findBySchoolProgram(SchoolProgramEntity schoolProgram);
    
    // Find accreditations by title
    List<AccreditationEntity> findByTitleContainingIgnoreCase(String title);
    
    // Find accreditations by recognition status
    List<AccreditationEntity> findByRecognitionStatus(String recognitionStatus);
    
    // Find accreditations by accrediting body
    List<AccreditationEntity> findByAccreditingBody(String accreditingBody);
    
    // Find accreditations by accreditation level
    List<AccreditationEntity> findByAccreditationLevel(String accreditationLevel);
}