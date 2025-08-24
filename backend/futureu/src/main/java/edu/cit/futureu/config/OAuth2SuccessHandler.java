package edu.cit.futureu.config;

import java.io.IOException;

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

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
            Authentication authentication) throws IOException, ServletException {
        
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");
        String providerId = oAuth2User.getAttribute("sub");

        // Find the user in database
        UserEntity user = userRepository.findByProviderId(providerId);
        if (user == null) {
            user = userRepository.findByEmail(email);
        }

        if (user != null) {
            // Generate JWT token
            String jwt = jwtUtil.generateTokenFromUserEntity(user);
            
            // Redirect to frontend with token
            String frontendUrl = "http://localhost:5173/user-landing-page?token=" + jwt 
                + "&userId=" + user.getUserId()
                + "&email=" + user.getEmail()
                + "&role=" + user.getRole().name()
                + "&firstName=" + user.getFirstName();
            
            response.sendRedirect(frontendUrl);
        } else {
            // User not found, redirect to error page
            response.sendRedirect("http://localhost:5173/auth/error");
        }
    }
}