package edu.cit.futureu.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import edu.cit.futureu.entity.UserAssessmentEntity;
import edu.cit.futureu.entity.AssessmentResultEntity;
import edu.cit.futureu.entity.UserAssessmentSectionResultEntity;
import edu.cit.futureu.service.UserAssessmentService;
import edu.cit.futureu.service.AssessmentResultService;
import edu.cit.futureu.service.GeminiAIService;

import java.util.*;

@RestController
@RequestMapping("/api/assessment-results")
public class AssessmentResultController {

    @Autowired
    private UserAssessmentService userAssessmentService;
    
    @Autowired
    private AssessmentResultService assessmentResultService;
    
    @Autowired
    private GeminiAIService geminiAIService;

    /**
     * Get results for a specific user assessment
     */
    @GetMapping("/user-assessment/{userAssessmentId}")
    public ResponseEntity<?> getAssessmentResultsByUserAssessment(@PathVariable int userAssessmentId) {
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
            Optional<AssessmentResultEntity> resultOpt = assessmentResultService.getAssessmentResultByUserAssessment(userAssessment);
            
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
            
            // Compile the response with all result data
            Map<String, Object> response = new HashMap<>();
            response.put("userAssessment", userAssessment);
            response.put("assessmentResult", resultOpt.get());
            response.put("sectionResults", sectionResults);
            
            return new ResponseEntity<>(response, HttpStatus.OK);
            
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(
                Map.of("error", "Failed to retrieve assessment results", 
                       "message", e.getMessage(),
                       "code", "SERVER_ERROR"),
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
    
    /**
     * Get AI-generated program recommendations based on assessment results
     */
    @GetMapping("/ai-recommendations/{userAssessmentId}")
    public ResponseEntity<?> getAIProgramRecommendations(@PathVariable int userAssessmentId) {
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
            Optional<AssessmentResultEntity> resultOpt = assessmentResultService.getAssessmentResultByUserAssessment(userAssessment);
            
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
            
            return new ResponseEntity<>(aiRecommendations, HttpStatus.OK);
            
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(
                Map.of("error", "Failed to generate AI recommendations", 
                       "message", e.getMessage(),
                       "code", "SERVER_ERROR"),
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}