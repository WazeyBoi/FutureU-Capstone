package edu.cit.futureu.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;

@Component
public class OAuth2ConfigValidator {

    private static final Logger logger = LoggerFactory.getLogger(OAuth2ConfigValidator.class);

    @Value("${spring.security.oauth2.client.registration.google.client-id:}")
    private String googleClientId;

    @Value("${spring.security.oauth2.client.registration.google.client-secret:}")
    private String googleClientSecret;

    private boolean oauth2Configured = false;

    @PostConstruct
    public void validateOAuth2Configuration() {
        logger.info("Validating OAuth2 configuration...");
        
        if (googleClientId == null || googleClientId.trim().isEmpty() || 
            "YOUR_GOOGLE_CLIENT_ID".equals(googleClientId)) {
            logger.warn("Google OAuth2 client ID is not configured or uses placeholder value");
            oauth2Configured = false;
            return;
        }

        if (googleClientSecret == null || googleClientSecret.trim().isEmpty() || 
            "YOUR_GOOGLE_CLIENT_SECRET".equals(googleClientSecret)) {
            logger.warn("Google OAuth2 client secret is not configured or uses placeholder value");
            oauth2Configured = false;
            return;
        }

        oauth2Configured = true;
        logger.info("OAuth2 configuration is valid - Google authentication enabled");
    }

    public boolean isOAuth2Configured() {
        return oauth2Configured;
    }

    public String getConfigurationMessage() {
        if (oauth2Configured) {
            return "OAuth2 is properly configured";
        } else {
            return "OAuth2 is not configured. Please set up Google OAuth2 credentials in application.properties. " +
                   "See OAUTH2_SETUP.md for detailed instructions.";
        }
    }
}