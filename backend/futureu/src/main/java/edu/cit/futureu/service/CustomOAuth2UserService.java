package edu.cit.futureu.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import edu.cit.futureu.entity.Role;
import edu.cit.futureu.entity.UserEntity;
import edu.cit.futureu.repository.UserRepository;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);
        
        String email = oAuth2User.getAttribute("email");
        String providerId = oAuth2User.getAttribute("sub");
        String firstName = oAuth2User.getAttribute("given_name");
        String lastName = oAuth2User.getAttribute("family_name");
        String profilePicture = oAuth2User.getAttribute("picture");
        String provider = userRequest.getClientRegistration().getRegistrationId();

        // Check if user exists by providerId first, then by email
        UserEntity user = userRepository.findByProviderId(providerId);
        if (user == null) {
            user = userRepository.findByEmail(email);
        }

        if (user == null) {
            // Create new user
            user = new UserEntity();
            user.setEmail(email);
            user.setFirstName(firstName);
            user.setLastname(lastName);
            user.setProviderId(providerId);
            user.setProvider(provider);
            user.setProfilePicture(profilePicture);
            user.setRole(Role.STUDENT); // Default role for OAuth2 users
            // No password needed for OAuth2 users
            user.setPassword(null);
            
            userRepository.save(user);
        } else {
            // Update existing user with OAuth2 info if needed
            if (user.getProviderId() == null) {
                user.setProviderId(providerId);
            }
            if (user.getProvider() == null) {
                user.setProvider(provider);
            }
            if (user.getProfilePicture() == null || !user.getProfilePicture().equals(profilePicture)) {
                user.setProfilePicture(profilePicture);
            }
            userRepository.save(user);
        }

        return oAuth2User;
    }
}