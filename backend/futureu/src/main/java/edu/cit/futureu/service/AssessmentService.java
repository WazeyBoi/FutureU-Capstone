package edu.cit.futureu.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import edu.cit.futureu.entity.AssessmentEntity;
import edu.cit.futureu.entity.UserAssessmentEntity;
import edu.cit.futureu.repository.AssessmentRepository;
import edu.cit.futureu.repository.UserAssessmentRepository;

@Service
public class AssessmentService {

    @Autowired
    private AssessmentRepository assessmentRepository;

    @Autowired
    private UserAssessmentRepository userAssessmentRepository;

    public AssessmentEntity createAssessment(AssessmentEntity assessment) {
        return assessmentRepository.save(assessment);
    }

    public List<AssessmentEntity> getAllAssessments() {
        return assessmentRepository.findAll();
    }

    public Optional<AssessmentEntity> getAssessmentById(int id) {
        return assessmentRepository.findById(id);
    }

    public List<AssessmentEntity> searchAssessmentsByTitle(String title) {
        return assessmentRepository.findByTitleContainingIgnoreCase(title);
    }

    public List<AssessmentEntity> filterAssessmentsByType(String type) {
        return assessmentRepository.findByType(type);
    }

    public List<AssessmentEntity> filterAssessmentsByStatus(String status) {
        return assessmentRepository.findByStatus(status);
    }

    public AssessmentEntity updateAssessment(AssessmentEntity assessment) {
        if (assessmentRepository.existsById(assessment.getAssessmentId())) {
            return assessmentRepository.save(assessment);
        }
        return null;
    }

    public boolean deleteAssessment(int id) {
        if (assessmentRepository.existsById(id)) {
            assessmentRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public Optional<UserAssessmentEntity> getUserAssessmentById(int userAssessmentId) {
        return userAssessmentRepository.findById(userAssessmentId);
    }
}