package edu.cit.futureu.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
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
import java.util.Comparator;
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
     * Identify the student's top strength areas based on assessment results
     * Uses a more sophisticated analysis approach for better program matching
     */
    private Map<String, Double> identifyTopStrengthAreas(AssessmentResultEntity result) {
        Map<String, Double> strengths = new HashMap<>();
        Map<String, List<Double>> strengthFactors = new HashMap<>();
        
        // Initialize strength categories with empty factor lists
        Arrays.asList("STEM", "ABM", "HUMSS", "ARTS", "SPORTS", "TVL").forEach(category -> 
            strengthFactors.put(category, new ArrayList<>())
        );
        
        // 1. Primary Track Scores - direct measures
        if (result.getStemScore() != null) {
            strengthFactors.get("STEM").add(result.getStemScore() * 1.5); // Weight more heavily
        }
        
        if (result.getAbmScore() != null) {
            strengthFactors.get("ABM").add(result.getAbmScore() * 1.5);
        }
        
        if (result.getHumssScore() != null) {
            strengthFactors.get("HUMSS").add(result.getHumssScore() * 1.5);
        }
        
        if (result.getArtsDesignTrackScore() != null) {
            strengthFactors.get("ARTS").add(result.getArtsDesignTrackScore() * 1.5);
        }
        
        if (result.getSportsTrackScore() != null) {
            strengthFactors.get("SPORTS").add(result.getSportsTrackScore() * 1.5);
        }
        
        if (result.getTvlScore() != null) {
            strengthFactors.get("TVL").add(result.getTvlScore() * 1.5);
        }
        
        // 2. Ability-based CONTRIBUTIONS - add relevant abilities to each area
        // Mathematical ability contributes to STEM and ABM
        if (result.getMathematicalAbilityScore() != null) {
            double mathScore = result.getMathematicalAbilityScore();
            strengthFactors.get("STEM").add(mathScore * 0.8);
            strengthFactors.get("ABM").add(mathScore * 0.4);
        }
        
        // Logical reasoning contributes to STEM, ABM and HUMSS
        if (result.getLogicalReasoningScore() != null) {
            double logicScore = result.getLogicalReasoningScore();
            strengthFactors.get("STEM").add(logicScore * 0.8);
            strengthFactors.get("ABM").add(logicScore * 0.5);
            strengthFactors.get("HUMSS").add(logicScore * 0.3);
        }
        
        // Verbal ability contributes to HUMSS, ABM and ARTS
        if (result.getVerbalAbilityScore() != null) {
            double verbalScore = result.getVerbalAbilityScore();
            strengthFactors.get("HUMSS").add(verbalScore * 0.8);
            strengthFactors.get("ABM").add(verbalScore * 0.4);
            strengthFactors.get("ARTS").add(verbalScore * 0.3);
        }
        
        // Reading comprehension contributes to HUMSS and ABM
        if (result.getReadingComprehensionScore() != null) {
            double readingScore = result.getReadingComprehensionScore();
            strengthFactors.get("HUMSS").add(readingScore * 0.7);
            strengthFactors.get("ABM").add(readingScore * 0.5);
        }
        
        // Scientific ability contributes to STEM
        if (result.getScientificAbilityScore() != null) {
            strengthFactors.get("STEM").add(result.getScientificAbilityScore() * 0.9);
        }
        
        // 3. RIASEC-based contributions - translate interest types to program areas
        // Use non-linear scaling for RIASEC scores (0-7 scale) to match percentage scales
        double riasecScale = 14.0; // Scale factor to convert 0-7 scale to 0-100
        
        // Realistic → STEM, TVL, SPORTS
        if (result.getRealisticScore() != null) {
            double score = result.getRealisticScore() * riasecScale;
            strengthFactors.get("STEM").add(score * 0.5);
            strengthFactors.get("TVL").add(score * 0.8);
            strengthFactors.get("SPORTS").add(score * 0.4);
        }
        
        // Investigative → STEM, HUMSS
        if (result.getInvestigativeScore() != null) {
            double score = result.getInvestigativeScore() * riasecScale;
            strengthFactors.get("STEM").add(score * 0.9);
            strengthFactors.get("HUMSS").add(score * 0.4);
        }
        
        // Artistic → ARTS, HUMSS
        if (result.getArtisticScore() != null) {
            double score = result.getArtisticScore() * riasecScale;
            strengthFactors.get("ARTS").add(score * 0.9);
            strengthFactors.get("HUMSS").add(score * 0.4);
        }
        
        // Social → HUMSS, SPORTS
        if (result.getSocialScore() != null) {
            double score = result.getSocialScore() * riasecScale;
            strengthFactors.get("HUMSS").add(score * 0.8);
            strengthFactors.get("SPORTS").add(score * 0.3);
        }
        
        // Enterprising → ABM, TVL
        if (result.getEnterprisingScore() != null) {
            double score = result.getEnterprisingScore() * riasecScale;
            strengthFactors.get("ABM").add(score * 0.9);
            strengthFactors.get("TVL").add(score * 0.3);
        }
        
        // Conventional → ABM
        if (result.getConventionalScore() != null) {
            double score = result.getConventionalScore() * riasecScale;
            strengthFactors.get("ABM").add(score * 0.8);
        }
        
        // 4. Calculate composite scores using weighted averages
        for (Map.Entry<String, List<Double>> entry : strengthFactors.entrySet()) {
            String category = entry.getKey();
            List<Double> factors = entry.getValue();
            
            if (!factors.isEmpty()) {
                // Calculate weighted average (more weight to higher scores)
                factors.sort(Comparator.reverseOrder()); // Sort from highest to lowest
                
                double totalWeight = 0;
                double weightedSum = 0;
                
                // Apply diminishing weights to each factor (highest gets most weight)
                for (int i = 0; i < factors.size(); i++) {
                    double weight = 1.0 / (i + 1); // First gets weight 1, second gets 1/2, third gets 1/3, etc.
                    weightedSum += factors.get(i) * weight;
                    totalWeight += weight;
                }
                
                double finalScore = totalWeight > 0 ? weightedSum / totalWeight : 0;
                strengths.put(category, finalScore);
            }
        }
        
        // 5. Find relative strengths - normalize so total adds up to 300 (3 top strengths at 100 each)
        double totalStrength = strengths.values().stream().mapToDouble(Double::doubleValue).sum();
        if (totalStrength > 0) {
            // Scale factor to make total equal 300
            double scaleFactor = 300.0 / totalStrength;
            
            // Apply scaling but cap at 100
            strengths.forEach((k, v) -> strengths.put(k, Math.min(v * scaleFactor, 100.0)));
        } else {
            // Fallback if no strengths were found
            strengths.put("STEM", 50.0);
            strengths.put("ABM", 50.0);
            strengths.put("HUMSS", 50.0);
        }
        
        // Debug output for transparency
        System.out.println("Calculated strength areas: " + strengths);
        
        return strengths;
    }
    
    /**
     * Create a more comprehensive prompt that explains student's strengths in detail
     */
    private String addStrengthAnalysisToPrompt(StringBuilder promptBuilder, Map<String, Double> strengths, 
                                              AssessmentResultEntity assessmentResult) {
        // Add a detailed analysis of the student's strengths
        promptBuilder.append("\nDETAILED STRENGTH ANALYSIS:\n");
        
        // Describe top strengths in detail
        List<Map.Entry<String, Double>> sortedStrengths = strengths.entrySet().stream()
            .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
            .collect(Collectors.toList());
        
        // Primary strength area
        if (!sortedStrengths.isEmpty()) {
            Map.Entry<String, Double> primaryStrength = sortedStrengths.get(0);
            promptBuilder.append("PRIMARY STRENGTH: ").append(primaryStrength.getKey())
                .append(" (Score: ").append(String.format("%.1f", primaryStrength.getValue())).append(")\n");
            
            promptBuilder.append(getStrengthDescription(primaryStrength.getKey(), assessmentResult)).append("\n\n");
        }
        
        // Secondary strength areas
        promptBuilder.append("SECONDARY STRENGTHS:\n");
        for (int i = 1; i < Math.min(sortedStrengths.size(), 3); i++) {
            Map.Entry<String, Double> strength = sortedStrengths.get(i);
            if (strength.getValue() > 30) { // Only include meaningful secondary strengths
                promptBuilder.append("- ").append(strength.getKey())
                    .append(" (Score: ").append(String.format("%.1f", strength.getValue())).append(")\n");
                promptBuilder.append("  ").append(getStrengthDescription(strength.getKey(), assessmentResult)
                    .replace("\n", "\n  ")).append("\n");
            }
        }
        
        // Add strengths-based career direction
        promptBuilder.append("\nCAREER DIRECTION BASED ON STRENGTHS:\n");
        promptBuilder.append(getCareerDirectionFromStrengths(sortedStrengths, assessmentResult)).append("\n");
        
        return promptBuilder.toString();
    }
    
    /**
     * Get detailed description of a strength area
     */
    private String getStrengthDescription(String strengthArea, AssessmentResultEntity result) {
        Map<String, String> descriptions = new HashMap<>();
        
        descriptions.put("STEM", "Student shows strong aptitude in Science, Technology, Engineering and Mathematics fields. " +
            "Mathematical ability: " + formatScore(result.getMathematicalAbilityScore()) + "%, " +
            "Scientific ability: " + formatScore(result.getScientificAbilityScore()) + "%, " +
            "Logical reasoning: " + formatScore(result.getLogicalReasoningScore()) + "%. " +
            "This indicates strong analytical thinking and problem-solving capabilities.");
        
        descriptions.put("ABM", "Student demonstrates skills in Accounting, Business and Management areas. " +
            "Interest in business concepts with enterprising score: " + result.getEnterprisingScore() + "/7, " +
            "Organizational abilities with conventional score: " + result.getConventionalScore() + "/7. " +
            "Combined with mathematical ability: " + formatScore(result.getMathematicalAbilityScore()) + "%, " +
            "this suggests aptitude for business-related programs.");
        
        descriptions.put("HUMSS", "Student excels in Humanities and Social Sciences areas. " +
            "Verbal ability: " + formatScore(result.getVerbalAbilityScore()) + "%, " +
            "Reading comprehension: " + formatScore(result.getReadingComprehensionScore()) + "%, " +
            "Social interest score: " + result.getSocialScore() + "/7. " +
            "This indicates strong communication skills and interest in understanding people and society.");
        
        descriptions.put("ARTS", "Student shows artistic talents and creative thinking. " +
            "Artistic interest score: " + result.getArtisticScore() + "/7, " +
            "This suggests a strong desire for self-expression and creativity. " +
            "Combined with verbal skills: " + formatScore(result.getVerbalAbilityScore()) + "%, " +
            "the student would thrive in creative and expressive fields.");
        
        descriptions.put("SPORTS", "Student demonstrates interest and aptitude in physical activities and sports. " +
            "Realistic score: " + result.getRealisticScore() + "/7, " +
            "Social score: " + result.getSocialScore() + "/7. " +
            "This indicates potential for physical education, sports science, or coaching careers.");
        
        descriptions.put("TVL", "Student shows promise in Technical-Vocational-Livelihood tracks. " +
            "Realistic score: " + result.getRealisticScore() + "/7, " +
            "This suggests hands-on capabilities and practical skills that translate well to technical careers.");
        
        return descriptions.getOrDefault(strengthArea, "General aptitude in this area based on assessment scores.");
    }
    
    /**
     * Format score with proper handling of null values
     */
    private String formatScore(Double score) {
        return score != null ? String.format("%.1f", score) : "N/A";
    }
    
    /**
     * Generate career direction advice based on strength profile
     */
    private String getCareerDirectionFromStrengths(List<Map.Entry<String, Double>> sortedStrengths, 
                                                 AssessmentResultEntity result) {
        if (sortedStrengths.isEmpty()) {
            return "Insufficient data to determine clear career direction.";
        }
        
        String primary = sortedStrengths.get(0).getKey();
        
        // Get secondary if available
        String secondary = sortedStrengths.size() > 1 && sortedStrengths.get(1).getValue() > 30 ? 
                          sortedStrengths.get(1).getKey() : null;
        
        // Create combinations of primary and secondary strengths
        if (primary.equals("STEM")) {
            if (secondary == null) {
                return "Pure STEM focus suggests careers in core scientific or technical fields such as physics, mathematics, computer science, or engineering.";
            } else if (secondary.equals("ABM")) {
                return "STEM + ABM combination suggests careers at the intersection of technology and business such as data science, financial engineering, technology management, or quantitative analysis.";
            } else if (secondary.equals("HUMSS")) {
                return "STEM + HUMSS combination suggests careers that bridge technology and humanity such as human-computer interaction, science communication, cognitive science, or educational technology.";
            } else if (secondary.equals("ARTS")) {
                return "STEM + ARTS combination suggests careers in digital design, animation, game development, creative technology, or architectural design.";
            }
        } else if (primary.equals("ABM")) {
            if (secondary == null) {
                return "Pure ABM focus suggests careers in business administration, finance, accounting, marketing, or entrepreneurship.";
            } else if (secondary.equals("STEM")) {
                return "ABM + STEM combination suggests careers in financial technology, business analytics, investment banking, or technology management.";
            } else if (secondary.equals("HUMSS")) {
                return "ABM + HUMSS combination suggests careers in human resources, public relations, organizational psychology, or public administration.";
            }
        } else if (primary.equals("HUMSS")) {
            if (secondary == null) {
                return "Pure HUMSS focus suggests careers in psychology, education, communication, social work, sociology, or political science.";
            } else if (secondary.equals("ARTS")) {
                return "HUMSS + ARTS combination suggests careers in media studies, journalism, creative writing, art therapy, or cultural studies.";
            }
        } else if (primary.equals("ARTS")) {
            if (secondary == null) {
                return "Pure ARTS focus suggests careers in fine arts, performing arts, graphic design, fashion design, or multimedia arts.";
            }
        }
        
        // Default response for other combinations
        return "Based on the strength profile with " + primary + 
               (secondary != null ? " and " + secondary : "") + 
               " as dominant areas, careers that combine these strengths would be most suitable. " +
               "Programs that balance technical skills with personal interests will provide the best fit.";
    }
    
    /**
     * Build a detailed prompt based on assessment results with enhanced strength analysis
     */
    private String buildPromptFromAssessmentResults(
            AssessmentResultEntity assessmentResult,
            List<UserAssessmentSectionResultEntity> sectionResults) {
        
        StringBuilder promptBuilder = new StringBuilder();
        
        // Introduction with more specific guidance
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
        
        // Identify top strength areas using the enhanced method
        Map<String, Double> strengths = identifyTopStrengthAreas(assessmentResult);
        
        // Add basic strength areas listing for reference
        promptBuilder.append("\nSTUDENT'S TOP STRENGTH AREAS:\n");
        strengths.entrySet().stream()
            .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
            .limit(3)
            .forEach(entry -> 
                promptBuilder.append("- ").append(entry.getKey()).append(": ").append(String.format("%.1f", entry.getValue())).append("\n")
            );
        
        // Add the enhanced strength analysis
        addStrengthAnalysisToPrompt(promptBuilder, strengths, assessmentResult);
        
        // Filter programs that match top strengths
        List<ProgramEntity> allPrograms = programService.getAllPrograms();
        List<ProgramEntity> filteredPrograms = filterProgramsByStrengths(allPrograms, strengths);
        
        // The request with more detailed instructions
        promptBuilder.append("\nBased on these assessment results, please provide:\n");
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
        promptBuilder.append("4. Format the response as a structured JSON with these exact keys: 'topPrograms' (array of objects with 'program', 'explanation', 'confidenceScore'), 'explanation' (string), and 'confidenceScore' (number)\n");
        promptBuilder.append("5. IMPORTANT: Only recommend programs from the provided list above - exact program names must be used\n");
        
        return promptBuilder.toString();
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
            result.put("statusCode", response.getStatusCodeValue());
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
