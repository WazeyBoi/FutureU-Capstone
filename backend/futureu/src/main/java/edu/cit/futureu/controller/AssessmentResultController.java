package edu.cit.futureu.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import edu.cit.futureu.entity.AssessmentResultEntity;
import edu.cit.futureu.entity.UserAssessmentEntity;
import edu.cit.futureu.service.AssessmentResultService;
import edu.cit.futureu.service.AssessmentService;


@RestController
@RequestMapping(method=RequestMethod.GET, path="/api/assessmentresult")
public class AssessmentResultController {

    @Autowired
    private AssessmentResultService assessmentResultService;

    @Autowired
    private AssessmentService assessmentService;

    @GetMapping("/test")
    public String test() {
        return "AssessmentResult API is working!";
    }

    // CREATE
    @PostMapping("/postAssessmentResult")
    public AssessmentResultEntity postAssessmentResult(@RequestBody AssessmentResultEntity result) {
        return assessmentResultService.createAssessmentResult(result);
    }

    // READ
    @GetMapping("/getAllAssessmentResults")
    public List<AssessmentResultEntity> getAllAssessmentResults() {
        return assessmentResultService.getAllAssessmentResults();
    }

    @GetMapping("/getAssessmentResult/{resultId}")
    public AssessmentResultEntity getAssessmentResultById(@PathVariable int resultId) {
        return assessmentResultService.getAssessmentResultById(resultId).orElse(null);
    }

    @GetMapping("/getAssessmentResultsByUserAssessment/{userAssessmentId}")
    public List<AssessmentResultEntity> getAssessmentResultsByUserAssessment(@PathVariable int userAssessmentId) {
        UserAssessmentEntity userAssessment = assessmentService.getUserAssessmentById(userAssessmentId).orElse(null);
        if (userAssessment != null) {
            return assessmentResultService.getAssessmentResultsByUserAssessment(userAssessment);
        }
        return List.of();
    }

    // UPDATE
    @PutMapping("/putAssessmentResult")
    public AssessmentResultEntity putAssessmentResult(@RequestParam int resultId, @RequestBody AssessmentResultEntity newResult) {
        newResult.setResultId(resultId);
        return assessmentResultService.updateAssessmentResult(newResult);
    }

    // DELETE
    @DeleteMapping("/deleteAssessmentResult/{resultId}")
    public String deleteAssessmentResult(@PathVariable int resultId) {
        boolean deleted = assessmentResultService.deleteAssessmentResult(resultId);
        return deleted ? "AssessmentResult with ID " + resultId + " successfully deleted" : "AssessmentResult with ID " + resultId + " not found";
    }
}