package edu.cit.futureu.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;

import edu.cit.futureu.entity.AssessmentResultEntity;
import edu.cit.futureu.entity.UserAssessmentSectionResultEntity;

public class GeminiAIServiceTest {

    @InjectMocks
    private GeminiAIService geminiAIService;
    
    @Mock
    private RestTemplate restTemplate;
    
    @Mock
    private ObjectMapper objectMapper;
    
    @Mock
    private ObjectNode mockObjectNode;
    
    @Mock
    private ArrayNode mockArrayNode;

    @BeforeEach
    public void setup() {
        MockitoAnnotations.openMocks(this);
        
        // Set up ObjectMapper mock behavior
        when(objectMapper.createObjectNode()).thenReturn(mockObjectNode);
        when(mockObjectNode.putArray(anyString())).thenReturn(mockArrayNode);
        when(mockArrayNode.addObject()).thenReturn(mockObjectNode);
        when(mockObjectNode.putObject(anyString())).thenReturn(mockObjectNode);
        when(mockObjectNode.put(anyString(), anyString())).thenReturn(mockObjectNode);
    }

    @Test
    public void testApiConnection() throws Exception {
        // Prepare a mock response
        String responseJson = "{\"candidates\":[{\"content\":{\"parts\":[{\"text\":\"This is a test response\"}]}}]}";
        ResponseEntity<String> mockResponse = new ResponseEntity<>(responseJson, HttpStatus.OK);
        
        // Mock the RestTemplate to return our response
        when(restTemplate.postForEntity(anyString(), any(HttpEntity.class), eq(String.class)))
            .thenReturn(mockResponse);
        
        // Mock ObjectMapper readTree method
        ObjectNode responseNode = mock(ObjectNode.class);
        ArrayNode candidatesNode = mock(ArrayNode.class);
        ObjectNode candidateNode = mock(ObjectNode.class);
        ObjectNode contentNode = mock(ObjectNode.class);
        ArrayNode partsNode = mock(ArrayNode.class);
        ObjectNode partNode = mock(ObjectNode.class);
        
        when(objectMapper.readTree(anyString())).thenReturn(responseNode);
        when(responseNode.has("candidates")).thenReturn(true);
        when(responseNode.get("candidates")).thenReturn(candidatesNode);
        when(candidatesNode.isArray()).thenReturn(true);
        when(candidatesNode.size()).thenReturn(1);
        when(candidatesNode.get(0)).thenReturn(candidateNode);
        when(candidateNode.has("content")).thenReturn(true);
        when(candidateNode.get("content")).thenReturn(contentNode);
        when(contentNode.has("parts")).thenReturn(true);
        when(contentNode.get("parts")).thenReturn(partsNode);
        when(partsNode.isArray()).thenReturn(true);
        when(partsNode.size()).thenReturn(1);
        when(partsNode.get(0)).thenReturn(partNode);
        when(partNode.get("text")).thenReturn(partNode);
        when(partNode.asText()).thenReturn("This is a test response");
        
        // Call the method
        Map<String, Object> result = geminiAIService.testApiConnection("Test prompt");
        
        // Verify the result
        assertTrue((Boolean) result.get("success"));
        assertEquals("This is a test response", result.get("response"));
    }

    @Test
    public void testGenerateProgramRecommendations() {
        // Create mock assessment result and section results
        AssessmentResultEntity mockResult = new AssessmentResultEntity();
        mockResult.setOverallScore(85.0);
        mockResult.setStemScore(90.0);
        mockResult.setGsaScore(88.0);
        mockResult.setMathematicalAbilityScore(95.0);
        mockResult.setLogicalReasoningScore(92.0);
        
        List<UserAssessmentSectionResultEntity> mockSectionResults = new ArrayList<>();
        UserAssessmentSectionResultEntity section1 = new UserAssessmentSectionResultEntity();
        section1.setSectionName("Scientific Ability");
        section1.setSectionType("GSA");
        section1.setPercentageScore(92.5);
        mockSectionResults.add(section1);
        
        // Same mocking for RestTemplate as in testApiConnection
        String responseJson = "{\"candidates\":[{\"content\":{\"parts\":[{\"text\":" +
                              "\"{\\\"topPrograms\\\":[{\\\"name\\\":\\\"Computer Science\\\",\\\"description\\\":\\\"Strong match for mathematical ability\\\",\\\"confidenceScore\\\":90}],\\\"explanation\\\":\\\"Based on high STEM scores\\\",\\\"confidenceScore\\\":85}\"" +
                              "}]}}]}";
        ResponseEntity<String> mockResponse = new ResponseEntity<>(responseJson, HttpStatus.OK);
        
        when(restTemplate.postForEntity(anyString(), any(HttpEntity.class), eq(String.class)))
            .thenReturn(mockResponse);
        
        // Setup ObjectMapper behavior for parsing the response
        // Similar to testApiConnection but with different return values
        
        // Call the method
        Map<String, Object> recommendations = geminiAIService.generateProgramRecommendations(mockResult, mockSectionResults);
        
        // Assertions would depend on exact implementation and response format
        // This is a placeholder for the actual assertions
        assertNotNull(recommendations);
        // More specific assertions would go here based on expected output format
    }
}
