package edu.cit.futureu.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

import edu.cit.futureu.entity.RecommendationEntity;
import edu.cit.futureu.entity.AssessmentResultEntity;

@Repository
public interface RecommendationRepository extends JpaRepository<RecommendationEntity, Integer> {
    RecommendationEntity findByAssessmentResult(AssessmentResultEntity assessmentResult);
    List<RecommendationEntity> findAllByAssessmentResult(AssessmentResultEntity assessmentResult);
}