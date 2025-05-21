package edu.cit.futureu.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import edu.cit.futureu.entity.CareerEntity;

@Repository
public interface CareerRepository extends JpaRepository<CareerEntity, Integer> {
    // Search careers by title
    List<CareerEntity> findByCareerTitleContainingIgnoreCase(String careerTitle);
    
    // Filter careers by industry
    List<CareerEntity> findByIndustryContainingIgnoreCase(String industry);
    
    // Filter careers by job trend
    List<CareerEntity> findByJobTrendContainingIgnoreCase(String jobTrend);
    
    // Filter careers by salary (string comparison)
    List<CareerEntity> findBySalaryContainingIgnoreCase(String salary);
    
    // Filter careers by description
    List<CareerEntity> findByCareerDescriptionContainingIgnoreCase(String description);
    
    // Removed the findByProgram method that's causing the error
    // This functionality is now handled via the CareerProgramService
}
