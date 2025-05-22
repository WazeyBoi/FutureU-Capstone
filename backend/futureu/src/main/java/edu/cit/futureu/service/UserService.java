package edu.cit.futureu.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import edu.cit.futureu.entity.UserEntity;
import edu.cit.futureu.repository.UserRepository;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    // Create operations
    public UserEntity createUser(UserEntity user) {
        // Encrypt the password before saving, but only if it's not already encrypted
        if (user.getPassword() != null && !user.getPassword().isEmpty() && !isPasswordEncoded(user.getPassword())) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }
        return userRepository.save(user);
    }
    
    // Read operations
    public List<UserEntity> getAllUsers() {
        return userRepository.findAll();
    }
    
    public Optional<UserEntity> getUserById(int id) {
        return userRepository.findById(id);
    }
    
    public UserEntity getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }
    
    // Update operations
    public UserEntity updateUser(UserEntity user) {
        if (userRepository.existsById(user.getUserId())) {
            // If a password is provided, encrypt it - otherwise leave existing password
            if (user.getPassword() != null && !user.getPassword().isEmpty()) {
                // Only encrypt if not already encrypted
                if (!isPasswordEncoded(user.getPassword())) {
                    user.setPassword(passwordEncoder.encode(user.getPassword()));
                }
            } else {
                // Keep the existing password if not provided
                UserEntity existingUser = userRepository.findById(user.getUserId()).orElse(null);
                if (existingUser != null) {
                    user.setPassword(existingUser.getPassword());
                }
            }
            return userRepository.save(user);
        }
        return null; // User not found
    }
    
    // Delete operations
    public boolean deleteUser(int id) {
        if (userRepository.existsById(id)) {
            userRepository.deleteById(id);
            return true;
        }
        return false; // User not found
    }
    
    /**
     * Check if a password is already BCrypt encoded
     * BCrypt passwords start with $2a$, $2b$, or $2y$
     */
    private boolean isPasswordEncoded(String password) {
        return password.startsWith("$2a$") || 
               password.startsWith("$2b$") || 
               password.startsWith("$2y$");
    }
}
