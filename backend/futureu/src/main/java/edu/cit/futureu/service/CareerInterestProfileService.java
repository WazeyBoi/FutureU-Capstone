package edu.cit.futureu.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import edu.cit.futureu.entity.CareerInterestProfileEntity;
import edu.cit.futureu.entity.UserEntity;
import edu.cit.futureu.repository.CareerInterestProfileRepository;
import edu.cit.futureu.repository.UserRepository;

@Service
public class CareerInterestProfileService {
    
    @Autowired
    private CareerInterestProfileRepository profileRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    // Create operations
    public CareerInterestProfileEntity createProfile(CareerInterestProfileEntity profile) {
        // Set any existing active profiles for this user to inactive
        if (profile.getUser() != null) {
            List<CareerInterestProfileEntity> existingProfiles = 
                profileRepository.findByUserAndIsActiveTrueOrderByCreatedAtDesc(profile.getUser());
            
            for (CareerInterestProfileEntity existingProfile : existingProfiles) {
                existingProfile.setActive(false);
                profileRepository.save(existingProfile);
            }
        }
        
        // Set the new profile as active
        profile.setActive(true);
        return profileRepository.save(profile);
    }
    
    public CareerInterestProfileEntity createProfileForUser(int userId, CareerInterestProfileEntity profile) {
        Optional<UserEntity> user = userRepository.findById(userId);
        if (user.isPresent()) {
            profile.setUser(user.get());
            return createProfile(profile);
        }
        throw new RuntimeException("User not found with ID: " + userId);
    }
    
    // Read operations
    public List<CareerInterestProfileEntity> getAllProfiles() {
        return profileRepository.findAll();
    }
    
    public Optional<CareerInterestProfileEntity> getProfileById(int id) {
        return profileRepository.findById(id);
    }
    
    public List<CareerInterestProfileEntity> getProfilesByUser(int userId) {
        return profileRepository.findByUser_UserIdOrderByCreatedAtDesc(userId);
    }
    
    public List<CareerInterestProfileEntity> getActiveProfilesByUser(int userId) {
        return profileRepository.findByUser_UserIdAndIsActiveTrueOrderByCreatedAtDesc(userId);
    }
    
    public Optional<CareerInterestProfileEntity> getMostRecentActiveProfile(int userId) {
        Optional<UserEntity> user = userRepository.findById(userId);
        if (user.isPresent()) {
            return profileRepository.findMostRecentActiveByUser(user.get());
        }
        return Optional.empty();
    }
    
    public List<CareerInterestProfileEntity> searchByDreamCareer(String keyword) {
        return profileRepository.findByDreamCareerContaining(keyword);
    }
    
    public List<CareerInterestProfileEntity> searchByInterests(String keyword) {
        return profileRepository.findByInterestsContaining(keyword);
    }
    
    // Update operations
    public CareerInterestProfileEntity updateProfile(CareerInterestProfileEntity profile) {
        if (profileRepository.existsById(profile.getProfileId())) {
            return profileRepository.save(profile);
        }
        throw new RuntimeException("Profile not found with ID: " + profile.getProfileId());
    }
    
    // Delete operations (soft delete - set inactive)
    public boolean deactivateProfile(int profileId) {
        Optional<CareerInterestProfileEntity> profile = profileRepository.findById(profileId);
        if (profile.isPresent()) {
            profile.get().setActive(false);
            profileRepository.save(profile.get());
            return true;
        }
        return false;
    }
    
    // Hard delete (permanent)
    public boolean deleteProfile(int profileId) {
        if (profileRepository.existsById(profileId)) {
            profileRepository.deleteById(profileId);
            return true;
        }
        return false;
    }
    
    // Utility methods
    public long getTotalActiveProfiles() {
        return profileRepository.findAll().stream()
            .filter(CareerInterestProfileEntity::isActive)
            .count();
    }
    
    public long getTotalProfilesByUser(int userId) {
        return profileRepository.findByUser_UserIdOrderByCreatedAtDesc(userId).size();
    }
}