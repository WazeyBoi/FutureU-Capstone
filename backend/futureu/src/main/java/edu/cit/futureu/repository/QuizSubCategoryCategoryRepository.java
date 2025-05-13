package edu.cit.futureu.repository;

import edu.cit.futureu.entity.QuizSubCategoryCategoryEntity;
import edu.cit.futureu.entity.AssessmentSubCategoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizSubCategoryCategoryRepository extends JpaRepository<QuizSubCategoryCategoryEntity, Integer> {
    // Find quiz sub-categories by assessment sub-category
    List<QuizSubCategoryCategoryEntity> findByAssesssmentSubCategory(AssessmentSubCategoryEntity assessmentSubCategory);
    
    // Find by name (useful for searching)
    List<QuizSubCategoryCategoryEntity> findByQuizSubCategoryCategoryNameContainingIgnoreCase(String name);
}
