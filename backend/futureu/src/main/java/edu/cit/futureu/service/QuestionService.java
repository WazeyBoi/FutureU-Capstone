package edu.cit.futureu.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import edu.cit.futureu.entity.QuestionEntity;
import edu.cit.futureu.entity.AssessmentCategoryEntity;
import edu.cit.futureu.repository.QuestionRepository;

@Service
public class QuestionService {

    @Autowired
    private QuestionRepository questionRepository;

    public QuestionEntity createQuestion(QuestionEntity question) {
        return questionRepository.save(question);
    }

    public List<QuestionEntity> getAllQuestions() {
        return questionRepository.findAll();
    }

    public Optional<QuestionEntity> getQuestionById(int id) {
        return questionRepository.findById(id);
    }

    public List<QuestionEntity> getQuestionsByAssessmentCategory(AssessmentCategoryEntity assessmentCategory) {
        return questionRepository.findByAssessmentCategory(assessmentCategory);
    }

    public QuestionEntity updateQuestion(QuestionEntity question) {
        if (questionRepository.existsById(question.getQuestionId())) {
            return questionRepository.save(question);
        }
        return null;
    }

    public boolean deleteQuestion(int id) {
        if (questionRepository.existsById(id)) {
            questionRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
