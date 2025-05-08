package edu.cit.futureu.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import edu.cit.futureu.entity.RecommendationEntity;
import edu.cit.futureu.entity.AssessmentResultEntity;
import edu.cit.futureu.repository.RecommendationRepository;

@Service
public class RecommendationService {

    @Autowired
    private RecommendationRepository recommendationRepository;

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
}