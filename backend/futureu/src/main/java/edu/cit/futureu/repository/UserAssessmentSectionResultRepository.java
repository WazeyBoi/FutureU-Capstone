package edu.cit.futureu.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import edu.cit.futureu.entity.UserAssessmentSectionResultEntity;
import edu.cit.futureu.entity.UserAssessmentEntity;

@Repository
public interface UserAssessmentSectionResultRepository extends JpaRepository<UserAssessmentSectionResultEntity, Integer> {
    List<UserAssessmentSectionResultEntity> findByUserAssessment(UserAssessmentEntity userAssessment);
}
