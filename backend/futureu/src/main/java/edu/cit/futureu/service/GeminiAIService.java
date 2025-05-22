package edu.cit.futureu.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;

import edu.cit.futureu.entity.AssessmentResultEntity;
import edu.cit.futureu.entity.ProgramEntity;
import edu.cit.futureu.entity.UserAssessmentSectionResultEntity;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class GeminiAIService {
    
    private final String apiKey = "AIzaSyBnxz2d-_geZKM8R3pDrJF5ZCZCOmjSVtk";
    private final String geminiEndpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    
    @Autowired
    private ProgramService programService;
    
    // Mapping to categorize program types - this will help with matching assessment results
    private static final Map<String, List<String>> PROGRAM_CATEGORY_KEYWORDS = Map.of(
        "STEM", List.of("engineering", "computer", "science", "technology", "mathematics", "physics", "chemistry", "biology", "information", "data", "statistics", "programming"),
        "ABM", List.of("business", "management", "accounting", "finance", "economics", "entrepreneurship", "marketing", "administration"),
        "HUMSS", List.of("humanities", "social", "psychology", "sociology", "anthropology", "history", "literature", "language", "communication", "education", "teaching", "political", "law"),
        "ARTS", List.of("art", "design", "music", "theater", "drama", "film", "animation", "creative", "performing", "visual", "fashion", "architecture"),
        "SPORTS", List.of("sports", "physical", "fitness", "exercise", "athletic", "coaching", "recreation", "leisure", "health"),
        "TVL", List.of("technical", "vocational", "industrial", "culinary", "hospitality", "tourism", "agriculture", "mechanical", "electrical", "electronics", "automotive", "construction")
    );
    
    public GeminiAIService() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }
    
    /**
     * Generate program recommendations based on assessment results
     */
    public Map<String, Object> generateProgramRecommendations(
            AssessmentResultEntity assessmentResult,
            List<UserAssessmentSectionResultEntity> sectionResults) {
        
        try {
            // Prepare the prompt for Gemini API
            String prompt = buildPromptFromAssessmentResults(assessmentResult, sectionResults);
            
            // Set up the request headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            // Create the request body
            ObjectNode requestBody = objectMapper.createObjectNode();
            ArrayNode contents = requestBody.putArray("contents");
            ObjectNode content = contents.addObject();
            ObjectNode parts = content.putObject("parts");
            parts.put("text", prompt);
            
            // Add API key to the URL
            String url = geminiEndpoint + "?key=" + apiKey;
            
            // Make the API call
            HttpEntity<String> request = new HttpEntity<>(requestBody.toString(), headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
            
            // Parse the response
            JsonNode responseJson = objectMapper.readTree(response.getBody());
            
            // Extract the generated text from the response
            String generatedText = "";
            if (responseJson.has("candidates") && responseJson.get("candidates").isArray() && 
                responseJson.get("candidates").size() > 0) {
                
                JsonNode candidate = responseJson.get("candidates").get(0);
                if (candidate.has("content") && candidate.get("content").has("parts") && 
                    candidate.get("content").get("parts").isArray() && 
                    candidate.get("content").get("parts").size() > 0) {
                    
                    generatedText = candidate.get("content").get("parts").get(0).get("text").asText();
                }
            }
            
            // Process the generated text to extract recommendations
            return parseRecommendationsFromText(generatedText);
            
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> errorResult = new HashMap<>();
            errorResult.put("error", "Failed to generate recommendations: " + e.getMessage());
            errorResult.put("suggestedPrograms", new ArrayList<>());
            return errorResult;
        }
    }
    
    /**
     * Build a detailed prompt based on assessment results
     */
    private String buildPromptFromAssessmentResults(
            AssessmentResultEntity assessmentResult,
            List<UserAssessmentSectionResultEntity> sectionResults) {
        
        StringBuilder promptBuilder = new StringBuilder();
        
        // Introduction with more specific guidance
        promptBuilder.append("You are an expert academic advisor.");
        promptBuilder.append("I need detailed college program recommendations based on a student's assessment results. ");
        promptBuilder.append("The recommendations should precisely match the student's strengths and interests shown in these scores:\n\n");
        
        // Overall scores
        promptBuilder.append("OVERALL ASSESSMENT SCORE: ").append(assessmentResult.getOverallScore()).append("/100\n\n");
        
        // GSA Scores
        promptBuilder.append("GENERAL SCHOLASTIC ABILITIES (GSA):\n");
        promptBuilder.append("- Overall GSA Score: ").append(assessmentResult.getGsaScore()).append("\n");
        promptBuilder.append("- Scientific Ability: ").append(assessmentResult.getScientificAbilityScore()).append("\n");
        promptBuilder.append("- Reading Comprehension: ").append(assessmentResult.getReadingComprehensionScore()).append("\n");
        promptBuilder.append("- Verbal Ability: ").append(assessmentResult.getVerbalAbilityScore()).append("\n");
        promptBuilder.append("- Mathematical Ability: ").append(assessmentResult.getMathematicalAbilityScore()).append("\n");
        promptBuilder.append("- Logical Reasoning: ").append(assessmentResult.getLogicalReasoningScore()).append("\n\n");
        
        // Academic Track Scores
        promptBuilder.append("ACADEMIC TRACK APTITUDE:\n");
        promptBuilder.append("- Overall Academic Track Score: ").append(assessmentResult.getAcademicTrackScore()).append("\n");
        promptBuilder.append("- STEM Track: ").append(assessmentResult.getStemScore()).append("\n");
        promptBuilder.append("- ABM (Accounting, Business, Management) Track: ").append(assessmentResult.getAbmScore()).append("\n");
        promptBuilder.append("- HUMSS (Humanities and Social Sciences) Track: ").append(assessmentResult.getHumssScore()).append("\n\n");
        
        // Other Track Scores
        promptBuilder.append("OTHER TRACK APTITUDE:\n");
        promptBuilder.append("- Overall Other Track Score: ").append(assessmentResult.getOtherTrackScore()).append("\n");
        promptBuilder.append("- TVL (Technical-Vocational-Livelihood) Track: ").append(assessmentResult.getTvlScore()).append("\n");
        promptBuilder.append("- Sports Track: ").append(assessmentResult.getSportsTrackScore()).append("\n");
        promptBuilder.append("- Arts and Design Track: ").append(assessmentResult.getArtsDesignTrackScore()).append("\n\n");
        
        // RIASEC Interest Scores
        promptBuilder.append("INTEREST AREAS (RIASEC):\n");
        promptBuilder.append("- Realistic (Hands-on, mechanical): ").append(assessmentResult.getRealisticScore()).append("\n");
        promptBuilder.append("- Investigative (Analytical, intellectual): ").append(assessmentResult.getInvestigativeScore()).append("\n");
        promptBuilder.append("- Artistic (Creative, original): ").append(assessmentResult.getArtisticScore()).append("\n");
        promptBuilder.append("- Social (Helping, teaching): ").append(assessmentResult.getSocialScore()).append("\n");
        promptBuilder.append("- Enterprising (Persuading, leading): ").append(assessmentResult.getEnterprisingScore()).append("\n");
        promptBuilder.append("- Conventional (Organizing, detail-oriented): ").append(assessmentResult.getConventionalScore()).append("\n\n");
        
        // Section-specific results
        promptBuilder.append("SECTION RESULTS:\n");
        for (UserAssessmentSectionResultEntity section : sectionResults) {
            promptBuilder.append("- ").append(section.getSectionName())
                .append(" (").append(section.getSectionType()).append("): ")
                .append(section.getPercentageScore()).append("% (")
                .append(section.getCorrectAnswers()).append("/").append(section.getTotalQuestions())
                .append(" correct)\n");
        }
        
        // Identify top strength areas
        Map<String, Double> strengths = identifyTopStrengthAreas(assessmentResult);
        promptBuilder.append("\nSTUDENT'S TOP STRENGTH AREAS:\n");
        strengths.entrySet().stream()
            .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
            .limit(3)
            .forEach(entry -> 
                promptBuilder.append("- ").append(entry.getKey()).append(": ").append(entry.getValue()).append("\n")
            );
        
        // Filter programs that match top strengths
        List<ProgramEntity> allPrograms = programService.getAllPrograms();
        List<ProgramEntity> filteredPrograms = filterProgramsByStrengths(allPrograms, strengths);
        
        // The request with more detailed instructions
        promptBuilder.append("\nBased on these assessment results, please provide:\n");
        promptBuilder.append("A summary of what are the stuent's strengths and weaknesses\n");
        promptBuilder.append("1. A ranked list of 5 MOST suitable college programs from the following options, ensuring each recommendation STRONGLY aligns with the student's specific strengths and RIASEC interests:\n");
        
        // Add programs to prompt
        Map<String, List<ProgramEntity>> categorizedPrograms = categorizeProgramsByType(filteredPrograms);
        
        // First add programs from the student's strongest categories
        for (String category : strengths.keySet()) {
            if (categorizedPrograms.containsKey(category)) {
                promptBuilder.append("\n" + category + " PROGRAMS:\n");
                for (ProgramEntity program : categorizedPrograms.get(category)) {
                    promptBuilder.append("   - ").append(program.getProgramName());
                    if (program.getDescription() != null && !program.getDescription().isEmpty()) {
                        promptBuilder.append(": ").append(program.getDescription());
                    }
                    promptBuilder.append("\n");
                }
            }
        }
        
        // Add remaining programs by category
        for (Map.Entry<String, List<ProgramEntity>> entry : categorizedPrograms.entrySet()) {
            if (!strengths.containsKey(entry.getKey())) {
                promptBuilder.append("\n" + entry.getKey() + " PROGRAMS:\n");
                for (ProgramEntity program : entry.getValue()) {
                    promptBuilder.append("   - ").append(program.getProgramName());
                    if (program.getDescription() != null && !program.getDescription().isEmpty()) {
                        promptBuilder.append(": ").append(program.getDescription());
                    }
                    promptBuilder.append("\n");
                }
            }
        }
        
        // Add detailed instruction for the AI response format
        promptBuilder.append("\n2. For each recommended program, provide a DETAILED explanation that connects specific assessment results to program requirements and career prospects\n");
        promptBuilder.append("3. Provide a confidence score (0-100) for each recommendation based on how well it matches the assessment profile\n");
        promptBuilder.append("4. Format the response as a structured JSON with these exact keys:\n");
        promptBuilder.append("   - 'summary': An object with 'strengths' (array of strings) and 'weaknesses' (array of strings)\n");
        promptBuilder.append("   - 'topPrograms': An array of objects, each with 'program' (string), 'explanation' (string), and 'confidenceScore' (number)\n");
        promptBuilder.append("5. IMPORTANT: Only recommend programs from the provided list above - exact program names must be used\n");
        promptBuilder.append("\nExample JSON Response:\n");
        promptBuilder.append("{\n");
        promptBuilder.append("  \"summary\": {\n");
        promptBuilder.append("    \"strengths\": [\"STEM\", \"Logical Reasoning\"],\n");
        promptBuilder.append("    \"weaknesses\": [\"Verbal Ability\"]\n");
        promptBuilder.append("  },\n");
        promptBuilder.append("  \"topPrograms\": [\n");
        promptBuilder.append("    {\n");
        promptBuilder.append("      \"program\": \"Computer Science\",\n");
        promptBuilder.append("      \"explanation\": \"Strong logical reasoning and STEM aptitude align with program requirements.\",\n");
        promptBuilder.append("      \"confidenceScore\": 95\n");
        promptBuilder.append("    }\n");
        promptBuilder.append("  ]\n");
        promptBuilder.append("}\n");
        
        return promptBuilder.toString();
    }
    
    /**
     * Identify the student's top strength areas based on assessment results.
     * This method calculates weighted scores for different areas and returns the top strengths.
     */
    private Map<String, Double> identifyTopStrengthAreas(AssessmentResultEntity result) {
        Map<String, Double> strengths = new HashMap<>();

        // STEM aptitude
        if (result.getStemScore() != null) {
            strengths.put("STEM", result.getStemScore());
        }

        // ABM aptitude
        if (result.getAbmScore() != null) {
            strengths.put("ABM", result.getAbmScore());
        }

        // HUMSS aptitude
        if (result.getHumssScore() != null) {
            strengths.put("HUMSS", result.getHumssScore());
        }

        // TVL aptitude
        if (result.getTvlScore() != null) {
            strengths.put("TVL", result.getTvlScore());
        }

        // Sports aptitude
        if (result.getSportsTrackScore() != null) {
            strengths.put("Sports", result.getSportsTrackScore());
        }

        // Arts and Design aptitude
        if (result.getArtsDesignTrackScore() != null) {
            strengths.put("Arts and Design", result.getArtsDesignTrackScore());
        }

        // Normalize and sort strengths (if needed, normalization logic can be added here)
        return strengths;
    }
    
    /**
     * Filter programs based on student strengths
     */
    private List<ProgramEntity> filterProgramsByStrengths(List<ProgramEntity> allPrograms, Map<String, Double> strengths) {
        List<ProgramEntity> filteredPrograms = new ArrayList<>();
        
        // Get top 3 strength categories
        List<String> topCategories = strengths.entrySet().stream()
            .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
            .limit(3)
            .map(Map.Entry::getKey)
            .collect(Collectors.toList());
        
        // First pass: add all programs that match top categories
        for (ProgramEntity program : allPrograms) {
            String programText = (program.getProgramName() + " " + 
                                 (program.getDescription() != null ? program.getDescription() : "")).toLowerCase();
            
            for (String category : topCategories) {
                List<String> keywords = PROGRAM_CATEGORY_KEYWORDS.get(category);
                if (keywords != null) {
                    for (String keyword : keywords) {
                        if (programText.contains(keyword.toLowerCase())) {
                            filteredPrograms.add(program);
                            break;
                        }
                    }
                }
            }
        }
        
        // If we don't have enough programs, add more
        if (filteredPrograms.size() < 30) {
            // Add programs that didn't match initially
            for (ProgramEntity program : allPrograms) {
                if (!filteredPrograms.contains(program)) {
                    filteredPrograms.add(program);
                    
                    // Stop when we reach 50 programs
                    if (filteredPrograms.size() >= 50) {
                        break;
                    }
                }
            }
        }
        
        return filteredPrograms;
    }
    
    /**
     * Categorize programs by their types (STEM, ABM, HUMSS, etc.)
     */
    private Map<String, List<ProgramEntity>> categorizeProgramsByType(List<ProgramEntity> programs) {
        Map<String, List<ProgramEntity>> categorizedPrograms = new HashMap<>();
        
        // Initialize categories
        for (String category : PROGRAM_CATEGORY_KEYWORDS.keySet()) {
            categorizedPrograms.put(category, new ArrayList<>());
        }
        
        // Add "Other" category for programs that don't match any category
        categorizedPrograms.put("OTHER", new ArrayList<>());
        
        // Categorize each program
        for (ProgramEntity program : programs) {
            String programText = (program.getProgramName() + " " + 
                                 (program.getDescription() != null ? program.getDescription() : "")).toLowerCase();
            
            boolean categorized = false;
            
            // Check against each category's keywords
            for (Map.Entry<String, List<String>> entry : PROGRAM_CATEGORY_KEYWORDS.entrySet()) {
                String category = entry.getKey();
                List<String> keywords = entry.getValue();
                
                for (String keyword : keywords) {
                    if (programText.contains(keyword.toLowerCase())) {
                        categorizedPrograms.get(category).add(program);
                        categorized = true;
                        break;
                    }
                }
                
                if (categorized) break;
            }
            
            // If not categorized, add to "Other"
            if (!categorized) {
                categorizedPrograms.get("OTHER").add(program);
            }
        }
        
        return categorizedPrograms;
    }
    
    /**
     * Find the closest matching program in the database with improved matching
     */
    private ProgramEntity findClosestProgramMatch(String recommendedName, List<ProgramEntity> programs) {
        ProgramEntity bestMatch = null;
        double highestScore = 0.4; // Lower threshold to consider more programs
        
        // Convert recommended name to lowercase for comparison
        String normalizedRecommendName = recommendedName.toLowerCase();
        
        for (ProgramEntity program : programs) {
            // Get program name in lowercase
            String normalizedProgramName = program.getProgramName().toLowerCase();
            
            // Calculate various similarity measures
            double exactMatchScore = normalizedProgramName.equals(normalizedRecommendName) ? 1.0 : 0.0;
            double containsScore = normalizedProgramName.contains(normalizedRecommendName) || 
                                  normalizedRecommendName.contains(normalizedProgramName) ? 0.8 : 0.0;
            double jaccardScore = calculateSimilarity(normalizedRecommendName, normalizedProgramName);
            double levenshteinScore = calculateLevenshteinSimilarity(normalizedRecommendName, normalizedProgramName);
            
            // Weight the scores with preference for exact matches
            double combinedScore = exactMatchScore * 0.6 + 
                                  containsScore * 0.2 + 
                                  jaccardScore * 0.1 + 
                                  levenshteinScore * 0.1;
            
            // If program has a description, check it too
            if (program.getDescription() != null && !program.getDescription().isEmpty()) {
                String normalizedDescription = program.getDescription().toLowerCase();
                double descriptionSimilarity = calculateSimilarity(normalizedRecommendName, normalizedDescription);
                
                // Add a small boost if the description matches
                combinedScore += descriptionSimilarity * 0.1;
            }
            
            // Update best match if this one is better
            if (combinedScore > highestScore) {
                highestScore = combinedScore;
                bestMatch = program;
            }
        }
        
        return bestMatch;
    }
    
    /**
     * Calculate similarity between two strings using Jaccard similarity
     */
    private double calculateSimilarity(String s1, String s2) {
        // Convert to sets of words for Jaccard similarity
        Set<String> words1 = new HashSet<>(Arrays.asList(s1.split("\\s+")));
        Set<String> words2 = new HashSet<>(Arrays.asList(s2.split("\\s+")));
        
        // Get intersection and union sizes
        Set<String> intersection = new HashSet<>(words1);
        intersection.retainAll(words2);
        
        Set<String> union = new HashSet<>(words1);
        union.addAll(words2);
        
        // Return Jaccard similarity coefficient
        return union.isEmpty() ? 0 : (double) intersection.size() / union.size();
    }
    
    /**
     * Calculate Levenshtein distance similarity (edit distance)
     */
    private double calculateLevenshteinSimilarity(String s1, String s2) {
        int[][] dp = new int[s1.length() + 1][s2.length() + 1];
        
        for (int i = 0; i <= s1.length(); i++) {
            for (int j = 0; j <= s2.length(); j++) {
                if (i == 0) {
                    dp[i][j] = j;
                } else if (j == 0) {
                    dp[i][j] = i;
                } else {
                    dp[i][j] = min(
                        dp[i - 1][j - 1] + (s1.charAt(i - 1) == s2.charAt(j - 1) ? 0 : 1),
                        dp[i - 1][j] + 1,
                        dp[i][j - 1] + 1
                    );
                }
            }
        }
        
        int maxLength = Math.max(s1.length(), s2.length());
        if (maxLength == 0) return 1.0; // Both strings empty
        
        // Convert edit distance to similarity score (1 - normalized distance)
        return 1.0 - ((double) dp[s1.length()][s2.length()] / maxLength);
    }
    
    private int min(int a, int b, int c) {
        return Math.min(Math.min(a, b), c);
    }
    
    /**
     * Parse the AI-generated text into a structured recommendation format and match with database programs
     */
    private Map<String, Object> parseRecommendationsFromText(String generatedText) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            // Store the original raw response for debugging
            result.put("rawResponse", generatedText);
            System.out.println("Raw Gemini response: " + generatedText);
            
            // First, check if the response is wrapped in a markdown code block
            String jsonContent = generatedText;
            if (generatedText.contains("```json")) {
                // Extract just the JSON content from inside the code block
                int startIndex = generatedText.indexOf("```json") + 7;
                int endIndex = generatedText.lastIndexOf("```");
                if (endIndex > startIndex) {
                    jsonContent = generatedText.substring(startIndex, endIndex).trim();
                    System.out.println("Extracted JSON from markdown: " + jsonContent);
                    result.put("extractedJson", jsonContent); // Add to result for debugging
                }
            }
            
            // Try to parse as JSON
            System.out.println("Attempting to parse as JSON: " + jsonContent);
            JsonNode jsonNode = objectMapper.readTree(jsonContent);
            System.out.println("Successfully parsed JSON");
            
            // After extracting recommendations, match with actual database programs
            List<Map<String, Object>> recommendedPrograms = new ArrayList<>();
            List<ProgramEntity> databasePrograms = programService.getAllPrograms();
            
            // Create a map for quicker lookups
            Map<String, ProgramEntity> programNameMap = new HashMap<>();
            for (ProgramEntity program : databasePrograms) {
                programNameMap.put(program.getProgramName().toLowerCase(), program);
            }
            
            if (jsonNode.has("topPrograms") && jsonNode.get("topPrograms").isArray()) {
                System.out.println("Found topPrograms array in JSON");
                // Extract programs from topPrograms array
                ArrayNode topProgramsNode = (ArrayNode) jsonNode.get("topPrograms");
                
                for (JsonNode programNode : topProgramsNode) {
                    Map<String, Object> programMap = new HashMap<>();
                    
                    // Handle different field names for program/name
                    if (programNode.has("name")) {
                        programMap.put("name", programNode.get("name").asText());
                    } else if (programNode.has("program")) {
                        programMap.put("name", programNode.get("program").asText());
                        System.out.println("Found program field instead of name: " + programNode.get("program").asText());
                    }
                    
                    // Handle different field names for description/explanation
                    if (programNode.has("description")) {
                        programMap.put("description", programNode.get("description").asText());
                    } else if (programNode.has("explanation")) {
                        programMap.put("description", programNode.get("explanation").asText());
                        System.out.println("Found explanation field instead of description");
                    }
                    
                    // Extract confidence score
                    if (programNode.has("confidenceScore")) {
                        programMap.put("confidenceScore", programNode.get("confidenceScore").asDouble());
                    }
                    
                    // Match recommended programs with database programs
                    String recommendedName = ((String) programMap.get("name")).toLowerCase();
                    
                    // First try exact match
                    ProgramEntity matchedProgram = programNameMap.get(recommendedName);
                    
                    // If no exact match, try to find the closest match
                    if (matchedProgram == null) {
                        matchedProgram = findClosestProgramMatch(recommendedName, databasePrograms);
                    }
                    
                    if (matchedProgram != null) {
                        // Add database program ID and other details
                        programMap.put("programId", matchedProgram.getProgramId());
                        programMap.put("name", matchedProgram.getProgramName()); // Use exact database name
                        
                        // If there's no description in AI response, use the database description
                        if (!programMap.containsKey("description") || programMap.get("description") == null) {
                            programMap.put("description", matchedProgram.getDescription());
                        }
                    }
                    
                    recommendedPrograms.add(programMap);
                }
                
                result.put("suggestedPrograms", recommendedPrograms);
                
                // Extract overall explanation
                if (jsonNode.has("explanation")) {
                    result.put("explanation", jsonNode.get("explanation").asText());
                }
                
                // Extract overall confidence score
                if (jsonNode.has("confidenceScore")) {
                    result.put("confidenceScore", jsonNode.get("confidenceScore").asDouble());
                }
            } else {
                // Fallback - use programs from database instead of hardcoded defaults
                System.out.println("JSON structure not as expected, using fallback extraction method");
                result.put("parseWarning", "Expected JSON structure not found, using fallback extraction");
                result.put("suggestedPrograms", createRecommendationsFromDatabase(databasePrograms, 5));
                result.put("explanation", "Recommendations generated from available programs based on assessment results.");
                result.put("confidenceScore", 65.0);
            }
            
        } catch (Exception e) {
            e.printStackTrace();
            System.out.println("Error parsing recommendation: " + e.getMessage());
            
            // Fallback to database programs on error
            List<ProgramEntity> databasePrograms = programService.getAllPrograms();
            result.put("error", "Failed to parse recommendation: " + e.getMessage());
            result.put("suggestedPrograms", createRecommendationsFromDatabase(databasePrograms, 5));
            result.put("explanation", "Fallback recommendations from available programs.");
            result.put("confidenceScore", 60.0);
        }
        
        return result;
    }
    
    /**
     * Create recommendations from database programs when AI fails
     */
    private List<Map<String, Object>> createRecommendationsFromDatabase(List<ProgramEntity> programs, int limit) {
        List<Map<String, Object>> recommendations = new ArrayList<>();
        
        // Ensure we don't exceed the available programs
        int count = Math.min(limit, programs.size());
        
        // Generate some generic recommendations based on database programs
        for (int i = 0; i < count; i++) {
            ProgramEntity program = programs.get(i);
            Map<String, Object> recommendation = new HashMap<>();
            
            recommendation.put("programId", program.getProgramId());
            recommendation.put("name", program.getProgramName());
            recommendation.put("description", program.getDescription() != null ? 
                program.getDescription() : "Recommended based on assessment results");
            recommendation.put("confidenceScore", 80.0 - (i * 5.0)); // Decreasing confidence scores
            
            recommendations.add(recommendation);
        }
        
        return recommendations;
    }
    
    /**
     * Test the Gemini API connection with a simple prompt
     */
    public Map<String, Object> testApiConnection(String prompt) {
        try {
            // Set up the request headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            // Create the request body
            ObjectNode requestBody = objectMapper.createObjectNode();
            ArrayNode contents = requestBody.putArray("contents");
            ObjectNode content = contents.addObject();
            ObjectNode parts = content.putObject("parts");
            parts.put("text", "Please respond to this test prompt: " + prompt);
            
            // Add API key to the URL
            String url = geminiEndpoint + "?key=" + apiKey;
            
            // Make the API call
            HttpEntity<String> request = new HttpEntity<>(requestBody.toString(), headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
            
            // Parse the response
            Map<String, Object> result = new HashMap<>();
            result.put("statusCode", response.getStatusCode().value());
            result.put("success", true);
            
            // Extract the generated text from the response
            JsonNode responseJson = objectMapper.readTree(response.getBody());
            String generatedText = "";
            
            if (responseJson.has("candidates") && responseJson.get("candidates").isArray() && 
                responseJson.get("candidates").size() > 0) {
                
                JsonNode candidate = responseJson.get("candidates").get(0);
                if (candidate.has("content") && candidate.get("content").has("parts") && 
                    candidate.get("content").get("parts").isArray() && 
                    candidate.get("content").get("parts").size() > 0) {
                    
                    generatedText = candidate.get("content").get("parts").get(0).get("text").asText();
                }
            }
            
            result.put("response", generatedText);
            return result;
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> errorResult = new HashMap<>();
            errorResult.put("success", false);
            errorResult.put("error", e.getMessage());
            return errorResult;
        }
    }
}
