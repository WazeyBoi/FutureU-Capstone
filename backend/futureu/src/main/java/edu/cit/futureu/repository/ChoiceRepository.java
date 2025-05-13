package edu.cit.futureu.repository;

import edu.cit.futureu.entity.ChoiceEntity;
import edu.cit.futureu.entity.QuestionEntity;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChoiceRepository extends JpaRepository<ChoiceEntity, Integer> {
    
    // Find choices by question
    List<ChoiceEntity> findByQuestion(QuestionEntity question);
    
    // Find correct choices for a question
    List<ChoiceEntity> findByQuestionAndIsCorrectTrue(QuestionEntity question);
    
    // Find by choice text containing
    List<ChoiceEntity> findByChoiceTextContainingIgnoreCase(String text);
}
