package edu.cit.futureu.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import edu.cit.futureu.entity.RecommendationEntity;
import edu.cit.futureu.entity.AssessmentResultEntity;
import edu.cit.futureu.service.RecommendationService;
import edu.cit.futureu.service.AssessmentResultService;

@RestController
@RequestMapping(method=RequestMethod.GET, path="/api/recommendation")
public class RecommendationController {

    @Autowired
    private RecommendationService recommendationService;

    @Autowired
    private AssessmentResultService assessmentResultService;

    @GetMapping("/test")
    public String test() {
        return "Recommendation API is working!";
    }

    // CREATE
    @PostMapping("/postRecommendation")
    public RecommendationEntity postRecommendation(@RequestBody RecommendationEntity recommendation) {
        return recommendationService.createRecommendation(recommendation);
    }

    // READ
    @GetMapping("/getRecommendation/{recommendationId}")
    public RecommendationEntity getRecommendationById(@PathVariable int recommendationId) {
        return recommendationService.getRecommendationById(recommendationId).orElse(null);
    }

    @GetMapping("/getRecommendationByResult/{resultId}")
    public RecommendationEntity getRecommendationByResult(@PathVariable int resultId) {
        AssessmentResultEntity result = assessmentResultService.getAssessmentResultById(resultId).orElse(null);
        if (result != null) {
            return recommendationService.getRecommendationByAssessmentResult(result);
        }
        return null;
    }

    // UPDATE
    @PutMapping("/putRecommendation")
    public RecommendationEntity putRecommendation(@RequestParam int recommendationId, @RequestBody RecommendationEntity newRecommendation) {
        newRecommendation.setRecommendationId(recommendationId);
        return recommendationService.updateRecommendation(newRecommendation);
    }

    // DELETE
    @DeleteMapping("/deleteRecommendation/{recommendationId}")
    public String deleteRecommendation(@PathVariable int recommendationId) {
        boolean deleted = recommendationService.deleteRecommendation(recommendationId);
        return deleted ? "Recommendation with ID " + recommendationId + " successfully deleted" : "Recommendation with ID " + recommendationId + " not found";
    }
}