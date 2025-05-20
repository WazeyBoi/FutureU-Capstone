package edu.cit.futureu.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import edu.cit.futureu.entity.UserAssessmentEntity;
import edu.cit.futureu.entity.UserAssessmentSectionResultEntity;
import edu.cit.futureu.entity.AssessmentResultEntity;
import edu.cit.futureu.entity.UserEntity;
import edu.cit.futureu.entity.AssessmentEntity;
import edu.cit.futureu.entity.QuestionEntity;
import edu.cit.futureu.entity.ChoiceEntity;
import edu.cit.futureu.repository.UserAssessmentRepository;
import edu.cit.futureu.repository.UserAssessmentSectionResultRepository;
import edu.cit.futureu.repository.AssessmentResultRepository;
import edu.cit.futureu.repository.QuestionRepository;

@Service
public class UserAssessmentService {

    @Autowired
    private UserAssessmentRepository userAssessmentRepository;
    
    @Autowired
    private UserAssessmentSectionResultRepository sectionResultRepository;
    
    @Autowired
    private AssessmentResultRepository assessmentResultRepository;
    
    @Autowired
    private QuestionRepository questionRepository;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    @Autowired
    private ChoiceService choiceService; // Add this for accessing choice information

    /**
     * Create a new user assessment record
     */
    public UserAssessmentEntity createUserAssessment(UserAssessmentEntity userAssessment) {
        return userAssessmentRepository.save(userAssessment);
    }

    /**
     * Get all user assessments
     */
    public List<UserAssessmentEntity> getAllUserAssessments() {
        return userAssessmentRepository.findAll();
    }

    /**
     * Get user assessment by ID
     */
    public Optional<UserAssessmentEntity> getUserAssessmentById(int id) {
        return userAssessmentRepository.findById(id);
    }

    /**
     * Get user assessments by user
     */
    public List<UserAssessmentEntity> getUserAssessmentsByUser(UserEntity user) {
        return userAssessmentRepository.findByUser(user);
    }

    /**
     * Get user assessments by assessment
     */
    public List<UserAssessmentEntity> getUserAssessmentsByAssessment(AssessmentEntity assessment) {
        return userAssessmentRepository.findByAssessment(assessment);
    }
    
    /**
     * Get user assessments by user and status
     */
    public List<UserAssessmentEntity> getUserAssessmentsByUserAndStatus(UserEntity user, String status) {
        return userAssessmentRepository.findByUserAndStatus(user, status);
    }

    /**
     * Update a user assessment
     */
    public UserAssessmentEntity updateUserAssessment(UserAssessmentEntity userAssessment) {
        return userAssessmentRepository.save(userAssessment);
    }

    /**
     * Delete a user assessment
     */
    public boolean deleteUserAssessment(int id) {
        if (userAssessmentRepository.existsById(id)) {
            userAssessmentRepository.deleteById(id);
            return true;
        }
        return false;
    }
    
    /**
     * Save assessment progress
     */
    @Transactional
    public UserAssessmentEntity saveProgress(UserEntity user, AssessmentEntity assessment, 
                                            int currentSectionIndex, double progressPercentage,
                                            String savedAnswers, String savedSections, int timeSpentSeconds) {
        // Look for existing in-progress assessment
        List<UserAssessmentEntity> inProgress = userAssessmentRepository.findByUserAndAssessmentAndStatus(user, assessment, "IN_PROGRESS");
        UserAssessmentEntity userAssessment;
        
        if (!inProgress.isEmpty()) {
            // Update existing record
            userAssessment = inProgress.get(0);
        } else {
            // Create new record
            userAssessment = new UserAssessmentEntity();
            userAssessment.setUser(user);
            userAssessment.setAssessment(assessment);
            userAssessment.setStatus("IN_PROGRESS");
            userAssessment.setDateTaken(LocalDateTime.now());
        }
        
        // Update progress fields
        userAssessment.setCurrentSectionIndex(currentSectionIndex);
        userAssessment.setProgressPercentage(progressPercentage);
        userAssessment.setSavedAnswers(savedAnswers);
        userAssessment.setSavedSections(savedSections);
        userAssessment.setTimeSpentSeconds(timeSpentSeconds);
        userAssessment.setLastSavedTime(LocalDateTime.now());
        
        return userAssessmentRepository.save(userAssessment);
    }
    
    /**
     * Submit and score a completed assessment
     */
    @Transactional
    public UserAssessmentEntity submitAndScoreAssessment(UserEntity user, AssessmentEntity assessment,
                                                      List<Map<String, Object>> answers, String sectionsJson,
                                                      int timeSpentSeconds) throws JsonProcessingException {
        // Find or create the user assessment record
        List<UserAssessmentEntity> inProgress = userAssessmentRepository.findByUserAndAssessmentAndStatus(user, assessment, "IN_PROGRESS");
        UserAssessmentEntity userAssessment;
        
        if (!inProgress.isEmpty()) {
            // Update existing record
            userAssessment = inProgress.get(0);
        } else {
            // Create new record
            userAssessment = new UserAssessmentEntity();
            userAssessment.setUser(user);
            userAssessment.setAssessment(assessment);
            userAssessment.setDateTaken(LocalDateTime.now());
        }
        
        // Set completion data
        userAssessment.setStatus("COMPLETED");
        userAssessment.setProgressPercentage(100.0);
        userAssessment.setTimeSpentSeconds(timeSpentSeconds);
        
        // Set the dateCompleted field
        LocalDateTime now = LocalDateTime.now();
        userAssessment.setDateCompleted(now);
        
        // Calculate attempt number if this is a new attempt
        if (userAssessment.getAttemptNo() == 0) {
            // Count existing completed attempts for this user and assessment
            long existingAttempts = userAssessmentRepository.countByUserAndAssessmentAndStatus(user, assessment, "COMPLETED");
            userAssessment.setAttemptNo((int) existingAttempts + 1);
        }
        
        // Parse sections data
        List<Map<String, Object>> sections = objectMapper.readValue(sectionsJson, 
                                            new TypeReference<List<Map<String, Object>>>(){});
        
        // Calculate scores for each section and overall
        Map<String, Map<String, Object>> sectionScores = calculateSectionScores(sections, answers);
        
        // Calculate overall score based on weighted section scores
        double overallScore = calculateOverallScore(sectionScores);
        userAssessment.setScore(overallScore);
        
        // Save the user assessment to get an ID
        userAssessment = userAssessmentRepository.save(userAssessment);
        
        // Now create section result entities
        createSectionResultEntities(userAssessment, sectionScores);
        
        // Create overall assessment result entity
        createOverallAssessmentResult(userAssessment, sectionScores, overallScore);
        
        return userAssessment;
    }
    
    /**
     * Find an existing in-progress assessment for a user and assessment
     */
    public Optional<UserAssessmentEntity> findExistingInProgressAssessment(UserEntity user, AssessmentEntity assessment) {
        List<UserAssessmentEntity> inProgress = userAssessmentRepository.findByUserAndAssessmentAndStatus(user, assessment, "IN_PROGRESS");
        return inProgress.isEmpty() ? Optional.empty() : Optional.of(inProgress.get(0));
    }
    
    /**
     * Calculate scores for each section
     */
    private Map<String, Map<String, Object>> calculateSectionScores(
            List<Map<String, Object>> sections, 
            List<Map<String, Object>> answers) {
        
        Map<String, Map<String, Object>> sectionScores = new HashMap<>();
        
        // Group answers by question ID for easy lookup
        Map<Integer, String> answerMap = new HashMap<>();
        for (Map<String, Object> answer : answers) {
            Integer questionId = (Integer) answer.get("questionId");
            String answerValue = String.valueOf(answer.get("answer"));
            answerMap.put(questionId, answerValue);
        }
        
        // Calculate scores for each section
        for (Map<String, Object> section : sections) {
            String sectionId = (String) section.get("id");
            String sectionType = getSectionType(sectionId);
            String sectionTitle = (String) section.get("title");
            
            // Get questions for this section
            List<Map<String, Object>> sectionQuestions = (List<Map<String, Object>>) section.get("questions");
            
            int totalQuestions = sectionQuestions.size();
            int correctAnswers = 0;
            double rawScore = 0.0;
            
            // Special tracking for RIASEC scores (how many "agree" responses per interest area)
            Map<String, Integer> riasecAgreeResponses = new HashMap<>();
            
            // Score each question in the section
            for (Map<String, Object> question : sectionQuestions) {
                Integer questionId = (Integer) question.get("questionId");
                String questionType = (String) question.get("questionType");
                
                // Get user's answer for this question
                String userAnswer = answerMap.get(questionId);
                
                // Skip if no answer was provided
                if (userAnswer == null) continue;
                
                // For RIASEC/Likert questions - handle as agree/disagree
                if ("Likert".equals(questionType) || Boolean.TRUE.equals(question.get("isRiasecQuestion"))) {
                    // Get the RIASEC type for scoring purposes
                    String riasecType = (String) question.get("riasecType");
                    
                    // Now handle the agree/disagree format
                    if ("agree".equals(userAnswer)) {
                        // For "agree" responses, add 1 point
                        rawScore += 1.0;
                        correctAnswers++;
                        
                        // Track agree responses by RIASEC type
                        if (riasecType != null) {
                            riasecAgreeResponses.put(riasecType, 
                                riasecAgreeResponses.getOrDefault(riasecType, 0) + 1);
                        }
                    } else if ("disagree".equals(userAnswer)) {
                        // For "disagree" responses, add no points but count as answered
                        correctAnswers++;
                    }
                } 
                // For multiple-choice questions, check the isCorrect attribute of the selected choice
                else if ("Multiple Choice".equals(questionType)) {
                    try {
                        // Fetch the question entity to get its choices
                        Optional<QuestionEntity> questionEntity = questionRepository.findById(questionId);
                        if (questionEntity.isPresent()) {
                            QuestionEntity q = questionEntity.get();
                            
                            // Parse the choiceId from the userAnswer
                            int choiceId = Integer.parseInt(userAnswer);
                            
                            // Get all choices for this question
                            List<ChoiceEntity> choices = choiceService.getChoicesByQuestion(q);
                            
                            // Find the selected choice
                            Optional<ChoiceEntity> selectedChoice = choices.stream()
                                .filter(c -> c.getChoiceId() == choiceId)
                                .findFirst();
                            
                            // Check if the selected choice is correct
                            if (selectedChoice.isPresent() && selectedChoice.get().isCorrect()) {
                                correctAnswers++;
                                rawScore += 1.0; // Each correct answer is worth 1 point
                            }
                        }
                    } catch (NumberFormatException e) {
                        // Log the error but continue processing other questions
                        System.err.println("Error processing answer for question " + questionId + ": " + e.getMessage());
                    }
                }
                // For other question types like True/False
                else {
                    Optional<QuestionEntity> questionEntity = questionRepository.findById(questionId);
                    if (questionEntity.isPresent() && 
                        userAnswer.equals(questionEntity.get().getCorrectAnswer())) {
                        correctAnswers++;
                        rawScore += 1.0;
                    }
                }
            }
            
            // Calculate percentage score
            double percentageScore = totalQuestions > 0 ? 
                                  (rawScore / totalQuestions) * 100 : 0;
            
            // Store section scores
            Map<String, Object> scoreDetails = new HashMap<>();
            scoreDetails.put("sectionId", sectionId);
            scoreDetails.put("sectionName", sectionTitle);
            scoreDetails.put("sectionType", sectionType);
            scoreDetails.put("totalQuestions", totalQuestions);
            scoreDetails.put("correctAnswers", correctAnswers);
            scoreDetails.put("rawScore", rawScore);
            scoreDetails.put("percentageScore", percentageScore);
            
            // Add RIASEC agree counts if this is an interest section
            if (sectionType.equals("INTEREST") && !riasecAgreeResponses.isEmpty()) {
                scoreDetails.put("riasecAgreeResponses", riasecAgreeResponses);
            }
            
            sectionScores.put(sectionId, scoreDetails);
        }
        
        return sectionScores;
    }
    
    /**
     * Calculate overall assessment score with weights for different section types
     */
    private double calculateOverallScore(Map<String, Map<String, Object>> sectionScores) {
        // Define weights for different section types
        Map<String, Double> typeWeights = new HashMap<>();
        typeWeights.put("GSA", 0.40);       // 40% weight for GSA
        typeWeights.put("ACADEMIC", 0.30);  // 30% weight for Academic Track
        typeWeights.put("OTHER", 0.15);     // 15% weight for Other Track
        typeWeights.put("INTEREST", 0.15);  // 15% weight for Interest Areas
        
        // Group section scores by type
        Map<String, List<Double>> scoresByType = new HashMap<>();
        
        for (Map.Entry<String, Map<String, Object>> entry : sectionScores.entrySet()) {
            String sectionType = (String) entry.getValue().get("sectionType");
            double score = (double) entry.getValue().get("percentageScore");
            
            scoresByType.computeIfAbsent(sectionType, k -> new ArrayList<>()).add(score);
        }
        
        // Calculate weighted average for each type
        double weightedTotal = 0.0;
        double totalWeight = 0.0;
        
        for (Map.Entry<String, List<Double>> entry : scoresByType.entrySet()) {
            String type = entry.getKey();
            List<Double> scores = entry.getValue();
            
            // Calculate average score for this type
            double typeAverage = scores.stream().mapToDouble(Double::doubleValue).average().orElse(0);
            
            // Get weight for this type
            double weight = typeWeights.getOrDefault(type, 0.0);
            
            // Add weighted score to total
            weightedTotal += typeAverage * weight;
            totalWeight += weight;
        }
        
        // Calculate final weighted average
        return totalWeight > 0 ? weightedTotal / totalWeight : 0;
    }
    
    /**
     * Determine section type based on section ID
     */
    private String getSectionType(String sectionId) {
        if (sectionId.startsWith("gsa-")) {
            return "GSA";
        } else if (sectionId.startsWith("at-")) {
            return "ACADEMIC";
        } else if (sectionId.startsWith("track-")) {
            return "OTHER";
        } else if (sectionId.startsWith("interest-")) {
            return "INTEREST";
        }
        return "UNKNOWN";
    }
    
    /**
     * Create section result entities for detailed scoring
     */
    private void createSectionResultEntities(
            UserAssessmentEntity userAssessment, 
            Map<String, Map<String, Object>> sectionScores) {
        
        for (Map.Entry<String, Map<String, Object>> entry : sectionScores.entrySet()) {
            Map<String, Object> scoreDetails = entry.getValue();
            
            UserAssessmentSectionResultEntity sectionResult = new UserAssessmentSectionResultEntity();
            sectionResult.setUserAssessment(userAssessment);
            sectionResult.setSectionId((String) scoreDetails.get("sectionId"));
            sectionResult.setSectionName((String) scoreDetails.get("sectionName"));
            sectionResult.setSectionType((String) scoreDetails.get("sectionType"));
            sectionResult.setSectionScore((Double) scoreDetails.get("rawScore"));
            sectionResult.setCorrectAnswers((Integer) scoreDetails.get("correctAnswers"));
            sectionResult.setTotalQuestions((Integer) scoreDetails.get("totalQuestions"));
            sectionResult.setPercentageScore((Double) scoreDetails.get("percentageScore"));
            sectionResult.setDateComputed(LocalDateTime.now());
            
            sectionResultRepository.save(sectionResult);
        }
    }
    
    /**
     * Create overall assessment result with detailed subsection scores
     */
    private void createOverallAssessmentResult(
            UserAssessmentEntity userAssessment, 
            Map<String, Map<String, Object>> sectionScores,
            double overallScore) {
        
        // Initialize result entity
        AssessmentResultEntity result = new AssessmentResultEntity();
        result.setUserAssessment(userAssessment);
        result.setOverallScore(overallScore);
        result.setDateComputed(LocalDateTime.now());
        
        // Fix: Set normalized score - this field is required by the database
        result.setNormalizedScore(overallScore); // Set same as overall score or calculate if needed
        
        // Fix: Ensure all required numeric fields are initialized to prevent null values
        // Initialize all scores to 0.0 to prevent null database errors
        result.setGsaScore(0.0);
        result.setAcademicTrackScore(0.0);
        result.setOtherTrackScore(0.0);
        result.setInterestAreaScore(0.0);
        result.setScientificAbilityScore(0.0);
        result.setReadingComprehensionScore(0.0);
        result.setVerbalAbilityScore(0.0);
        result.setMathematicalAbilityScore(0.0);
        result.setLogicalReasoningScore(0.0);
        result.setStemScore(0.0);
        result.setAbmScore(0.0);
        result.setHumssScore(0.0);
        result.setTvlScore(0.0);
        result.setSportsTrackScore(0.0);
        result.setArtsDesignTrackScore(0.0);
        result.setRealisticScore(0.0);
        result.setInvestigativeScore(0.0);
        result.setArtisticScore(0.0);
        result.setSocialScore(0.0);
        result.setEnterprisingScore(0.0);
        result.setConventionalScore(0.0);
        
        // Map to hold scores by section ID for easy lookup
        Map<String, Double> scoreBySection = new HashMap<>();
        for (Map.Entry<String, Map<String, Object>> entry : sectionScores.entrySet()) {
            String sectionId = entry.getKey();
            double score = (double) entry.getValue().get("percentageScore");
            scoreBySection.put(sectionId, score);
        }
        
        // Set GSA scores
        double gsaTotal = 0;
        int gsaCount = 0;
        
        if (scoreBySection.containsKey("gsa-scientific")) {
            result.setScientificAbilityScore(scoreBySection.get("gsa-scientific"));
            gsaTotal += scoreBySection.get("gsa-scientific");
            gsaCount++;
        }
        
        if (scoreBySection.containsKey("gsa-reading")) {
            result.setReadingComprehensionScore(scoreBySection.get("gsa-reading"));
            gsaTotal += scoreBySection.get("gsa-reading");
            gsaCount++;
        }
        
        if (scoreBySection.containsKey("gsa-verbal")) {
            result.setVerbalAbilityScore(scoreBySection.get("gsa-verbal"));
            gsaTotal += scoreBySection.get("gsa-verbal");
            gsaCount++;
        }
        
        if (scoreBySection.containsKey("gsa-math")) {
            result.setMathematicalAbilityScore(scoreBySection.get("gsa-math"));
            gsaTotal += scoreBySection.get("gsa-math");
            gsaCount++;
        }
        
        if (scoreBySection.containsKey("gsa-logical")) {
            result.setLogicalReasoningScore(scoreBySection.get("gsa-logical"));
            gsaTotal += scoreBySection.get("gsa-logical");
            gsaCount++;
        }
        
        if (gsaCount > 0) {
            result.setGsaScore(gsaTotal / gsaCount);
        }
        
        // Set Academic Track scores
        double atTotal = 0;
        int atCount = 0;
        
        if (scoreBySection.containsKey("at-stem")) {
            result.setStemScore(scoreBySection.get("at-stem"));
            atTotal += scoreBySection.get("at-stem");
            atCount++;
        }
        
        if (scoreBySection.containsKey("at-abm")) {
            result.setAbmScore(scoreBySection.get("at-abm"));
            atTotal += scoreBySection.get("at-abm");
            atCount++;
        }
        
        if (scoreBySection.containsKey("at-humss")) {
            result.setHumssScore(scoreBySection.get("at-humss"));
            atTotal += scoreBySection.get("at-humss");
            atCount++;
        }
        
        if (atCount > 0) {
            result.setAcademicTrackScore(atTotal / atCount);
        }
        
        // Set Other Track scores
        double otTotal = 0;
        int otCount = 0;
        
        if (scoreBySection.containsKey("track-tech")) {
            result.setTvlScore(scoreBySection.get("track-tech"));
            otTotal += scoreBySection.get("track-tech");
            otCount++;
        }
        
        if (scoreBySection.containsKey("track-sports")) {
            result.setSportsTrackScore(scoreBySection.get("track-sports"));
            otTotal += scoreBySection.get("track-sports");
            otCount++;
        }
        
        if (scoreBySection.containsKey("track-arts")) {
            result.setArtsDesignTrackScore(scoreBySection.get("track-arts"));
            otTotal += scoreBySection.get("track-arts");
            otCount++;
        }
        
        if (otCount > 0) {
            result.setOtherTrackScore(otTotal / otCount);
        }
        
        // Extract RIASEC scores from interest sections
        Map<String, Integer> combinedRiasecAgreeResponses = new HashMap<>();
        
        // Collect all RIASEC agree responses from interest sections
        for (Map.Entry<String, Map<String, Object>> entry : sectionScores.entrySet()) {
            String sectionType = (String) entry.getValue().get("sectionType");
            if ("INTEREST".equals(sectionType)) {
                @SuppressWarnings("unchecked")
                Map<String, Integer> riasecAgreeResponses = 
                    (Map<String, Integer>) entry.getValue().get("riasecAgreeResponses");
                
                if (riasecAgreeResponses != null) {
                    // Combine counts from different sections
                    for (Map.Entry<String, Integer> countEntry : riasecAgreeResponses.entrySet()) {
                        String riasecType = countEntry.getKey();
                        Integer count = countEntry.getValue();
                        combinedRiasecAgreeResponses.put(riasecType, 
                            combinedRiasecAgreeResponses.getOrDefault(riasecType, 0) + count);
                    }
                }
            }
        }
        
        // Set RIASEC scores - each subsection score is simply the count of "agree" responses
        // (out of 7 possible statements for each RIASEC type)
        result.setRealisticScore((double) combinedRiasecAgreeResponses.getOrDefault("realistic", 0));
        result.setInvestigativeScore((double) combinedRiasecAgreeResponses.getOrDefault("investigative", 0));
        result.setArtisticScore((double) combinedRiasecAgreeResponses.getOrDefault("artistic", 0));
        result.setSocialScore((double) combinedRiasecAgreeResponses.getOrDefault("social", 0));
        result.setEnterprisingScore((double) combinedRiasecAgreeResponses.getOrDefault("enterprising", 0));
        result.setConventionalScore((double) combinedRiasecAgreeResponses.getOrDefault("conventional", 0));
        
        // Calculate total RIASEC score as a percentage of total possible points
        // (assuming 7 questions per type × 6 types = 42 total possible points)
        int totalAgreeCount = combinedRiasecAgreeResponses.values().stream().mapToInt(Integer::intValue).sum();
        double maxPossibleScore = 42.0; // 7 questions × 6 RIASEC types
        double riasecPercentageScore = (totalAgreeCount / maxPossibleScore) * 100;
        result.setInterestAreaScore(riasecPercentageScore);
        
        // Save the assessment result
        assessmentResultRepository.save(result);
    }
    
    /**
     * Get section results for a specific assessment
     */
    public List<UserAssessmentSectionResultEntity> getSectionResultsForAssessment(UserAssessmentEntity userAssessment) {
        return sectionResultRepository.findByUserAssessment(userAssessment);
    }
}
