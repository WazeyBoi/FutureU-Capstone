package edu.cit.futureu.service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

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
import edu.cit.futureu.entity.CareerEntity;
import edu.cit.futureu.entity.ProgramEntity;
import edu.cit.futureu.entity.SchoolProgramEntity;
import edu.cit.futureu.entity.UserAssessmentSectionResultEntity;

@Service
public class GeminiAIService {
    
    private final String apiKey = "AIzaSyD6eaRsrdObk8XHYIEgu7NucuV5er_-Qw4";
    private final String geminiEndpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    
    // Rate limiting variables - Optimized for better performance
    private static final long RATE_LIMIT_DELAY_MS = 2000; // 2 seconds between API calls (Gemini allows 60 requests/minute)
    private static final long CIRCUIT_BREAKER_TIMEOUT_MS = 60000; // 1 minute circuit breaker (faster recovery)
    private static final int MAX_CONSECUTIVE_FAILURES = 3; // Open after 3 failures (more tolerant)
    
    private final AtomicLong lastApiCall = new AtomicLong(0);
    private final AtomicLong circuitBreakerUntil = new AtomicLong(0);
    private final AtomicLong consecutiveFailures = new AtomicLong(0);
    
    // Simple cache for AI responses (in production, use Redis or similar)
    private final Map<String, String> responseCache = new ConcurrentHashMap<>();
    private static final long CACHE_EXPIRY_MS = 3600000; // 1 hour
    private final Map<String, Long> cacheTimestamps = new ConcurrentHashMap<>();
    
    @Autowired
    private CareerService careerService;
    // @Autowired
    // private CareerProgramService careerProgramService;
    @Autowired
    private ProgramService programService;
    @Autowired
    private SchoolProgramService schoolProgramService;
    
    // Mapping to categorize career types - update keywords if needed
    private static final Map<String, List<String>> CAREER_CATEGORY_KEYWORDS = Map.of(
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
     * Generate career pathway recommendations based on assessment results with rate limiting
     */
    public Map<String, Object> generateCareerRecommendations(
            AssessmentResultEntity assessmentResult,
            List<UserAssessmentSectionResultEntity> sectionResults) {
        
        // Check circuit breaker first
        if (isCircuitBreakerOpen()) {
            System.out.println("Circuit breaker is open, using fallback career recommendations");
            return createFallbackRecommendations();
        }
        
        try {
            // Prepare the prompt for Gemini API
            String prompt = buildPromptFromAssessmentResults(assessmentResult, sectionResults);
            String cacheKey = generatePromptCacheKey(assessmentResult, sectionResults);
            
            // Check cache first
            String cachedResponse = getCachedResponse(cacheKey);
            if (cachedResponse != null) {
                System.out.println("Using cached career recommendations");
                return parseRecommendationsFromText(cachedResponse);
            }
            
            // Apply rate limiting
            waitForRateLimit();
            
            String generatedText = makeAIRequest(prompt);
            
            // Cache the response
            cacheResponse(cacheKey, generatedText);
            
            // Reset failure counter on success
            consecutiveFailures.set(0);
            
            // Process the generated text to extract recommendations
            return parseRecommendationsFromText(generatedText);
            
        } catch (Exception e) {
            handleApiFailure(e);
            System.err.println("Error generating career recommendations: " + e.getMessage());
            return createFallbackRecommendations();
        }
    }
    
    /**
     * Create fallback recommendations when AI is unavailable
     */
    private Map<String, Object> createFallbackRecommendations() {
        Map<String, Object> result = new HashMap<>();
        List<CareerEntity> databaseCareers = careerService.getAllCareers();
        
        result.put("error", "AI recommendations unavailable, using fallback");
        result.put("suggestedCareers", createRecommendationsFromDatabase(databaseCareers, 5));
        result.put("explanation", "Fallback recommendations from available careers.");
        result.put("confidenceScore", 60.0);
        result.put("fallback", true);
        
        return result;
    }
    
    /**
     * Generate cache key for main recommendation prompts
     */
    private String generatePromptCacheKey(AssessmentResultEntity assessmentResult, 
                                         List<UserAssessmentSectionResultEntity> sectionResults) {
        StringBuilder keyBuilder = new StringBuilder();
        keyBuilder.append("main_recommendation_");
        keyBuilder.append(assessmentResult.getResultId());
        keyBuilder.append("_overall_").append((int)(assessmentResult.getOverallScore() != null ? assessmentResult.getOverallScore() : 0));
        
        // Add key assessment scores for cache differentiation
        if (assessmentResult.getStemScore() != null) keyBuilder.append("_stem_").append(assessmentResult.getStemScore().intValue());
        if (assessmentResult.getAbmScore() != null) keyBuilder.append("_abm_").append(assessmentResult.getAbmScore().intValue());
        if (assessmentResult.getHumssScore() != null) keyBuilder.append("_humss_").append(assessmentResult.getHumssScore().intValue());
        
        return keyBuilder.toString().replaceAll("[^a-zA-Z0-9_]", "");
    }
    
    /**
     * Build a detailed prompt based on assessment results
     */
    private String buildPromptFromAssessmentResults(
            AssessmentResultEntity assessmentResult,
            List<UserAssessmentSectionResultEntity> sectionResults) {
        
        StringBuilder promptBuilder = new StringBuilder();
        
        // Introduction with more specific guidance
        promptBuilder.append("You are an expert career advisor.");
        promptBuilder.append("I need detailed career pathway recommendations based on a student's assessment results. ");
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
        promptBuilder.append("INTEREST AREAS (RIASEC) - Based on 60 total interest questions:\n");
        promptBuilder.append("- Realistic (Hands-on, mechanical): ").append(assessmentResult.getRealisticScore()).append(" agree responses\n");
        promptBuilder.append("- Investigative (Analytical, intellectual): ").append(assessmentResult.getInvestigativeScore()).append(" agree responses\n");
        promptBuilder.append("- Artistic (Creative, original): ").append(assessmentResult.getArtisticScore()).append(" agree responses\n");
        promptBuilder.append("- Social (Helping, teaching): ").append(assessmentResult.getSocialScore()).append(" agree responses\n");
        promptBuilder.append("- Enterprising (Persuading, leading): ").append(assessmentResult.getEnterprisingScore()).append(" agree responses\n");
        promptBuilder.append("- Conventional (Organizing, detail-oriented): ").append(assessmentResult.getConventionalScore()).append(" agree responses\n\n");
        
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
        
        // Filter careers that match top strengths
        List<CareerEntity> allCareers = careerService.getAllCareers();
        List<CareerEntity> filteredCareers = filterCareersByStrengths(allCareers, strengths);
        
        // The request with more detailed instructions
        promptBuilder.append("\nBased on these assessment results, please provide:\n");
        promptBuilder.append("A summary of what are the student's strengths and weaknesses\n");
        promptBuilder.append("1. A ranked list of 5 MOST suitable career pathways from the following options, ensuring each recommendation STRONGLY aligns with the student's specific strengths and RIASEC interests:\n");
        promptBuilder.append("\nDIVERSITY REQUIREMENT: Select 2 careers from the student's highest scoring track/category, and 1 career each from the next 3 highest scoring tracks/categories (if available). If there are not enough categories, fill the rest with the next best matches from any field, but avoid duplicates.\n");
        promptBuilder.append("This ensures the list is both highly relevant and diverse.\n");
        
        // Add careers to prompt
        Map<String, List<CareerEntity>> categorizedCareers = categorizeCareersByType(filteredCareers);
        
        // First add careers from the student's strongest categories
        for (String category : strengths.keySet()) {
            if (categorizedCareers.containsKey(category)) {
                promptBuilder.append("\n" + category + " CAREERS:\n");
                for (CareerEntity career : categorizedCareers.get(category)) {
                    promptBuilder.append("   - Title: ").append(career.getCareerTitle());
                    if (career.getCareerDescription() != null && !career.getCareerDescription().isEmpty()) {
                        promptBuilder.append(" | Description: ").append(career.getCareerDescription());
                    }
                    if (career.getIndustry() != null && !career.getIndustry().isEmpty()) {
                        promptBuilder.append(" | Industry: ").append(career.getIndustry());
                    }
                    promptBuilder.append("\n");
                }
            }
        }
        
        // Add remaining careers by category
        for (Map.Entry<String, List<CareerEntity>> entry : categorizedCareers.entrySet()) {
            if (!strengths.containsKey(entry.getKey())) {
                promptBuilder.append("\n" + entry.getKey() + " CAREERS:\n");
                for (CareerEntity career : entry.getValue()) {
                    promptBuilder.append("   - Title: ").append(career.getCareerTitle());
                    if (career.getCareerDescription() != null && !career.getCareerDescription().isEmpty()) {
                        promptBuilder.append(" | Description: ").append(career.getCareerDescription());
                    }
                    if (career.getIndustry() != null && !career.getIndustry().isEmpty()) {
                        promptBuilder.append(" | Industry: ").append(career.getIndustry());
                    }
                    promptBuilder.append("\n");
                }
            }
        }
        
        // Add all available programs to the prompt
        List<ProgramEntity> allPrograms = programService.getAllPrograms();
        promptBuilder.append("\nAVAILABLE PROGRAMS:\n");
        for (ProgramEntity program : allPrograms) {
            promptBuilder.append("- [ID: ").append(program.getProgramId()).append("] ")
                .append(program.getProgramName());
            if (program.getDescription() != null && !program.getDescription().isEmpty()) {
                promptBuilder.append(" | Description: ").append(program.getDescription());
            }
            promptBuilder.append("\n");
        }
        promptBuilder.append("\nIMPORTANT: From the AVAILABLE PROGRAMS list above, select and recommend exactly 5 programs that best match the student's top 5 recommended careers. ");
        promptBuilder.append("For each program, include programId, programName, description, confidenceScore (0-100), and a highly detailed, globally relevant explanation of why it fits the student. The explanation should:");
        promptBuilder.append("\n   - Reference real-world trends, job market data, and global opportunities related to the program.");
        promptBuilder.append("\n   - Mention the types of roles, industries, and future prospects associated with the program, both locally and internationally.");
        promptBuilder.append("\n   - Highlight unique features or advantages of the program, and how it prepares students for success in a changing world.");
        promptBuilder.append("\n   - Use up-to-date, motivational, and student-centered language, helping the student visualize their future and inspiring them to pursue their goals.");
        promptBuilder.append("\n   - Connect the program to the student's strengths, interests, and assessment results, and explain how it can open doors to meaningful and rewarding careers worldwide.\n");
        
        // Add detailed instruction for the AI response format
        promptBuilder.append("\nIMPORTANT: For each career, consider the title, description, and industry fields when matching recommendations.\n");
        promptBuilder.append("\n2. For the recommendations, ensure the FINAL LIST contains exactly 5 careers, and DIVERSIFY the fields as much as possible (e.g., do not recommend 5 from the same track/category/industry).\n");
        promptBuilder.append("If the top matches are all from the same field, replace some with the next best matches from other fields, so the list is varied but still relevant.\n");
        promptBuilder.append("3. For each recommended career pathway, provide a DETAILED, LONG, and highly personalized explanation that:");
        promptBuilder.append("\n   - Clearly connects the student's specific assessment results, strengths, and interests to the requirements, daily work, and long-term prospects of the career.");
        promptBuilder.append("\n   - Uses motivational, engaging, and self-discovery language. For example, say things like: 'You are more likely to excel at...', 'You have a natural ability to...', 'People with your strengths often find fulfillment in...', 'Your unique combination of skills means you can...'.");
        promptBuilder.append("\n   - Helps the student visualize themselves in the role, describing what they might enjoy, achieve, or contribute, and how their strengths will help them succeed and feel fulfilled.");
        promptBuilder.append("\n   - Offers insights about how their personality and abilities make them a great fit, and encourages them to explore their potential in this field.");
        promptBuilder.append("\n   - The explanation should be long, detailed, and written in a positive, inspiring, and student-centered tone, sparking the student's interest in themselves and their future.");
        promptBuilder.append("4. Provide a confidence score (0-100) for each recommendation based on how well it matches the assessment profile\n");
        promptBuilder.append("5. Your response MUST be a single JSON object, with NO extra text, markdown, or explanation. The structure MUST match this sample exactly (including all keys and field names):\n");
        promptBuilder.append("{\n");
        promptBuilder.append("  \"summary\": {\n");
        promptBuilder.append("    \"strengths\": [\"...\"],\n");
        promptBuilder.append("    \"weaknesses\": [\"...\"]\n");
        promptBuilder.append("  },\n");
        promptBuilder.append("  \"topCareers\": [\n");
        promptBuilder.append("    {\n");
        promptBuilder.append("      \"careerId\": 0,\n");
        promptBuilder.append("      \"career\": \"...\",\n");
        promptBuilder.append("      \"explanation\": \"...\",\n");
        promptBuilder.append("      \"confidenceScore\": 0,\n");
        promptBuilder.append("      \"category\": \"...\"\n");
        promptBuilder.append("    }\n    // ...4 more objects\n  ],\n");
        promptBuilder.append("  \"topPrograms\": [\n");
        promptBuilder.append("    {\n");
        promptBuilder.append("      \"programId\": 0,\n");
        promptBuilder.append("      \"programName\": \"...\",\n");
        promptBuilder.append("      \"description\": \"...\",\n");
        promptBuilder.append("      \"confidenceScore\": 0,\n");
        promptBuilder.append("      \"explanation\": \"...\"\n");
        promptBuilder.append("    },\n");
        promptBuilder.append("    { /* 2nd program */ },\n");
        promptBuilder.append("    { /* 3rd program */ },\n");
        promptBuilder.append("    { /* 4th program */ },\n");
        promptBuilder.append("    { /* 5th program */ }\n");
        promptBuilder.append("  ]\n}\n");
        promptBuilder.append("- All fields are required. Do NOT include any text before or after the JSON. Do NOT use markdown code blocks.\n");
        promptBuilder.append("6. IMPORTANT: Only recommend career pathways from the provided list above - exact career titles must be used\n");
        
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
     * Filter careers based on student strengths
     */
    private List<CareerEntity> filterCareersByStrengths(List<CareerEntity> allCareers, Map<String, Double> strengths) {
        List<CareerEntity> filteredCareers = new ArrayList<>();
        
        // Get top 3 strength categories
        List<String> topCategories = strengths.entrySet().stream()
            .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
            .limit(3)
            .map(Map.Entry::getKey)
            .collect(Collectors.toList());
        
        // First pass: add all careers that match top categories
        for (CareerEntity career : allCareers) {
            String careerText = (career.getCareerTitle() + " " + 
                                 (career.getCareerDescription() != null ? career.getCareerDescription() : "")).toLowerCase();
            
            for (String category : topCategories) {
                List<String> keywords = CAREER_CATEGORY_KEYWORDS.get(category);
                if (keywords != null) {
                    for (String keyword : keywords) {
                        if (careerText.contains(keyword.toLowerCase())) {
                            filteredCareers.add(career);
                            break;
                        }
                    }
                }
            }
        }
        
        // If we don't have enough careers, add more
        if (filteredCareers.size() < 30) {
            // Add careers that didn't match initially
            for (CareerEntity career : allCareers) {
                if (!filteredCareers.contains(career)) {
                    filteredCareers.add(career);
                    
                    // Stop when we reach 50 careers
                    if (filteredCareers.size() >= 50) {
                        break;
                    }
                }
            }
        }
        
        return filteredCareers;
    }
    
    /**
     * Categorize careers by their types (STEM, ABM, HUMSS, etc.)
     */
    private Map<String, List<CareerEntity>> categorizeCareersByType(List<CareerEntity> careers) {
        Map<String, List<CareerEntity>> categorizedCareers = new HashMap<>();
        
        // Initialize categories
        for (String category : CAREER_CATEGORY_KEYWORDS.keySet()) {
            categorizedCareers.put(category, new ArrayList<>());
        }
        
        // Add "Other" category for careers that don't match any category
        categorizedCareers.put("OTHER", new ArrayList<>());
        
        // Categorize each career
        for (CareerEntity career : careers) {
            String careerText = (career.getCareerTitle() + " " + 
                                 (career.getCareerDescription() != null ? career.getCareerDescription() : "")).toLowerCase();
            
            boolean categorized = false;
            
            // Check against each category's keywords
            for (Map.Entry<String, List<String>> entry : CAREER_CATEGORY_KEYWORDS.entrySet()) {
                String category = entry.getKey();
                List<String> keywords = entry.getValue();
                
                for (String keyword : keywords) {
                    if (careerText.contains(keyword.toLowerCase())) {
                        categorizedCareers.get(category).add(career);
                        categorized = true;
                        break;
                    }
                }
                
                if (categorized) break;
            }
            
            // If not categorized, add to "Other"
            if (!categorized) {
                categorizedCareers.get("OTHER").add(career);
            }
        }
        
        return categorizedCareers;
    }
    
    /**
     * Find the closest matching career in the database with improved matching
     */
    private CareerEntity findClosestCareerMatch(String recommendedName, List<CareerEntity> careers) {
        CareerEntity bestMatch = null;
        double highestScore = 0.4; // Lower threshold to consider more careers
        
        // Convert recommended name to lowercase for comparison
        String normalizedRecommendName = recommendedName.toLowerCase();
        
        for (CareerEntity career : careers) {
            // Get career title in lowercase
            String normalizedCareerTitle = career.getCareerTitle().toLowerCase();
            
            // Calculate various similarity measures
            double exactMatchScore = normalizedCareerTitle.equals(normalizedRecommendName) ? 1.0 : 0.0;
            double containsScore = normalizedCareerTitle.contains(normalizedRecommendName) || 
                                  normalizedRecommendName.contains(normalizedCareerTitle) ? 0.8 : 0.0;
            double jaccardScore = calculateSimilarity(normalizedRecommendName, normalizedCareerTitle);
            double levenshteinScore = calculateLevenshteinSimilarity(normalizedRecommendName, normalizedCareerTitle);
            
            // Weight the scores with preference for exact matches
            double combinedScore = exactMatchScore * 0.6 + 
                                  containsScore * 0.2 + 
                                  jaccardScore * 0.1 + 
                                  levenshteinScore * 0.1;
            
            // If career has a description, check it too
            if (career.getCareerDescription() != null && !career.getCareerDescription().isEmpty()) {
                String normalizedDescription = career.getCareerDescription().toLowerCase();
                double descriptionSimilarity = calculateSimilarity(normalizedRecommendName, normalizedDescription);
                
                // Add a small boost if the description matches
                combinedScore += descriptionSimilarity * 0.1;
            }
            
            // Update best match if this one is better
            if (combinedScore > highestScore) {
                highestScore = combinedScore;
                bestMatch = career;
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
     * Parse the AI-generated text into a structured recommendation format and match with database careers
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
            
            // After extracting recommendations, match with actual database careers
            List<Map<String, Object>> recommendedCareers = new ArrayList<>();
            List<CareerEntity> databaseCareers = careerService.getAllCareers();
            
            // Create a map for quicker lookups
            Map<String, CareerEntity> careerTitleMap = new HashMap<>();
            for (CareerEntity career : databaseCareers) {
                careerTitleMap.put(career.getCareerTitle().toLowerCase(), career);
            }
            
            if (jsonNode.has("topCareers") && jsonNode.get("topCareers").isArray()) {
                System.out.println("Found topCareers array in JSON");
                // Extract careers from topCareers array
                ArrayNode topCareersNode = (ArrayNode) jsonNode.get("topCareers");
                
                // Collect all recommended CareerEntity objects
                List<CareerEntity> topCareerEntities = new ArrayList<>();
                for (JsonNode careerNode : topCareersNode) {
                    Map<String, Object> careerMap = new HashMap<>();
                    
                    // Handle different field names for career/name
                    if (careerNode.has("name")) {
                        careerMap.put("name", careerNode.get("name").asText());
                    } else if (careerNode.has("career")) {
                        careerMap.put("name", careerNode.get("career").asText());
                        System.out.println("Found career field instead of name: " + careerNode.get("career").asText());
                    }
                    
                    // Handle different field names for description/explanation
                    if (careerNode.has("description")) {
                        careerMap.put("description", careerNode.get("description").asText());
                    } else if (careerNode.has("explanation")) {
                        careerMap.put("description", careerNode.get("explanation").asText());
                        System.out.println("Found explanation field instead of description");
                    }
                    
                    // Extract confidence score
                    if (careerNode.has("confidenceScore")) {
                        careerMap.put("confidenceScore", careerNode.get("confidenceScore").asDouble());
                    }
                    
                    // Match recommended careers with database careers
                    String recommendedName = ((String) careerMap.get("name")).toLowerCase();
                    
                    // First try exact match
                    CareerEntity matchedCareer = careerTitleMap.get(recommendedName);
                    
                    // If no exact match, try to find the closest match
                    if (matchedCareer == null) {
                        matchedCareer = findClosestCareerMatch(recommendedName, databaseCareers);
                    }
                    
                    if (matchedCareer != null) {
                        // Add database career ID and other details
                        careerMap.put("careerId", matchedCareer.getCareerId());
                        careerMap.put("name", matchedCareer.getCareerTitle()); // Use exact database name
                        
                        // If there's no description in AI response, use the database description
                        if (!careerMap.containsKey("description") || careerMap.get("description") == null) {
                            careerMap.put("description", matchedCareer.getCareerDescription());
                        }
                        
                        topCareerEntities.add(matchedCareer);
                    }
                    
                    recommendedCareers.add(careerMap);
                }
                result.put("suggestedCareers", recommendedCareers);
                
                // Prepare JSON array for topPrograms
                List<Map<String, Object>> topPrograms = new ArrayList<>();
                if (jsonNode.has("topPrograms") && jsonNode.get("topPrograms").isArray()) {
                    ArrayNode topProgramsNode = (ArrayNode) jsonNode.get("topPrograms");
                    for (JsonNode progNode : topProgramsNode) {
                        Map<String, Object> programMap = new HashMap<>();
                        if (progNode.has("programId")) programMap.put("programId", progNode.get("programId").asInt());
                        if (progNode.has("programName")) programMap.put("programName", progNode.get("programName").asText());
                        if (progNode.has("description")) programMap.put("description", progNode.get("description").asText());
                        if (progNode.has("confidenceScore")) programMap.put("confidenceScore", progNode.get("confidenceScore").asDouble());
                        if (progNode.has("explanation")) programMap.put("explanation", progNode.get("explanation").asText());
                        topPrograms.add(programMap);
                    }
                }
                result.put("topPrograms", topPrograms);
                
                // Extract overall explanation
                if (jsonNode.has("explanation")) {
                    result.put("explanation", jsonNode.get("explanation").asText());
                }
                
                // Extract overall confidence score
                if (jsonNode.has("confidenceScore")) {
                    result.put("confidenceScore", jsonNode.get("confidenceScore").asDouble());
                }
            } else {
                // Fallback - use careers from database instead of hardcoded defaults
                System.out.println("JSON structure not as expected, using fallback extraction method");
                result.put("parseWarning", "Expected JSON structure not found, using fallback extraction");
                result.put("suggestedCareers", createRecommendationsFromDatabase(databaseCareers, 5));
                result.put("explanation", "Recommendations generated from available careers based on assessment results.");
                result.put("confidenceScore", 65.0);
            }
            
        } catch (Exception e) {
            e.printStackTrace();
            System.out.println("Error parsing recommendation: " + e.getMessage());
            
            // Fallback to database careers on error
            List<CareerEntity> databaseCareers = careerService.getAllCareers();
            result.put("error", "Failed to parse recommendation: " + e.getMessage());
            result.put("suggestedCareers", createRecommendationsFromDatabase(databaseCareers, 5));
            result.put("explanation", "Fallback recommendations from available careers.");
            result.put("confidenceScore", 60.0);
        }
        
        return result;
    }
    
    /**
     * Create recommendations from database careers when AI fails
     */
    private List<Map<String, Object>> createRecommendationsFromDatabase(List<CareerEntity> careers, int limit) {
        List<Map<String, Object>> recommendations = new ArrayList<>();
        
        // Ensure we don't exceed the available careers
        int count = Math.min(limit, careers.size());
        
        // Generate some generic recommendations based on database careers
        for (int i = 0; i < count; i++) {
            CareerEntity career = careers.get(i);
            Map<String, Object> recommendation = new HashMap<>();
            
            recommendation.put("careerId", career.getCareerId());
            recommendation.put("name", career.getCareerTitle());
            recommendation.put("description", career.getCareerDescription() != null ? 
                career.getCareerDescription() : "Recommended based on assessment results");
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

    /**
     * For each programId, fetch all schools offering it, sort by accreditation, and return the ranked list with reasons.
     * Returns a list of objects: { programId, programName, schools: [{...schoolProgram, reason}], ... }
     */
    public List<Map<String, Object>> getProgramSchoolRecommendations(List<Integer> programIds) {
        List<Map<String, Object>> recommendations = new ArrayList<>();
        for (Integer programId : programIds) {
            ProgramEntity program = programService.getProgramById(programId).orElse(null);
            if (program == null) continue;
            List<SchoolProgramEntity> schoolPrograms = schoolProgramService.getSchoolProgramsByProgram(program);
            // Sort schools by accreditation level (IV > III > II > I > null), then by recognition (COE > COD > others > null)
            schoolPrograms.sort((a, b) -> {
                int levelA = getAccredLevelRank(a.getAccreditation());
                int levelB = getAccredLevelRank(b.getAccreditation());
                if (levelA != levelB) return Integer.compare(levelB, levelA); // Descending
                int recogA = getRecognitionRank(a.getAccreditation());
                int recogB = getRecognitionRank(b.getAccreditation());
                return Integer.compare(recogB, recogA); // Descending
            });
            // Build school list with reasons
            List<Map<String, Object>> schoolsWithReasons = new ArrayList<>();
            for (int i = 0; i < schoolPrograms.size(); i++) {
                SchoolProgramEntity sp = schoolPrograms.get(i);
                Map<String, Object> schoolMap = new HashMap<>();
                schoolMap.put("schoolProgram", sp);
                String reason;
                if (i == 0) {
                    reason = buildBestSchoolReason(sp);
                } else {
                    reason = buildRankedSchoolReason(sp, i + 1);
                }
                schoolMap.put("reason", reason);
                schoolsWithReasons.add(schoolMap);
            }
            Map<String, Object> rec = new HashMap<>();
            rec.put("programId", program.getProgramId());
            rec.put("programName", program.getProgramName());
            rec.put("schools", schoolsWithReasons); // Already ranked, with reasons
            recommendations.add(rec);
        }
        return recommendations;
    }

    // Helper: build a reason string for why this school is best (1st)
    private String buildBestSchoolReason(SchoolProgramEntity sp) {
        if (sp.getAccreditation() == null) {
            return "No accreditation information available.";
        }
        StringBuilder sb = new StringBuilder();
        sb.append("Best School Based on the Accreditation: ")
          .append(sp.getAccreditation().getAccreditationLevel());
        if (sp.getAccreditation().getRecognitionStatus() != null && !sp.getAccreditation().getRecognitionStatus().equalsIgnoreCase("none")) {
            sb.append(", Recognition: ").append(sp.getAccreditation().getRecognitionStatus());
        }
        if (sp.getAccreditation().getAccreditingBody() != null) {
            sb.append(", Accrediting Body: ").append(sp.getAccreditation().getAccreditingBody());
        }
        return sb.toString();
    }

    // Helper: build a reason string for why this school is ranked at its position (2nd, 3rd, ...)
    private String buildRankedSchoolReason(SchoolProgramEntity sp, int rank) {
        if (sp.getAccreditation() == null) {
            return "Ranked #" + rank + ": No accreditation information available.";
        }
        StringBuilder sb = new StringBuilder();
        sb.append("Ranked #").append(rank).append(" due to accreditation: ")
          .append(sp.getAccreditation().getAccreditationLevel());
        if (sp.getAccreditation().getRecognitionStatus() != null && !sp.getAccreditation().getRecognitionStatus().equalsIgnoreCase("none")) {
            sb.append(", Recognition: ").append(sp.getAccreditation().getRecognitionStatus());
        }
        if (sp.getAccreditation().getAccreditingBody() != null) {
            sb.append(", Accrediting Body: ").append(sp.getAccreditation().getAccreditingBody());
        }
        return sb.toString();
    }

    // Helper: assign numeric rank to accreditation level (higher is better)
    private int getAccredLevelRank(edu.cit.futureu.entity.AccreditationEntity accred) {
        if (accred == null || accred.getAccreditationLevel() == null) return 0;
        switch (accred.getAccreditationLevel().replaceAll("[^IV1234]", "").toUpperCase()) {
            case "IV": case "4": return 4;
            case "III": case "3": return 3;
            case "II": case "2": return 2;
            case "I": case "1": return 1;
            default: return 0;
        }
    }
    // Helper: assign numeric rank to recognition (COE > COD > others > null)
    private int getRecognitionRank(edu.cit.futureu.entity.AccreditationEntity accred) {
        if (accred == null || accred.getRecognitionStatus() == null) return 0;
        String recog = accred.getRecognitionStatus().toUpperCase();
        if (recog.contains("COE")) return 3;
        if (recog.contains("COD")) return 2;
        if (!recog.equals("NONE") && !recog.isEmpty()) return 1;
        return 0;
    }

    /**
     * Generate personalized career summary using AI with rate limiting (SELECTIVE - only for top recommendations)
     */
    public String generatePersonalizedCareerSummary(CareerEntity career, double matchPercentage, 
                                                   Map<String, Object> studentProfile, boolean isTopRecommendation) {
        
        System.out.println("🎯 CAREER SUMMARY REQUEST - Career: " + career.getCareerTitle() + 
                          " | Match: " + String.format("%.1f", matchPercentage) + "% | IsTop: " + isTopRecommendation);
        
        // Only use AI for top recommendations to save quota
        if (!isTopRecommendation) {
            System.out.println("⚡ Using fallback summary for non-top career: " + career.getCareerTitle());
            return getFallbackCareerSummary(career, matchPercentage);
        }
        
        // Check circuit breaker first
        if (isCircuitBreakerOpen()) {
            System.out.println("🚫 Circuit breaker is open, using fallback for career: " + career.getCareerTitle());
            return getFallbackCareerSummary(career, matchPercentage);
        }
        
        try {
            String prompt = buildCareerSummaryPrompt(career, matchPercentage, studentProfile);
            String cacheKey = generateCacheKey("career", career.getCareerId(), matchPercentage, studentProfile);
            
            // Check cache first
            String cachedResponse = getCachedResponse(cacheKey);
            if (cachedResponse != null) {
                System.out.println("💾 Using cached AI summary for career: " + career.getCareerTitle());
                return cachedResponse;
            }
            
            System.out.println("🤖 Generating AI summary for TOP career: " + career.getCareerTitle());
            
            // Apply rate limiting
            waitForRateLimit();
            
            String response = makeAIRequest(prompt);
            
            // Cache the response
            cacheResponse(cacheKey, response);
            
            // Reset failure counter on success
            consecutiveFailures.set(0);
            
            System.out.println("✅ Successfully generated AI summary for career: " + career.getCareerTitle());
            return response.trim();
            
        } catch (Exception e) {
            handleApiFailure(e);
            System.err.println("❌ Error generating AI career summary for " + career.getCareerTitle() + ": " + e.getMessage());
            return getFallbackCareerSummary(career, matchPercentage);
        }
    }

    /**
     * Generate personalized program summary using AI with rate limiting (SELECTIVE - only for top recommendations)
     */
    public String generatePersonalizedProgramSummary(ProgramEntity program, double matchPercentage, 
                                                    Map<String, Object> studentProfile, boolean isTopRecommendation) {
        
        System.out.println("📚 PROGRAM SUMMARY REQUEST - Program: " + program.getProgramName() + 
                          " | Match: " + String.format("%.1f", matchPercentage) + "% | IsTop: " + isTopRecommendation);
        
        // Only use AI for top recommendations to save quota
        if (!isTopRecommendation) {
            System.out.println("⚡ Using fallback summary for non-top program: " + program.getProgramName());
            return getFallbackProgramSummary(program, matchPercentage);
        }
        
        // Check circuit breaker first
        if (isCircuitBreakerOpen()) {
            System.out.println("🚫 Circuit breaker is open, using fallback for program: " + program.getProgramName());
            return getFallbackProgramSummary(program, matchPercentage);
        }
        
        try {
            String prompt = buildProgramSummaryPrompt(program, matchPercentage, studentProfile);
            String cacheKey = generateCacheKey("program", program.getProgramId(), matchPercentage, studentProfile);
            
            // Check cache first
            String cachedResponse = getCachedResponse(cacheKey);
            if (cachedResponse != null) {
                System.out.println("💾 Using cached AI summary for program: " + program.getProgramName());
                return cachedResponse;
            }
            
            System.out.println("🤖 Generating AI summary for TOP program: " + program.getProgramName());
            
            // Apply rate limiting
            waitForRateLimit();
            
            String response = makeAIRequest(prompt);
            
            // Cache the response
            cacheResponse(cacheKey, response);
            
            // Reset failure counter on success
            consecutiveFailures.set(0);
            
            System.out.println("✅ Successfully generated AI summary for program: " + program.getProgramName());
            return response.trim();
            
        } catch (Exception e) {
            handleApiFailure(e);
            System.err.println("❌ Error generating AI program summary for " + program.getProgramName() + ": " + e.getMessage());
            return getFallbackProgramSummary(program, matchPercentage);
        }
    }

    /**
     * Backward compatibility method for career summaries
     */
    public String generatePersonalizedCareerSummary(CareerEntity career, double matchPercentage, 
                                                   Map<String, Object> studentProfile) {
        return generatePersonalizedCareerSummary(career, matchPercentage, studentProfile, true);
    }

    /**
     * Backward compatibility method for program summaries
     */
    public String generatePersonalizedProgramSummary(ProgramEntity program, double matchPercentage, 
                                                    Map<String, Object> studentProfile) {
        return generatePersonalizedProgramSummary(program, matchPercentage, studentProfile, true);
    }

    /**
     * Generate personalized career path summary explaining why this path fits the student
     */
    public String generateCareerPathSummary(String careerPathName, double matchPercentage, 
                                           Map<String, Double> componentBreakdown, 
                                           Map<String, Object> studentProfile) {
        
        System.out.println("🎯 CAREER PATH SUMMARY REQUEST - Path: " + careerPathName + 
                          " | Match: " + String.format("%.1f", matchPercentage) + "%");
        
        // Check circuit breaker first
        if (isCircuitBreakerOpen()) {
            System.out.println("🚫 Circuit breaker is open, using fallback for career path: " + careerPathName);
            return getFallbackCareerPathSummary(careerPathName, matchPercentage, componentBreakdown);
        }
        
        try {
            String prompt = buildCareerPathSummaryPrompt(careerPathName, matchPercentage, componentBreakdown, studentProfile);
            String cacheKey = generateCacheKey("career_path", careerPathName.hashCode(), matchPercentage, studentProfile);
            
            // Check cache first
            String cachedResponse = getCachedResponse(cacheKey);
            if (cachedResponse != null) {
                System.out.println("✅ Using cached career path summary for: " + careerPathName);
                return cachedResponse;
            }
            
            // Wait for rate limiting
            waitForRateLimit();
            
            System.out.println("🤖 Generating AI career path summary for: " + careerPathName);
            
            // Call Gemini API
            String response = makeAIRequest(prompt);
            
            // Cache the response
            cacheResponse(cacheKey, response);
            
            System.out.println("✅ Successfully generated career path summary for: " + careerPathName);
            return response.trim();
            
        } catch (Exception e) {
            handleApiFailure(e);
            System.err.println("❌ Error generating AI career path summary for " + careerPathName + ": " + e.getMessage());
            return getFallbackCareerPathSummary(careerPathName, matchPercentage, componentBreakdown);
        }
    }

    /**
     * Rate limiting: Wait if necessary to respect API limits
     */
    private void waitForRateLimit() {
        long currentTime = System.currentTimeMillis();
        long timeSinceLastCall = currentTime - lastApiCall.get();
        
        if (timeSinceLastCall < RATE_LIMIT_DELAY_MS) {
            long waitTime = RATE_LIMIT_DELAY_MS - timeSinceLastCall;
            System.out.println("Rate limiting: waiting " + waitTime + "ms before next API call");
            
            try {
                Thread.sleep(waitTime);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new RuntimeException("Rate limiting interrupted", e);
            }
        }
        
        lastApiCall.set(System.currentTimeMillis());
    }

    /**
     * Check if circuit breaker is open (too many recent failures)
     */
    private boolean isCircuitBreakerOpen() {
        long currentTime = System.currentTimeMillis();
        
        // If circuit breaker timeout has passed, reset it
        if (circuitBreakerUntil.get() > 0 && currentTime > circuitBreakerUntil.get()) {
            System.out.println("🟢 Circuit breaker timeout expired, resetting after " + 
                             (CIRCUIT_BREAKER_TIMEOUT_MS / 1000) + " seconds");
            circuitBreakerUntil.set(0);
            consecutiveFailures.set(0);
            return false;
        }
        
        boolean isOpen = circuitBreakerUntil.get() > currentTime;
        if (isOpen) {
            long timeRemaining = (circuitBreakerUntil.get() - currentTime) / 1000;
            System.out.println("🔴 Circuit breaker is OPEN - " + consecutiveFailures.get() + "/" + 
                             MAX_CONSECUTIVE_FAILURES + " failures. Reopens in " + timeRemaining + " seconds");
        }
        
        return isOpen;
    }

    /**
     * Handle API failure - increment counter and potentially open circuit breaker
     */
    private void handleApiFailure(Exception e) {
        long failures = consecutiveFailures.incrementAndGet();
        System.err.println("🚨 API FAILURE #" + failures + " - " + e.getClass().getSimpleName() + ": " + e.getMessage());
        
        if (failures >= MAX_CONSECUTIVE_FAILURES) {
            long currentTime = System.currentTimeMillis();
            circuitBreakerUntil.set(currentTime + CIRCUIT_BREAKER_TIMEOUT_MS);
            System.err.println("🔴 CIRCUIT BREAKER OPENED due to " + failures + "/" + MAX_CONSECUTIVE_FAILURES + 
                             " consecutive failures. Will retry after " + (CIRCUIT_BREAKER_TIMEOUT_MS / 1000) + " seconds");
            System.err.println("🔧 Reason: " + e.getClass().getSimpleName() + " - " + e.getMessage());
            if (e.getMessage().contains("404")) {
                System.err.println("💡 TIP: Check if the API endpoint and model name are correct");
            }
        }
    }

    /**
     * Manually reset the circuit breaker and failure counter
     * Call this when you want to try AI generation again after quota reset
     */
    public void resetCircuitBreaker() {
        consecutiveFailures.set(0);
        circuitBreakerUntil.set(0);
        System.out.println("🔄 Circuit breaker manually reset. AI generation will be attempted again.");
    }

    /**
     * Get current circuit breaker status for debugging
     */
    public String getCircuitBreakerStatus() {
        boolean isOpen = isCircuitBreakerOpen();
        long failures = consecutiveFailures.get();
        long timeUntilReset = Math.max(0, circuitBreakerUntil.get() - System.currentTimeMillis());
        
        return String.format(
            """
            🔧 GEMINI AI SERVICE STATUS:
            ├─ API Endpoint: %s
            ├─ Circuit Breaker: %s
            ├─ Consecutive Failures: %d/%d
            ├─ Reset in: %d seconds
            └─ Rate Limit Delay: %d ms
            """,
            geminiEndpoint,
            isOpen ? "🔴 OPEN (Using Fallbacks)" : "🟢 CLOSED (AI Active)",
            failures,
            MAX_CONSECUTIVE_FAILURES,
            timeUntilReset / 1000,
            RATE_LIMIT_DELAY_MS
        );
    }

    /**
     * Generate cache key for AI responses
     */
    private String generateCacheKey(String type, int entityId, double matchPercentage, Map<String, Object> studentProfile) {
        StringBuilder keyBuilder = new StringBuilder();
        keyBuilder.append(type).append("_").append(entityId).append("_").append((int)matchPercentage);
        
        // Add relevant student profile data to cache key
        if (studentProfile != null) {
            // Use top 3 RIASEC scores for cache key to group similar profiles
            Object riasecProfile = studentProfile.get("personalityType");
            if (riasecProfile instanceof Map) {
                Map<?, ?> riasec = (Map<?, ?>) riasecProfile;
                keyBuilder.append("_riasec");
                riasec.entrySet().stream()
                    .sorted((e1, e2) -> Double.compare(
                        Double.parseDouble(e2.getValue().toString()), 
                        Double.parseDouble(e1.getValue().toString())))
                    .limit(3)
                    .forEach(entry -> keyBuilder.append("_").append(entry.getKey()).append((int)(Double.parseDouble(entry.getValue().toString()) * 100)));
            }
        }
        
        return keyBuilder.toString().replaceAll("[^a-zA-Z0-9_]", "");
    }

    /**
     * Get cached response if available and not expired
     */
    private String getCachedResponse(String cacheKey) {
        Long timestamp = cacheTimestamps.get(cacheKey);
        if (timestamp != null) {
            long currentTime = System.currentTimeMillis();
            if (currentTime - timestamp < CACHE_EXPIRY_MS) {
                return responseCache.get(cacheKey);
            } else {
                // Remove expired cache entry
                responseCache.remove(cacheKey);
                cacheTimestamps.remove(cacheKey);
            }
        }
        return null;
    }

    /**
     * Cache AI response
     */
    private void cacheResponse(String cacheKey, String response) {
        responseCache.put(cacheKey, response);
        cacheTimestamps.put(cacheKey, System.currentTimeMillis());
        
        // Simple cache cleanup - remove old entries if cache gets too large
        if (responseCache.size() > 1000) {
            cleanupOldCacheEntries();
        }
    }

    /**
     * Clean up old cache entries
     */
    private void cleanupOldCacheEntries() {
        long currentTime = System.currentTimeMillis();
        List<String> keysToRemove = new ArrayList<>();
        
        cacheTimestamps.entrySet().forEach(entry -> {
            if (currentTime - entry.getValue() > CACHE_EXPIRY_MS) {
                keysToRemove.add(entry.getKey());
            }
        });
        
        keysToRemove.forEach(key -> {
            responseCache.remove(key);
            cacheTimestamps.remove(key);
        });
        
        System.out.println("Cleaned up " + keysToRemove.size() + " expired cache entries");
    }

    /**
     * Make the actual AI request with consistent error handling
     */
    private String makeAIRequest(String prompt) throws Exception {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        
        ObjectNode requestBody = objectMapper.createObjectNode();
        ArrayNode contents = requestBody.putArray("contents");
        ObjectNode content = contents.addObject();
        ObjectNode parts = content.putObject("parts");
        parts.put("text", prompt);
        
        String url = geminiEndpoint + "?key=" + apiKey;
        HttpEntity<String> request = new HttpEntity<>(requestBody.toString(), headers);
        ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
        
        JsonNode responseJson = objectMapper.readTree(response.getBody());
        
        if (responseJson.has("candidates") && responseJson.get("candidates").isArray() && 
            responseJson.get("candidates").size() > 0) {
            
            JsonNode candidate = responseJson.get("candidates").get(0);
            if (candidate.has("content") && candidate.get("content").has("parts") && 
                candidate.get("content").get("parts").isArray() && 
                candidate.get("content").get("parts").size() > 0) {
                
                return candidate.get("content").get("parts").get(0).get("text").asText();
            }
        }
        
        throw new RuntimeException("No valid response content from AI API");
    }

    /**
     * Fallback career summary when AI is unavailable
     */
    private String getFallbackCareerSummary(CareerEntity career, double matchPercentage) {
        return String.format("%s aligns well with your strengths (%.0f%% match).", 
            career.getCareerTitle(), matchPercentage);
    }

    /**
     * Fallback program summary when AI is unavailable
     */
    private String getFallbackProgramSummary(ProgramEntity program, double matchPercentage) {
        return String.format("%s supports your target skills (%.0f%% match).", 
            program.getProgramName(), matchPercentage);
    }

    /**
     * Fallback career path summary when AI is unavailable
     */
    private String getFallbackCareerPathSummary(String careerPathName, double matchPercentage, 
                                               Map<String, Double> componentBreakdown) {
        StringBuilder summary = new StringBuilder();
        summary.append(String.format("%s shows a %.0f%% match with your profile.", careerPathName, matchPercentage));
        
        // Add component breakdown explanation
        if (componentBreakdown != null && !componentBreakdown.isEmpty()) {
            summary.append(" Key strengths include: ");
            componentBreakdown.entrySet().stream()
                .sorted((a, b) -> Double.compare(b.getValue(), a.getValue()))
                .limit(2)
                .forEach(entry -> {
                    String component = entry.getKey();
                    double score = entry.getValue();
                    summary.append(String.format("%s (%.1f%%), ", 
                        component.toUpperCase(), score));
                });
            // Remove trailing comma and space
            if (summary.toString().endsWith(", ")) {
                summary.setLength(summary.length() - 2);
            }
            summary.append(".");
        }
        
        return summary.toString();
    }

    /**
     * Build engaging prompt for career path summary generation
     */
    private String buildCareerPathSummaryPrompt(String careerPathName, double matchPercentage, 
                                               Map<String, Double> componentBreakdown, 
                                               Map<String, Object> studentProfile) {
        StringBuilder prompt = new StringBuilder();
        
        prompt.append("You are a career counselor explaining why a specific career path fits a student. ");
        prompt.append("Create a comprehensive yet engaging explanation in 3-4 sentences. ");
        prompt.append("Explain what the component scores mean and why this path is a good fit.\n\n");
        
        prompt.append("Career Path: ").append(careerPathName).append("\n");
        prompt.append("Overall Match: ").append(String.format("%.1f", matchPercentage)).append("%\n\n");
        
        prompt.append("Component Breakdown Scores:\n");
        if (componentBreakdown != null) {
            componentBreakdown.forEach((component, score) -> {
                prompt.append("- ").append(component.toUpperCase()).append(": ")
                      .append(String.format("%.1f", score)).append("%\n");
            });
        }
        
        if (studentProfile != null && !studentProfile.isEmpty()) {
            prompt.append("\nStudent Profile:\n");
            studentProfile.forEach((key, value) -> {
                if (value != null && !value.toString().isEmpty()) {
                    prompt.append("- ").append(key).append(": ").append(value).append("\n");
                }
            });
        }
        
        prompt.append("\nWrite an explanatory summary that:\n");
        prompt.append("1. Explains what this career path represents and its key characteristics\n");
        prompt.append("2. Breaks down what the component scores (RIASEC, APTITUDE, SKILLS, CONTEXT) mean for this path\n");
        prompt.append("3. Connects the student's profile to why this path is a good match\n");
        prompt.append("4. Uses encouraging and motivational language\n");
        prompt.append("5. Keeps it under 150 words\n\n");
        prompt.append("Response format: Just the summary text, no headers or labels.");
        
        return prompt.toString();
    }

    /**
     * Batch generate career summaries with smart rate limiting
     * This method reduces API calls by generating multiple summaries in one request when possible
     */
    public Map<Integer, String> batchGenerateCareerSummaries(List<CareerEntity> careers, 
                                                            List<Double> matchPercentages,
                                                            Map<String, Object> studentProfile) {
        Map<Integer, String> results = new HashMap<>();
        List<CareerEntity> remainingCareers = new ArrayList<>();
        List<Double> remainingPercentages = new ArrayList<>();
        
        // First, check cache for existing summaries
        for (int i = 0; i < careers.size(); i++) {
            CareerEntity career = careers.get(i);
            Double percentage = matchPercentages.get(i);
            String cacheKey = generateCacheKey("career", career.getCareerId(), percentage, studentProfile);
            String cached = getCachedResponse(cacheKey);
            
            if (cached != null) {
                results.put(career.getCareerId(), cached);
            } else {
                remainingCareers.add(career);
                remainingPercentages.add(percentage);
            }
        }
        
        // If circuit breaker is open, use fallback for remaining careers
        if (isCircuitBreakerOpen()) {
            for (int i = 0; i < remainingCareers.size(); i++) {
                CareerEntity career = remainingCareers.get(i);
                Double percentage = remainingPercentages.get(i);
                results.put(career.getCareerId(), getFallbackCareerSummary(career, percentage));
            }
            return results;
        }
        
        // Process remaining careers with rate limiting
        for (int i = 0; i < remainingCareers.size(); i++) {
            CareerEntity career = remainingCareers.get(i);
            Double percentage = remainingPercentages.get(i);
            
            try {
                if (i > 0) { // Don't wait before the first request
                    waitForRateLimit();
                }
                
                String summary = generatePersonalizedCareerSummary(career, percentage, studentProfile);
                results.put(career.getCareerId(), summary);
                
            } catch (Exception e) {
                System.err.println("Failed to generate summary for career " + career.getCareerTitle() + ": " + e.getMessage());
                results.put(career.getCareerId(), getFallbackCareerSummary(career, percentage));
            }
        }
        
        return results;
    }

    /**
     * Batch generate program summaries with smart rate limiting
     */
    public Map<Integer, String> batchGenerateProgramSummaries(List<ProgramEntity> programs, 
                                                             List<Double> matchPercentages,
                                                             Map<String, Object> studentProfile) {
        Map<Integer, String> results = new HashMap<>();
        List<ProgramEntity> remainingPrograms = new ArrayList<>();
        List<Double> remainingPercentages = new ArrayList<>();
        
        // First, check cache for existing summaries
        for (int i = 0; i < programs.size(); i++) {
            ProgramEntity program = programs.get(i);
            Double percentage = matchPercentages.get(i);
            String cacheKey = generateCacheKey("program", program.getProgramId(), percentage, studentProfile);
            String cached = getCachedResponse(cacheKey);
            
            if (cached != null) {
                results.put(program.getProgramId(), cached);
            } else {
                remainingPrograms.add(program);
                remainingPercentages.add(percentage);
            }
        }
        
        // If circuit breaker is open, use fallback for remaining programs
        if (isCircuitBreakerOpen()) {
            for (int i = 0; i < remainingPrograms.size(); i++) {
                ProgramEntity program = remainingPrograms.get(i);
                Double percentage = remainingPercentages.get(i);
                results.put(program.getProgramId(), getFallbackProgramSummary(program, percentage));
            }
            return results;
        }
        
        // Process remaining programs with rate limiting
        for (int i = 0; i < remainingPrograms.size(); i++) {
            ProgramEntity program = remainingPrograms.get(i);
            Double percentage = remainingPercentages.get(i);
            
            try {
                if (i > 0) { // Don't wait before the first request
                    waitForRateLimit();
                }
                
                String summary = generatePersonalizedProgramSummary(program, percentage, studentProfile);
                results.put(program.getProgramId(), summary);
                
            } catch (Exception e) {
                System.err.println("Failed to generate summary for program " + program.getProgramName() + ": " + e.getMessage());
                results.put(program.getProgramId(), getFallbackProgramSummary(program, percentage));
            }
        }
        
        return results;
    }

    /**
     * Build engaging prompt for career summary generation
     */
    private String buildCareerSummaryPrompt(CareerEntity career, double matchPercentage, 
                                           Map<String, Object> studentProfile) {
        StringBuilder prompt = new StringBuilder();
        
        prompt.append("You are a career counselor writing a personalized and engaging summary for a student. ");
        prompt.append("Create a motivational, specific, and encouraging description in 2-3 sentences. ");
        prompt.append("Keep it conversational and exciting, avoiding generic language.\n\n");
        
        prompt.append("Career: ").append(career.getCareerTitle()).append("\n");
        prompt.append("Match Percentage: ").append(String.format("%.0f", matchPercentage)).append("%\n");
        
        if (career.getCareerDescription() != null) {
            prompt.append("Career Description: ").append(career.getCareerDescription()).append("\n");
        }
        
        if (studentProfile != null) {
            prompt.append("\nStudent Profile:\n");
            studentProfile.forEach((key, value) -> {
                if (value != null && !value.toString().isEmpty()) {
                    prompt.append("- ").append(key).append(": ").append(value).append("\n");
                }
            });
        }
        
        prompt.append("\nWrite an engaging, personalized summary that:\n");
        prompt.append("1. Highlights why this career is exciting for THIS specific student\n");
        prompt.append("2. Mentions specific aspects that align with their profile\n");
        prompt.append("3. Uses motivational language that creates enthusiasm\n");
        prompt.append("4. Avoids clichés and generic statements\n");
        prompt.append("5. Keeps it under 100 words\n\n");
        prompt.append("Response format: Just the summary text, no headers or labels.");
        
        return prompt.toString();
    }

    /**
     * Build engaging prompt for program summary generation
     */
    private String buildProgramSummaryPrompt(ProgramEntity program, double matchPercentage, 
                                            Map<String, Object> studentProfile) {
        StringBuilder prompt = new StringBuilder();
        
        prompt.append("You are an academic advisor writing a personalized and engaging summary for a student. ");
        prompt.append("Create a motivational, specific, and encouraging description in 2-3 sentences. ");
        prompt.append("Keep it conversational and exciting, avoiding generic language.\n\n");
        
        prompt.append("Program: ").append(program.getProgramName()).append("\n");
        prompt.append("Match Percentage: ").append(String.format("%.0f", matchPercentage)).append("%\n");
        
        if (program.getDescription() != null) {
            prompt.append("Program Description: ").append(program.getDescription()).append("\n");
        }
        
        if (studentProfile != null) {
            prompt.append("\nStudent Profile:\n");
            studentProfile.forEach((key, value) -> {
                if (value != null && !value.toString().isEmpty()) {
                    prompt.append("- ").append(key).append(": ").append(value).append("\n");
                }
            });
        }
        
        prompt.append("\nWrite an engaging, personalized summary that:\n");
        prompt.append("1. Explains why this program is perfect for THIS specific student\n");
        prompt.append("2. Highlights how it builds on their strengths and interests\n");
        prompt.append("3. Uses exciting language about learning opportunities\n");
        prompt.append("4. Avoids academic jargon and generic descriptions\n");
        prompt.append("5. Keeps it under 100 words\n\n");
        prompt.append("Response format: Just the summary text, no headers or labels.");
        
        return prompt.toString();
    }

    /**
     * Test rate limiting functionality
     */
    public Map<String, Object> testRateLimiting() {
        Map<String, Object> result = new HashMap<>();
        long startTime = System.currentTimeMillis();
        
        try {
            System.out.println("Testing rate limiting with 3 API calls...");
            
            // Make 3 test calls to see rate limiting in action
            for (int i = 1; i <= 3; i++) {
                long callStart = System.currentTimeMillis();
                System.out.println("Making test API call #" + i);
                
                if (i > 1) {
                    waitForRateLimit();
                }
                
                // Make a simple test call
                String testResponse = makeAIRequest("Write a single word: 'Hello'");
                long callEnd = System.currentTimeMillis();
                
                System.out.println("Call #" + i + " completed in " + (callEnd - callStart) + "ms. Response: " + testResponse.substring(0, Math.min(50, testResponse.length())));
            }
            
            long totalTime = System.currentTimeMillis() - startTime;
            result.put("success", true);
            result.put("totalTimeMs", totalTime);
            result.put("rateLimitDelayMs", RATE_LIMIT_DELAY_MS);
            result.put("message", "Rate limiting test completed successfully");
            
        } catch (Exception e) {
            result.put("success", false);
            result.put("error", e.getMessage());
            result.put("circuitBreakerOpen", isCircuitBreakerOpen());
        }
        
        return result;
    }
}
