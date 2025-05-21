package edu.cit.futureu.service;

import java.util.Map;
import java.util.Optional;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import edu.cit.futureu.entity.RecommendationEntity;
import edu.cit.futureu.entity.AssessmentResultEntity;
import edu.cit.futureu.entity.UserAssessmentSectionResultEntity;
import edu.cit.futureu.repository.RecommendationRepository;

@Service
public class RecommendationService {

    @Autowired
    private RecommendationRepository recommendationRepository;
    
    @Autowired
    private UserAssessmentService userAssessmentService;
    
    @Autowired
    private GeminiAIService geminiAIService;

    public RecommendationEntity createRecommendation(RecommendationEntity recommendation) {
        return recommendationRepository.save(recommendation);
    }

    public Optional<RecommendationEntity> getRecommendationById(int id) {
        return recommendationRepository.findById(id);
    }

    public RecommendationEntity getRecommendationByAssessmentResult(AssessmentResultEntity assessmentResult) {
        return recommendationRepository.findByAssessmentResult(assessmentResult);
    }

    public RecommendationEntity updateRecommendation(RecommendationEntity recommendation) {
        if (recommendationRepository.existsById(recommendation.getRecommendationId())) {
            return recommendationRepository.save(recommendation);
        }
        return null;
    }

    public boolean deleteRecommendation(int id) {
        if (recommendationRepository.existsById(id)) {
            recommendationRepository.deleteById(id);
            return true;
        }
        return false;
    }
    
    /**
     * Generate and save AI-powered program recommendations
     */
    public RecommendationEntity generateAndSaveRecommendations(AssessmentResultEntity assessmentResult) {
        // Check if recommendation already exists
        RecommendationEntity existingRecommendation = recommendationRepository.findByAssessmentResult(assessmentResult);
        if (existingRecommendation != null) {
            return existingRecommendation;
        }
        
        // Get section results for this assessment
        List<UserAssessmentSectionResultEntity> sectionResults = 
            userAssessmentService.getSectionResultsForAssessment(assessmentResult.getUserAssessment());
        
        // Generate AI recommendations
        Map<String, Object> aiRecommendations = 
            geminiAIService.generateProgramRecommendations(assessmentResult, sectionResults);
        
        // Create a new recommendation entity
        RecommendationEntity recommendation = new RecommendationEntity();
        recommendation.setAssessmentResult(assessmentResult);
        
        // Extract the top suggested program if available
        List<Map<String, Object>> suggestedPrograms = 
            (List<Map<String, Object>>) aiRecommendations.get("suggestedPrograms");
        
        if (suggestedPrograms != null && !suggestedPrograms.isEmpty()) {
            Map<String, Object> topProgram = suggestedPrograms.get(0);
            recommendation.setSuggestedProgram(topProgram.get("name").toString());
            
            // Set confidence score if available
            if (topProgram.containsKey("confidenceScore")) {
                recommendation.setConfidenceScore(Double.parseDouble(topProgram.get("confidenceScore").toString()));
            } else if (aiRecommendations.containsKey("confidenceScore")) {
                recommendation.setConfidenceScore(Double.parseDouble(aiRecommendations.get("confidenceScore").toString()));
            } else {
                recommendation.setConfidenceScore(75.0); // Default confidence score
            }
        } else {
            recommendation.setSuggestedProgram("No specific program recommendation available");
            recommendation.setConfidenceScore(0.0);
        }
        
        // Save and return the recommendation
        return recommendationRepository.save(recommendation);
    }
}