package edu.cit.futureu.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import edu.cit.futureu.entity.AssessmentResultEntity;
import edu.cit.futureu.entity.UserAssessmentEntity;
import edu.cit.futureu.entity.UserAssessmentSectionResultEntity;
import edu.cit.futureu.repository.AssessmentResultRepository;
import edu.cit.futureu.repository.UserAssessmentRepository;
import edu.cit.futureu.repository.UserAssessmentSectionResultRepository;

@RestController
@RequestMapping(method=RequestMethod.GET, path="/api/assessment-results")
public class AssessmentResultController {

    @Autowired
    private AssessmentResultRepository assessmentResultRepository;
    
    @Autowired
    private UserAssessmentRepository userAssessmentRepository;
    
    @Autowired
    private UserAssessmentSectionResultRepository sectionResultRepository;
    
    /**
     * Get detailed assessment results by user assessment ID
     */
    @GetMapping("/{userAssessmentId}")
    public ResponseEntity<?> getDetailedResults(@PathVariable int userAssessmentId) {
        try {
            // Check if the user assessment exists
            Optional<UserAssessmentEntity> userAssessmentOpt = userAssessmentRepository.findById(userAssessmentId);
            if (!userAssessmentOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "User assessment not found"));
            }
            
            UserAssessmentEntity userAssessment = userAssessmentOpt.get();
            
            // Get overall result
            Optional<AssessmentResultEntity> resultOpt = assessmentResultRepository.findByUserAssessment(userAssessment);
            if (!resultOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Assessment result not found"));
            }
            
            AssessmentResultEntity result = resultOpt.get();
            
            // Get section results
            List<UserAssessmentSectionResultEntity> sectionResults = sectionResultRepository.findByUserAssessment(userAssessment);
            
            // Organize section results by type
            Map<String, List<UserAssessmentSectionResultEntity>> resultsByType = new HashMap<>();
            
            for (UserAssessmentSectionResultEntity sectionResult : sectionResults) {
                String type = sectionResult.getSectionType();
                resultsByType.computeIfAbsent(type, k -> new java.util.ArrayList<>()).add(sectionResult);
            }
            
            // Build response
            Map<String, Object> response = new HashMap<>();
            response.put("userAssessmentId", userAssessmentId);
            response.put("assessmentId", userAssessment.getAssessment().getAssessmentId());
            response.put("assessmentTitle", userAssessment.getAssessment().getTitle());
            response.put("userId", userAssessment.getUser().getUserId());
            // response.put("userName", userAssessment.getUser().getUsername());
            response.put("completionDate", userAssessment.getDateTaken());
            response.put("timeSpentSeconds", userAssessment.getTimeSpentSeconds());
            
            // Overall scores
            Map<String, Object> overallScores = new HashMap<>();
            overallScores.put("overallScore", result.getOverallScore());
            overallScores.put("gsaScore", result.getGsaScore());
            overallScores.put("academicTrackScore", result.getAcademicTrackScore());
            overallScores.put("otherTrackScore", result.getOtherTrackScore());
            overallScores.put("interestAreaScore", result.getInterestAreaScore());
            
            response.put("overallScores", overallScores);
            response.put("sectionResults", resultsByType);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }
}