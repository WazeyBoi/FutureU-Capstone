package edu.cit.futureu.service;

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
}
