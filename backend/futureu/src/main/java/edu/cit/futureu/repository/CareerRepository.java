package edu.cit.futureu.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import edu.cit.futureu.entity.CareerEntity;
import edu.cit.futureu.entity.ProgramEntity;

@Repository
public interface CareerRepository extends JpaRepository<CareerEntity, Integer> {
    // Find careers by program
    List<CareerEntity> findByProgram(ProgramEntity program);
    
    // Search careers by title
    List<CareerEntity> findByCareerTitleContainingIgnoreCase(String careerTitle);
    
    // Filter careers by industry
    List<CareerEntity> findByIndustryContainingIgnoreCase(String industry);
    
    // Filter careers by job trend
    List<CareerEntity> findByJobTrendContainingIgnoreCase(String jobTrend);
    
    // Filter careers by salary range
    List<CareerEntity> findBySalaryBetween(double minSalary, double maxSalary);
}
