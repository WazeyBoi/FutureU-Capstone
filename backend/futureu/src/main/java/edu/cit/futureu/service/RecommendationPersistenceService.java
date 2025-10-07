package edu.cit.futureu.service;

import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import edu.cit.futureu.entity.AssessmentResultEntity;
import edu.cit.futureu.entity.CareerEntity;
import edu.cit.futureu.entity.CareerPathEntity;
import edu.cit.futureu.entity.CareerPathRecommendationEntity;
import edu.cit.futureu.entity.CareerRecommendationDetailEntity;
import edu.cit.futureu.entity.DreamCareerInsightEntity;
import edu.cit.futureu.entity.ProgramEntity;
import edu.cit.futureu.entity.ProgramRecommendationDetailEntity;
import edu.cit.futureu.recommendation.AdvancedRecommendationResponse;
import edu.cit.futureu.recommendation.CareerPathRecommendation;
import edu.cit.futureu.recommendation.CareerRecommendationDetail;
import edu.cit.futureu.recommendation.DreamCareerInsight;
import edu.cit.futureu.recommendation.ProgramRecommendationDetail;
import edu.cit.futureu.recommendation.RecommendationScore;
import edu.cit.futureu.repository.CareerPathRecommendationRepository;
import edu.cit.futureu.repository.CareerPathRepository;
import edu.cit.futureu.repository.CareerRepository;
import edu.cit.futureu.repository.DreamCareerInsightRepository;
import edu.cit.futureu.repository.ProgramRepository;

@Service
public class RecommendationPersistenceService {

    private static final Logger logger = LoggerFactory.getLogger(RecommendationPersistenceService.class);

    @Autowired
    private CareerPathRecommendationRepository careerPathRecommendationRepository;

    @Autowired
    private DreamCareerInsightRepository dreamCareerInsightRepository;

    @Autowired
    private CareerPathRepository careerPathRepository;

    @Autowired
    private CareerRepository careerRepository;

    @Autowired
    private ProgramRepository programRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Persist the complete recommendation response to the database
     */
    @Transactional
    public void persistRecommendations(AssessmentResultEntity assessmentResult, 
                                     AdvancedRecommendationResponse response) {
        
        logger.debug("Starting persistence for assessment result: {}", assessmentResult.getResultId());
        
        // For career path recommendations, we'll clear and recreate since they can have multiple entries
        logger.debug("Clearing existing career path recommendations...");
        careerPathRecommendationRepository.deleteByAssessmentResult(assessmentResult);
        
        // Persist career path recommendations
        persistCareerPathRecommendations(assessmentResult, response.getCareerPaths());

        // For dream career insight, we'll upsert (handled in the method)
        if (response.getDreamCareerInsight() != null) {
            persistDreamCareerInsight(assessmentResult, response.getDreamCareerInsight());
        }

        logger.info("Successfully persisted recommendations for assessment result: {}", 
                   assessmentResult.getResultId());
    }

    private void persistCareerPathRecommendations(AssessmentResultEntity assessmentResult,
                                                List<CareerPathRecommendation> recommendations) {
        
        for (CareerPathRecommendation recommendation : recommendations) {
            CareerPathRecommendationEntity entity = new CareerPathRecommendationEntity();
            entity.setAssessmentResult(assessmentResult);
            
            // Find and set career path
            CareerPathEntity careerPath = careerPathRepository.findById(recommendation.getCareerPathId())
                .orElse(null);
            if (careerPath == null) {
                logger.warn("Career path not found with ID: {}", recommendation.getCareerPathId());
                continue;
            }
            entity.setCareerPath(careerPath);
            
            entity.setMatchPercentage(recommendation.getMatchPercentage());
            entity.setRecommendationType("STRUCTURED");
            
            // Set AI-generated summary if available
            if (recommendation.getSummary() != null) {
                entity.setSummary(recommendation.getSummary());
            }
            
            // Set component scores
            if (recommendation.getComponentBreakdown() != null) {
                Map<String, Double> breakdown = recommendation.getComponentBreakdown();
                entity.setRiasecScore(breakdown.get("riasec"));
                entity.setAptitudeScore(breakdown.get("aptitude"));
                entity.setSkillScore(breakdown.get("skills"));
                entity.setContextScore(breakdown.get("context"));
            }

            // Save the main recommendation first
            entity = careerPathRecommendationRepository.save(entity);

            // Persist career details
            persistCareerDetails(entity, recommendation.getCareers());

            // Persist program details
            persistProgramDetails(entity, recommendation.getPrograms());
        }
    }

    private void persistCareerDetails(CareerPathRecommendationEntity pathRecommendation,
                                    List<CareerRecommendationDetail> careerDetails) {
        
        int ranking = 1;
        for (CareerRecommendationDetail detail : careerDetails) {
            CareerRecommendationDetailEntity entity = new CareerRecommendationDetailEntity();
            entity.setCareerPathRecommendation(pathRecommendation);
            
            // Find and set career
            CareerEntity career = careerRepository.findById(detail.getCareerId()).orElse(null);
            if (career == null) {
                logger.warn("Career not found with ID: {}", detail.getCareerId());
                continue;
            }
            entity.setCareer(career);
            
            entity.setMatchPercentage(detail.getMatchPercentage());
            entity.setSummary(detail.getSummary());
            entity.setRanking(ranking++);
            
            pathRecommendation.getCareerDetails().add(entity);
        }
    }

    private void persistProgramDetails(CareerPathRecommendationEntity pathRecommendation,
                                     List<ProgramRecommendationDetail> programDetails) {
        
        int ranking = 1;
        for (ProgramRecommendationDetail detail : programDetails) {
            ProgramRecommendationDetailEntity entity = new ProgramRecommendationDetailEntity();
            entity.setCareerPathRecommendation(pathRecommendation);
            
            // Find and set program
            ProgramEntity program = programRepository.findById(detail.getProgramId()).orElse(null);
            if (program == null) {
                logger.warn("Program not found with ID: {}", detail.getProgramId());
                continue;
            }
            entity.setProgram(program);
            
            entity.setMatchPercentage(detail.getMatchPercentage());
            entity.setSummary(detail.getSummary());
            entity.setRanking(ranking++);
            
            // Serialize recommended schools to JSON
            if (detail.getRecommendedSchools() != null && !detail.getRecommendedSchools().isEmpty()) {
                try {
                    String schoolsJson = objectMapper.writeValueAsString(detail.getRecommendedSchools());
                    entity.setRecommendedSchoolsJson(schoolsJson);
                } catch (JsonProcessingException e) {
                    logger.warn("Failed to serialize recommended schools for program {}: {}", 
                               detail.getProgramId(), e.getMessage());
                }
            }
            
            pathRecommendation.getProgramDetails().add(entity);
        }
    }

    @Transactional
    private void persistDreamCareerInsight(AssessmentResultEntity assessmentResult,
                                         DreamCareerInsight insight) {
        
        logger.debug("Persisting dream career insight for assessment result: {}", assessmentResult.getResultId());
        
        try {
            // First, try to delete any existing insight to avoid unique constraint violation
            dreamCareerInsightRepository.deleteByAssessmentResult(assessmentResult);
            // Force the delete to be executed immediately
            dreamCareerInsightRepository.flush();
            logger.debug("Cleared any existing dream career insight for assessment result: {}", assessmentResult.getResultId());
            
            // Create new entity
            DreamCareerInsightEntity entity = new DreamCareerInsightEntity();
            entity.setAssessmentResult(assessmentResult);
            logger.debug("Creating new dream career insight for assessment result: {}", assessmentResult.getResultId());
            
            entity.setDreamCareer(insight.getDreamCareer());
            entity.setClosenessScore(insight.getClosenessScore());
            
            // New comprehensive AI analysis fields
            entity.setFieldAlignment(insight.getFieldAlignment());
            entity.setStrengthsAlignment(insight.getStrengthsAlignment());
            entity.setMisalignmentInsights(insight.getMisalignmentInsights());
            entity.setPersonalizedFocusAreas(insight.getPersonalizedFocusAreas());
            entity.setEncouragement(insight.getEncouragement());
            
            // Legacy fields - keep for backward compatibility
            entity.setGuidance(insight.getGuidance());
            
            // Serialize gap maps to JSON
            try {
                if (insight.getRiasecGap() != null) {
                    entity.setRiasecGap(objectMapper.writeValueAsString(insight.getRiasecGap()));
                }
                if (insight.getAptitudeGap() != null) {
                    entity.setAptitudeGap(objectMapper.writeValueAsString(insight.getAptitudeGap()));
                }
            } catch (JsonProcessingException e) {
                logger.warn("Failed to serialize gap data for dream career insight: {}", e.getMessage());
            }
            
            DreamCareerInsightEntity saved = dreamCareerInsightRepository.save(entity);
            logger.debug("Successfully saved dream career insight with ID: {}", saved.getId());
            
        } catch (Exception e) {
            logger.error("Failed to persist dream career insight for assessment result {}: {}", 
                        assessmentResult.getResultId(), e.getMessage(), e);
            // Don't throw - we want the rest of the recommendations to persist even if this fails
        }
    }

    /**
     * Check if recommendations already exist for an assessment result
     */
    @Transactional(readOnly = true)
    public boolean hasPersistedRecommendations(AssessmentResultEntity assessmentResult) {
        // Check if career path recommendations exist
        List<CareerPathRecommendationEntity> pathRecommendations = 
            careerPathRecommendationRepository.findByAssessmentResult(assessmentResult);
        return !pathRecommendations.isEmpty();
    }

    /**
     * Retrieve persisted recommendations for an assessment result
     */
    @Transactional(readOnly = true)
    public AdvancedRecommendationResponse getPersistedRecommendations(AssessmentResultEntity assessmentResult) {
        AdvancedRecommendationResponse response = new AdvancedRecommendationResponse();
        response.setAssessmentResultId(assessmentResult.getResultId());
        
        // Load career path recommendations
        List<CareerPathRecommendationEntity> pathRecommendations = 
            careerPathRecommendationRepository.findByAssessmentResultOrderByMatchPercentageDesc(assessmentResult);
        
        for (CareerPathRecommendationEntity pathEntity : pathRecommendations) {
            CareerPathRecommendation pathRec = convertToCareerPathRecommendation(pathEntity);
            response.getCareerPaths().add(pathRec);
        }
        
        // Load dream career insight
        dreamCareerInsightRepository.findByAssessmentResult(assessmentResult)
            .ifPresent(insight -> response.setDreamCareerInsight(convertToDreamCareerInsight(insight)));
        
        return response;
    }

    private CareerPathRecommendation convertToCareerPathRecommendation(CareerPathRecommendationEntity entity) {
        // Create a mock RecommendationScore for the conversion
        RecommendationScore score = new RecommendationScore(
            entity.getMatchPercentage(),
            entity.getRiasecScore() != null ? entity.getRiasecScore() : 0.0,
            entity.getAptitudeScore() != null ? entity.getAptitudeScore() : 0.0,
            entity.getSkillScore() != null ? entity.getSkillScore() : 0.0,
            entity.getContextScore() != null ? entity.getContextScore() : 0.0
        );
        
        CareerPathRecommendation recommendation = CareerPathRecommendation.from(
            entity.getCareerPath(), entity.getMatchPercentage(), score);
        
        // Set the AI-generated summary if available
        if (entity.getSummary() != null) {
            recommendation.setSummary(entity.getSummary());
        }
        
        // Convert career details
        for (CareerRecommendationDetailEntity careerEntity : entity.getCareerDetails()) {
            CareerRecommendationDetail careerDetail = CareerRecommendationDetail.from(
                careerEntity.getCareer(), careerEntity.getMatchPercentage(), careerEntity.getSummary());
            recommendation.addCareer(careerDetail);
        }
        
        // Convert program details
        for (ProgramRecommendationDetailEntity programEntity : entity.getProgramDetails()) {
            // Deserialize schools if present
            List<Map<String, Object>> schools = null;
            if (programEntity.getRecommendedSchoolsJson() != null) {
                try {
                    @SuppressWarnings("unchecked")
                    List<Map<String, Object>> schoolsList = objectMapper.readValue(
                        programEntity.getRecommendedSchoolsJson(), List.class);
                    schools = schoolsList;
                } catch (JsonProcessingException e) {
                    logger.warn("Failed to deserialize recommended schools: {}", e.getMessage());
                }
            }
            
            ProgramRecommendationDetail programDetail = ProgramRecommendationDetail.from(
                programEntity.getProgram(), programEntity.getMatchPercentage(), 
                programEntity.getSummary(), schools);
            recommendation.addProgram(programDetail);
        }
        
        return recommendation;
    }

    private DreamCareerInsight convertToDreamCareerInsight(DreamCareerInsightEntity entity) {
        DreamCareerInsight insight = new DreamCareerInsight();
        insight.setDreamCareer(entity.getDreamCareer());
        insight.setClosenessScore(entity.getClosenessScore());
        
        // New comprehensive AI analysis fields
        insight.setFieldAlignment(entity.getFieldAlignment());
        insight.setStrengthsAlignment(entity.getStrengthsAlignment());
        insight.setMisalignmentInsights(entity.getMisalignmentInsights());
        insight.setPersonalizedFocusAreas(entity.getPersonalizedFocusAreas());
        insight.setEncouragement(entity.getEncouragement());
        
        // Legacy fields - keep for backward compatibility
        insight.setGuidance(entity.getGuidance());
        
        // Deserialize gap maps
        try {
            if (entity.getRiasecGap() != null) {
                @SuppressWarnings("unchecked")
                Map<String, Double> riasecGapMap = objectMapper.readValue(entity.getRiasecGap(), Map.class);
                insight.setRiasecGap(riasecGapMap);
            }
            if (entity.getAptitudeGap() != null) {
                @SuppressWarnings("unchecked")
                Map<String, Double> aptitudeGapMap = objectMapper.readValue(entity.getAptitudeGap(), Map.class);
                insight.setAptitudeGap(aptitudeGapMap);
            }
        } catch (JsonProcessingException e) {
            logger.warn("Failed to deserialize gap data: {}", e.getMessage());
        }
        
        return insight;
    }
}