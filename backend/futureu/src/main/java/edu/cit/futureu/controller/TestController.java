package edu.cit.futureu.controller;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
public class TestController {

    @Autowired
    private edu.cit.futureu.service.GeminiAIService geminiAIService;

    @Autowired
    private com.fasterxml.jackson.databind.ObjectMapper objectMapper;

    @GetMapping("/gemini")
    public ResponseEntity<?> testGeminiConnection(@RequestParam(defaultValue = "Brief test prompt") String prompt) {
        try {
            // Create a simple test request to Gemini API
            Map<String, Object> response = geminiAIService.testApiConnection(prompt);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "API connection failed");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    /**
     * Debug endpoint to test JSON extraction from Gemini responses
     */
    @GetMapping("/debug-json-extraction")
    public ResponseEntity<?> testJsonExtraction(@RequestParam String text) {
        try {
            Map<String, Object> result = new HashMap<>();
            
            // Basic markdown extraction test
            if (text.contains("```json")) {
                int startIndex = text.indexOf("```json") + 7;
                int endIndex = text.lastIndexOf("```");
                if (endIndex > startIndex) {
                    String extracted = text.substring(startIndex, endIndex).trim();
                    result.put("extractedJson", extracted);
                    
                    // Try to parse it
                    try {
                        JsonNode jsonNode = objectMapper.readTree(extracted);
                        result.put("parsedSuccessfully", true);
                        result.put("parsedNode", jsonNode);
                    } catch (Exception e) {
                        result.put("jsonParseError", e.getMessage());
                    }
                } else {
                    result.put("extractionError", "Could not find matching closing markdown tag");
                }
            } else {
                result.put("markdownTags", "No markdown tags found in input");
            }
            
            // Try full recommendation parsing
            result.put("fullParsingResult", geminiAIService.generateProgramRecommendations(null, null));
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "Failed to test JSON extraction",
                "message", e.getMessage()
            ));
        }
    }
}
