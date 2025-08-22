package edu.cit.futureu.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;

import edu.cit.futureu.dto.JwtResponse;
import edu.cit.futureu.dto.SigninRequest;
import edu.cit.futureu.dto.SignupRequest;
import edu.cit.futureu.entity.Role; // Add this import
import edu.cit.futureu.entity.UserEntity;
import edu.cit.futureu.jwt.JwtUtil;
import edu.cit.futureu.repository.UserRepository;
import edu.cit.futureu.service.UserService;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;
    
    @Autowired
    UserService userService;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtil jwtUtil;

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@RequestBody SigninRequest signinRequest, HttpServletResponse response) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(signinRequest.getEmail(), signinRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        
        UserEntity userEntity = userRepository.findByEmail(signinRequest.getEmail());
        String jwt = jwtUtil.generateTokenFromUserEntity(userEntity);
        
        // Set HTTPOnly cookie for JWT token
        Cookie jwtCookie = new Cookie("futureu_token", jwt);
        jwtCookie.setHttpOnly(true);
        jwtCookie.setSecure(false); // Set to true in production with HTTPS
        jwtCookie.setPath("/");
        jwtCookie.setMaxAge(10800); // 3 hours in seconds (same as JWT expiration)
        response.addCookie(jwtCookie);
        
        // Set HTTPOnly cookie for user data
        String userData = String.format("{\"id\":%d,\"email\":\"%s\",\"role\":\"%s\",\"firstName\":\"%s\"}", 
                                       userEntity.getUserId(),
                                       userEntity.getEmail(),
                                       userEntity.getRole().name(),
                                       userEntity.getFirstName() != null ? userEntity.getFirstName() : "");
        Cookie userCookie = new Cookie("futureu_user", userData);
        userCookie.setHttpOnly(true);
        userCookie.setSecure(false); // Set to true in production with HTTPS  
        userCookie.setPath("/");
        userCookie.setMaxAge(10800); // 3 hours in seconds
        response.addCookie(userCookie);
        
        // Return response without token (token is now in HTTPOnly cookie)
        return ResponseEntity.ok(new JwtResponse(null, // Don't send token in response body
                                                 userEntity.getUserId(),
                                                 userEntity.getEmail(),
                                                 userEntity.getRole().name(),
                                                 userEntity.getFirstName()));
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@RequestBody SignupRequest signUpRequest) {
        if (userRepository.findByEmail(signUpRequest.getEmail()) != null) {
            return ResponseEntity
                    .badRequest()
                    .body("Error: Email is already in use!");
        }

        // Create new user's account
        UserEntity user = new UserEntity();
        user.setFirstName(signUpRequest.getFirstName());
        user.setMiddleName(signUpRequest.getMiddleName());
        user.setLastname(signUpRequest.getLastname());
        user.setEmail(signUpRequest.getEmail());
        user.setPassword(encoder.encode(signUpRequest.getPassword()));
        user.setAge(signUpRequest.getAge());
        user.setAddress(signUpRequest.getAddress());
        user.setContactNumber(signUpRequest.getContactNumber());
        user.setRole(Role.STUDENT); // Set role using Enum

        userService.createUser(user);

        return ResponseEntity.ok("User registered successfully!");
    }

    @PostMapping("/signout")
    public ResponseEntity<?> signoutUser(HttpServletResponse response) {
        // Clear JWT cookie
        Cookie jwtCookie = new Cookie("futureu_token", null);
        jwtCookie.setHttpOnly(true);
        jwtCookie.setSecure(false); // Set to true in production with HTTPS
        jwtCookie.setPath("/");
        jwtCookie.setMaxAge(0); // Expire immediately
        response.addCookie(jwtCookie);
        
        // Clear user data cookie
        Cookie userCookie = new Cookie("futureu_user", null);
        userCookie.setHttpOnly(true);
        userCookie.setSecure(false); // Set to true in production with HTTPS
        userCookie.setPath("/");
        userCookie.setMaxAge(0); // Expire immediately
        response.addCookie(userCookie);
        
        return ResponseEntity.ok("User signed out successfully!");
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body("Not authenticated");
        }
        
        String email = authentication.getName();
        UserEntity userEntity = userRepository.findByEmail(email);
        
        if (userEntity == null) {
            return ResponseEntity.status(404).body("User not found");
        }
        
        return ResponseEntity.ok(new JwtResponse(null, // Don't send token in response
                                                 userEntity.getUserId(),
                                                 userEntity.getEmail(),
                                                 userEntity.getRole().name(),
                                                 userEntity.getFirstName()));
    }
}
