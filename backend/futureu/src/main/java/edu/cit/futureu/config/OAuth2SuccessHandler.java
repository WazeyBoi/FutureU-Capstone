package edu.cit.futureu.config;

import java.io.IOException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import edu.cit.futureu.entity.UserEntity;
import edu.cit.futureu.jwt.JwtUtil;
import edu.cit.futureu.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private static final Logger logger = LoggerFactory.getLogger(OAuth2SuccessHandler.class);

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
            Authentication authentication) throws IOException, ServletException {
        
        try {
            logger.info("OAuth2 authentication success handler called");
            
            OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
            String email = oAuth2User.getAttribute("email");
            String providerId = oAuth2User.getAttribute("sub");
            
            logger.info("OAuth2 user email: {}, providerId: {}", email, providerId);

            // Find the user in database
            UserEntity user = userRepository.findByProviderId(providerId);
            logger.info("User found by providerId: {}", user != null);
            
            if (user == null) {
                user = userRepository.findByEmail(email);
                logger.info("User found by email: {}", user != null);
            }

            if (user != null) {
                logger.info("User found: userId={}, email={}, role={}", user.getUserId(), user.getEmail(), user.getRole());
                
                // Generate JWT token
                String jwt = jwtUtil.generateTokenFromUserEntity(user);
                logger.info("JWT token generated successfully");
                
                // Redirect to frontend with token
                String frontendUrl = "http://localhost:5173/user-landing-page?token=" + jwt 
                    + "&userId=" + user.getUserId()
                    + "&email=" + user.getEmail()
                    + "&role=" + user.getRole().name()
                    + "&firstName=" + user.getFirstName();
                
                logger.info("Redirecting to: {}", frontendUrl);
                response.sendRedirect(frontendUrl);
            } else {
                logger.error("User not found for email: {} and providerId: {}", email, providerId);
                // User not found, redirect to error page
                response.sendRedirect("http://localhost:5173/auth/error");
            }
        } catch (Exception e) {
            logger.error("Error in OAuth2 success handler", e);
            response.sendRedirect("http://localhost:5173/auth/error");
        }
    }
}