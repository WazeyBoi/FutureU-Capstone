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
        Optional<UserEntity> user = userRepository.findById(userId);
        if (user.isPresent()) {
            UserEntity userEntity = user.get();
            // Don't return password for security
            userEntity.setPassword(null);
            return userEntity;
        }
        throw new RuntimeException("User not found");
    }
    
    public UserEntity updateUserProfile(int userId, UserEntity profileData) {
        Optional<UserEntity> existingUser = userRepository.findById(userId);
        if (existingUser.isPresent()) {
            UserEntity user = existingUser.get();
            
            // Update only allowed profile fields
            if (profileData.getFirstName() != null) {
                user.setFirstName(profileData.getFirstName());
            }
            if (profileData.getLastname() != null) {
                user.setLastname(profileData.getLastname());
            }
            if (profileData.getMiddleName() != null) {
                user.setMiddleName(profileData.getMiddleName());
            }
            if (profileData.getEmail() != null) {
                user.setEmail(profileData.getEmail());
            }
            if (profileData.getAddress() != null) {
                user.setAddress(profileData.getAddress());
            }
            if (profileData.getContactNumber() != null) {
                user.setContactNumber(profileData.getContactNumber());
            }
            if (profileData.getAge() != null) {
                user.setAge(profileData.getAge());
            }
            // Don't allow password updates through this method
            
            UserEntity savedUser = userRepository.save(user);
            savedUser.setPassword(null); // Don't return password
            return savedUser;
        }
        throw new RuntimeException("User not found");
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

    // NEW: Change Password method
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
