package edu.cit.futureu.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import edu.cit.futureu.entity.AssessmentCategoryEntity;

@Repository
public interface AssessmentCategoryRepository extends JpaRepository<AssessmentCategoryEntity, Integer> {
}