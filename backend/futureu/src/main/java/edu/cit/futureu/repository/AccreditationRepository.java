
package edu.cit.futureu.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import edu.cit.futureu.entity.AccreditationEntity;
import edu.cit.futureu.entity.SchoolEntity;

@Repository
public interface AccreditationRepository extends JpaRepository<AccreditationEntity, Integer> {
    // Find accreditations by school
    List<AccreditationEntity> findBySchool(SchoolEntity school);
    
    // Custom query to find accreditation by its ID
    @Query("SELECT a FROM AccreditationEntity a WHERE a.accredId = :accredId")
    Optional<AccreditationEntity> findByAccredId(@Param("accredId") Integer accredId);
    
    // Find accreditations by title
    List<AccreditationEntity> findByTitleContainingIgnoreCase(String title);
    
    // Find accreditations by recognition status
    List<AccreditationEntity> findByRecognitionStatus(String recognitionStatus);
    
    // Find accreditations by accrediting body
    List<AccreditationEntity> findByAccreditingBody(String accreditingBody);
    
    // Find accreditations by accreditation level
    List<AccreditationEntity> findByAccreditationLevel(String accreditationLevel);
}