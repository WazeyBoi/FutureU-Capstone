package edu.cit.futureu.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import edu.cit.futureu.entity.CareerInterestProfileEntity;
import edu.cit.futureu.service.CareerInterestProfileService;

@RestController
@RequestMapping("/api/career-interest-profile")
public class CareerInterestProfileController {
    
    @Autowired
    private CareerInterestProfileService profileService;
    
    @GetMapping("/test")
    public String test() {
        return "Career Interest Profile API is working!";
    }
    
    // CREATE
    @PostMapping("/create/{userId}")
    public ResponseEntity<?> createProfile(@PathVariable int userId, 
            @RequestBody CareerInterestProfileEntity profile) {
        try {
            CareerInterestProfileEntity savedProfile = profileService.createProfileForUser(userId, profile);
            return ResponseEntity.ok(savedProfile);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // READ
    @GetMapping("/getAll")
    public List<CareerInterestProfileEntity> getAllProfiles() {
        return profileService.getAllProfiles();
    }
    
    @GetMapping("/get/{profileId}")
    public ResponseEntity<?> getProfileById(@PathVariable int profileId) {
        return profileService.getProfileById(profileId)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/user/{userId}")
    public List<CareerInterestProfileEntity> getProfilesByUser(@PathVariable int userId) {
        return profileService.getProfilesByUser(userId);
    }
    
    @GetMapping("/user/{userId}/active")
    public List<CareerInterestProfileEntity> getActiveProfilesByUser(@PathVariable int userId) {
        return profileService.getActiveProfilesByUser(userId);
    }
    
    @GetMapping("/user/{userId}/latest")
    public ResponseEntity<?> getMostRecentProfile(@PathVariable int userId) {
        return profileService.getMostRecentActiveProfile(userId)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/search/dream-career")
    public List<CareerInterestProfileEntity> searchByDreamCareer(@RequestParam String keyword) {
        return profileService.searchByDreamCareer(keyword);
    }
    
    @GetMapping("/search/interests")
    public List<CareerInterestProfileEntity> searchByInterests(@RequestParam String keyword) {
        return profileService.searchByInterests(keyword);
    }
    
    // UPDATE
    @PutMapping("/update")
    public ResponseEntity<?> updateProfile(@RequestBody CareerInterestProfileEntity profile) {
        try {
            CareerInterestProfileEntity updatedProfile = profileService.updateProfile(profile);
            return ResponseEntity.ok(updatedProfile);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // SOFT DELETE (deactivate)
    @PutMapping("/deactivate/{profileId}")
    public ResponseEntity<?> deactivateProfile(@PathVariable int profileId) {
        boolean deactivated = profileService.deactivateProfile(profileId);
        if (deactivated) {
            return ResponseEntity.ok(Map.of("message", "Profile deactivated successfully"));
        }
        return ResponseEntity.notFound().build();
    }
    
    // HARD DELETE
    @DeleteMapping("/delete/{profileId}")
    public ResponseEntity<?> deleteProfile(@PathVariable int profileId) {
        boolean deleted = profileService.deleteProfile(profileId);
        if (deleted) {
            return ResponseEntity.ok(Map.of("message", "Profile deleted successfully"));
        }
        return ResponseEntity.notFound().build();
    }
    
    // STATISTICS
    @GetMapping("/stats/total-active")
    public Map<String, Long> getTotalActiveProfiles() {
        return Map.of("totalActiveProfiles", profileService.getTotalActiveProfiles());
    }
    
    @GetMapping("/stats/user/{userId}/total")
    public Map<String, Long> getTotalProfilesByUser(@PathVariable int userId) {
        return Map.of("totalProfiles", profileService.getTotalProfilesByUser(userId));
    }
}