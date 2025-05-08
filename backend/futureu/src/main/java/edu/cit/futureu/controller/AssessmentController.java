package edu.cit.futureu.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import edu.cit.futureu.entity.AssessmentEntity;
import edu.cit.futureu.service.AssessmentService;

@RestController
@RequestMapping(method=RequestMethod.GET, path="/api/assessment")
public class AssessmentController {

    @Autowired
    private AssessmentService assessmentService;

    @GetMapping("/test")
    public String test() {
        return "Assessment API is working!";
    }

    // CREATE
    @PostMapping("/postAssessmentRecord")
    public AssessmentEntity postAssessmentRecord(@RequestBody AssessmentEntity assessment) {
        return assessmentService.createAssessment(assessment);
    }

    // READ
    @GetMapping("/getAllAssessments")
    public List<AssessmentEntity> getAllAssessments() {
        return assessmentService.getAllAssessments();
    }

    @GetMapping("/getAssessment/{assessmentId}")
    public AssessmentEntity getAssessmentById(@PathVariable int assessmentId) {
        return assessmentService.getAssessmentById(assessmentId).orElse(null);
    }

    @GetMapping("/searchAssessments")
    public List<AssessmentEntity> searchAssessments(@RequestParam String title) {
        return assessmentService.searchAssessmentsByTitle(title);
    }

    @GetMapping("/filterByType")
    public List<AssessmentEntity> filterByType(@RequestParam String type) {
        return assessmentService.filterAssessmentsByType(type);
    }

    @GetMapping("/filterByStatus")
    public List<AssessmentEntity> filterByStatus(@RequestParam String status) {
        return assessmentService.filterAssessmentsByStatus(status);
    }

    // UPDATE
    @PutMapping("/putAssessmentDetails")
    public AssessmentEntity putAssessmentDetails(@RequestParam int assessmentId, @RequestBody AssessmentEntity newAssessmentDetails) {
        newAssessmentDetails.setAssessmentId(assessmentId);
        return assessmentService.updateAssessment(newAssessmentDetails);
    }

    // DELETE
    @DeleteMapping("/deleteAssessment/{assessmentId}")
    public String deleteAssessment(@PathVariable int assessmentId) {
        boolean deleted = assessmentService.deleteAssessment(assessmentId);
        return deleted ? "Assessment with ID " + assessmentId + " successfully deleted" : "Assessment with ID " + assessmentId + " not found";
    }
}