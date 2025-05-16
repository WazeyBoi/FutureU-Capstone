package edu.cit.futureu.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import edu.cit.futureu.entity.UserEntity;
import edu.cit.futureu.repository.UserRepository;

@RestController
@RequestMapping("/api")
public class WebTest {
    
    @Autowired
    private UserRepository userRepository;
    
    @GetMapping("/hello")
    public String helloWorld() {
        return "Hello World from FutureU!";
    }
    
    @GetMapping("/protected")
    @PreAuthorize("isAuthenticated()")
    public String protectedEndpoint() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        
        // Get the user's full name from the repository
        UserEntity user = userRepository.findByEmail(email);
        String fullName = "";
        
        if (user != null) {
            fullName = user.getFirstName() + " " + 
                      (user.getMiddleName() != null && !user.getMiddleName().isEmpty() ? user.getMiddleName() + " " : "") + 
                      user.getLastname();
        }
        
        return "You are authenticated as: " + email + " (Name: " + fullName + ")";
    }
}
