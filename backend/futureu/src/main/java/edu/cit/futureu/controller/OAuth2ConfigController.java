package edu.cit.futureu.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import edu.cit.futureu.config.OAuth2ConfigValidator;

import java.util.HashMap;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:5173", maxAge = 3600, allowCredentials = "true")
@RestController
@RequestMapping("/api/oauth2")
public class OAuth2ConfigController {

    @Autowired
    private OAuth2ConfigValidator oauth2ConfigValidator;

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getOAuth2Status() {
        Map<String, Object> response = new HashMap<>();
        response.put("configured", oauth2ConfigValidator.isOAuth2Configured());
        response.put("message", oauth2ConfigValidator.getConfigurationMessage());
        
        return ResponseEntity.ok(response);
    }
}