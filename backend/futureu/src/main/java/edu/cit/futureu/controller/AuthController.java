package edu.cit.futureu.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
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
import edu.cit.futureu.entity.Role;
import edu.cit.futureu.entity.UserEntity;
import edu.cit.futureu.entity.RefreshTokenEntity;
import edu.cit.futureu.jwt.JwtUtil;
import edu.cit.futureu.repository.UserRepository;
import edu.cit.futureu.repository.RefreshTokenRepository;
import edu.cit.futureu.service.UserService;
import edu.cit.futureu.util.SecureCookieUtil;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.Cookie;
import java.time.LocalDateTime;
import java.util.UUID;
import java.util.Map;
import java.util.HashMap;
import com.fasterxml.jackson.databind.ObjectMapper;

@CrossOrigin(origins = "${futureu.app.allowedOrigins}", maxAge = 3600, allowCredentials = "true")
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
    
    @Autowired
    RefreshTokenRepository refreshTokenRepository;
    
    @Autowired
    SecureCookieUtil cookieUtil;
    
    @Value("${futureu.app.jwtExpirationMs}")
    private int jwtExpirationMs;
    
    @Value("${futureu.app.refreshTokenExpirationMs}")
    private int refreshTokenExpirationMs;

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@RequestBody SigninRequest signinRequest, HttpServletResponse response) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(signinRequest.getEmail(), signinRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        
        UserEntity userEntity = userRepository.findByEmail(signinRequest.getEmail());
        
        // Generate access token
        String accessToken = jwtUtil.generateTokenFromUserEntity(userEntity);
        
        // Generate refresh token
        String refreshToken = generateRefreshToken((long) userEntity.getUserId());
        
        // Set secure cookies
        cookieUtil.setAccessTokenCookie(response, accessToken, jwtExpirationMs / 1000);
        cookieUtil.setRefreshTokenCookie(response, refreshToken, refreshTokenExpirationMs / 1000);
        
        // Set user info cookie (non-sensitive data only)
        Map<String, Object> userInfo = new HashMap<>();
        userInfo.put("id", userEntity.getUserId());
        userInfo.put("email", userEntity.getEmail());
        userInfo.put("role", userEntity.getRole().name());
        userInfo.put("firstName", userEntity.getFirstName());
        
        try {
            String userInfoJson = new ObjectMapper().writeValueAsString(userInfo);
            cookieUtil.setUserInfoCookie(response, userInfoJson, jwtExpirationMs / 1000);
        } catch (Exception e) {
            // Log error but don't fail the request
            System.err.println("Error serializing user info: " + e.getMessage());
        }
        
        return ResponseEntity.ok(new JwtResponse(accessToken,
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
    
    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@RequestBody Map<String, String> request, HttpServletResponse response) {
        String refreshToken = request.get("refreshToken");
        
        if (refreshToken == null || refreshToken.isEmpty()) {
            return ResponseEntity.badRequest().body("Refresh token is required");
        }
        
        RefreshTokenEntity tokenEntity = refreshTokenRepository.findByToken(refreshToken)
            .orElse(null);
            
        if (tokenEntity == null || !tokenEntity.isValid()) {
            return ResponseEntity.badRequest().body("Invalid refresh token");
        }
        
        // Update last used time
        tokenEntity.setLastUsedAt(LocalDateTime.now());
        refreshTokenRepository.save(tokenEntity);
        
        // Get user and generate new access token
        UserEntity user = userRepository.findById((int) tokenEntity.getUserId()).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body("User not found");
        }
        
        String newAccessToken = jwtUtil.generateTokenFromUserEntity(user);
        
        // Set new access token cookie
        cookieUtil.setAccessTokenCookie(response, newAccessToken, jwtExpirationMs / 1000);
        
        return ResponseEntity.ok(Map.of("accessToken", newAccessToken));
    }
    
    @PostMapping("/signout")
    public ResponseEntity<?> signout(HttpServletResponse response) {
        // Clear all authentication cookies
        cookieUtil.clearAuthCookies(response);
        
        return ResponseEntity.ok("Signed out successfully");
    }
    
    private String generateRefreshToken(Long userId) {
        // Revoke all existing tokens for this user
        refreshTokenRepository.revokeAllUserTokens(userId);
        
        // Generate new refresh token
        String token = UUID.randomUUID().toString();
        LocalDateTime expiryDate = LocalDateTime.now().plusSeconds(refreshTokenExpirationMs / 1000);
        
        RefreshTokenEntity refreshToken = new RefreshTokenEntity(token, userId, expiryDate);
        refreshTokenRepository.save(refreshToken);
        
        return token;
    }
}
