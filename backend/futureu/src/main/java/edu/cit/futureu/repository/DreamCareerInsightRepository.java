package edu.cit.futureu.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;

import edu.cit.futureu.entity.AssessmentResultEntity;
import edu.cit.futureu.entity.DreamCareerInsightEntity;

@Repository
public interface DreamCareerInsightRepository extends JpaRepository<DreamCareerInsightEntity, Integer> {
    
    Optional<DreamCareerInsightEntity> findByAssessmentResult(AssessmentResultEntity assessmentResult);
    
    @Modifying
    void deleteByAssessmentResult(AssessmentResultEntity assessmentResult);
}