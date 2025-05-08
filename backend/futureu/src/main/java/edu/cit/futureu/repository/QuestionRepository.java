package edu.cit.futureu.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import edu.cit.futureu.entity.QuestionEntity;
import edu.cit.futureu.entity.AssessmentCategoryEntity;

@Repository
public interface QuestionRepository extends JpaRepository<QuestionEntity, Integer> {
    List<QuestionEntity> findByAssessmentCategory(AssessmentCategoryEntity assessmentCategory);
}
