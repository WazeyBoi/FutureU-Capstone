package edu.cit.futureu.controller;

import edu.cit.futureu.entity.UserEntity;
import edu.cit.futureu.service.ProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*", maxAge = 3600)
@RequestMapping("/api/profile")
public class ProfileController {
    
    @Autowired
    private ProfileService profileService;
    
    @GetMapping("/{userId}")
    public ResponseEntity<?> getUserProfile(@PathVariable int userId) {
        try {
            System.out.println("=== GET PROFILE REQUEST ===");
            System.out.println("UserId: " + userId);
            
            UserEntity user = profileService.getUserProfile(userId);
            
            System.out.println("Profile fetched successfully for user: " + userId);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            System.err.println("=== ERROR in getUserProfile ===");
            System.err.println("Error fetching user profile: " + e.getMessage());
            e.printStackTrace();
            System.err.println("=== END ERROR ===");
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PutMapping("/{userId}")
    public ResponseEntity<?> updateUserProfile(@PathVariable int userId, @RequestBody UserEntity profileData) {
        try {
            System.out.println("=== UPDATE PROFILE REQUEST ===");
            System.out.println("Received userId: " + userId);
            System.out.println("Request body: " + profileData);
            System.out.println("Profile data class: " + profileData.getClass().getSimpleName());
            
            // Validate userId
            if (userId <= 0) {
                System.err.println("Invalid userId: " + userId);
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid user ID"));
            }
            
            // Validate profileData
            if (profileData == null) {
                System.err.println("ProfileData is null");
                return ResponseEntity.badRequest().body(Map.of("error", "Profile data is required"));
            }
            
            System.out.println("Calling ProfileService.updateUserProfile...");
            UserEntity updatedUser = profileService.updateUserProfile(userId, profileData);
            
            System.out.println("Profile updated successfully for user: " + updatedUser.getUserId());
            return ResponseEntity.ok(updatedUser);
            
        } catch (RuntimeException e) {
            System.err.println("=== RUNTIME ERROR in updateUserProfile ===");
            System.err.println("Runtime error updating user profile: " + e.getMessage());
            e.printStackTrace();
            System.err.println("=== END RUNTIME ERROR ===");
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            System.err.println("=== UNEXPECTED ERROR in updateUserProfile ===");
            System.err.println("Unexpected error updating user profile: " + e.getMessage());
            e.printStackTrace();
            System.err.println("=== END UNEXPECTED ERROR ===");
            return ResponseEntity.internalServerError().body(Map.of("error", "An unexpected error occurred: " + e.getMessage()));
        }
    }
    
    @PostMapping("/{userId}/upload-picture")
    public ResponseEntity<?> uploadProfilePicture(@PathVariable int userId, @RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Please select a file to upload"));
            }
            
            String profilePictureUrl = profileService.uploadProfilePicture(userId, file);
            return ResponseEntity.ok(Map.of("profilePictureUrl", profilePictureUrl, "message", "Profile picture uploaded successfully"));
        } catch (IllegalArgumentException e) {
            System.err.println("Invalid file: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (IOException e) {
            System.err.println("File upload error: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to upload file: " + e.getMessage()));
        } catch (Exception e) {
            System.err.println("Unexpected error during file upload: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("error", "An unexpected error occurred"));
        }
    }
    
    @DeleteMapping("/{userId}/profile-picture")
    public ResponseEntity<?> deleteProfilePicture(@PathVariable int userId) {
        try {
            profileService.deleteProfilePicture(userId);
            return ResponseEntity.ok(Map.of("message", "Profile picture deleted successfully"));
        } catch (Exception e) {
            System.err.println("Error deleting profile picture: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{userId}/change-password")
    public ResponseEntity<?> changePassword(@PathVariable int userId, @RequestBody Map<String, String> passwordData) {
        try {
            String currentPassword = passwordData.get("currentPassword");
            String newPassword = passwordData.get("newPassword");
            
            if (currentPassword == null || currentPassword.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Current password is required"));
            }
            
            if (newPassword == null || newPassword.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "New password is required"));
            }
            
            profileService.changePassword(userId, currentPassword, newPassword);
            return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
        } catch (Exception e) {
            System.err.println("Error changing password: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}