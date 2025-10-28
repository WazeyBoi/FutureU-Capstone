package edu.cit.futureu.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

@Service
public class CloudinaryService {
    
    @Autowired
    private Cloudinary cloudinary;
    
    /**
     * Upload profile picture to Cloudinary
     * @param file The image file to upload
     * @param userId The user ID (used for organizing uploads)
     * @return The secure URL of the uploaded image
     * @throws IOException if upload fails
     */
    public String uploadProfilePicture(MultipartFile file, int userId) throws IOException {
        // Validate file
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }
        
        if (!file.getContentType().startsWith("image/")) {
            throw new IllegalArgumentException("File must be an image");
        }
        
        if (file.getSize() > 10 * 1024 * 1024) { // 10MB limit
            throw new IllegalArgumentException("File size exceeds 10MB limit");
        }
        
        try {
            // Generate unique public ID for the image
            String publicId = "futureu/profile-pictures/" + userId + "_" + UUID.randomUUID().toString();
            
            // Upload to Cloudinary with transformations
            Map uploadResult = cloudinary.uploader().upload(file.getBytes(), 
                ObjectUtils.asMap(
                    "public_id", publicId,
                    "folder", "futureu/profile-pictures",
                    "resource_type", "image",
                    "transformation", new com.cloudinary.Transformation()
                        .width(500)
                        .height(500)
                        .crop("fill")
                        .quality("auto:good")
                        .fetchFormat("auto")
                )
            );
            
            // Return the secure URL
            return (String) uploadResult.get("secure_url");
            
        } catch (IOException e) {
            System.err.println("Error uploading to Cloudinary: " + e.getMessage());
            throw new IOException("Failed to upload image to cloud storage", e);
        }
    }
    
    /**
     * Delete profile picture from Cloudinary
     * @param imageUrl The full URL of the image to delete
     * @throws IOException if deletion fails
     */
    public void deleteProfilePicture(String imageUrl) throws IOException {
        if (imageUrl == null || imageUrl.isEmpty()) {
            return;
        }
        
        try {
            // Extract public ID from URL
            String publicId = extractPublicIdFromUrl(imageUrl);
            
            if (publicId != null && !publicId.isEmpty()) {
                // Delete from Cloudinary
                cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
                System.out.println("Deleted image from Cloudinary: " + publicId);
            }
            
        } catch (IOException e) {
            System.err.println("Error deleting from Cloudinary: " + e.getMessage());
            // Don't throw exception - log and continue
        }
    }
    
    /**
     * Extract public ID from Cloudinary URL
     * @param imageUrl The full Cloudinary URL
     * @return The public ID
     */
    private String extractPublicIdFromUrl(String imageUrl) {
        if (imageUrl == null || !imageUrl.contains("cloudinary.com")) {
            return null;
        }
        
        try {
            // Extract the path after /upload/ or /upload/v{version}/
            String[] parts = imageUrl.split("/upload/");
            if (parts.length < 2) return null;
            
            String afterUpload = parts[1];
            
            // Remove version number if present (v1234567890/)
            if (afterUpload.matches("^v\\d+/.*")) {
                afterUpload = afterUpload.substring(afterUpload.indexOf('/') + 1);
            }
            
            // Remove file extension
            int lastDot = afterUpload.lastIndexOf('.');
            if (lastDot > 0) {
                afterUpload = afterUpload.substring(0, lastDot);
            }
            
            return afterUpload;
            
        } catch (Exception e) {
            System.err.println("Error extracting public ID from URL: " + e.getMessage());
            return null;
        }
    }
}
