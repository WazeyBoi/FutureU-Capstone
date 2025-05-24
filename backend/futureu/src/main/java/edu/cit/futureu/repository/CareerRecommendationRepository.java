package edu.cit.futureu.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

import edu.cit.futureu.entity.CareerRecommendationEntity;
import edu.cit.futureu.entity.AssessmentResultEntity;

@Repository
public interface CareerRecommendationRepository extends JpaRepository<CareerRecommendationEntity, Integer> {
    CareerRecommendationEntity findByAssessmentResult(AssessmentResultEntity assessmentResult);
    List<CareerRecommendationEntity> findAllByAssessmentResult(AssessmentResultEntity assessmentResult);
}