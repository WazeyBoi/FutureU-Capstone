package edu.cit.futureu.service;

import edu.cit.futureu.entity.QuizSubCategoryCategoryEntity;
import edu.cit.futureu.entity.AssessmentSubCategoryEntity;
import edu.cit.futureu.repository.QuizSubCategoryCategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class QuizSubCategoryCategoryService {

    @Autowired
    private final QuizSubCategoryCategoryRepository quizSubCategoryCategoryRepository;

    public QuizSubCategoryCategoryService(QuizSubCategoryCategoryRepository quizSubCategoryCategoryRepository) {
        this.quizSubCategoryCategoryRepository = quizSubCategoryCategoryRepository;
    }

    public List<QuizSubCategoryCategoryEntity> getAllQuizSubCategories() {
        return quizSubCategoryCategoryRepository.findAll();
    }

    public Optional<QuizSubCategoryCategoryEntity> getQuizSubCategoryById(int id) {
        return quizSubCategoryCategoryRepository.findById(id);
    }

    public List<QuizSubCategoryCategoryEntity> getQuizSubCategoriesByAssessmentSubCategory(AssessmentSubCategoryEntity assessmentSubCategory) {
        return quizSubCategoryCategoryRepository.findByAssesssmentSubCategory(assessmentSubCategory);
    }

    public List<QuizSubCategoryCategoryEntity> searchQuizSubCategoriesByName(String name) {
        return quizSubCategoryCategoryRepository.findByQuizSubCategoryCategoryNameContainingIgnoreCase(name);
    }

    public QuizSubCategoryCategoryEntity saveQuizSubCategory(QuizSubCategoryCategoryEntity quizSubCategoryCategory) {
        return quizSubCategoryCategoryRepository.save(quizSubCategoryCategory);
    }

    public void deleteQuizSubCategory(int id) {
        quizSubCategoryCategoryRepository.deleteById(id);
    }
}
