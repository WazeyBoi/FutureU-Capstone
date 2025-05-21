package edu.cit.futureu.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import edu.cit.futureu.entity.RecommendationEntity;
import edu.cit.futureu.entity.AssessmentResultEntity;
import edu.cit.futureu.entity.UserAssessmentEntity;
import edu.cit.futureu.entity.UserAssessmentSectionResultEntity;
import edu.cit.futureu.service.RecommendationService;
import edu.cit.futureu.service.AssessmentResultService;
import edu.cit.futureu.service.UserAssessmentService;
import edu.cit.futureu.service.GeminiAIService;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.HashMap;

@RestController
@RequestMapping(method=RequestMethod.GET, path="/api/recommendation")
public class RecommendationController {

    @Autowired
    private RecommendationService recommendationService;

    @Autowired
    private AssessmentResultService assessmentResultService;
    
    @Autowired
    private UserAssessmentService userAssessmentService;

    @Autowired
    private GeminiAIService geminiAIService;

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
    
    /**
     * Generate AI recommendations for a completed assessment
     */
    @PostMapping("/generate-for-assessment/{userAssessmentId}")
    public ResponseEntity<?> generateRecommendationsForAssessment(@PathVariable int userAssessmentId) {
        try {
            // Get the user assessment
            Optional<UserAssessmentEntity> userAssessmentOpt = userAssessmentService.getUserAssessmentById(userAssessmentId);
            
            if (!userAssessmentOpt.isPresent()) {
                return new ResponseEntity<>(
                    Map.of("error", "User assessment not found", 
                           "code", "NOT_FOUND"),
                    HttpStatus.NOT_FOUND
                );
            }
            
            UserAssessmentEntity userAssessment = userAssessmentOpt.get();
            
            // Check if the assessment is completed
            if (!"COMPLETED".equals(userAssessment.getStatus())) {
                return new ResponseEntity<>(
                    Map.of("error", "Assessment is not yet completed", 
                           "code", "BAD_REQUEST"),
                    HttpStatus.BAD_REQUEST
                );
            }
            
            // Get the main assessment result
            Optional<AssessmentResultEntity> resultOpt = 
                assessmentResultService.getAssessmentResultByUserAssessment(userAssessment);
            
            if (!resultOpt.isPresent()) {
                return new ResponseEntity<>(
                    Map.of("error", "Assessment result not found", 
                           "code", "NOT_FOUND"),
                    HttpStatus.NOT_FOUND
                );
            }
            
            // Generate and save AI recommendations
            RecommendationEntity recommendation = 
                recommendationService.generateAndSaveRecommendations(resultOpt.get());
            
            return new ResponseEntity<>(recommendation, HttpStatus.OK);
            
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(
                Map.of("error", "Failed to generate recommendations", 
                       "message", e.getMessage(),
                       "code", "SERVER_ERROR"),
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Get comprehensive AI recommendations with database program matches
     */
    @GetMapping("/comprehensive/{userAssessmentId}")
    public ResponseEntity<?> getComprehensiveRecommendations(@PathVariable int userAssessmentId) {
        try {
            // Get the user assessment
            Optional<UserAssessmentEntity> userAssessmentOpt = userAssessmentService.getUserAssessmentById(userAssessmentId);
            
            if (!userAssessmentOpt.isPresent()) {
                return new ResponseEntity<>(
                    Map.of("error", "User assessment not found", 
                           "code", "NOT_FOUND"),
                    HttpStatus.NOT_FOUND
                );
            }
            
            UserAssessmentEntity userAssessment = userAssessmentOpt.get();
            
            // Check if the assessment is completed
            if (!"COMPLETED".equals(userAssessment.getStatus())) {
                return new ResponseEntity<>(
                    Map.of("error", "Assessment is not yet completed", 
                           "code", "BAD_REQUEST"),
                    HttpStatus.BAD_REQUEST
                );
            }
            
            // Get the main assessment result
            Optional<AssessmentResultEntity> resultOpt = 
                assessmentResultService.getAssessmentResultByUserAssessment(userAssessment);
            
            if (!resultOpt.isPresent()) {
                return new ResponseEntity<>(
                    Map.of("error", "Assessment result not found", 
                           "code", "NOT_FOUND"),
                    HttpStatus.NOT_FOUND
                );
            }
            
            // Get section results
            List<UserAssessmentSectionResultEntity> sectionResults = 
                userAssessmentService.getSectionResultsForAssessment(userAssessment);
            
            // Generate AI recommendations
            Map<String, Object> aiRecommendations = 
                geminiAIService.generateProgramRecommendations(resultOpt.get(), sectionResults);
            
            // Create a comprehensive response
            Map<String, Object> response = new HashMap<>();
            response.put("assessmentId", userAssessment.getUserQuizAssessment());
            response.put("userId", userAssessment.getUser().getUserId());
            response.put("dateCompleted", userAssessment.getDateCompleted());
            response.put("overallScore", resultOpt.get().getOverallScore());
            response.put("recommendations", aiRecommendations);
            
            return new ResponseEntity<>(response, HttpStatus.OK);
            
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(
                Map.of("error", "Failed to generate comprehensive recommendations", 
                       "message", e.getMessage(),
                       "code", "SERVER_ERROR"),
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
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