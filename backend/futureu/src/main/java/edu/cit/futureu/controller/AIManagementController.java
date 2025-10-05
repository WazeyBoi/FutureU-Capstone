package edu.cit.futureu.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import edu.cit.futureu.service.GeminiAIService;
import edu.cit.futureu.service.RequestPriorityService;

@RestController
@RequestMapping("/api/admin")
public class AIManagementController {
    
    @Autowired
    private GeminiAIService geminiAIService;
    
    @Autowired
    private RequestPriorityService requestPriorityService;
    
    /**
     * Reset circuit breaker manually (call this after quota refresh)
     */
    @PostMapping("/reset-circuit-breaker")
    public ResponseEntity<Map<String, Object>> resetCircuitBreaker() {
        try {
            String statusBefore = geminiAIService.getCircuitBreakerStatus();
            geminiAIService.resetCircuitBreaker();
            String statusAfter = geminiAIService.getCircuitBreakerStatus();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Circuit breaker reset successfully");
            response.put("statusBefore", statusBefore);
            response.put("statusAfter", statusAfter);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    /**
     * Get current circuit breaker and queue status
     */
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getSystemStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("circuitBreaker", geminiAIService.getCircuitBreakerStatus());
        status.put("requestQueue", requestPriorityService.getQueueStatus());
        return ResponseEntity.ok(status);
    }
    
    /**
     * Clear all pending requests (emergency)
     */
    @PostMapping("/clear-queue")
    public ResponseEntity<Map<String, Object>> clearRequestQueue() {
        try {
            requestPriorityService.clearQueue();
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Request queue cleared");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    /**
     * Test rate limiting functionality
     */
    @PostMapping("/test-rate-limit")
    public ResponseEntity<Map<String, Object>> testRateLimit() {
        try {
            Map<String, Object> result = geminiAIService.testRateLimiting();
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
}