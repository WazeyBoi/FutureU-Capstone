package edu.cit.futureu.repository;

import edu.cit.futureu.entity.AssessmentResultEntity;
import edu.cit.futureu.entity.UserAssessmentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AssessmentResultRepository extends JpaRepository<AssessmentResultEntity, Integer> {
    Optional<AssessmentResultEntity> findByUserAssessment(UserAssessmentEntity userAssessment);
}