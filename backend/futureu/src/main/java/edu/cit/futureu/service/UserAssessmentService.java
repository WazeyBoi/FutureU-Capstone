package edu.cit.futureu.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import edu.cit.futureu.entity.UserAssessmentEntity;
import edu.cit.futureu.entity.UserEntity;
import edu.cit.futureu.entity.AssessmentEntity;
import edu.cit.futureu.repository.UserAssessmentRepository;

@Service
public class UserAssessmentService {

    @Autowired
    private UserAssessmentRepository userAssessmentRepository;

    public UserAssessmentEntity createUserAssessment(UserAssessmentEntity userAssessment) {
        return userAssessmentRepository.save(userAssessment);
    }

    public List<UserAssessmentEntity> getAllUserAssessments() {
        return userAssessmentRepository.findAll();
    }

    public Optional<UserAssessmentEntity> getUserAssessmentById(int id) {
        return userAssessmentRepository.findById(id);
    }

    public List<UserAssessmentEntity> getUserAssessmentsByUser(UserEntity user) {
        return userAssessmentRepository.findByUser(user);
    }

    public List<UserAssessmentEntity> getUserAssessmentsByAssessment(AssessmentEntity assessment) {
        return userAssessmentRepository.findByAssessment(assessment);
    }

    public UserAssessmentEntity updateUserAssessment(UserAssessmentEntity userAssessment) {
        if (userAssessmentRepository.existsById(userAssessment.getUserQuizAssessment())) {
            return userAssessmentRepository.save(userAssessment);
        }
        return null;
    }

    public boolean deleteUserAssessment(int id) {
        if (userAssessmentRepository.existsById(id)) {
            userAssessmentRepository.deleteById(id);
            return true;
        }
        return false;
    }

    // New methods for progress management
    public List<UserAssessmentEntity> getUserAssessmentsByUserAndStatus(UserEntity user, String status) {
        return userAssessmentRepository.findByUserAndStatus(user, status);
    }
    
    public Optional<UserAssessmentEntity> findExistingInProgressAssessment(UserEntity user, AssessmentEntity assessment) {
        List<UserAssessmentEntity> inProgressAssessments = 
            userAssessmentRepository.findByUserAndAssessmentAndStatus(user, assessment, "IN_PROGRESS");
        
        return inProgressAssessments.isEmpty() ? Optional.empty() : Optional.of(inProgressAssessments.get(0));
    }
    
    public UserAssessmentEntity saveAssessmentProgress(UserAssessmentEntity userAssessment, 
                                                      Integer currentSectionIndex,
                                                      Double progressPercentage,
                                                      String savedAnswers,
                                                      String savedSections,
                                                      Integer timeSpentSeconds) {
        
        userAssessment.setStatus("IN_PROGRESS");
        userAssessment.setLastSavedTime(LocalDateTime.now());
        userAssessment.setCurrentSectionIndex(currentSectionIndex);
        userAssessment.setProgressPercentage(progressPercentage);
        userAssessment.setSavedAnswers(savedAnswers);
        userAssessment.setSavedSections(savedSections);
        userAssessment.setTimeSpentSeconds(timeSpentSeconds);
        
        return userAssessmentRepository.save(userAssessment);
    }
    
    public UserAssessmentEntity completeAssessment(UserAssessmentEntity userAssessment, double score) {
        userAssessment.setStatus("COMPLETED");
        userAssessment.setScore(score);
        userAssessment.setProgressPercentage(100.0);
        
        return userAssessmentRepository.save(userAssessment);
    }
}
