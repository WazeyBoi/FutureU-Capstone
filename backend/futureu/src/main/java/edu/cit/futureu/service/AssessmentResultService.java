package edu.cit.futureu.service;

import edu.cit.futureu.entity.AssessmentResultEntity;
import edu.cit.futureu.entity.UserAssessmentEntity;
import edu.cit.futureu.repository.AssessmentResultRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AssessmentResultService {

    @Autowired
    private AssessmentResultRepository assessmentResultRepository;

    /**
     * Get all assessment results
     */
    public List<AssessmentResultEntity> getAllAssessmentResults() {
        return assessmentResultRepository.findAll();
    }

    /**
     * Get assessment result by ID
     */
    public Optional<AssessmentResultEntity> getAssessmentResultById(int id) {
        return assessmentResultRepository.findById(id);
    }

    /**
     * Get assessment result by user assessment
     */
    public Optional<AssessmentResultEntity> getAssessmentResultByUserAssessment(UserAssessmentEntity userAssessment) {
        return assessmentResultRepository.findByUserAssessment(userAssessment);
    }

    /**
     * Create or update an assessment result
     */
    public AssessmentResultEntity saveAssessmentResult(AssessmentResultEntity result) {
        return assessmentResultRepository.save(result);
    }

    /**
     * Delete an assessment result
     */
    public boolean deleteAssessmentResult(int id) {
        if (assessmentResultRepository.existsById(id)) {
            assessmentResultRepository.deleteById(id);
            return true;
        }
        return false;
    }
}