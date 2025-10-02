package edu.cit.futureu.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import edu.cit.futureu.entity.CareerEntity;
import edu.cit.futureu.entity.CareerPathEntity;

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
    
    // Find careers by career path using the junction table
    @Query("SELECT c FROM CareerEntity c JOIN c.careerCareerPaths ccp WHERE ccp.careerPath = :careerPath")
    List<CareerEntity> findByCareerPath(@Param("careerPath") CareerPathEntity careerPath);
}
