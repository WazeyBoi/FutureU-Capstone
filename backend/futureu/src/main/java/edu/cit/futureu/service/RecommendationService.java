package edu.cit.futureu.service;

import java.util.Map;
import java.util.Optional;
import java.util.List;
import java.util.ArrayList;
import java.util.HashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import edu.cit.futureu.entity.RecommendationEntity;
import edu.cit.futureu.entity.AssessmentResultEntity;
import edu.cit.futureu.entity.UserAssessmentSectionResultEntity;
import edu.cit.futureu.repository.RecommendationRepository;
import edu.cit.futureu.service.CareerService;

@Service
public class RecommendationService {

    @Autowired
    private RecommendationRepository recommendationRepository;
    
    @Autowired
    private UserAssessmentService userAssessmentService;
    
    @Autowired
    private GeminiAIService geminiAIService;

    @Autowired
    private CareerService careerService;

    public RecommendationEntity createRecommendation(RecommendationEntity recommendation) {
        return recommendationRepository.save(recommendation);
    }

    public Optional<RecommendationEntity> getRecommendationById(int id) {
        return recommendationRepository.findById(id);
    }

    /**
     * Get a single recommendation by assessment result
     * @deprecated Use getRecommendationsByAssessmentResult instead as multiple recommendations may exist
     */
    @Deprecated
    public RecommendationEntity getRecommendationByAssessmentResult(AssessmentResultEntity assessmentResult) {
        List<RecommendationEntity> recommendations = recommendationRepository.findAllByAssessmentResult(assessmentResult);
        return recommendations.isEmpty() ? null : recommendations.get(0);
    }

    /**
     * Get all recommendations for an assessment result
     */
    public List<RecommendationEntity> getRecommendationsByAssessmentResult(AssessmentResultEntity assessmentResult) {
        return recommendationRepository.findAllByAssessmentResult(assessmentResult);
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
    public List<RecommendationEntity> generateAndSaveRecommendations(AssessmentResultEntity assessmentResult) {
        // Check if recommendations already exist
        List<RecommendationEntity> existingRecommendations = 
            recommendationRepository.findAllByAssessmentResult(assessmentResult);
        if (!existingRecommendations.isEmpty()) {
            return existingRecommendations;
        }

        // Get section results for this assessment
        List<UserAssessmentSectionResultEntity> sectionResults = 
            userAssessmentService.getSectionResultsForAssessment(assessmentResult.getUserAssessment());

        // Generate AI recommendations
        Map<String, Object> aiRecommendations = 
            geminiAIService.generateCareerRecommendations(assessmentResult, sectionResults);

        // Safely cast suggestedCareers to the expected type
        Object suggestedCareersObj = aiRecommendations.get("suggestedCareers");
        List<Map<String, Object>> suggestedCareers = new ArrayList<>();
        if (suggestedCareersObj instanceof List<?>) {
            for (Object item : (List<?>) suggestedCareersObj) {
                if (item instanceof Map<?, ?>) {
                    Map<?, ?> rawMap = (Map<?, ?>) item;
                    Map<String, Object> typedMap = new HashMap<>();
                    for (Map.Entry<?, ?> entry : rawMap.entrySet()) {
                        if (entry.getKey() instanceof String) {
                            typedMap.put((String) entry.getKey(), entry.getValue());
                        }
                    }
                    suggestedCareers.add(typedMap);
                }
            }
        }

        // Create and save recommendations for all suggested careers
        List<RecommendationEntity> recommendations = new ArrayList<>();
        for (Map<String, Object> careerMap : suggestedCareers) {
            RecommendationEntity recommendation = new RecommendationEntity();
            recommendation.setAssessmentResult(assessmentResult);

            // Set careerPath if careerId is available
            if (careerMap.containsKey("careerId")) {
                try {
                    int careerId = Integer.parseInt(careerMap.get("careerId").toString());
                    careerService.getCareerById(careerId).ifPresent(recommendation::setCareerPath);
                } catch (Exception e) {
                    // Ignore and leave careerPath null if not found
                }
            }

            // Set confidence score if available
            if (careerMap.containsKey("confidenceScore")) {
                recommendation.setConfidenceScore(Double.parseDouble(careerMap.get("confidenceScore").toString()));
            } else {
                recommendation.setConfidenceScore(75.0); // Default confidence score
            }

            // Set description if available
            if (careerMap.containsKey("description")) {
                recommendation.setDescription(careerMap.get("description").toString());
            } else {
                recommendation.setDescription("No description provided.");
            }

            // Save recommendation
            recommendations.add(recommendationRepository.save(recommendation));
        }

        return recommendations;
    }
}