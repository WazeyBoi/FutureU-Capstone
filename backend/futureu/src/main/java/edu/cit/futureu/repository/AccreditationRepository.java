package edu.cit.futureu.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import edu.cit.futureu.entity.AccreditationEntity;
import edu.cit.futureu.entity.SchoolEntity;

@Repository
public interface AccreditationRepository extends JpaRepository<AccreditationEntity, Integer> {
    // Find accreditations by school
    List<AccreditationEntity> findBySchool(SchoolEntity school);
    
    // Find accreditations by title
    List<AccreditationEntity> findByTitleContainingIgnoreCase(String title);
}