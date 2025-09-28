package edu.cit.futureu.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import edu.cit.futureu.entity.UserEntity;
import edu.cit.futureu.repository.UserRepository;

@Service
public class ProfileService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private InstitutionService institutionService;
    
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
            
            // Update ALL profile fields (not just firstName)
            if (profileData.getFirstName() != null) {
                System.out.println("Updating firstName from '" + user.getFirstName() + "' to '" + profileData.getFirstName() + "'");
                if (!profileData.getFirstName().trim().isEmpty()) {
                    user.setFirstName(profileData.getFirstName().trim());
                    System.out.println("FirstName updated successfully");
                }
            }
            
            if (profileData.getLastname() != null) {
                System.out.println("Updating lastname from '" + user.getLastname() + "' to '" + profileData.getLastname() + "'");
                if (!profileData.getLastname().trim().isEmpty()) {
                    user.setLastname(profileData.getLastname().trim());
                    System.out.println("Lastname updated successfully");
                }
            }
            
            if (profileData.getMiddleName() != null) {
                System.out.println("Updating middleName from '" + user.getMiddleName() + "' to '" + profileData.getMiddleName() + "'");
                user.setMiddleName(profileData.getMiddleName().trim().isEmpty() ? null : profileData.getMiddleName().trim());
                System.out.println("MiddleName updated successfully");
            }
            
            if (profileData.getEmail() != null) {
                System.out.println("Updating email from '" + user.getEmail() + "' to '" + profileData.getEmail() + "'");
                if (!profileData.getEmail().trim().isEmpty()) {
                    user.setEmail(profileData.getEmail().trim());
                    System.out.println("Email updated successfully");
                }
            }
            
            if (profileData.getAddress() != null) {
                System.out.println("Updating address from '" + user.getAddress() + "' to '" + profileData.getAddress() + "'");
                user.setAddress(profileData.getAddress().trim().isEmpty() ? null : profileData.getAddress().trim());
                System.out.println("Address updated successfully");
            }
            
            if (profileData.getContactNumber() != null) {
                System.out.println("Updating contactNumber from '" + user.getContactNumber() + "' to '" + profileData.getContactNumber() + "'");
                user.setContactNumber(profileData.getContactNumber().trim().isEmpty() ? null : profileData.getContactNumber().trim());
                System.out.println("ContactNumber updated successfully");
            }
            
            if (profileData.getAge() != 0) { // Note: int primitive, so check for 0 instead of null
                System.out.println("Updating age from " + user.getAge() + " to " + profileData.getAge());
                if (profileData.getAge() > 0) {
                    user.setAge(profileData.getAge());
                    System.out.println("Age updated successfully");
                }
            }

            // Validate and set school code for counselors only
            if (profileData.getSchoolCode() != null) {
                String role = user.getRole() != null ? user.getRole().name() : "";
                if ("GUIDANCE_COUNSELOR".equals(role) || "CAREER_COUNSELOR".equals(role)) {
                    String schoolCode = profileData.getSchoolCode().trim();
                    if (!schoolCode.isEmpty()) {
                        if (!institutionService.isValidSchoolCode(schoolCode)) {
                            throw new RuntimeException("Invalid school code. Please verify with your institution.");
                        }
                    }
                }
                user.setSchoolCode(profileData.getSchoolCode());
            }
            
            System.out.println("About to save user to database...");
            System.out.println("User before save - firstName: " + user.getFirstName() + ", lastname: " + user.getLastname());
            
            UserEntity savedUser = userRepository.save(user);
            System.out.println("User saved successfully!");
            System.out.println("Saved user - firstName: " + savedUser.getFirstName() + ", lastname: " + savedUser.getLastname());
            
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
