package edu.cit.futureu.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
    public ResponseEntity<?> authenticateUser(@RequestBody SigninRequest signinRequest) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(signinRequest.getEmail(), signinRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        
        UserEntity userEntity = userRepository.findByEmail(signinRequest.getEmail());
        String jwt = jwtUtil.generateTokenFromUserEntity(userEntity);
        
        return ResponseEntity.ok(new JwtResponse(jwt,
                                                 userEntity.getUserId(),
                                                 userEntity.getEmail(),
                                                 userEntity.getRole().name())); // Use role.name()
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
}
