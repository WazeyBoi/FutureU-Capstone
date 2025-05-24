package edu.cit.futureu.service;

import java.util.Map;
import java.util.Optional;
import java.util.List;
import java.util.ArrayList;
import java.util.HashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import edu.cit.futureu.entity.CareerRecommendationEntity;
import edu.cit.futureu.entity.AssessmentResultEntity;
import edu.cit.futureu.entity.UserAssessmentSectionResultEntity;
import edu.cit.futureu.repository.CareerRecommendationRepository;

@Service
public class CareerRecommendationService {

    @Autowired
    private CareerRecommendationRepository recommendationRepository;
    
    @Autowired
    private UserAssessmentService userAssessmentService;
    
    @Autowired
    private GeminiAIService geminiAIService;
    
    @Autowired
    private CareerService careerService;
    
    @Autowired
    private ProgramService programService;
    
    @Autowired
    private ProgramRecommendationService programRecommendationService;

    public CareerRecommendationEntity createRecommendation(CareerRecommendationEntity recommendation) {
        return recommendationRepository.save(recommendation);
    }

    public Optional<CareerRecommendationEntity> getRecommendationById(int id) {
        return recommendationRepository.findById(id);
    }

    /**
     * Get a single recommendation by assessment result
     * @deprecated Use getRecommendationsByAssessmentResult instead as multiple recommendations may exist
     */
    @Deprecated
    public CareerRecommendationEntity getRecommendationByAssessmentResult(AssessmentResultEntity assessmentResult) {
        List<CareerRecommendationEntity> recommendations = recommendationRepository.findAllByAssessmentResult(assessmentResult);
        return recommendations.isEmpty() ? null : recommendations.get(0);
    }

    /**
     * Get all recommendations for an assessment result
     */
    public List<CareerRecommendationEntity> getRecommendationsByAssessmentResult(AssessmentResultEntity assessmentResult) {
        return recommendationRepository.findAllByAssessmentResult(assessmentResult);
    }

    public CareerRecommendationEntity updateRecommendation(CareerRecommendationEntity recommendation) {
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
    public List<CareerRecommendationEntity> generateAndSaveRecommendations(AssessmentResultEntity assessmentResult) {
        // Check if recommendations already exist
        List<CareerRecommendationEntity> existingRecommendations = 
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
        List<CareerRecommendationEntity> recommendations = new ArrayList<>();
        for (Map<String, Object> careerMap : suggestedCareers) {
            CareerRecommendationEntity recommendation = new CareerRecommendationEntity();
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

        // Insert top 5 programs into ProgramRecommendationEntity
        if (aiRecommendations.containsKey("topPrograms")) {
            Object topProgramsObj = aiRecommendations.get("topPrograms");
            if (topProgramsObj instanceof List<?>) {
                for (Object prog : (List<?>) topProgramsObj) {
                    if (prog instanceof Map<?, ?>) {
                        Map<?, ?> progMap = (Map<?, ?>) prog;
                        // Convert to Map<String, Object> for type safety
                        Map<String, Object> progMapString = new HashMap<>();
                        for (Map.Entry<?, ?> entry : progMap.entrySet()) {
                            if (entry.getKey() instanceof String) {
                                progMapString.put((String) entry.getKey(), entry.getValue());
                            }
                        }
                        if (progMapString.containsKey("programId")) {
                            try {
                                int programId = Integer.parseInt(progMapString.get("programId").toString());
                                programService.getProgramById(programId).ifPresent(programEntity -> {
                                    programRecommendationService.createFromAI(progMapString, assessmentResult, programEntity);
                                });
                            } catch (Exception e) {
                                // Ignore invalid programId
                            }
                        }
                    }
                }
            }
        }

        return recommendations;
    }
}