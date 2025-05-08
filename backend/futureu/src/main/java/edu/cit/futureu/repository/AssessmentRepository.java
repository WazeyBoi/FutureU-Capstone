package edu.cit.futureu.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import edu.cit.futureu.entity.AssessmentEntity;

@Repository
public interface AssessmentRepository extends JpaRepository<AssessmentEntity, Integer> {
    List<AssessmentEntity> findByTitleContainingIgnoreCase(String title);
    List<AssessmentEntity> findByType(String type);
    List<AssessmentEntity> findByStatus(String status);
}