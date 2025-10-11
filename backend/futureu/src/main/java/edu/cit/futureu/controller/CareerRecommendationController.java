package edu.cit.futureu.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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

import edu.cit.futureu.entity.AssessmentResultEntity;
import edu.cit.futureu.entity.CareerRecommendationEntity;
import edu.cit.futureu.entity.UserAssessmentEntity;
import edu.cit.futureu.recommendation.AdvancedRecommendationResponse;
import edu.cit.futureu.recommendation.DreamCareerInsight;
import edu.cit.futureu.recommendation.StructuredRecommendationService;
import edu.cit.futureu.entity.RecommendationJobEntity;
import edu.cit.futureu.service.RecommendationJobService;
import edu.cit.futureu.repository.CareerPathRepository;
import edu.cit.futureu.service.AssessmentResultService;
import edu.cit.futureu.service.CareerRecommendationService;
import edu.cit.futureu.service.GeminiAIService;
import edu.cit.futureu.service.UserAssessmentService;


@RestController
@RequestMapping(method=RequestMethod.GET, path="/api/recommendation")
public class CareerRecommendationController {

    private static final Logger logger = LoggerFactory.getLogger(CareerRecommendationController.class);

    @Autowired
    private CareerRecommendationService recommendationService;

    @Autowired
    private AssessmentResultService assessmentResultService;
    
    @Autowired
    private UserAssessmentService userAssessmentService;

    @Autowired
    private StructuredRecommendationService structuredRecommendationService;

    @Autowired
    private CareerPathRepository careerPathRepository;

    @Autowired
    private GeminiAIService geminiAIService;

    @Autowired
    private edu.cit.futureu.service.RecommendationPersistenceService recommendationPersistenceService;

    @Autowired
    private RecommendationJobService recommendationJobService;

    @GetMapping("/test")
    public String test() {
        return "Recommendation API is working!";
    }

    // CREATE
    @PostMapping("/postRecommendation")
    public CareerRecommendationEntity postRecommendation(@RequestBody CareerRecommendationEntity recommendation) {
        return recommendationService.createRecommendation(recommendation);
    }

    @GetMapping("getAllCareerRecommendations")
    public List<CareerRecommendationEntity> getAllCareerRecommendations() {
        return recommendationService.getAllCareerRecommendations();
    }

    // READ
    @GetMapping("/getRecommendation/{recommendationId}")
    public CareerRecommendationEntity getRecommendationById(@PathVariable int recommendationId) {
        return recommendationService.getRecommendationById(recommendationId).orElse(null);
    }

    @GetMapping("/getRecommendationByResult/{resultId}")
    public List<CareerRecommendationEntity> getRecommendationByResult(@PathVariable int resultId) {
        AssessmentResultEntity result = assessmentResultService.getAssessmentResultById(resultId).orElse(null);
        if (result != null) {
            return recommendationService.getRecommendationsByAssessmentResult(result);
        }
        return new ArrayList<>();
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
            List<CareerRecommendationEntity> recommendations = 
                recommendationService.generateAndSaveRecommendations(resultOpt.get());

            return new ResponseEntity<>(recommendations, HttpStatus.OK);
            
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
        logger.info("Starting comprehensive recommendations for userAssessmentId: {}", userAssessmentId);
        
        try {
            // Get the user assessment
            logger.debug("Fetching user assessment with ID: {}", userAssessmentId);
            Optional<UserAssessmentEntity> userAssessmentOpt = userAssessmentService.getUserAssessmentById(userAssessmentId);
            
            if (!userAssessmentOpt.isPresent()) {
                logger.warn("User assessment not found for ID: {}", userAssessmentId);
                return new ResponseEntity<>(
                    Map.of("error", "User assessment not found", 
                           "code", "NOT_FOUND"),
                    HttpStatus.NOT_FOUND
                );
            }
            
            UserAssessmentEntity userAssessment = userAssessmentOpt.get();
            logger.info("Found user assessment: {}, Status: {}, User ID: {}", 
                       userAssessment.getUserQuizAssessment(), 
                       userAssessment.getStatus(),
                       userAssessment.getUser() != null ? userAssessment.getUser().getUserId() : "NULL");
            
            // Check if the assessment is completed
            if (!"COMPLETED".equals(userAssessment.getStatus())) {
                logger.warn("Assessment not completed. Current status: {}", userAssessment.getStatus());
                return new ResponseEntity<>(
                    Map.of("error", "Assessment is not yet completed", 
                           "code", "BAD_REQUEST"),
                    HttpStatus.BAD_REQUEST
                );
            }
            
            // Get the main assessment result
            logger.debug("Fetching assessment result for user assessment: {}", userAssessment.getUserQuizAssessment());
            Optional<AssessmentResultEntity> resultOpt = 
                assessmentResultService.getAssessmentResultByUserAssessment(userAssessment);
            
            if (!resultOpt.isPresent()) {
                logger.warn("Assessment result not found for user assessment: {}", userAssessment.getUserQuizAssessment());
                return new ResponseEntity<>(
                    Map.of("error", "Assessment result not found", 
                           "code", "NOT_FOUND"),
                    HttpStatus.NOT_FOUND
                );
            }
            
            AssessmentResultEntity assessmentResult = resultOpt.get();
            logger.info("Found assessment result: ID={}, Overall Score={}", 
                       assessmentResult.getResultId(), assessmentResult.getOverallScore());
            
            // Check if recommendations already exist
            // This endpoint should ONLY return existing recommendations, not generate new ones
            if (!recommendationPersistenceService.hasPersistedRecommendations(assessmentResult)) {
                logger.info("No existing recommendations found for assessment result: {}", assessmentResult.getResultId());
                return new ResponseEntity<>(
                    Map.of("error", "No recommendations found. Please generate recommendations first.", 
                           "code", "NOT_FOUND"),
                    HttpStatus.NOT_FOUND
                );
            }
            
            logger.info("Loading existing recommendations for assessment result: {}", assessmentResult.getResultId());
            AdvancedRecommendationResponse structured = recommendationPersistenceService.getPersistedRecommendations(assessmentResult);
            logger.info("Loaded existing recommendations. Career paths count: {}", 
                       structured != null && structured.getCareerPaths() != null ? structured.getCareerPaths().size() : 0);
            
            if (structured != null && structured.getCareerPaths() != null) {
                logger.debug("Career paths details:");
                for (int i = 0; i < structured.getCareerPaths().size(); i++) {
                    var careerPath = structured.getCareerPaths().get(i);
                    logger.debug("  Path {}: ID={}, Name={}, Match%={}, Careers={}, Programs={}", 
                                i + 1,
                                careerPath.getCareerPathId(),
                                careerPath.getCareerPathName(),
                                careerPath.getMatchPercentage(),
                                careerPath.getCareers() != null ? careerPath.getCareers().size() : 0,
                                careerPath.getPrograms() != null ? careerPath.getPrograms().size() : 0);
                }
            }

            Map<String, Object> response = new HashMap<>();
            response.put("assessmentId", userAssessment.getUserQuizAssessment());
            response.put("userId", userAssessment.getUser().getUserId());
            response.put("dateCompleted", userAssessment.getDateCompleted());
            response.put("overallScore", assessmentResult.getOverallScore());
            response.put("recommendations", structured);
            
            logger.info("Comprehensive recommendations response prepared successfully for user: {}", 
                       userAssessment.getUser().getUserId());

            return new ResponseEntity<>(response, HttpStatus.OK);
            
        } catch (Exception e) {
            logger.error("Error generating comprehensive recommendations for userAssessmentId: {}", userAssessmentId, e);
            return new ResponseEntity<>(
                Map.of("error", "Failed to generate comprehensive recommendations", 
                       "message", e.getMessage(),
                       "code", "SERVER_ERROR"),
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Force regenerate recommendations (clear existing and generate new ones)
     * Limited to 2 regenerations per assessment to protect API quota
     */
    @PostMapping("/regenerate/{userAssessmentId}")
    public ResponseEntity<?> regenerateRecommendations(@PathVariable int userAssessmentId) {
        logger.info("Enqueueing regeneration job for userAssessmentId: {}", userAssessmentId);
        try {
            // Check regeneration limit before enqueuing
            Optional<UserAssessmentEntity> userAssessmentOpt = userAssessmentService.getUserAssessmentById(userAssessmentId);
            
            if (!userAssessmentOpt.isPresent()) {
                logger.warn("User assessment not found for ID: {}", userAssessmentId);
                return new ResponseEntity<>(
                    Map.of("error", "User assessment not found", 
                           "code", "NOT_FOUND"),
                    HttpStatus.NOT_FOUND
                );
            }
            
            UserAssessmentEntity userAssessment = userAssessmentOpt.get();
            int currentCount = userAssessment.getRegenerationCount();
            final int MAX_REGENERATIONS = 2;
            
            if (currentCount >= MAX_REGENERATIONS) {
                logger.warn("Regeneration limit reached for userAssessmentId: {}. Count: {}", 
                           userAssessmentId, currentCount);
                return new ResponseEntity<>(
                    Map.of("error", "Regeneration limit reached", 
                           "message", "You have reached the maximum number of regenerations (2) for this assessment.",
                           "regenerationCount", currentCount,
                           "maxRegenerations", MAX_REGENERATIONS,
                           "code", "LIMIT_REACHED"),
                    HttpStatus.TOO_MANY_REQUESTS
                );
            }
            
            // Increment regeneration count
            userAssessment.incrementRegenerationCount();
            userAssessmentService.updateUserAssessment(userAssessment);
            logger.info("Incremented regeneration count to {} for userAssessmentId: {}", 
                       userAssessment.getRegenerationCount(), userAssessmentId);
            
            // Enqueue the job
            RecommendationJobEntity job = recommendationJobService.enqueueJob(userAssessmentId);
            
            Map<String, Object> resp = new HashMap<>();
            resp.put("jobId", job.getId());
            resp.put("status", job.getStatus());
            resp.put("regenerationCount", userAssessment.getRegenerationCount());
            resp.put("remainingRegenerations", MAX_REGENERATIONS - userAssessment.getRegenerationCount());
            
            return ResponseEntity.accepted().body(resp);
        } catch (Exception e) {
            logger.error("Failed to enqueue regeneration job for {}: {}", userAssessmentId, e.getMessage(), e);
            return new ResponseEntity<>(
                Map.of("error", "Failed to enqueue regeneration job", 
                       "message", e.getMessage()), 
                HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/job/{jobId}")
    public ResponseEntity<?> getJobStatus(@PathVariable Long jobId) {
        try {
            Optional<RecommendationJobEntity> jobOpt = recommendationJobService.getJob(jobId);
            if (jobOpt.isEmpty()) {
                return new ResponseEntity<>(Map.of("error", "Job not found"), HttpStatus.NOT_FOUND);
            }
            RecommendationJobEntity job = jobOpt.get();
            Map<String, Object> resp = new HashMap<>();
            resp.put("jobId", job.getId());
            resp.put("userAssessmentId", job.getUserAssessmentId());
            resp.put("status", job.getStatus());
            // message/createdAt/finishedAt may be null while the job is queued or running
            resp.put("message", job.getMessage());
            resp.put("createdAt", job.getCreatedAt());
            resp.put("finishedAt", job.getFinishedAt());
            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            return new ResponseEntity<>(Map.of("error", "Failed to get job status", "message", e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * Get regeneration information for a user assessment
     */
    @GetMapping("/regeneration-info/{userAssessmentId}")
    public ResponseEntity<?> getRegenerationInfo(@PathVariable int userAssessmentId) {
        try {
            Optional<UserAssessmentEntity> userAssessmentOpt = userAssessmentService.getUserAssessmentById(userAssessmentId);
            
            if (!userAssessmentOpt.isPresent()) {
                return new ResponseEntity<>(
                    Map.of("error", "User assessment not found"),
                    HttpStatus.NOT_FOUND
                );
            }
            
            UserAssessmentEntity userAssessment = userAssessmentOpt.get();
            final int MAX_REGENERATIONS = 2;
            int currentCount = userAssessment.getRegenerationCount();
            
            Map<String, Object> resp = new HashMap<>();
            resp.put("regenerationCount", currentCount);
            resp.put("maxRegenerations", MAX_REGENERATIONS);
            resp.put("remainingRegenerations", MAX_REGENERATIONS - currentCount);
            resp.put("canRegenerate", currentCount < MAX_REGENERATIONS);
            
            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            logger.error("Failed to get regeneration info for {}: {}", userAssessmentId, e.getMessage(), e);
            return new ResponseEntity<>(
                Map.of("error", "Failed to get regeneration info", "message", e.getMessage()),
                HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Regenerate only the dream career analysis component
     */
    @PostMapping("/regenerate-dream-career/{userAssessmentId}")
    public ResponseEntity<?> regenerateDreamCareerAnalysis(@PathVariable int userAssessmentId) {
        logger.info("Regenerating dream career analysis for userAssessmentId: {}", userAssessmentId);
        
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
            
            // Get existing recommendations to use for dream career analysis
            AdvancedRecommendationResponse existingRecommendations = structuredRecommendationService.getExistingRecommendations(userAssessment);
            
            if (existingRecommendations == null || existingRecommendations.getCareerPaths() == null || existingRecommendations.getCareerPaths().isEmpty()) {
                return new ResponseEntity<>(
                    Map.of("error", "No existing career recommendations found. Please generate recommendations first.", 
                           "code", "PRECONDITION_FAILED"),
                    HttpStatus.PRECONDITION_FAILED
                );
            }
            
            // Regenerate only the dream career analysis using existing recommendations
            DreamCareerInsight newDreamInsight = structuredRecommendationService.regenerateDreamCareerAnalysis(userAssessment, existingRecommendations.getCareerPaths());
            
            // Update the existing recommendations with the new dream career insight
            existingRecommendations.setDreamCareerInsight(newDreamInsight);
            
            // Save the updated recommendations back to the database
            Optional<AssessmentResultEntity> resultOpt = assessmentResultService.getAssessmentResultByUserAssessment(userAssessment);
            if (resultOpt.isPresent()) {
                AssessmentResultEntity assessmentResult = resultOpt.get();
                structuredRecommendationService.persistUpdatedRecommendations(assessmentResult, existingRecommendations);
                logger.info("Updated recommendations with new dream career analysis saved to database");
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("dreamCareerInsight", newDreamInsight);
            response.put("regenerated", true);
            response.put("timestamp", new java.util.Date());
            
            logger.info("Dream career analysis regenerated successfully for userAssessmentId: {}", userAssessmentId);
            return new ResponseEntity<>(response, HttpStatus.OK);
            
        } catch (Exception e) {
            logger.error("Error regenerating dream career analysis for userAssessmentId: {}", userAssessmentId, e);
            return new ResponseEntity<>(
                Map.of("error", "Failed to regenerate dream career analysis", 
                       "message", e.getMessage(),
                       "code", "SERVER_ERROR"),
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Check if recommendations exist for a user assessment
     */
    @GetMapping("/exists/{userAssessmentId}")
    public ResponseEntity<?> checkRecommendationsExist(@PathVariable int userAssessmentId) {
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
            
            // Get the assessment result
            Optional<AssessmentResultEntity> resultOpt = 
                assessmentResultService.getAssessmentResultByUserAssessment(userAssessment);
            
            if (!resultOpt.isPresent()) {
                return new ResponseEntity<>(
                    Map.of("error", "Assessment result not found", 
                           "code", "NOT_FOUND"),
                    HttpStatus.NOT_FOUND
                );
            }
            
            AssessmentResultEntity assessmentResult = resultOpt.get();
            boolean hasRecommendations = recommendationPersistenceService.hasPersistedRecommendations(assessmentResult);
            
            Map<String, Object> response = new HashMap<>();
            response.put("userAssessmentId", userAssessmentId);
            response.put("assessmentResultId", assessmentResult.getResultId());
            response.put("hasRecommendations", hasRecommendations);
            response.put("status", userAssessment.getStatus());
            
            return new ResponseEntity<>(response, HttpStatus.OK);
            
        } catch (Exception e) {
            logger.error("Error checking recommendations existence for userAssessmentId: {}", userAssessmentId, e);
            return new ResponseEntity<>(
                Map.of("error", "Failed to check recommendations existence", 
                       "message", e.getMessage(),
                       "code", "SERVER_ERROR"),
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Debug endpoint to check career paths in database
     */
    @GetMapping("/debug/career-paths")
    public ResponseEntity<?> debugCareerPaths() {
        try {
            logger.info("Debug: Checking career paths in database");
            List<edu.cit.futureu.entity.CareerPathEntity> careerPaths = careerPathRepository.findAll();
            
            Map<String, Object> debugInfo = new HashMap<>();
            debugInfo.put("totalCareerPaths", careerPaths.size());
            debugInfo.put("careerPaths", careerPaths.stream().map(cp -> 
                Map.of("id", cp.getCareerPathId(), 
                       "name", cp.getCareerPathName(),
                       "description", cp.getCareerPathDescription() != null ? cp.getCareerPathDescription() : "")
            ).toList());
            
            logger.info("Found {} career paths in database", careerPaths.size());
            return new ResponseEntity<>(debugInfo, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error in debug career paths", e);
            return new ResponseEntity<>(
                Map.of("error", "Debug failed", "message", e.getMessage()),
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    // UPDATE
    @PutMapping("/putRecommendation")
    public CareerRecommendationEntity putRecommendation(@RequestParam int recommendationId, @RequestBody CareerRecommendationEntity newRecommendation) {
        newRecommendation.setRecommendationId(recommendationId);
        return recommendationService.updateRecommendation(newRecommendation);
    }

    // DELETE
    @DeleteMapping("/deleteRecommendation/{recommendationId}")
    public String deleteRecommendation(@PathVariable int recommendationId) {
        boolean deleted = recommendationService.deleteRecommendation(recommendationId);
        return deleted ? "Recommendation with ID " + recommendationId + " successfully deleted" : "Recommendation with ID " + recommendationId + " not found";
    }

    // ADMIN: Reset AI Circuit Breaker
    @PostMapping("/admin/reset-circuit-breaker")
    public ResponseEntity<Map<String, Object>> resetCircuitBreaker() {
        try {
            String statusBefore = geminiAIService.getCircuitBreakerStatus();
            geminiAIService.resetCircuitBreaker();
            String statusAfter = geminiAIService.getCircuitBreakerStatus();
            
            Map<String, Object> response = Map.of(
                "success", true,
                "message", "Circuit breaker reset successfully",
                "statusBefore", statusBefore,
                "statusAfter", statusAfter
            );
            
            logger.info("Circuit breaker reset manually via admin endpoint");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Failed to reset circuit breaker", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    // ADMIN: Get Circuit Breaker Status
    @GetMapping("/admin/circuit-breaker-status")
    public ResponseEntity<Map<String, Object>> getCircuitBreakerStatus() {
        try {
            String status = geminiAIService.getCircuitBreakerStatus();
            return ResponseEntity.ok(Map.of("status", status));
        } catch (Exception e) {
            logger.error("Failed to get circuit breaker status", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }
}