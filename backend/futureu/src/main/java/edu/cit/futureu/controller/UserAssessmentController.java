package edu.cit.futureu.controller;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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

import edu.cit.futureu.entity.UserAssessmentEntity;
import edu.cit.futureu.entity.UserEntity;
import edu.cit.futureu.entity.AssessmentEntity;
import edu.cit.futureu.entity.AssessmentResultEntity;
import edu.cit.futureu.repository.AssessmentResultRepository;
import edu.cit.futureu.service.UserAssessmentService;
import edu.cit.futureu.service.UserService;
import edu.cit.futureu.service.AssessmentService;

@RestController
@RequestMapping(method=RequestMethod.GET, path="/api/userassessment")
public class UserAssessmentController {

    @Autowired
    private UserAssessmentService userAssessmentService;

    @Autowired
    private UserService userService;

    @Autowired
    private AssessmentService assessmentService;

    @Autowired
    private AssessmentResultRepository assessmentResultRepository;

    @GetMapping("/test")
    public String test() {
        return "UserAssessment API is working!";
    }

    // CREATE
    @PostMapping("/postUserAssessmentRecord")
    public UserAssessmentEntity postUserAssessmentRecord(@RequestBody UserAssessmentEntity userAssessment) {
        return userAssessmentService.createUserAssessment(userAssessment);
    }

    // READ
    @GetMapping("/getAllUserAssessments")
    public List<UserAssessmentEntity> getAllUserAssessments() {
        return userAssessmentService.getAllUserAssessments();
    }

    @GetMapping("/getUserAssessment/{id}")
    public UserAssessmentEntity getUserAssessmentById(@PathVariable int id) {
        return userAssessmentService.getUserAssessmentById(id).orElse(null);
    }

    @GetMapping("/getUserAssessmentsByUser/{userId}")
    public List<UserAssessmentEntity> getUserAssessmentsByUser(@PathVariable int userId) {
        UserEntity user = userService.getUserById(userId).orElse(null);
        if (user != null) {
            return userAssessmentService.getUserAssessmentsByUser(user);
        }
        return List.of();
    }

    @GetMapping("/getUserAssessmentsByAssessment/{assessmentId}")
    public List<UserAssessmentEntity> getUserAssessmentsByAssessment(@PathVariable int assessmentId) {
        AssessmentEntity assessment = assessmentService.getAssessmentById(assessmentId).orElse(null);
        if (assessment != null) {
            return userAssessmentService.getUserAssessmentsByAssessment(assessment);
        }
        return List.of();
    }

    // UPDATE
    @PutMapping("/putUserAssessmentDetails")
    public UserAssessmentEntity putUserAssessmentDetails(@RequestParam int id, @RequestBody UserAssessmentEntity newDetails) {
        newDetails.setUserQuizAssessment(id);
        return userAssessmentService.updateUserAssessment(newDetails);
    }

    // DELETE
    @DeleteMapping("/deleteUserAssessment/{id}")
    public String deleteUserAssessment(@PathVariable int id) {
        boolean deleted = userAssessmentService.deleteUserAssessment(id);
        return deleted ? "UserAssessment with ID " + id + " successfully deleted" : "UserAssessment with ID " + id + " not found";
    }

    /**
     * Submit a completed assessment for scoring 
     * This handles both new submissions and continuation of saved progress
     */
    @PostMapping("/submit-completed")
    public ResponseEntity<?> submitCompletedAssessment(@RequestBody Map<String, Object> payload) {
        try {
            int userId = Integer.parseInt(payload.get("userId").toString());
            int assessmentId = Integer.parseInt(payload.get("assessmentId").toString());
            
            // Security check: Verify user is submitting their own assessment
            // TODO: Replace with proper authentication when implemented
            int authenticatedUserId = userId; // This should be from security context in production
            if (userId != authenticatedUserId) {
                return new ResponseEntity<>(
                    Map.of("error", "Unauthorized: Cannot submit assessment for another user",
                           "code", "UNAUTHORIZED"), 
                    HttpStatus.FORBIDDEN
                );
            }
            
            // Validate user and assessment existence
            Optional<UserEntity> userOpt = userService.getUserById(userId);
            Optional<AssessmentEntity> assessmentOpt = assessmentService.getAssessmentById(assessmentId);
            
            if (!userOpt.isPresent() || !assessmentOpt.isPresent()) {
                return new ResponseEntity<>(
                    Map.of("error", "User or assessment not found",
                           "code", "NOT_FOUND"), 
                    HttpStatus.NOT_FOUND
                );
            }
            
            // Parse answers from the payload
            List<Map<String, Object>> answers = (List<Map<String, Object>>) payload.get("answers");
            String sectionsJson = payload.get("sections").toString();
            int elapsedTime = Integer.parseInt(payload.get("elapsedTime").toString());
            
            // Submit and score the assessment
            UserAssessmentEntity result = userAssessmentService.submitAndScoreAssessment(
                userOpt.get(), assessmentOpt.get(), answers, sectionsJson, elapsedTime);
            
            // Return the result with success message
            return new ResponseEntity<>(
                Map.of("userAssessmentId", result.getUserQuizAssessment(),
                      "message", "Assessment submitted successfully",
                      "score", result.getScore()),
                HttpStatus.OK
            );
        } catch (Exception e) {
            e.printStackTrace(); // For debugging
            return new ResponseEntity<>(
                Map.of("error", e.getMessage(),
                      "code", "SERVER_ERROR"),
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}
