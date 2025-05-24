package edu.cit.futureu.service;

import edu.cit.futureu.entity.ProgramRecommendationEntity;
import edu.cit.futureu.entity.AssessmentResultEntity;
import edu.cit.futureu.entity.ProgramEntity;
import edu.cit.futureu.repository.ProgramRecommendationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class ProgramRecommendationService {
    @Autowired
    private ProgramRecommendationRepository programRecommendationRepository;

    public ProgramRecommendationEntity create(ProgramRecommendationEntity entity) {
        return programRecommendationRepository.save(entity);
    }

    public List<ProgramRecommendationEntity> getByAssessmentResult(AssessmentResultEntity assessmentResult) {
        return programRecommendationRepository.findByAssessmentResult(assessmentResult);
    }

    public List<ProgramRecommendationEntity> getByProgram(ProgramEntity program) {
        return programRecommendationRepository.findByProgram(program);
    }

    public Optional<ProgramRecommendationEntity> getById(int id) {
        return programRecommendationRepository.findById(id);
    }

    public void delete(int id) {
        programRecommendationRepository.deleteById(id);
    }

    /**
     * Create and save a ProgramRecommendationEntity from AI program map, assessment result, and program entity.
     */
    public ProgramRecommendationEntity createFromAI(Map<String, Object> progMap, AssessmentResultEntity assessmentResult, ProgramEntity programEntity) {
        System.out.println("ProgramRecommendationService.createFromAI - progMap: " + progMap);
        ProgramRecommendationEntity pre = new ProgramRecommendationEntity();
        pre.setAssessmentResult(assessmentResult);
        pre.setProgram(programEntity);
        // Improved fallback logic for explanation
        String explanation = null;
        if (progMap.containsKey("explanation") && progMap.get("explanation") != null) {
            explanation = progMap.get("explanation").toString();
        } else if (progMap.containsKey("description") && progMap.get("description") != null) {
            explanation = progMap.get("description").toString();
        } else {
            explanation = "No explanation provided by AI.";
        }
        pre.setExplanation(explanation);
        // Improved fallback logic for confidenceScore
        Double confidence = null;
        if (progMap.containsKey("confidenceScore") && progMap.get("confidenceScore") != null) {
            try {
                confidence = Double.parseDouble(progMap.get("confidenceScore").toString());
            } catch (Exception e) {
                System.out.println("Could not parse confidenceScore: " + progMap.get("confidenceScore"));
            }
        }
        pre.setConfidenceScore(confidence);
        return programRecommendationRepository.save(pre);
    }
}
