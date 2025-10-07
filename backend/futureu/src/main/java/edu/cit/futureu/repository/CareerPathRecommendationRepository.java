package edu.cit.futureu.repository;

import edu.cit.futureu.entity.CareerPathRecommendationEntity;
import edu.cit.futureu.entity.AssessmentResultEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CareerPathRecommendationRepository extends JpaRepository<CareerPathRecommendationEntity, Integer> {
    
    List<CareerPathRecommendationEntity> findByAssessmentResult(AssessmentResultEntity assessmentResult);
    
    List<CareerPathRecommendationEntity> findByAssessmentResultOrderByMatchPercentageDesc(AssessmentResultEntity assessmentResult);
    
    Optional<CareerPathRecommendationEntity> findByAssessmentResultAndCareerPath_CareerPathId(
        AssessmentResultEntity assessmentResult, int careerPathId);
    
    void deleteByAssessmentResult(AssessmentResultEntity assessmentResult);
}