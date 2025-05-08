package edu.cit.futureu.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import edu.cit.futureu.entity.AssessmentCategoryEntity;
import edu.cit.futureu.repository.AssessmentCategoryRepository;

@Service
public class AssessmentCategoryService {

    @Autowired
    private AssessmentCategoryRepository assessmentCategoryRepository;

    public AssessmentCategoryEntity createAssessmentCategory(AssessmentCategoryEntity category) {
        return assessmentCategoryRepository.save(category);
    }

    public List<AssessmentCategoryEntity> getAllAssessmentCategories() {
        return assessmentCategoryRepository.findAll();
    }

    public Optional<AssessmentCategoryEntity> getAssessmentCategoryById(int id) {
        return assessmentCategoryRepository.findById(id);
    }

    public AssessmentCategoryEntity updateAssessmentCategory(AssessmentCategoryEntity category) {
        if (assessmentCategoryRepository.existsById(category.getAssessmentCategoryId())) {
            return assessmentCategoryRepository.save(category);
        }
        return null;
    }

    public boolean deleteAssessmentCategory(int id) {
        if (assessmentCategoryRepository.existsById(id)) {
            assessmentCategoryRepository.deleteById(id);
            return true;
        }
        return false;
    }
}