package edu.cit.futureu.service;

import java.io.IOException;
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
    
    @Autowired
    private CloudinaryService cloudinaryService; // NEW: Inject Cloudinary service
    
    // REMOVED: private final String uploadDir = "uploads/profile-pictures/";
    
    public UserEntity getUserProfile(int userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
    }
    
    public UserEntity updateUserProfile(int userId, UserEntity profileData) {
        try {
            System.out.println("=== UPDATE USER PROFILE ===");
            System.out.println("Updating user with ID: " + userId);
            
            Optional<UserEntity> userOpt = userRepository.findById(userId);
            if (!userOpt.isPresent()) {
                throw new RuntimeException("User not found with ID: " + userId);
            }
            
            UserEntity existingUser = userOpt.get();
            System.out.println("Found existing user: " + existingUser.getEmail());
            
            // Update fields
            if (profileData.getFirstName() != null) {
                existingUser.setFirstName(profileData.getFirstName());
            }
            if (profileData.getMiddleName() != null) {
                existingUser.setMiddleName(profileData.getMiddleName());
            }
            if (profileData.getLastname() != null) {
                existingUser.setLastname(profileData.getLastname());
            }
            if (profileData.getEmail() != null) {
                existingUser.setEmail(profileData.getEmail());
            }
            if (profileData.getAge() > 0) {
                existingUser.setAge(profileData.getAge());
            }
            if (profileData.getAddress() != null) {
                existingUser.setAddress(profileData.getAddress());
            }
            if (profileData.getContactNumber() != null) {
                existingUser.setContactNumber(profileData.getContactNumber());
            }
            
            // Handle school code for counselors
            if (profileData.getSchoolCode() != null) {
                String schoolCode = profileData.getSchoolCode().trim();
                if (!schoolCode.isEmpty()) {
                    // FIXED: Change validateSchoolCode to isValidSchoolCode
                    boolean isValid = institutionService.isValidSchoolCode(schoolCode);
                    if (!isValid) {
                        throw new RuntimeException("Invalid school code provided");
                    }
                    existingUser.setSchoolCode(schoolCode);
                } else {
                    existingUser.setSchoolCode(null);
                }
            }
            
            UserEntity savedUser = userRepository.save(existingUser);
            System.out.println("User profile updated successfully");
            return savedUser;
            
        } catch (RuntimeException e) {
            System.err.println("=== RUNTIME ERROR ===");
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
            System.err.println("=== END RUNTIME ERROR ===");
            throw e;
        } catch (Exception e) {
            System.err.println("=== CRITICAL ERROR ===");
            System.err.println("Unexpected error: " + e.getMessage());
            e.printStackTrace();
            System.err.println("=== END CRITICAL ERROR ===");
            throw e;
        }
    }
    
    /**
     * Upload profile picture to Cloudinary
     */
    public String uploadProfilePicture(int userId, MultipartFile file) throws IOException {
        try {
            System.out.println("=== UPLOAD PROFILE PICTURE ===");
            System.out.println("Uploading for user ID: " + userId);
            
            // Get existing user
            Optional<UserEntity> userOpt = userRepository.findById(userId);
            if (!userOpt.isPresent()) {
                throw new RuntimeException("User not found with ID: " + userId);
            }
            
            UserEntity user = userOpt.get();
            String oldProfilePictureUrl = user.getProfilePictureUrl();
            
            // Delete old image from Cloudinary if exists
            if (oldProfilePictureUrl != null && !oldProfilePictureUrl.isEmpty()) {
                try {
                    cloudinaryService.deleteProfilePicture(oldProfilePictureUrl);
                    System.out.println("Deleted old profile picture from Cloudinary");
                } catch (IOException e) {
                    System.err.println("Failed to delete old image: " + e.getMessage());
                    // Continue with upload even if deletion fails
                }
            }
            
            // Upload new image to Cloudinary
            String imageUrl = cloudinaryService.uploadProfilePicture(file, userId);
            System.out.println("Uploaded new profile picture to Cloudinary: " + imageUrl);
            
            // Update user's profile picture URL in database
            user.setProfilePictureUrl(imageUrl);
            userRepository.save(user);
            
            System.out.println("Profile picture URL updated in database");
            return imageUrl;
            
        } catch (IOException e) {
            System.err.println("Error uploading profile picture: " + e.getMessage());
            throw e;
        }
    }
    
    /**
     * Delete profile picture from Cloudinary
     */
    public void deleteProfilePicture(int userId) {
        Optional<UserEntity> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            UserEntity user = userOpt.get();
            String profilePictureUrl = user.getProfilePictureUrl();
            
            // Delete from Cloudinary
            if (profilePictureUrl != null && !profilePictureUrl.isEmpty()) {
                try {
                    cloudinaryService.deleteProfilePicture(profilePictureUrl);
                    System.out.println("Deleted profile picture from Cloudinary");
                } catch (IOException e) {
                    System.err.println("Failed to delete image from Cloudinary: " + e.getMessage());
                    // Continue to remove URL from database even if Cloudinary delete fails
                }
            }
            
            // Remove URL from database
            user.setProfilePictureUrl(null);
            userRepository.save(user);
        }
    }

    public void changePassword(int userId, String currentPassword, String newPassword) {
        Optional<UserEntity> userOpt = userRepository.findById(userId);
        if (!userOpt.isPresent()) {
            throw new RuntimeException("User not found");
        }
        
        UserEntity user = userOpt.get();
        
        // Verify current password
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }
        
        // Update to new password
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
}
