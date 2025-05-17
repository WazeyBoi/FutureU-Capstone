package edu.cit.futureu.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import edu.cit.futureu.entity.AssessmentResultEntity;
import edu.cit.futureu.entity.UserAssessmentEntity;

@Repository
public interface AssessmentResultRepository extends JpaRepository<AssessmentResultEntity, Integer> {
    Optional<AssessmentResultEntity> findByUserAssessment(UserAssessmentEntity userAssessment);
}