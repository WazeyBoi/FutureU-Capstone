package edu.cit.futureu.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import edu.cit.futureu.entity.AssessmentSubCategoryEntity;
import edu.cit.futureu.entity.AssessmentCategoryEntity;
import edu.cit.futureu.repository.AssessmentSubCategoryRepository;

@Service
public class AssessmentSubCategoryService {

    @Autowired
    private AssessmentSubCategoryRepository assessmentSubCategoryRepository;

    public AssessmentSubCategoryEntity createAssessmentSubCategory(AssessmentSubCategoryEntity subCategory) {
        return assessmentSubCategoryRepository.save(subCategory);
    }

    public List<AssessmentSubCategoryEntity> getAllAssessmentSubCategories() {
        return assessmentSubCategoryRepository.findAll();
    }

    public Optional<AssessmentSubCategoryEntity> getAssessmentSubCategoryById(int id) {
        return assessmentSubCategoryRepository.findById(id);
    }

    public List<AssessmentSubCategoryEntity> getAssessmentSubCategoriesByCategory(AssessmentCategoryEntity category) {
        return assessmentSubCategoryRepository.findByAssessmentCategory(category);
    }

    public AssessmentSubCategoryEntity updateAssessmentSubCategory(AssessmentSubCategoryEntity subCategory) {
        if (assessmentSubCategoryRepository.existsById(subCategory.getAssessmentSubCategoryId())) {
            return assessmentSubCategoryRepository.save(subCategory);
        }
        return null;
    }

    public boolean deleteAssessmentSubCategory(int id) {
        if (assessmentSubCategoryRepository.existsById(id)) {
            assessmentSubCategoryRepository.deleteById(id);
            return true;
        }
        return false;
    }
}