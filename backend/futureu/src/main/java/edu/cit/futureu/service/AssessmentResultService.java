package edu.cit.futureu.service;

import edu.cit.futureu.entity.AssessmentResultEntity;
import edu.cit.futureu.entity.UserAssessmentEntity;
import edu.cit.futureu.repository.AssessmentResultRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class AssessmentResultService {

    @Autowired
    private AssessmentResultRepository assessmentResultRepository;

    /**
     * Get all assessment results (use with caution - can be memory intensive)
     * Consider using getAssessmentResultsPaginated for large datasets
     */
    @Transactional(readOnly = true)
    public List<AssessmentResultEntity> getAllAssessmentResults() {
        // Limit to prevent memory issues - return max 1000 results
        Pageable pageable = PageRequest.of(0, 1000);
        Page<AssessmentResultEntity> page = assessmentResultRepository.findAll(pageable);
        return page.getContent();
    }
    
    /**
     * Get paginated assessment results for better memory management
     */
    @Transactional(readOnly = true)
    public Page<AssessmentResultEntity> getAssessmentResultsPaginated(int page, int size) {
        Pageable pageable = PageRequest.of(page - 1, size); // Page is 0-indexed in Spring
        return assessmentResultRepository.findAll(pageable);
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