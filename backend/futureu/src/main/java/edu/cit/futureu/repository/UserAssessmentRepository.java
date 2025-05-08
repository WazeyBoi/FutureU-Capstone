package edu.cit.futureu.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import edu.cit.futureu.entity.UserAssessmentEntity;
import edu.cit.futureu.entity.UserEntity;
import edu.cit.futureu.entity.AssessmentEntity;

@Repository
public interface UserAssessmentRepository extends JpaRepository<UserAssessmentEntity, Integer> {
    List<UserAssessmentEntity> findByUser(UserEntity user);
    List<UserAssessmentEntity> findByAssessment(AssessmentEntity assessment);
}
