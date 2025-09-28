package edu.cit.futureu.service;

import edu.cit.futureu.entity.UserEntity;
import edu.cit.futureu.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Optional;

@Service
public class ProfileService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    private final String uploadDir = "uploads/profile-pictures/";
    
    public UserEntity getUserProfile(int userId) {
        System.out.println("ProfileService: getUserProfile called with userId: " + userId);
        
        Optional<UserEntity> user = userRepository.findById(userId);
        if (user.isPresent()) {
            UserEntity userEntity = user.get();
            // Don't return password for security
            userEntity.setPassword(null);
            System.out.println("User found: " + userEntity.getEmail());
            return userEntity;
        }
        System.err.println("User not found with ID: " + userId);
        throw new RuntimeException("User not found");
    }
    
    public UserEntity updateUserProfile(int userId, UserEntity profileData) {
        try {
            System.out.println("=== ProfileService: updateUserProfile START ===");
            System.out.println("UserId: " + userId);
            System.out.println("ProfileData received: " + profileData);
            System.out.println("ProfileData firstName: " + profileData.getFirstName());
            System.out.println("ProfileData class: " + profileData.getClass().getName());
            
            // Check if userRepository is available
            if (userRepository == null) {
                System.err.println("UserRepository is null!");
                throw new RuntimeException("UserRepository is not available");
            }
            
            System.out.println("Looking for user with ID: " + userId);
            Optional<UserEntity> existingUser = userRepository.findById(userId);
            
            if (!existingUser.isPresent()) {
                System.err.println("User not found with ID: " + userId);
                throw new RuntimeException("User not found with ID: " + userId);
            }
            
            UserEntity user = existingUser.get();
            System.out.println("Found existing user: " + user.getEmail());
            
            // Only update firstName for testing
            if (profileData.getFirstName() != null) {
                System.out.println("Updating firstName from '" + user.getFirstName() + "' to '" + profileData.getFirstName() + "'");
                if (!profileData.getFirstName().trim().isEmpty()) {
                    user.setFirstName(profileData.getFirstName().trim());
                    System.out.println("FirstName updated successfully");
                } else {
                    System.out.println("FirstName is empty, skipping update");
                }
            } else {
                System.out.println("ProfileData.firstName is null, no update needed");
            }
            
            System.out.println("About to save user to database...");
            System.out.println("User before save: " + user.getFirstName());
            
            UserEntity savedUser = userRepository.save(user);
            System.out.println("User saved successfully!");
            System.out.println("Saved user firstName: " + savedUser.getFirstName());
            
            savedUser.setPassword(null); // Don't return password
            
            System.out.println("ProfileService: updateUserProfile completed successfully");
            System.out.println("=== ProfileService: updateUserProfile END ===");
            return savedUser;
            
        } catch (Exception e) {
            System.err.println("=== CRITICAL ERROR in ProfileService.updateUserProfile ===");
            System.err.println("Error type: " + e.getClass().getSimpleName());
            System.err.println("Error message: " + e.getMessage());
            System.err.println("Stack trace:");
            e.printStackTrace();
            System.err.println("=== END CRITICAL ERROR ===");
            throw e;
        }
    }
    
    public String uploadProfilePicture(int userId, MultipartFile file) throws IOException {
        // Validate file
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }
        
        if (!file.getContentType().startsWith("image/")) {
            throw new IllegalArgumentException("File must be an image");
        }
        
        if (file.getSize() > 5 * 1024 * 1024) { // 5MB limit
            throw new IllegalArgumentException("File size exceeds 5MB limit");
        }
        
        // Create upload directory if it doesn't exist
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        
        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String fileExtension = originalFilename != null ? 
            originalFilename.substring(originalFilename.lastIndexOf(".")) : ".jpg";
        String fileName = userId + "_" + System.currentTimeMillis() + fileExtension;
        Path filePath = uploadPath.resolve(fileName);
        
        // Save file
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        
        // Update user's profile picture URL
        String profilePictureUrl = "/uploads/profile-pictures/" + fileName;
        Optional<UserEntity> user = userRepository.findById(userId);
        if (user.isPresent()) {
            UserEntity userEntity = user.get();
            userEntity.setProfilePictureUrl(profilePictureUrl);
            userRepository.save(userEntity);
        }
        
        return profilePictureUrl;
    }
    
    public void deleteProfilePicture(int userId) {
        Optional<UserEntity> user = userRepository.findById(userId);
        if (user.isPresent()) {
            UserEntity userEntity = user.get();
            String currentPictureUrl = userEntity.getProfilePictureUrl();
            
            // Delete file if exists
            if (currentPictureUrl != null && !currentPictureUrl.isEmpty()) {
                try {
                    String fileName = currentPictureUrl.substring(currentPictureUrl.lastIndexOf("/") + 1);
                    Path filePath = Paths.get(uploadDir + fileName);
                    Files.deleteIfExists(filePath);
                } catch (IOException e) {
                    // Log error but don't throw exception
                    System.err.println("Could not delete file: " + e.getMessage());
                }
            }
            
            // Remove URL from database
            userEntity.setProfilePictureUrl(null);
            userRepository.save(userEntity);
        }
    }

    public void changePassword(int userId, String currentPassword, String newPassword) {
        Optional<UserEntity> userOptional = userRepository.findById(userId);
        if (!userOptional.isPresent()) {
            throw new RuntimeException("User not found");
        }

        UserEntity user = userOptional.get();
        
        // Verify current password
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }
        
        // Validate new password
        if (newPassword == null || newPassword.trim().length() < 8) {
            throw new RuntimeException("New password must be at least 8 characters long");
        }
        
        // Check if new password is different from current
        if (passwordEncoder.matches(newPassword, user.getPassword())) {
            throw new RuntimeException("New password must be different from current password");
        }
        
        // Update password
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
}
