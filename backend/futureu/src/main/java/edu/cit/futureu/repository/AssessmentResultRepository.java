package edu.cit.futureu.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import edu.cit.futureu.entity.AssessmentResultEntity;
import edu.cit.futureu.entity.UserAssessmentEntity;

@Repository
public interface AssessmentResultRepository extends JpaRepository<AssessmentResultEntity, Integer> {
    List<AssessmentResultEntity> findByUserAssessment(UserAssessmentEntity userAssessment);
}