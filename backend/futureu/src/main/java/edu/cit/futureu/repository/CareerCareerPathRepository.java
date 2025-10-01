package edu.cit.futureu.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import edu.cit.futureu.entity.CareerCareerPathEntity;
import edu.cit.futureu.entity.CareerEntity;
import edu.cit.futureu.entity.CareerPathEntity;

@Repository
public interface CareerCareerPathRepository extends JpaRepository<CareerCareerPathEntity, Integer> {
    
    // Find all associations by career
    List<CareerCareerPathEntity> findByCareer(CareerEntity career);
    
    // Find all associations by career path
    List<CareerCareerPathEntity> findByCareerPath(CareerPathEntity careerPath);
    
    // Find specific association between career and career path
    Optional<CareerCareerPathEntity> findByCareerAndCareerPath(CareerEntity career, CareerPathEntity careerPath);
    
    // Check if association exists
    boolean existsByCareerAndCareerPath(CareerEntity career, CareerPathEntity careerPath);
    
    // Delete by career and career path
    void deleteByCareerAndCareerPath(CareerEntity career, CareerPathEntity careerPath);
    
    // Find associations by career ID
    List<CareerCareerPathEntity> findByCareer_CareerId(int careerId);
    
    // Find associations by career path ID
    List<CareerCareerPathEntity> findByCareerPath_CareerPathId(int careerPathId);
}