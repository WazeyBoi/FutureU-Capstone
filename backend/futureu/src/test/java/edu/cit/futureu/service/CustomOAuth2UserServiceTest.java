package edu.cit.futureu.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.util.HashMap;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.oauth2.OAuth2AccessToken;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;

import edu.cit.futureu.entity.Role;
import edu.cit.futureu.entity.UserEntity;
import edu.cit.futureu.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
public class CustomOAuth2UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private CustomOAuth2UserService customOAuth2UserService;

    private OAuth2UserRequest userRequest;
    private OAuth2User oAuth2User;

    @BeforeEach
    void setUp() {
        // Mock OAuth2User attributes
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("sub", "google-123456");
        attributes.put("email", "test@gmail.com");
        attributes.put("given_name", "John");
        attributes.put("family_name", "Doe");
        attributes.put("picture", "https://lh3.googleusercontent.com/test");

        oAuth2User = new DefaultOAuth2User(null, attributes, "sub");

        // Mock ClientRegistration
        ClientRegistration clientRegistration = ClientRegistration.withRegistrationId("google")
                .clientId("test-client-id")
                .clientSecret("test-client-secret")
                .authorizationUri("https://accounts.google.com/o/oauth2/auth")
                .tokenUri("https://accounts.google.com/o/oauth2/token")
                .userInfoUri("https://www.googleapis.com/oauth2/v3/userinfo")
                .userNameAttributeName("sub")
                .authorizationGrantType(org.springframework.security.oauth2.core.AuthorizationGrantType.AUTHORIZATION_CODE)
                .build();

        // Mock OAuth2AccessToken
        OAuth2AccessToken accessToken = new OAuth2AccessToken(
            OAuth2AccessToken.TokenType.BEARER, 
            "test-token", 
            null, 
            null);

        userRequest = new OAuth2UserRequest(clientRegistration, accessToken);
    }

    @Test
    void testNewUserCreation() {
        // Given
        when(userRepository.findByProviderId("google-123456")).thenReturn(null);
        when(userRepository.findByEmail("test@gmail.com")).thenReturn(null);
        when(userRepository.save(any(UserEntity.class))).thenAnswer(invocation -> {
            UserEntity user = invocation.getArgument(0);
            user.setUserId(1);
            return user;
        });

        // When
        OAuth2User result = customOAuth2UserService.loadUser(userRequest);

        // Then
        assertNotNull(result);
        assertEquals("test@gmail.com", result.getAttribute("email"));
        assertEquals("google-123456", result.getAttribute("sub"));
        assertEquals("John", result.getAttribute("given_name"));
        assertEquals("Doe", result.getAttribute("family_name"));
    }

    @Test
    void testExistingUserLogin() {
        // Given
        UserEntity existingUser = new UserEntity();
        existingUser.setUserId(1);
        existingUser.setEmail("test@gmail.com");
        existingUser.setProviderId("google-123456");
        existingUser.setRole(Role.STUDENT);

        when(userRepository.findByProviderId("google-123456")).thenReturn(existingUser);
        when(userRepository.save(any(UserEntity.class))).thenReturn(existingUser);

        // When
        OAuth2User result = customOAuth2UserService.loadUser(userRequest);

        // Then
        assertNotNull(result);
        assertEquals("test@gmail.com", result.getAttribute("email"));
    }
}