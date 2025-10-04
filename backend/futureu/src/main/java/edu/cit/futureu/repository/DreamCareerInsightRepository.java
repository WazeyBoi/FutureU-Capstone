package edu.cit.futureu.repository;

import edu.cit.futureu.entity.DreamCareerInsightEntity;
import edu.cit.futureu.entity.AssessmentResultEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface DreamCareerInsightRepository extends JpaRepository<DreamCareerInsightEntity, Integer> {
    
    Optional<DreamCareerInsightEntity> findByAssessmentResult(AssessmentResultEntity assessmentResult);
    
    void deleteByAssessmentResult(AssessmentResultEntity assessmentResult);
}