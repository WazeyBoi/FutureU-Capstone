package edu.cit.futureu.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import edu.cit.futureu.entity.AssessmentResultEntity;
import edu.cit.futureu.entity.CareerRecommendationEntity;
import edu.cit.futureu.recommendation.AdvancedRecommendationResponse;
import edu.cit.futureu.recommendation.CareerPathRecommendation;
import edu.cit.futureu.recommendation.CareerRecommendationDetail;
import edu.cit.futureu.recommendation.ProgramRecommendationDetail;
import edu.cit.futureu.recommendation.StructuredRecommendationService;
import edu.cit.futureu.repository.CareerRecommendationRepository;

@Service
public class CareerRecommendationService {

    @Autowired
    private CareerRecommendationRepository recommendationRepository;
    
    @Autowired
    private CareerService careerService;
    
    @Autowired
    private ProgramService programService;
    
    @Autowired
    private ProgramRecommendationService programRecommendationService;

    @Autowired
    private StructuredRecommendationService structuredRecommendationService;

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
     * Generate and persist structured career and program recommendations using the deterministic engine.
     */
    public List<CareerRecommendationEntity> generateAndSaveRecommendations(AssessmentResultEntity assessmentResult) {
        // Check if recommendations already exist
        List<CareerRecommendationEntity> existingRecommendations = 
            recommendationRepository.findAllByAssessmentResult(assessmentResult);
        if (!existingRecommendations.isEmpty()) {
            return existingRecommendations;
        }

        AdvancedRecommendationResponse structured =
            structuredRecommendationService.generate(assessmentResult.getUserAssessment());

        List<CareerRecommendationEntity> recommendations = new ArrayList<>();
        if (structured.getCareerPaths() == null) {
            return recommendations;
        }
        for (CareerPathRecommendation pathRecommendation : structured.getCareerPaths()) {
            for (CareerRecommendationDetail detail : pathRecommendation.getCareers()) {
                careerService.getCareerById(detail.getCareerId()).ifPresent(careerEntity -> {
                    CareerRecommendationEntity recommendation = new CareerRecommendationEntity();
                    recommendation.setAssessmentResult(assessmentResult);
                    recommendation.setCareerPath(careerEntity);
                    recommendation.setConfidenceScore(detail.getMatchPercentage());
                    recommendation.setDescription(detail.getSummary());
                    recommendations.add(recommendationRepository.save(recommendation));
                });
            }
            for (ProgramRecommendationDetail programDetail : pathRecommendation.getPrograms()) {
                programService.getProgramById(programDetail.getProgramId()).ifPresent(programEntity ->
                    programRecommendationService.createOrUpdateStructured(
                        assessmentResult,
                        programEntity,
                        programDetail.getMatchPercentage(),
                        programDetail.getSummary()
                    )
                );
            }
        }

        return recommendations;
    }

    public List<CareerRecommendationEntity> getAllCareerRecommendations() {
        List<CareerRecommendationEntity> recommendations = new ArrayList<>();
        recommendationRepository.findAll().forEach(recommendations::add);
        return recommendations;
    }
}