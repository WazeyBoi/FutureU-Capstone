package edu.cit.futureu.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import edu.cit.futureu.entity.AssessmentSubCategoryEntity;
import edu.cit.futureu.entity.AssessmentCategoryEntity;
import edu.cit.futureu.service.AssessmentSubCategoryService;
import edu.cit.futureu.service.AssessmentCategoryService;

@RestController
@RequestMapping(method=RequestMethod.GET, path="/api/assessmentsubcategory")
public class AssessmentSubCategoryController {

    @Autowired
    private AssessmentSubCategoryService assessmentSubCategoryService;

    @Autowired
    private AssessmentCategoryService assessmentCategoryService;

    @GetMapping("/test")
    public String test() {
        return "AssessmentSubCategory API is working!";
    }

    @PostMapping("/postAssessmentSubCategory")
    public AssessmentSubCategoryEntity postAssessmentSubCategory(@RequestBody AssessmentSubCategoryEntity subCategory) {
        return assessmentSubCategoryService.createAssessmentSubCategory(subCategory);
    }

    @GetMapping("/getAllAssessmentSubCategories")
    public List<AssessmentSubCategoryEntity> getAllAssessmentSubCategories() {
        return assessmentSubCategoryService.getAllAssessmentSubCategories();
    }

    @GetMapping("/getAssessmentSubCategory/{id}")
    public AssessmentSubCategoryEntity getAssessmentSubCategoryById(@PathVariable int id) {
        return assessmentSubCategoryService.getAssessmentSubCategoryById(id).orElse(null);
    }

    @GetMapping("/getAssessmentSubCategoriesByCategory/{categoryId}")
    public List<AssessmentSubCategoryEntity> getAssessmentSubCategoriesByCategory(@PathVariable int categoryId) {
        AssessmentCategoryEntity category = assessmentCategoryService.getAssessmentCategoryById(categoryId).orElse(null);
        if (category != null) {
            return assessmentSubCategoryService.getAssessmentSubCategoriesByCategory(category);
        }
        return List.of();
    }

    @PutMapping("/putAssessmentSubCategory")
    public AssessmentSubCategoryEntity putAssessmentSubCategory(@RequestParam int id, @RequestBody AssessmentSubCategoryEntity newSubCategory) {
        newSubCategory.setAssessmentSubCategoryId(id);
        return assessmentSubCategoryService.updateAssessmentSubCategory(newSubCategory);
    }

    @DeleteMapping("/deleteAssessmentSubCategory/{id}")
    public String deleteAssessmentSubCategory(@PathVariable int id) {
        boolean deleted = assessmentSubCategoryService.deleteAssessmentSubCategory(id);
        return deleted ? "AssessmentSubCategory with ID " + id + " successfully deleted" : "AssessmentSubCategory with ID " + id + " not found";
    }
}