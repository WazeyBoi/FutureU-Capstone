package edu.cit.futureu.repository;

import edu.cit.futureu.entity.ProgramRecommendationEntity;
import edu.cit.futureu.entity.AssessmentResultEntity;
import edu.cit.futureu.entity.ProgramEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProgramRecommendationRepository extends JpaRepository<ProgramRecommendationEntity, Integer> {
    List<ProgramRecommendationEntity> findByAssessmentResult(AssessmentResultEntity assessmentResult);
    List<ProgramRecommendationEntity> findByProgram(ProgramEntity program);
}
