package edu.cit.futureu.controller;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import edu.cit.futureu.entity.UserAssessmentEntity;
import edu.cit.futureu.entity.UserEntity;
import edu.cit.futureu.entity.AssessmentEntity;
import edu.cit.futureu.service.UserAssessmentService;
import edu.cit.futureu.service.UserService;
import edu.cit.futureu.service.AssessmentService;

@RestController
@RequestMapping("/api/assessment-progress")
public class AssessmentProgressController {

    @Autowired
    private UserAssessmentService userAssessmentService;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private AssessmentService assessmentService;

    /**
     * Save the current progress of an assessment
     */
    @PostMapping("/save")
    public ResponseEntity<?> saveProgress(@RequestBody Map<String, Object> payload) {
        try {
            int userId = Integer.parseInt(payload.get("userId").toString());
            int assessmentId = Integer.parseInt(payload.get("assessmentId").toString());
            
            // Get authenticated user ID from security context
            // int authenticatedUserId = getAuthenticatedUserId(); // Uncomment when auth is implemented
            int authenticatedUserId = userId; // Temporary, remove when auth is implemented
            
            // Security check: Verify the user is saving their own progress
            if (userId != authenticatedUserId) {
                return new ResponseEntity<>(
                    Map.of("error", "Unauthorized: Cannot save progress for another user"), 
                    HttpStatus.FORBIDDEN
                );
            }
            
            int currentSectionIndex = Integer.parseInt(payload.get("currentSectionIndex").toString());
            double progressPercentage = Double.parseDouble(payload.get("progressPercentage").toString());
            String savedAnswers = payload.get("savedAnswers").toString();
            // Get the serialized sections with questions
            String savedSections = payload.get("savedSections").toString();
            // Get elapsed time in seconds
            int elapsedTime = Integer.parseInt(payload.get("elapsedTime").toString());
            
            Optional<UserEntity> userOpt = userService.getUserById(userId);
            Optional<AssessmentEntity> assessmentOpt = assessmentService.getAssessmentById(assessmentId);
            
            if (!userOpt.isPresent() || !assessmentOpt.isPresent()) {
                return new ResponseEntity<>("User or assessment not found", HttpStatus.NOT_FOUND);
            }
            
            UserEntity user = userOpt.get();
            AssessmentEntity assessment = assessmentOpt.get();
            
            // Check if there's an existing in-progress assessment
            Optional<UserAssessmentEntity> existingAssessment = 
                userAssessmentService.findExistingInProgressAssessment(user, assessment);
            
            UserAssessmentEntity userAssessment;
            
            if (existingAssessment.isPresent()) {
                // Update existing assessment
                userAssessment = existingAssessment.get();
            } else {
                // Create new assessment record
                userAssessment = new UserAssessmentEntity();
                userAssessment.setUser(user);
                userAssessment.setAssessment(assessment);
                userAssessment.setAttemptNo(1); // This logic might need to be more sophisticated
                userAssessment.setDateTaken(LocalDateTime.now());
            }
            
            // Save progress with sections and elapsed time
            userAssessment = userAssessmentService.saveProgress(
                user, assessment, currentSectionIndex, progressPercentage, savedAnswers, savedSections, elapsedTime);
                
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Progress saved successfully");
            response.put("userAssessmentId", userAssessment.getUserQuizAssessment());
            
            return new ResponseEntity<>(response, HttpStatus.OK);
            
        } catch (Exception e) {
            return new ResponseEntity<>(Map.of("error", e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * Get in-progress assessments for a user
     */
    @GetMapping("/in-progress/{userId}")
    public ResponseEntity<List<UserAssessmentEntity>> getInProgressAssessments(@PathVariable int userId) {
        // IMPORTANT: In a real implementation, get the authenticated user ID from the security context
        // For now, we'll assume the passed userId is correct, but in production:
        // int authenticatedUserId = SecurityContextHolder.getContext().getAuthentication().getPrincipal().getUserId();
        int authenticatedUserId = userId; // REPLACE THIS with actual security context when implemented
        
        // Security check: Verify the user is requesting their own assessments
        if (userId != authenticatedUserId) {
            return new ResponseEntity<>(
                HttpStatus.FORBIDDEN
            );
        }
        
        Optional<UserEntity> userOpt = userService.getUserById(userId);
        if (!userOpt.isPresent()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        
        List<UserAssessmentEntity> inProgressAssessments = 
            userAssessmentService.getUserAssessmentsByUserAndStatus(userOpt.get(), "IN_PROGRESS");
        
        return new ResponseEntity<>(inProgressAssessments, HttpStatus.OK);
    }
    
    /**
     * Get a specific in-progress assessment
     */
    @GetMapping("/{userAssessmentId}")
    public ResponseEntity<UserAssessmentEntity> getAssessmentProgress(@PathVariable int userAssessmentId) {
        Optional<UserAssessmentEntity> userAssessmentOpt = 
            userAssessmentService.getUserAssessmentById(userAssessmentId);
            
        if (!userAssessmentOpt.isPresent()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        
        // Get authenticated user ID from security context
        // int authenticatedUserId = getAuthenticatedUserId(); // Uncomment when auth is implemented
        UserAssessmentEntity assessment = userAssessmentOpt.get();
        int assessmentUserId = assessment.getUser().getUserId();
        int authenticatedUserId = assessmentUserId; // Temporary, remove when auth is implemented
        
        // Security check: Verify the user is accessing their own assessment
        if (assessmentUserId != authenticatedUserId) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        
        return new ResponseEntity<>(assessment, HttpStatus.OK);
    }
    
    // Add this method when authentication is fully implemented
    /*
    private int getAuthenticatedUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new UnauthorizedException("User not authenticated");
        }
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        return ((CustomUserDetails) userDetails).getUserId();
    }
    */
}
