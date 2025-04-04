package edu.cit.futureu.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import edu.cit.futureu.entity.UserEntity;
import edu.cit.futureu.repository.UserRepository;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;
    
    // Create operations
    public UserEntity createUser(UserEntity user) {
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
}
