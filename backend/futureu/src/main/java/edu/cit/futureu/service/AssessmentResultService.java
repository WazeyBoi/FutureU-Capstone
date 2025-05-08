package edu.cit.futureu.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import edu.cit.futureu.entity.AssessmentResultEntity;
import edu.cit.futureu.entity.UserAssessmentEntity;
import edu.cit.futureu.repository.AssessmentResultRepository;

@Service
public class AssessmentResultService {

    @Autowired
    private AssessmentResultRepository assessmentResultRepository;

    public AssessmentResultEntity createAssessmentResult(AssessmentResultEntity result) {
        return assessmentResultRepository.save(result);
    }

    public List<AssessmentResultEntity> getAllAssessmentResults() {
        return assessmentResultRepository.findAll();
    }

    public Optional<AssessmentResultEntity> getAssessmentResultById(int id) {
        return assessmentResultRepository.findById(id);
    }

    public List<AssessmentResultEntity> getAssessmentResultsByUserAssessment(UserAssessmentEntity userAssessment) {
        return assessmentResultRepository.findByUserAssessment(userAssessment);
    }

    public AssessmentResultEntity updateAssessmentResult(AssessmentResultEntity result) {
        if (assessmentResultRepository.existsById(result.getResultId())) {
            return assessmentResultRepository.save(result);
        }
        return null;
    }

    public boolean deleteAssessmentResult(int id) {
        if (assessmentResultRepository.existsById(id)) {
            assessmentResultRepository.deleteById(id);
            return true;
        }
        return false;
    }
}