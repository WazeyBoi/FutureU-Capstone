package edu.cit.futureu.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import edu.cit.futureu.entity.AssessmentCategoryEntity;
import edu.cit.futureu.service.AssessmentCategoryService;

@RestController
@RequestMapping(method=RequestMethod.GET, path="/api/assessmentcategory")
public class AssessmentCategoryController {

    @Autowired
    private AssessmentCategoryService assessmentCategoryService;

    @GetMapping("/test")
    public String test() {
        return "AssessmentCategory API is working!";
    }

    @PostMapping("/postAssessmentCategory")
    public AssessmentCategoryEntity postAssessmentCategory(@RequestBody AssessmentCategoryEntity category) {
        return assessmentCategoryService.createAssessmentCategory(category);
    }

    @GetMapping("/getAllAssessmentCategories")
    public List<AssessmentCategoryEntity> getAllAssessmentCategories() {
        return assessmentCategoryService.getAllAssessmentCategories();
    }

    @GetMapping("/getAssessmentCategory/{id}")
    public AssessmentCategoryEntity getAssessmentCategoryById(@PathVariable int id) {
        return assessmentCategoryService.getAssessmentCategoryById(id).orElse(null);
    }

    @PutMapping("/putAssessmentCategory")
    public AssessmentCategoryEntity putAssessmentCategory(@RequestParam int id, @RequestBody AssessmentCategoryEntity newCategory) {
        newCategory.setAssessmentCategoryId(id);
        return assessmentCategoryService.updateAssessmentCategory(newCategory);
    }

    @DeleteMapping("/deleteAssessmentCategory/{id}")
    public String deleteAssessmentCategory(@PathVariable int id) {
        boolean deleted = assessmentCategoryService.deleteAssessmentCategory(id);
        return deleted ? "AssessmentCategory with ID " + id + " successfully deleted" : "AssessmentCategory with ID " + id + " not found";
    }
}