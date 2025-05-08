package edu.cit.futureu.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import edu.cit.futureu.entity.AssessmentSubCategoryEntity;
import edu.cit.futureu.entity.AssessmentCategoryEntity;

@Repository
public interface AssessmentSubCategoryRepository extends JpaRepository<AssessmentSubCategoryEntity, Integer> {
    List<AssessmentSubCategoryEntity> findByAssessmentCategory(AssessmentCategoryEntity assessmentCategory);
}