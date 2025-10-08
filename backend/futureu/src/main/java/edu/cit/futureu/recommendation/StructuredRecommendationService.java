package edu.cit.futureu.recommendation;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import edu.cit.futureu.entity.AssessmentResultEntity;
import edu.cit.futureu.entity.CareerCareerPathEntity;
import edu.cit.futureu.entity.CareerEntity;
import edu.cit.futureu.entity.CareerInterestProfileEntity;
import edu.cit.futureu.entity.CareerPathEntity;
import edu.cit.futureu.entity.ProgramCareerPathEntity;
import edu.cit.futureu.entity.ProgramEntity;
import edu.cit.futureu.entity.UserAssessmentEntity;
import edu.cit.futureu.entity.UserAssessmentSectionResultEntity;
import edu.cit.futureu.repository.CareerPathRepository;
import edu.cit.futureu.repository.CareerRepository;
import edu.cit.futureu.repository.ProgramCareerPathRepository;
import edu.cit.futureu.service.AssessmentResultService;
import edu.cit.futureu.service.CareerInterestProfileService;
import edu.cit.futureu.service.GeminiAIService;
import edu.cit.futureu.service.RecommendationPersistenceService;
import edu.cit.futureu.service.UserAssessmentService;

/**
 * Orchestrates the deterministic recommendation flow using the existing schema and assessment results.
 */
@Service
public class StructuredRecommendationService {

    private static final Logger LOGGER = LoggerFactory.getLogger(StructuredRecommendationService.class);

    @Autowired
    private AssessmentResultService assessmentResultService;

    @Autowired
    private UserAssessmentService userAssessmentService;

    @Autowired
    private CareerPathRepository careerPathRepository;

    @Autowired
    private CareerRepository careerRepository;

    @Autowired
    private ProgramCareerPathRepository programCareerPathRepository;

    @Autowired
    private CareerInterestProfileService careerInterestProfileService;

    @Autowired
    private GeminiAIService geminiAIService;

    @Autowired
    private CareerProfileAnalyzer profileAnalyzer;

    @Autowired
    private RecommendationScoringService scoringService;

    @Autowired
    private RecommendationPersistenceService persistenceService;

    @Transactional
    public AdvancedRecommendationResponse generate(UserAssessmentEntity userAssessment) {
        LOGGER.info("Generating structured recommendations for user assessment: {}", userAssessment.getUserQuizAssessment());
        
        AssessmentResultEntity assessmentResult = assessmentResultService
            .getAssessmentResultByUserAssessment(userAssessment)
            .orElseThrow(() -> new IllegalArgumentException("No assessment result found"));

        LOGGER.debug("Found assessment result: ID={}, Overall Score={}", 
                    assessmentResult.getResultId(), assessmentResult.getOverallScore());

        List<UserAssessmentSectionResultEntity> sectionResults =
            userAssessmentService.getSectionResultsForAssessment(userAssessment);

        LOGGER.debug("Found {} section results", sectionResults != null ? sectionResults.size() : 0);

        StudentProfile studentProfile = StudentProfile.from(assessmentResult, sectionResults);
        LOGGER.debug("Student profile created successfully");

        List<CareerPathRecommendation> careerPathRecommendations = buildCareerPathRecommendations(studentProfile);
        LOGGER.info("Built {} career path recommendations", careerPathRecommendations.size());

        DreamCareerInsight insight = buildDreamCareerInsight(userAssessment, studentProfile, careerPathRecommendations);
        LOGGER.debug("Dream career insight built: {}", insight != null ? "Success" : "Null");

        AdvancedRecommendationResponse response = new AdvancedRecommendationResponse();
        response.setAssessmentResultId(assessmentResult.getResultId());
        response.setCareerPaths(careerPathRecommendations);
        response.setDreamCareerInsight(insight);
        
        // Persist the recommendations to the database
        LOGGER.debug("Persisting recommendations to database...");
        try {
            persistenceService.persistRecommendations(assessmentResult, response);
            LOGGER.info("Recommendations persisted successfully");
        } catch (Exception e) {
            LOGGER.error("Failed to persist recommendations: {}", e.getMessage(), e);
            // Continue without throwing - we still want to return the recommendations
        }
        
        return response;
    }

    /**
     * Get previously generated and persisted recommendations for an assessment result
     */
    @Transactional(readOnly = true)
    public AdvancedRecommendationResponse getPersistedRecommendations(UserAssessmentEntity userAssessment) {
        AssessmentResultEntity assessmentResult = assessmentResultService
            .getAssessmentResultByUserAssessment(userAssessment)
            .orElseThrow(() -> new IllegalArgumentException("No assessment result found"));

        return persistenceService.getPersistedRecommendations(assessmentResult);
    }

    private List<CareerPathRecommendation> buildCareerPathRecommendations(StudentProfile studentProfile) {
        LOGGER.debug("Building career path recommendations...");
        List<CareerPathEntity> allPaths = careerPathRepository.findAll();
        LOGGER.info("Found {} career paths in database", allPaths.size());
        
        System.out.println("\n🚀 ========== RECOMMENDATION GENERATION STARTED ==========");
        System.out.println("🎯 OPTIMIZED Mode: Only processing careers/programs for TOP 3 career paths!");
        System.out.println("📊 Scoring " + allPaths.size() + " career paths...\n");
        
        // STEP 1: Score ALL career paths but DON'T load careers/programs yet
        List<CareerPathRecommendation> scoredPaths = new ArrayList<>();
        for (CareerPathEntity path : allPaths) {
            LOGGER.debug("Processing career path: ID={}, Name={}", path.getCareerPathId(), path.getCareerPathName());
            
            ProfileVector vector = profileAnalyzer.buildProfile(path);
            vector.normalize();
            RecommendationScore score = scoringService.score(vector, studentProfile);
            
            LOGGER.debug("Career path {} scored: {}", path.getCareerPathName(), score.getOverall());
            
            if (score.getOverall() <= 0) {
                LOGGER.debug("Skipping career path {} due to low score", path.getCareerPathName());
                continue;
            }
            
            // Create recommendation WITHOUT populating careers/programs yet
            CareerPathRecommendation recommendation = CareerPathRecommendation.from(path, score.getOverall(), score);
            scoredPaths.add(recommendation);
        }
        
        // STEP 2: HYBRID APPROACH - Get TOP 10 deterministic paths, then AI refines to TOP 3
        List<CareerPathRecommendation> top10Paths = scoredPaths.stream()
            .sorted(Comparator.comparingDouble(CareerPathRecommendation::getMatchPercentage).reversed())
            .limit(10)
            .collect(Collectors.toList());
            
        System.out.println("� HYBRID APPROACH: Deterministic scoring found TOP 10, now AI will refine to TOP 3");
        System.out.println("📊 Deterministic TOP 10 career paths:");
        for (int i = 0; i < top10Paths.size(); i++) {
            System.out.println("   " + (i+1) + ". " + top10Paths.get(i).getCareerPathName() + 
                             " (" + String.format("%.1f", top10Paths.get(i).getMatchPercentage()) + "%)");
        }
        System.out.println();
        
        // STEP 2.5: Let AI refine the top 10 to top 3 with enhanced reasoning
        List<CareerPathRecommendation> topPaths = refineCareerPathsWithAI(top10Paths, studentProfile);
        
        System.out.println("🤖 AI-REFINED TOP 3 career paths for detailed processing:");
        for (int i = 0; i < topPaths.size(); i++) {
            System.out.println("   " + (i+1) + ". " + topPaths.get(i).getCareerPathName() + 
                             " (" + String.format("%.1f", topPaths.get(i).getMatchPercentage()) + "%) [AI-Enhanced]");
        }
        System.out.println();
        
        // STEP 3: Generate AI summaries for career paths
        System.out.println("🤖 Generating AI summaries for career paths...");
        for (CareerPathRecommendation recommendation : topPaths) {
            try {
                Map<String, Object> studentProfileForAI = buildStudentProfileForAI(studentProfile);
                String pathSummary = geminiAIService.generateCareerPathSummary(
                    recommendation.getCareerPathName(),
                    recommendation.getMatchPercentage(),
                    recommendation.getComponentBreakdown(),
                    studentProfileForAI
                );
                recommendation.setSummary(pathSummary);
                System.out.println("   ✅ Summary generated for: " + recommendation.getCareerPathName());
            } catch (Exception e) {
                LOGGER.warn("Failed to generate AI summary for career path {}: {}", 
                    recommendation.getCareerPathName(), e.getMessage());
                System.out.println("   ❌ Failed to generate summary for: " + recommendation.getCareerPathName());
            }
        }
        
        // STEP 4: ONLY populate careers and programs for TOP 3 paths
        for (CareerPathRecommendation topPath : topPaths) {
            // Find the original CareerPathEntity 
            CareerPathEntity pathEntity = allPaths.stream()
                .filter(p -> p.getCareerPathId() == topPath.getCareerPathId())
                .findFirst()
                .orElse(null);
                
            if (pathEntity != null) {
                populateCareersForPath(pathEntity, studentProfile, topPath);
                populateProgramsForPath(pathEntity, studentProfile, topPath);
            }
        }
            
        System.out.println("\n✅ ========== RECOMMENDATION GENERATION COMPLETED ==========");
        System.out.println("📊 Total paths scored: " + scoredPaths.size());
        System.out.println("🏆 Top paths with details: " + topPaths.size());
        System.out.println("🚀 MASSIVE OPTIMIZATION: Only processed " + topPaths.size() + " paths instead of " + scoredPaths.size() + "!");
        System.out.println("💡 API calls reduced by ~" + Math.round(((double)(scoredPaths.size() - topPaths.size()) / scoredPaths.size()) * 100) + "%!\n");
            
        LOGGER.info("Returning top {} career path recommendations", topPaths.size());
        return topPaths;
    }

    private void populateCareersForPath(CareerPathEntity path, StudentProfile studentProfile,
                                         CareerPathRecommendation recommendation) {
        List<CareerCareerPathEntity> careerLinks = path.getCareerCareerPaths();
        if (careerLinks == null || careerLinks.isEmpty()) {
            return;
        }
        List<CareerRecommendationDetail> scoredCareers = new ArrayList<>();
        Map<Integer, CareerEntity> careerMap = new HashMap<>(); // Store careers for later AI processing
        
        for (CareerCareerPathEntity link : careerLinks) {
            CareerEntity career = link != null ? link.getCareer() : null;
            if (career == null) {
                continue;
            }
            ProfileVector vector = profileAnalyzer.buildProfile(career);
            vector.normalize();
            RecommendationScore score = scoringService.score(vector, studentProfile);
            if (score.getOverall() <= 0) {
                continue;
            }
            String summary = buildCareerSummary(career, score, studentProfile);
            CareerRecommendationDetail detail = CareerRecommendationDetail.from(career, score.getOverall(), summary);
            scoredCareers.add(detail);
            careerMap.put(career.getCareerId(), career); // Store for AI processing
        }
        scoredCareers.sort(Comparator.comparingDouble(CareerRecommendationDetail::getMatchPercentage).reversed());
        
        System.out.println("🎯 CAREER PATH: " + path.getCareerPathName() + " | Found " + scoredCareers.size() + " careers");
        
        // Only add top 5 careers and use selective AI for top 3
        for (int i = 0; i < Math.min(5, scoredCareers.size()); i++) {
            CareerRecommendationDetail careerDetail = scoredCareers.get(i);
            
            System.out.println("   📋 Career #" + (i+1) + ": " + careerDetail.getCareerTitle() + 
                             " | Match: " + String.format("%.1f", careerDetail.getMatchPercentage()) + "%");
            
            // Regenerate summary with selective AI for top 3 recommendations
            if (i < 3) {
                System.out.println("      🔥 Requesting AI enhancement for TOP career");
                try {
                    Map<String, Object> studentProfileForAI = buildStudentProfileForAI(studentProfile);
                    CareerEntity career = careerMap.get(careerDetail.getCareerId());
                    if (career != null) {
                        String aiSummary = geminiAIService.generatePersonalizedCareerSummary(
                            career, careerDetail.getMatchPercentage(), studentProfileForAI, true);
                        // Update the summary with AI-generated version
                        careerDetail = CareerRecommendationDetail.from(career, careerDetail.getMatchPercentage(), aiSummary);
                        System.out.println("      ✨ AI summary updated for career: " + career.getCareerTitle());
                    }
                } catch (Exception e) {
                    System.err.println("      ❌ Failed to generate AI summary for top career " + careerDetail.getCareerId() + ": " + e.getMessage());
                    LOGGER.warn("Failed to generate AI summary for top career {}, using fallback", careerDetail.getCareerId());
                }
            }
            
            recommendation.addCareer(careerDetail);
        }
    }

    private void populateProgramsForPath(CareerPathEntity path, StudentProfile studentProfile,
                                          CareerPathRecommendation recommendation) {
        List<ProgramCareerPathEntity> links = programCareerPathRepository.findByCareerPath(path);
        if (links == null || links.isEmpty()) {
            return;
        }
        List<ProgramRecommendationDetail> scoredPrograms = new ArrayList<>();
        List<Integer> programIds = new ArrayList<>();
        Map<Integer, ProgramEntity> programMap = new HashMap<>(); // Store programs for later AI processing
        
        for (ProgramCareerPathEntity link : links) {
            ProgramEntity program = link.getProgram();
            if (program == null) {
                continue;
            }
            ProfileVector vector = profileAnalyzer.buildProfile(program);
            vector.normalize();
            RecommendationScore score = scoringService.score(vector, studentProfile);
            if (score.getOverall() <= 0) {
                continue;
            }
            String summary = buildProgramSummary(program, score, studentProfile);
            scoredPrograms.add(ProgramRecommendationDetail.from(program, score.getOverall(), summary, null));
            programIds.add(program.getProgramId());
            programMap.put(program.getProgramId(), program); // Store for AI processing
        }
        
        Map<Integer, List<Map<String, Object>>> schoolsByProgram = fetchSchoolsForPrograms(programIds);
        scoredPrograms.forEach(program -> {
            List<Map<String, Object>> schools = schoolsByProgram.get(program.getProgramId());
            if (schools != null) {
                program.setRecommendedSchools(schools);
            }
        });
        
        scoredPrograms.sort(Comparator.comparingDouble(ProgramRecommendationDetail::getMatchPercentage).reversed());
        
        System.out.println("📚 PROGRAMS for path: " + path.getCareerPathName() + " | Found " + scoredPrograms.size() + " programs");
        
        // Only add top 5 programs and use selective AI for top 3
        for (int i = 0; i < Math.min(5, scoredPrograms.size()); i++) {
            ProgramRecommendationDetail programDetail = scoredPrograms.get(i);
            
            System.out.println("   📋 Program #" + (i+1) + ": " + programDetail.getProgramName() + 
                             " | Match: " + String.format("%.1f", programDetail.getMatchPercentage()) + "%");
            
            // Regenerate summary with selective AI for top 3 recommendations
            if (i < 3) {
                System.out.println("      🔥 Requesting AI enhancement for TOP program");
                try {
                    Map<String, Object> studentProfileForAI = buildStudentProfileForAI(studentProfile);
                    ProgramEntity program = programMap.get(programDetail.getProgramId());
                    if (program != null) {
                        String aiSummary = geminiAIService.generatePersonalizedProgramSummary(
                            program, programDetail.getMatchPercentage(), studentProfileForAI, true);
                        // Update the summary with AI-generated version
                        programDetail = ProgramRecommendationDetail.from(program, programDetail.getMatchPercentage(), 
                                                                        aiSummary, programDetail.getRecommendedSchools());
                        System.out.println("      ✨ AI summary updated for program: " + program.getProgramName());
                    }
                } catch (Exception e) {
                    System.err.println("      ❌ Failed to generate AI summary for top program " + programDetail.getProgramId() + ": " + e.getMessage());
                    LOGGER.warn("Failed to generate AI summary for top program {}, using fallback", programDetail.getProgramId());
                }
            }
            
            recommendation.addProgram(programDetail);
        }
    }

    private Map<Integer, List<Map<String, Object>>> fetchSchoolsForPrograms(List<Integer> programIds) {
        Map<Integer, List<Map<String, Object>>> result = new HashMap<>();
        if (programIds == null || programIds.isEmpty()) {
            return result;
        }
        try {
            List<Map<String, Object>> recommendations = geminiAIService.getProgramSchoolRecommendations(programIds);
            for (Map<String, Object> entry : recommendations) {
                Object idObj = entry.get("programId");
                if (!(idObj instanceof Number)) {
                    continue;
                }
                Object schoolsObj = entry.get("schools");
                List<Map<String, Object>> schools = new ArrayList<>();
                if (schoolsObj instanceof List<?>) {
                    for (Object school : (List<?>) schoolsObj) {
                        if (school instanceof Map<?, ?>) {
                            Map<?, ?> schoolMap = (Map<?, ?>) school;
                            Map<String, Object> safeMap = new HashMap<>();
                            schoolMap.forEach((key, value) -> {
                                if (key != null) {
                                    safeMap.put(key.toString(), value);
                                }
                            });
                            schools.add(safeMap);
                        }
                    }
                }
                result.put(((Number) idObj).intValue(), schools);
            }
        } catch (Exception ex) {
            LOGGER.warn("Failed to fetch school recommendations: {}", ex.getMessage());
        }
        return result;
    }

    private DreamCareerInsight buildDreamCareerInsight(UserAssessmentEntity userAssessment, StudentProfile studentProfile, List<CareerPathRecommendation> careerPathRecommendations) {
        if (userAssessment == null || userAssessment.getUser() == null) {
            return null;
        }
        Optional<CareerInterestProfileEntity> profileOpt =
            careerInterestProfileService.getMostRecentActiveProfile(userAssessment.getUser().getUserId());
        if (profileOpt.isEmpty()) {
            return null;
        }
        CareerInterestProfileEntity profile = profileOpt.get();
        DreamCareerInsight insight = new DreamCareerInsight();
        insight.setDreamCareer(profile.getDreamCareer());

        // Try comprehensive AI analysis first
        try {
            DreamCareerInsight aiInsight = generateComprehensiveDreamCareerAnalysis(profile, studentProfile, userAssessment, careerPathRecommendations);
            if (aiInsight != null) {
                return aiInsight;
            }
        } catch (Exception e) {
            LOGGER.warn("Failed to generate AI dream career analysis for user {}: {}", 
                userAssessment.getUser().getUserId(), e.getMessage());
        }

        // Fallback to original logic
        CareerEntity matchedDream = matchCareerByName(profile.getDreamCareer());
        if (matchedDream == null) {
            insight.setEncouragement(buildDefaultEncouragement());
            return insight;
        }
        ProfileVector dreamVector = profileAnalyzer.buildProfile(matchedDream);
        dreamVector.normalize();
        RecommendationScore dreamScore = scoringService.score(dreamVector, studentProfile);
        insight.setClosenessScore(dreamScore.getOverall());
        insight.setRiasecGap(buildGapMap(dreamVector.getRiasecWeights(), studentProfile.getRiasecWeights()));
        insight.setAptitudeGap(buildGapMap(dreamVector.getTrackWeights(), studentProfile.getTrackWeights()));
        insight.setGuidance(buildGuidanceMessage(insight));
        insight.setEncouragement(buildEncouragementMessage(insight));
        return insight;
    }

    /**
     * Generate comprehensive AI-driven dream career analysis
     * Handles both specific and vague dream career statements with personalized insights
     */
    private DreamCareerInsight generateComprehensiveDreamCareerAnalysis(
            CareerInterestProfileEntity profile, 
            StudentProfile studentProfile, 
            UserAssessmentEntity userAssessment,
            List<CareerPathRecommendation> careerPathRecommendations) throws Exception {
        
        // Wait for rate limit before making API call
        geminiAIService.waitForRateLimit();
        
        // Build comprehensive student profile data for AI analysis
        Map<String, Object> studentData = buildStudentProfileForAI(studentProfile);
        
        // Add basic assessment information from userAssessment
        studentData.put("assessmentScore", userAssessment.getScore());
        studentData.put("dateTaken", userAssessment.getDateTaken());
        if (userAssessment.getDateCompleted() != null) {
            studentData.put("dateCompleted", userAssessment.getDateCompleted());
        }
        
        // Add career interest profile information
        Map<String, Object> careerProfileData = new HashMap<>();
        careerProfileData.put("dreamCareer", profile.getDreamCareer());
        careerProfileData.put("mainInterestsHobbies", profile.getMainInterestsHobbies());
        careerProfileData.put("personalStrengthsSkills", profile.getPersonalStrengthsSkills());
        careerProfileData.put("careerValues", profile.getCareerValues());
        careerProfileData.put("preferredWorkEnvironment", profile.getPreferredWorkEnvironment());
        careerProfileData.put("educationTrainingAspirations", profile.getEducationTrainingAspirations());
        studentData.put("careerProfile", careerProfileData);
        
        // CRITICAL: Add all available careers from database for AI to reference
        List<CareerEntity> allCareers = careerRepository.findAll();
        studentData.put("availableCareers", buildCareerDatabase(allCareers));
        
        // Add career pathway recommendations if available
        if (careerPathRecommendations != null && !careerPathRecommendations.isEmpty()) {
            studentData.put("careerPathRecommendations", buildCareerPathContext(careerPathRecommendations));
        }
        
        // Build comprehensive AI prompt
        String aiPrompt = buildDreamCareerAnalysisPrompt(profile.getDreamCareer(), studentData);
        
        // Make AI request
        String aiResponse = geminiAIService.makeAIRequest(aiPrompt);
        
        // Parse AI response to create DreamCareerInsight
        return parseDreamCareerAIResponse(aiResponse, profile.getDreamCareer());
    }

    /**
     * Build career database information for AI consumption
     */
    private List<Map<String, Object>> buildCareerDatabase(List<CareerEntity> careers) {
        List<Map<String, Object>> careerData = new ArrayList<>();
        
        for (CareerEntity career : careers) {
            Map<String, Object> careerInfo = new HashMap<>();
            careerInfo.put("title", career.getCareerTitle());
            careerInfo.put("description", career.getCareerDescription());
            careerInfo.put("industry", career.getIndustry());
            careerInfo.put("salary", career.getSalary());
            careerInfo.put("jobTrend", career.getJobTrend());
            
            // Extract RIASEC information from description if available
            String description = career.getCareerDescription();
            if (description != null) {
                careerInfo.put("riasecHints", extractRiasecFromDescription(description));
            }
            
            careerData.add(careerInfo);
        }
        
        return careerData;
    }

    /**
     * Extract RIASEC hints from career description
     */
    private String extractRiasecFromDescription(String description) {
        if (description == null || description.isEmpty()) {
            return "";
        }
        
        StringBuilder riasecHints = new StringBuilder();
        String lowerDesc = description.toLowerCase();
        
        // Look for RIASEC indicators in the description
        if (lowerDesc.contains("hands-on") || lowerDesc.contains("manual") || lowerDesc.contains("tools") || 
            lowerDesc.contains("mechanical") || lowerDesc.contains("practical") || lowerDesc.contains("build")) {
            riasecHints.append("Realistic, ");
        }
        
        if (lowerDesc.contains("research") || lowerDesc.contains("analyze") || lowerDesc.contains("investigate") || 
            lowerDesc.contains("scientific") || lowerDesc.contains("data") || lowerDesc.contains("problem-solving")) {
            riasecHints.append("Investigative, ");
        }
        
        if (lowerDesc.contains("creative") || lowerDesc.contains("artistic") || lowerDesc.contains("design") || 
            lowerDesc.contains("innovative") || lowerDesc.contains("aesthetic") || lowerDesc.contains("expression")) {
            riasecHints.append("Artistic, ");
        }
        
        if (lowerDesc.contains("helping") || lowerDesc.contains("teaching") || lowerDesc.contains("counseling") || 
            lowerDesc.contains("social") || lowerDesc.contains("community") || lowerDesc.contains("support")) {
            riasecHints.append("Social, ");
        }
        
        if (lowerDesc.contains("leadership") || lowerDesc.contains("management") || lowerDesc.contains("business") || 
            lowerDesc.contains("sales") || lowerDesc.contains("entrepreneurial") || lowerDesc.contains("influence")) {
            riasecHints.append("Enterprising, ");
        }
        
        if (lowerDesc.contains("organized") || lowerDesc.contains("systematic") || lowerDesc.contains("detailed") || 
            lowerDesc.contains("administrative") || lowerDesc.contains("structured") || lowerDesc.contains("procedural")) {
            riasecHints.append("Conventional, ");
        }
        
        // Remove trailing comma and space
        String result = riasecHints.toString();
        return result.endsWith(", ") ? result.substring(0, result.length() - 2) : result;
    }

    /**
     * Build career pathway context for AI
     */
    private List<Map<String, Object>> buildCareerPathContext(List<CareerPathRecommendation> careerPaths) {
        List<Map<String, Object>> pathData = new ArrayList<>();
        
        for (CareerPathRecommendation path : careerPaths) {
            Map<String, Object> pathInfo = new HashMap<>();
            pathInfo.put("pathName", path.getCareerPathName());
            pathInfo.put("matchPercentage", path.getMatchPercentage());
            pathInfo.put("summary", path.getSummary());
            
            // Add career details if available
            if (path.getCareers() != null && !path.getCareers().isEmpty()) {
                List<Map<String, String>> careers = new ArrayList<>();
                for (CareerRecommendationDetail career : path.getCareers()) {
                    Map<String, String> careerInfo = new HashMap<>();
                    careerInfo.put("title", career.getCareerTitle());
                    careerInfo.put("summary", career.getSummary());
                    careers.add(careerInfo);
                }
                pathInfo.put("careers", careers);
            }
            
            pathData.add(pathInfo);
        }
        
        return pathData;
    }

    /**
     * Detect if a dream career statement is vague and provide field context
     */
    private boolean isVagueCareerStatement(String dreamCareer) {
        if (dreamCareer == null || dreamCareer.trim().isEmpty()) {
            return true;
        }
        
        String normalized = dreamCareer.toLowerCase().trim();
        
        // Common vague indicators
        String[] vagueIndicators = {
            "field", "area", "something", "anything", "related to", "involving", 
            "helping", "working with", "dealing with", "focused on", "based on",
            "technology", "business", "creative", "innovative", "scientific"
        };
        
        for (String indicator : vagueIndicators) {
            if (normalized.contains(indicator)) {
                return true;
            }
        }
        
        // Check if it's too short or too general
        return normalized.split("\\s+").length <= 3 || 
               normalized.contains("don't know") || 
               normalized.contains("not sure") ||
               normalized.contains("undecided");
    }

    /**
     * Add field interpretation context to help AI understand vague responses
     */
    private void addFieldInterpretationContext(String dreamCareer, StringBuilder prompt) {
        prompt.append("FIELD INTERPRETATION GUIDANCE:\n");
        
        if (isVagueCareerStatement(dreamCareer)) {
            prompt.append("⚠️  VAGUE RESPONSE DETECTED - Use intelligent interpretation with database constraints:\n\n");
            
            String normalized = dreamCareer.toLowerCase();
            
            if (normalized.contains("technolog") || normalized.contains("computer") || normalized.contains("software") || normalized.contains("digital")) {
                prompt.append("TECHNOLOGY FIELD INDICATORS detected. Search the career database for technology-related careers such as:\n");
                prompt.append("- Look for careers with 'Software', 'Computer', 'Data', 'Systems', 'Technology' in their titles\n");
                prompt.append("- Prioritize based on student's Investigative and Realistic RIASEC scores\n\n");
            }
            
            if (normalized.contains("help") || normalized.contains("service") || normalized.contains("people") || normalized.contains("society")) {
                prompt.append("HELPING/SERVICE FIELD INDICATORS detected. Search the career database for service-oriented careers such as:\n");
                prompt.append("- Look for careers with 'Social', 'Teacher', 'Counselor', 'Healthcare', 'Community' in their titles\n");
                prompt.append("- Prioritize based on student's Social RIASEC scores\n\n");
            }
            
            if (normalized.contains("business") || normalized.contains("management") || normalized.contains("leader") || normalized.contains("entrepreneur")) {
                prompt.append("BUSINESS/LEADERSHIP FIELD INDICATORS detected. Search the career database for business careers such as:\n");
                prompt.append("- Look for careers with 'Manager', 'Business', 'Marketing', 'Finance', 'Sales' in their titles\n");
                prompt.append("- Prioritize based on student's Enterprising RIASEC scores\n\n");
            }
            
            if (normalized.contains("creative") || normalized.contains("art") || normalized.contains("design") || normalized.contains("innovation")) {
                prompt.append("CREATIVE/DESIGN FIELD INDICATORS detected. Search the career database for creative careers such as:\n");
                prompt.append("- Look for careers with 'Design', 'Creative', 'Art', 'Media', 'Innovation' in their titles\n");
                prompt.append("- Prioritize based on student's Artistic RIASEC scores\n\n");
            }
            
            if (normalized.contains("science") || normalized.contains("research") || normalized.contains("analyz") || normalized.contains("discover")) {
                prompt.append("SCIENCE/RESEARCH FIELD INDICATORS detected. Search the career database for research careers such as:\n");
                prompt.append("- Look for careers with 'Research', 'Scientist', 'Analyst', 'Laboratory', 'Study' in their titles\n");
                prompt.append("- Prioritize based on student's Investigative RIASEC scores\n\n");
            }
            
            if (normalized.contains("health") || normalized.contains("medical") || normalized.contains("care") || normalized.contains("wellness")) {
                prompt.append("HEALTHCARE FIELD INDICATORS detected. Search the career database for healthcare careers such as:\n");
                prompt.append("- Look for careers with 'Doctor', 'Nurse', 'Medical', 'Health', 'Therapy' in their titles\n");
                prompt.append("- Prioritize based on student's Social and Investigative RIASEC scores\n\n");
            }
            
            prompt.append("🎯 CRITICAL: Only suggest careers that actually exist in the provided database. Do not suggest careers not listed.\n\n");
        } else {
            prompt.append("✅ SPECIFIC CAREER detected - Find exact or close matches in the career database and analyze alignment.\n\n");
        }
    }

    /**
     * Build comprehensive AI prompt for dream career analysis
     */
    private String buildDreamCareerAnalysisPrompt(String dreamCareer, Map<String, Object> studentData) {
        StringBuilder prompt = new StringBuilder();
        
        prompt.append("DREAM CAREER ALIGNMENT ANALYSIS\n\n");
        
        prompt.append("You are an expert career counselor providing personalized guidance. ");
        prompt.append("A student has shared their dream career, and you need to analyze how this aligns with ");
        prompt.append("the SPECIFIC career recommendations that were generated for them based on their assessment. ");
        prompt.append("This is NOT about general career exploration - it's about comparing their SUBJECTIVE dream ");
        prompt.append("against their OBJECTIVE personalized recommendations.\n\n");
        
        prompt.append("YOUR DREAM CAREER: \"").append(dreamCareer).append("\"\n\n");
        
        // Add intelligent field interpretation context
        addFieldInterpretationContext(dreamCareer, prompt);
        
        prompt.append("CORE ANALYSIS PURPOSE:\n");
        prompt.append("Compare their dream career against their personalized recommendations to determine:\n");
        prompt.append("- Does their dream career appear in their recommended career paths?\n");
        prompt.append("- If YES: Validate the alignment and explain why it's a good match\n");
        prompt.append("- If NO: Explain the gap between what they want vs. what we recommend for them\n");
        prompt.append("- Provide insights on bridging any gaps or validating their aspirations\n\n");
        
        prompt.append("YOUR ASSESSMENT DATA:\n");
        
        // Add RIASEC Profile
        if (studentData.containsKey("personalityType")) {
            prompt.append("RIASEC Personality Profile:\n");
            @SuppressWarnings("unchecked")
            Map<String, Object> riasecScores = (Map<String, Object>) studentData.get("personalityType");
            for (Map.Entry<String, Object> entry : riasecScores.entrySet()) {
                prompt.append("- ").append(entry.getKey()).append(": ").append(entry.getValue()).append("%\n");
            }
            prompt.append("\n");
        }
        
        // Add Academic Tracks
        if (studentData.containsKey("academicTracks")) {
            prompt.append("Academic Track Strengths:\n");
            @SuppressWarnings("unchecked")
            Map<String, Double> tracks = (Map<String, Double>) studentData.get("academicTracks");
            for (Map.Entry<String, Double> entry : tracks.entrySet()) {
                prompt.append("- ").append(entry.getKey()).append(": ").append(String.format("%.1f", entry.getValue() * 100)).append("%\n");
            }
            prompt.append("\n");
        }
        
        // Add Skills
        if (studentData.containsKey("skillAreas")) {
            prompt.append("Skill Assessment Results:\n");
            @SuppressWarnings("unchecked")
            Map<String, Double> skills = (Map<String, Double>) studentData.get("skillAreas");
            for (Map.Entry<String, Double> entry : skills.entrySet()) {
                prompt.append("- ").append(entry.getKey()).append(": ").append(String.format("%.1f", entry.getValue() * 100)).append("%\n");
            }
            prompt.append("\n");
        }
        
        // Add Career Profile Data
        if (studentData.containsKey("careerProfile")) {
            @SuppressWarnings("unchecked")
            Map<String, Object> careerProfile = (Map<String, Object>) studentData.get("careerProfile");
            
            prompt.append("CAREER INTEREST PROFILE:\n");
            if (careerProfile.get("careerValues") != null) {
                prompt.append("Core Values: ").append(careerProfile.get("careerValues")).append("\n");
            }
            if (careerProfile.get("mainInterestsHobbies") != null) {
                prompt.append("Main Interests & Hobbies: ").append(careerProfile.get("mainInterestsHobbies")).append("\n");
            }
            if (careerProfile.get("personalStrengthsSkills") != null) {
                prompt.append("Personal Strengths & Skills: ").append(careerProfile.get("personalStrengthsSkills")).append("\n");
            }
            if (careerProfile.get("preferredWorkEnvironment") != null) {
                prompt.append("Preferred Work Environment: ").append(careerProfile.get("preferredWorkEnvironment")).append("\n");
            }
            if (careerProfile.get("educationTrainingAspirations") != null) {
                prompt.append("Education/Training Aspirations: ").append(careerProfile.get("educationTrainingAspirations")).append("\n");
            }
            prompt.append("\n");
        }
        
        // Add Available Careers Database - REFERENCE ONLY
        if (studentData.containsKey("availableCareers")) {
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> careers = (List<Map<String, Object>>) studentData.get("availableCareers");
            
            prompt.append("📚 REFERENCE DATABASE (for context only):\n");
            prompt.append("Use this database only to understand career descriptions if needed, ");
            prompt.append("but focus your analysis on the RECOMMENDED careers above.\n");
            prompt.append("Database contains ").append(careers.size()).append(" total careers across all industries.\n\n");
        }
        
        // Add Career Pathway Recommendations if available - CRITICAL SECTION
        if (studentData.containsKey("careerPathRecommendations")) {
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> pathRecommendations = (List<Map<String, Object>>) studentData.get("careerPathRecommendations");
            
            prompt.append("🎯 YOUR PERSONALIZED RECOMMENDATIONS:\n");
            prompt.append("These are the career paths specifically recommended for you based on your assessment:\n");
            prompt.append("Compare the dream career against THESE recommendations, not the general database.\n\n");
            
            for (Map<String, Object> path : pathRecommendations) {
                prompt.append("✅ RECOMMENDED PATH: ").append(path.get("pathName"))
                      .append(" (").append(path.get("matchPercentage")).append("% match)\n");
                
                if (path.get("summary") != null) {
                    prompt.append("   Why recommended: ").append(path.get("summary")).append("\n");
                }
                
                @SuppressWarnings("unchecked")
                List<Map<String, String>> pathCareers = (List<Map<String, String>>) path.get("careers");
                if (pathCareers != null && !pathCareers.isEmpty()) {
                    prompt.append("   Specific careers in this path:\n");
                    for (Map<String, String> career : pathCareers) {
                        prompt.append("     • ").append(career.get("title")).append("\n");
                    }
                }
                prompt.append("\n");
            }
            
            prompt.append("� ALIGNMENT QUESTION: Does your dream career appear in the above recommendations?\n");
            prompt.append("If not, what does this reveal about the gap between your aspirations and your assessment profile?\n\n");
        }
        
        prompt.append("ANALYSIS REQUIREMENTS:\n");
        prompt.append("Provide a comprehensive reality-check analysis in 5 structured sections:\n\n");
        
        prompt.append("1. RECOMMENDATION ALIGNMENT (100-150 words):\n");
        prompt.append("- PRIMARY QUESTION: Does your dream career appear in your recommendations above?\n");
        prompt.append("- IF YES: Explain which recommended path contains your dream career and why it's a strong match\n");
        prompt.append("- IF NO: Identify the closest recommended career to your dream and explain the differences\n");
        prompt.append("- FOR VAGUE DREAMS: Interpret your field interest and find the best matching recommended path\n");
        prompt.append("- Reference specific recommendation percentages and path summaries\n");
        prompt.append("- Example: 'Your dream of software development aligns perfectly with your #1 recommended Technology Career Path (89% match)'\n\n");
        
        prompt.append("2. STRENGTHS VALIDATION (100-150 words):\n");
        prompt.append("- Analyze how your assessment strengths support (or don't support) your dream career\n");
        prompt.append("- Compare your top RIASEC scores against what your dream career typically requires\n");
        prompt.append("- IF ALIGNED: Celebrate how your natural strengths match your aspirations\n");
        prompt.append("- IF MISALIGNED: Explain why the assessment didn't recommend careers in your dream field\n");
        prompt.append("- Use specific percentages: 'Your Investigative score (85%) strongly supports your interest in research'\n");
        prompt.append("- Connect your academic track performance to career feasibility\n\n");
        
        prompt.append("3. REALITY CHECK INSIGHTS (100-150 words):\n");
        prompt.append("- Honest assessment of any gaps between your dream and your recommended paths\n");
        prompt.append("- IF DREAM NOT RECOMMENDED: Explain why the assessment didn't suggest careers in your preferred field\n");
        prompt.append("- Address potential misconceptions about your dream career requirements\n");
        prompt.append("- Highlight assessment areas that may not align with your dream career demands\n");
        prompt.append("- Be constructive: frame gaps as development opportunities rather than barriers\n");
        prompt.append("- Example: 'While you dream of marketing, your lower Social score (40%) suggests challenges in client-facing roles'\n\n");
        
        prompt.append("4. BRIDGE-BUILDING STRATEGIES (100-150 words):\n");
        prompt.append("- IF ALIGNED: Suggest next steps to pursue your recommended path confidently\n");
        prompt.append("- IF MISALIGNED: Provide strategies to either develop toward your dream or explore recommended alternatives\n");
        prompt.append("- Suggest ways to explore your dream field while building on your recommended strengths\n");
        prompt.append("- Include both immediate actions and longer-term development plans\n");
        prompt.append("- Example: 'To bridge toward marketing, strengthen social skills through recommended business paths first'\n");
        prompt.append("- Offer compromise careers that blend your dreams with your recommendations\n\n");
        
        prompt.append("5. PERSONALIZED ENCOURAGEMENT (80-120 words):\n");
        prompt.append("- IF DREAMS ALIGN: Celebrate the convergence of your aspirations and assessment results\n");
        prompt.append("- IF DREAMS DIVERGE: Encourage exploration while honoring your assessment-based strengths\n");
        prompt.append("- Acknowledge your self-awareness in stating your dreams\n");
        prompt.append("- Frame the analysis as valuable self-discovery rather than limitation\n");
        prompt.append("- End with motivation about either pursuing your validated dream or exploring new possibilities\n");
        prompt.append("- Tone: realistic optimism that honors both your aspirations and your assessed capabilities\n\n");
        
        prompt.append("RESPONSE FORMAT:\n");
        prompt.append("Return your analysis as a valid JSON object with exactly these keys:\n");
        prompt.append("{\n");
        prompt.append("  \"fieldAlignment\": \"your field alignment analysis\",\n");
        prompt.append("  \"strengthsAlignment\": \"your strengths alignment analysis\",\n");
        prompt.append("  \"misalignmentInsights\": \"your misalignment insights\",\n");
        prompt.append("  \"personalizedFocusAreas\": \"your personalized focus areas\",\n");
        prompt.append("  \"encouragement\": \"your encouragement message\"\n");
        prompt.append("}\n\n");
        
        prompt.append("RESPONSE FORMAT:\n");
        prompt.append("Return your analysis as a valid JSON object with exactly these keys:\n");
        prompt.append("{\n");
        prompt.append("  \"fieldAlignment\": \"your recommendation alignment analysis\",\n");
        prompt.append("  \"strengthsAlignment\": \"your strengths validation analysis\",\n");
        prompt.append("  \"misalignmentInsights\": \"your reality check insights\",\n");
        prompt.append("  \"personalizedFocusAreas\": \"your bridge-building strategies\",\n");
        prompt.append("  \"encouragement\": \"your personalized encouragement\"\n");
        prompt.append("}\n\n");
        
        prompt.append("CRITICAL FOCUS:\n");
        prompt.append("- This is a COMPARISON analysis: Dream Career vs. Personalized Recommendations\n");
        prompt.append("- Your primary job is determining alignment/misalignment with their specific recommendations\n");
        prompt.append("- Reference actual recommendation percentages and path names in your analysis\n");
        prompt.append("- Be honest about gaps while remaining encouraging about possibilities\n");
        prompt.append("- Help them understand WHY the assessment made its recommendations vs. their stated dreams\n");
        prompt.append("- Write as if you are speaking directly to the student using 'you' and 'your'\n");
        prompt.append("- Avoid mentioning AI, algorithms, or automated systems - speak as a human counselor\n");
        
        return prompt.toString();
    }

    /**
     * Parse AI response into DreamCareerInsight object
     */
    private DreamCareerInsight parseDreamCareerAIResponse(String aiResponse, String dreamCareer) {
        try {
            // Clean the response - extract JSON if wrapped in other text
            String jsonResponse = extractJSONFromResponse(aiResponse);
            
            // Parse the JSON response
            ObjectMapper mapper = new ObjectMapper();
            JsonNode responseNode = mapper.readTree(jsonResponse);
            
            // Create and populate DreamCareerInsight
            DreamCareerInsight insight = new DreamCareerInsight();
            insight.setDreamCareer(dreamCareer);
            
            // Extract AI analysis sections
            if (responseNode.has("fieldAlignment")) {
                insight.setFieldAlignment(responseNode.get("fieldAlignment").asText());
            }
            if (responseNode.has("strengthsAlignment")) {
                insight.setStrengthsAlignment(responseNode.get("strengthsAlignment").asText());
            }
            if (responseNode.has("misalignmentInsights")) {
                insight.setMisalignmentInsights(responseNode.get("misalignmentInsights").asText());
            }
            if (responseNode.has("personalizedFocusAreas")) {
                insight.setPersonalizedFocusAreas(responseNode.get("personalizedFocusAreas").asText());
            }
            if (responseNode.has("encouragement")) {
                insight.setEncouragement(responseNode.get("encouragement").asText());
            }
            
            // Set a synthetic closeness score based on field alignment quality
            // This provides backward compatibility for frontend components expecting this field
            insight.setClosenessScore(calculateSyntheticClosenessScore(insight));
            
            return insight;
            
        } catch (Exception e) {
            LOGGER.error("Failed to parse AI dream career response: {}", e.getMessage());
            throw new RuntimeException("Failed to parse AI analysis response", e);
        }
    }

    /**
     * Extract JSON object from AI response text
     */
    private String extractJSONFromResponse(String response) {
        if (response == null || response.trim().isEmpty()) {
            throw new IllegalArgumentException("AI response is empty");
        }
        
        // Try to find JSON object boundaries
        int jsonStart = response.indexOf("{");
        int jsonEnd = response.lastIndexOf("}");
        
        if (jsonStart >= 0 && jsonEnd > jsonStart) {
            return response.substring(jsonStart, jsonEnd + 1);
        }
        
        // If no clear JSON boundaries, return the response as-is and let JSON parser handle it
        return response.trim();
    }

    /**
     * Calculate a synthetic closeness score based on AI analysis quality
     * This provides backward compatibility for components expecting numerical scores
     */
    private Double calculateSyntheticClosenessScore(DreamCareerInsight insight) {
        // Simple heuristic based on the presence and positive tone of analysis sections
        double score = 50.0; // Base score
        
        // Boost score based on comprehensive analysis
        if (insight.getFieldAlignment() != null && insight.getFieldAlignment().length() > 100) {
            score += 15.0;
        }
        if (insight.getStrengthsAlignment() != null && insight.getStrengthsAlignment().length() > 100) {
            score += 15.0;
        }
        if (insight.getPersonalizedFocusAreas() != null && insight.getPersonalizedFocusAreas().length() > 100) {
            score += 10.0;
        }
        
        // Check for positive indicators in field alignment
        if (insight.getFieldAlignment() != null) {
            String fieldText = insight.getFieldAlignment().toLowerCase();
            if (fieldText.contains("strong") || fieldText.contains("excellent") || fieldText.contains("well-aligned")) {
                score += 10.0;
            }
            if (fieldText.contains("perfect") || fieldText.contains("ideal")) {
                score += 5.0;
            }
        }
        
        return Math.min(100.0, Math.max(0.0, score));
    }

    private CareerEntity matchCareerByName(String name) {
        if (name == null || name.isBlank()) {
            return null;
        }
        List<CareerEntity> careers = careerRepository.findAll();
        String normalized = name.trim().toLowerCase(Locale.ENGLISH);
        CareerEntity bestMatch = null;
        double highestScore = 0;
        for (CareerEntity career : careers) {
            String title = career.getCareerTitle();
            if (title == null) {
                continue;
            }
            double score = stringSimilarity(normalized, title.toLowerCase(Locale.ENGLISH));
            if (score > highestScore) {
                highestScore = score;
                bestMatch = career;
            }
        }
        return highestScore < 0.35 ? null : bestMatch;
    }

    private double stringSimilarity(String a, String b) {
        if (a.equals(b)) {
            return 1.0;
        }
        int distance = levenshteinDistance(a, b);
        int max = Math.max(a.length(), b.length());
        if (max == 0) {
            return 1.0;
        }
        return 1.0 - ((double) distance / max);
    }

    private int levenshteinDistance(String lhs, String rhs) {
        int[][] dp = new int[lhs.length() + 1][rhs.length() + 1];
        for (int i = 0; i <= lhs.length(); i++) {
            dp[i][0] = i;
        }
        for (int j = 0; j <= rhs.length(); j++) {
            dp[0][j] = j;
        }
        for (int i = 1; i <= lhs.length(); i++) {
            for (int j = 1; j <= rhs.length(); j++) {
                int cost = lhs.charAt(i - 1) == rhs.charAt(j - 1) ? 0 : 1;
                dp[i][j] = Math.min(
                    Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1),
                    dp[i - 1][j - 1] + cost
                );
            }
        }
        return dp[lhs.length()][rhs.length()];
    }

    private Map<String, Double> buildGapMap(Map<?, Double> target, Map<?, Double> student) {
        Map<String, Double> gap = new HashMap<>();
        if (target == null || student == null) {
            return gap;
        }
        for (Map.Entry<?, Double> entry : target.entrySet()) {
            Object key = entry.getKey();
            Double targetVal = entry.getValue();
            Double studentVal = student.get(key);
            if (targetVal != null) {
                double diff = targetVal - (studentVal != null ? studentVal : 0);
                gap.put(key.toString(), Math.round(diff * 10000.0) / 100.0);
            }
        }
        return gap;
    }

    private String buildCareerSummary(CareerEntity career, RecommendationScore score, StudentProfile studentProfile) {
        // Try to generate AI-powered personalized summary
        try {
            Map<String, Object> studentProfileForAI = buildStudentProfileForAI(studentProfile);
            return geminiAIService.generatePersonalizedCareerSummary(
                career, score.getOverall(), studentProfileForAI);
        } catch (Exception e) {
            LOGGER.warn("Failed to generate AI career summary for {}: {}", 
                career.getCareerTitle(), e.getMessage());
            // Fallback to basic summary
            return String.format(Locale.ENGLISH,
                "%s aligns well with your strengths (overall match %.0f%%).",
                career.getCareerTitle(), score.getOverall());
        }
    }

    private String buildProgramSummary(ProgramEntity program, RecommendationScore score, StudentProfile studentProfile) {
        // Try to generate AI-powered personalized summary
        try {
            Map<String, Object> studentProfileForAI = buildStudentProfileForAI(studentProfile);
            return geminiAIService.generatePersonalizedProgramSummary(
                program, score.getOverall(), studentProfileForAI);
        } catch (Exception e) {
            LOGGER.warn("Failed to generate AI program summary for {}: {}", 
                program.getProgramName(), e.getMessage());
            // Fallback to basic summary
            return String.format(Locale.ENGLISH,
                "%s supports your target skills (overall match %.0f%%).",
                program.getProgramName(), score.getOverall());
        }
    }

    private String buildGuidanceMessage(DreamCareerInsight insight) {
        Map<String, Double> riasecGap = insight.getRiasecGap();
        List<Map.Entry<String, Double>> focusAreas = riasecGap.entrySet().stream()
            .filter(entry -> entry.getValue() > 5)
            .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
            .limit(2)
            .collect(Collectors.toList());
        if (focusAreas.isEmpty()) {
            return "You're already closely aligned with your dream career profile.";
        }
        StringBuilder builder = new StringBuilder("To move closer to your dream career, focus on: ");
        for (int i = 0; i < focusAreas.size(); i++) {
            Map.Entry<String, Double> entry = focusAreas.get(i);
            builder.append(entry.getKey()).append(" (+").append(entry.getValue()).append("%)");
            if (i < focusAreas.size() - 1) {
                builder.append(", ");
            }
        }
        return builder.toString();
    }

    private String buildEncouragementMessage(DreamCareerInsight insight) {
        double closeness = Optional.ofNullable(insight.getClosenessScore()).orElse(0.0);
        if (closeness >= 80) {
            return "You're on an excellent path—keep nurturing your strengths and stay curious!";
        }
        if (closeness >= 60) {
            return "You're getting close. Small improvements in your focus areas will unlock even more opportunities.";
        }
        return buildDefaultEncouragement();
    }

    private String buildDefaultEncouragement() {
        return "Every skill you practice today brings you closer to the future you're imagining. Keep going!";
    }

    /**
     * Build a student profile map for AI consumption
     */
    private Map<String, Object> buildStudentProfileForAI(StudentProfile studentProfile) {
        Map<String, Object> profile = new HashMap<>();
        
        if (studentProfile != null) {
            // Add RIASEC profile information
            Map<String, Double> riasecProfile = new HashMap<>();
            for (RiaSecType type : RiaSecType.values()) {
                riasecProfile.put(type.name(), studentProfile.getRiasecScore(type));
            }
            profile.put("riasecProfile", riasecProfile);
            
            // Add individual RIASEC dimensions for better AI understanding
            Map<String, Object> riasecScores = new HashMap<>();
            riasecScores.put("Realistic", studentProfile.getRiasecScore(RiaSecType.REALISTIC));
            riasecScores.put("Investigative", studentProfile.getRiasecScore(RiaSecType.INVESTIGATIVE));
            riasecScores.put("Artistic", studentProfile.getRiasecScore(RiaSecType.ARTISTIC));
            riasecScores.put("Social", studentProfile.getRiasecScore(RiaSecType.SOCIAL));
            riasecScores.put("Enterprising", studentProfile.getRiasecScore(RiaSecType.ENTERPRISING));
            riasecScores.put("Conventional", studentProfile.getRiasecScore(RiaSecType.CONVENTIONAL));
            profile.put("personalityType", riasecScores);
            
            // Add academic track strengths
            Map<String, Double> trackProfile = new HashMap<>();
            for (AcademicTrackType type : AcademicTrackType.values()) {
                trackProfile.put(type.name(), studentProfile.getTrackScore(type));
            }
            profile.put("academicTracks", trackProfile);
            
            // Add skill assessments
            Map<String, Double> skillProfile = new HashMap<>();
            for (SkillCluster cluster : SkillCluster.values()) {
                skillProfile.put(cluster.name(), studentProfile.getSkillScore(cluster));
            }
            profile.put("skillAreas", skillProfile);
            
            // Add top strengths for AI to highlight
            List<String> topStrengths = new ArrayList<>();
            studentProfile.getRiasecWeights().entrySet().stream()
                .sorted(Map.Entry.<RiaSecType, Double>comparingByValue().reversed())
                .limit(3)
                .forEach(entry -> {
                    String dimension = getRiasecFullName(entry.getKey().name());
                    topStrengths.add(dimension + " (" + String.format("%.0f", entry.getValue() * 100) + "%)");
                });
            profile.put("topStrengths", topStrengths);
            
            // Add assessment metadata
            if (studentProfile.getAssessmentResult() != null) {
                profile.put("overallScore", studentProfile.getAssessmentResult().getOverallScore());
            }
        } else {
            profile.put("note", "Student profile data not available for personalization");
        }
        
        return profile;
    }
    
    /**
     * Helper method to get full RIASEC dimension names
     */
    private String getRiasecFullName(String code) {
        switch (code.toUpperCase()) {
            case "REALISTIC": return "Realistic (hands-on, practical)";
            case "INVESTIGATIVE": return "Investigative (analytical, research-oriented)";
            case "ARTISTIC": return "Artistic (creative, expressive)";
            case "SOCIAL": return "Social (helping, interpersonal)";
            case "ENTERPRISING": return "Enterprising (leadership, business)";
            case "CONVENTIONAL": return "Conventional (organized, detail-oriented)";
            default: return code;
        }
    }
    
    /**
     * HYBRID APPROACH: Use AI to refine deterministic top 10 to final top 3
     * This combines mathematical scoring reliability with AI insights
     */
    private List<CareerPathRecommendation> refineCareerPathsWithAI(
            List<CareerPathRecommendation> top10Paths, 
            StudentProfile studentProfile) {
        
        if (top10Paths.size() <= 3) {
            // If we have 3 or fewer paths, just return them all
            return top10Paths;
        }
        
        try {
            System.out.println("🤖 Starting AI refinement of career paths...");
            
            // Build comprehensive prompt for AI refinement
            String refinementPrompt = buildCareerPathRefinementPrompt(top10Paths, studentProfile);
            
            // Apply rate limiting before AI call
            geminiAIService.waitForRateLimit();
            
            // Get AI refinement
            String aiResponse = geminiAIService.makeAIRequest(refinementPrompt);
            
            // Parse AI response to get refined rankings
            List<CareerPathRecommendation> refinedPaths = parseAIRefinementResponse(aiResponse, top10Paths);
            
            if (refinedPaths.size() >= 3) {
                System.out.println("✅ AI successfully refined career paths");
                return refinedPaths.subList(0, 3);
            } else {
                System.out.println("⚠️ AI refinement returned insufficient paths, falling back to deterministic top 3");
                return top10Paths.subList(0, 3);
            }
            
        } catch (Exception e) {
            LOGGER.warn("AI refinement failed: {}, falling back to deterministic top 3", e.getMessage());
            System.out.println("❌ AI refinement failed, using deterministic top 3: " + e.getMessage());
            return top10Paths.subList(0, 3);
        }
    }
    
    /**
     * Build prompt for AI to refine career path rankings
     * Enhanced to include career path descriptions and focus on objective assessment data
     */
    private String buildCareerPathRefinementPrompt(
            List<CareerPathRecommendation> top10Paths, 
            StudentProfile studentProfile) {
        
        StringBuilder prompt = new StringBuilder();
        
        prompt.append("You are an expert career counselor tasked with intelligently refining career pathway recommendations.\n");
        prompt.append("Your goal is to compare the deterministic mathematical scores against the actual career pathway descriptions ");
        prompt.append("and the student's objective assessment performance to select the TOP 3 most suitable paths.\n\n");
        
        prompt.append("STUDENT ASSESSMENT RESULTS (OBJECTIVE DATA ONLY):\n");
        Map<String, Object> profile = buildStudentProfileForAI(studentProfile);
        
        // Add only objective assessment data
        if (profile.containsKey("personalityType")) {
            prompt.append("RIASEC Personality Assessment Results:\n");
            @SuppressWarnings("unchecked")
            Map<String, Object> riasecScores = (Map<String, Object>) profile.get("personalityType");
            for (Map.Entry<String, Object> entry : riasecScores.entrySet()) {
                prompt.append("- ").append(entry.getKey()).append(": ").append(String.format("%.1f", ((Number)entry.getValue()).doubleValue())).append("%\n");
            }
            prompt.append("\n");
        }
        
        if (profile.containsKey("academicTracks")) {
            prompt.append("Academic Track Performance:\n");
            @SuppressWarnings("unchecked")
            Map<String, Double> tracks = (Map<String, Double>) profile.get("academicTracks");
            for (Map.Entry<String, Double> entry : tracks.entrySet()) {
                prompt.append("- ").append(entry.getKey()).append(": ").append(String.format("%.1f", entry.getValue() * 100)).append("%\n");
            }
            prompt.append("\n");
        }
        
        if (profile.containsKey("skillAreas")) {
            prompt.append("Skill Assessment Results:\n");
            @SuppressWarnings("unchecked")
            Map<String, Double> skills = (Map<String, Double>) profile.get("skillAreas");
            for (Map.Entry<String, Double> entry : skills.entrySet()) {
                prompt.append("- ").append(entry.getKey()).append(": ").append(String.format("%.1f", entry.getValue() * 100)).append("%\n");
            }
            prompt.append("\n");
        }
        
        if (profile.containsKey("overallScore")) {
            prompt.append("Overall Assessment Score: ").append(profile.get("overallScore")).append("%\n\n");
        }
        
        prompt.append("CAREER PATHWAYS TO ANALYZE (with descriptions and mathematical scores):\n");
        
        // Get all career path entities to access descriptions
        List<CareerPathEntity> allPaths = careerPathRepository.findAll();
        
        for (int i = 0; i < top10Paths.size(); i++) {
            CareerPathRecommendation path = top10Paths.get(i);
            prompt.append("=== PATHWAY #").append(i + 1).append(" ===\n");
            prompt.append("Name: ").append(path.getCareerPathName()).append("\n");
            prompt.append("Mathematical Score: ").append(String.format("%.1f", path.getMatchPercentage())).append("% match\n");
            
            // Add component breakdown
            if (path.getComponentBreakdown() != null) {
                prompt.append("Score Components: ");
                path.getComponentBreakdown().forEach((component, score) -> 
                    prompt.append(component).append(": ").append(String.format("%.1f", score)).append("%, "));
                prompt.append("\n");
            }
            
            // ADD CAREER PATH DESCRIPTION - This was the missing piece!
            CareerPathEntity pathEntity = allPaths.stream()
                .filter(p -> p.getCareerPathId() == path.getCareerPathId())
                .findFirst()
                .orElse(null);
            
            if (pathEntity != null && pathEntity.getCareerPathDescription() != null) {
                prompt.append("Description: ").append(pathEntity.getCareerPathDescription()).append("\n");
            } else {
                prompt.append("Description: [No description available]\n");
            }
            prompt.append("\n");
        }
        
        prompt.append("ANALYSIS TASK:\n");
        prompt.append("Intelligently compare the student's objective assessment results against each career pathway description ");
        prompt.append("and mathematical score. Select the TOP 3 pathways that best align with the student's demonstrated strengths and capabilities.\n\n");
        
        prompt.append("ANALYSIS CRITERIA (based on objective data only):\n");
        prompt.append("1. RIASEC Alignment: How well do the student's RIASEC scores match what each pathway description requires?\n");
        prompt.append("2. Academic Track Match: Do the student's academic strengths align with pathway requirements?\n");
        prompt.append("3. Skill Compatibility: Are the student's assessed skills relevant to each pathway?\n");
        prompt.append("4. Mathematical Score Validation: Does the pathway description support or contradict the algorithmic score?\n");
        prompt.append("5. Assessment Performance Consistency: Is there coherent alignment across all assessment dimensions?\n\n");
        
        prompt.append("IMPORTANT: Base your analysis ONLY on the objective assessment data provided. ");
        prompt.append("Do NOT make assumptions about the student's personal preferences, life circumstances, ");
        prompt.append("work-life balance desires, or subjective goals that are not evidenced in their assessment results.\n\n");
        
        prompt.append("RESPONSE FORMAT:\n");
        prompt.append("Return a JSON array with exactly 3 career paths in your recommended order:\n");
        prompt.append("[\n");
        prompt.append("  {\n");
        prompt.append("    \"careerPathName\": \"Exact name from the list above\",\n");
        prompt.append("    \"rank\": 1,\n");
        prompt.append("    \"adjustedScore\": 85.5,\n");
        prompt.append("    \"comprehensiveReasoning\": \"Provide 2-3 paragraphs explaining: (1) How this pathway description aligns with the student's specific RIASEC scores, academic track performance, and skill assessments. (2) Whether the mathematical score accurately reflects this alignment or if your analysis suggests adjustments. (3) Why this pathway ranks in your top 3 based on objective assessment evidence. Be specific about which assessment results support this recommendation and cite actual percentages from their results.\"\n");
        prompt.append("  },\n");
        prompt.append("  ... (2 more entries with equally comprehensive reasoning)\n");
        prompt.append("]\n\n");
        
        prompt.append("CRITICAL REQUIREMENTS:\n");
        prompt.append("- All careerPathName values must EXACTLY match the names from the pathways listed above\n");
        prompt.append("- Each comprehensiveReasoning must be 2-3 substantial paragraphs (minimum 150 words each)\n");
        prompt.append("- Reference specific assessment scores and percentages in your reasoning\n");
        prompt.append("- Explain how the pathway description aligns with or contradicts the mathematical scoring\n");
        prompt.append("- Base recommendations solely on objective assessment data, not assumptions\n");
        
        return prompt.toString();
    }
    
    /**
     * Parse AI response to get refined career path rankings
     * Updated to handle comprehensive reasoning instead of brief aiReasoning
     */
    private List<CareerPathRecommendation> parseAIRefinementResponse(
            String aiResponse, 
            List<CareerPathRecommendation> originalPaths) {
        
        List<CareerPathRecommendation> refinedPaths = new ArrayList<>();
        
        try {
            // Extract JSON from AI response
            String jsonStart = aiResponse.indexOf("[") >= 0 ? aiResponse.substring(aiResponse.indexOf("[")) : aiResponse;
            String jsonEnd = jsonStart.indexOf("]") >= 0 ? jsonStart.substring(0, jsonStart.indexOf("]") + 1) : jsonStart;
            
            // Parse JSON array
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            com.fasterxml.jackson.databind.JsonNode rootNode = mapper.readTree(jsonEnd);
            
            if (rootNode.isArray()) {
                for (com.fasterxml.jackson.databind.JsonNode pathNode : rootNode) {
                    String pathName = pathNode.get("careerPathName").asText();
                    double adjustedScore = pathNode.has("adjustedScore") ? 
                        pathNode.get("adjustedScore").asDouble() : 0.0;
                    
                    // Handle both old and new reasoning field names for backward compatibility
                    String comprehensiveReasoning = "";
                    if (pathNode.has("comprehensiveReasoning")) {
                        comprehensiveReasoning = pathNode.get("comprehensiveReasoning").asText();
                    } else if (pathNode.has("aiReasoning")) {
                        comprehensiveReasoning = pathNode.get("aiReasoning").asText();
                    }
                    
                    // Find matching original path
                    CareerPathRecommendation matchedPath = originalPaths.stream()
                        .filter(p -> p.getCareerPathName().equals(pathName))
                        .findFirst()
                        .orElse(null);
                    
                    if (matchedPath != null) {
                        // Create enhanced copy with AI adjustments and comprehensive reasoning
                        CareerPathRecommendation enhancedPath = createEnhancedCareerPath(
                            matchedPath, adjustedScore, comprehensiveReasoning);
                        refinedPaths.add(enhancedPath);
                        
                        System.out.println("   ✅ AI refined: " + pathName + 
                            " (Score: " + String.format("%.1f", adjustedScore) + "%) with comprehensive analysis");
                    }
                }
            }
            
        } catch (Exception e) {
            LOGGER.warn("Failed to parse AI refinement response: {}", e.getMessage());
            System.out.println("❌ Failed to parse AI response, using fallback");
        }
        
        return refinedPaths;
    }
    
    /**
     * Create enhanced career path with AI adjustments and comprehensive reasoning
     */
    private CareerPathRecommendation createEnhancedCareerPath(
            CareerPathRecommendation original, 
            double adjustedScore, 
            String comprehensiveReasoning) {
        
        // Create new recommendation by copying from original
        CareerPathRecommendation enhanced = new CareerPathRecommendation();
        
        // Copy all original data
        enhanced.setCareerPathId(original.getCareerPathId());
        enhanced.setCareerPathName(original.getCareerPathName());
        enhanced.setMatchPercentage(adjustedScore > 0 ? adjustedScore : original.getMatchPercentage());
        enhanced.setComponentBreakdown(new HashMap<>(original.getComponentBreakdown()));
        
        // Enhance summary with comprehensive AI reasoning
        String enhancedSummary = original.getSummary();
        if (comprehensiveReasoning != null && !comprehensiveReasoning.isEmpty()) {
            enhancedSummary = comprehensiveReasoning;
        }
        enhanced.setSummary(enhancedSummary);
        
        // Copy careers and programs
        for (CareerRecommendationDetail career : original.getCareers()) {
            enhanced.addCareer(career);
        }
        for (ProgramRecommendationDetail program : original.getPrograms()) {
            enhanced.addProgram(program);
        }
        
        return enhanced;
    }

    /**
     * Get existing recommendations for a user assessment
     */
    public AdvancedRecommendationResponse getExistingRecommendations(UserAssessmentEntity userAssessment) {
        try {
            // Check if recommendations already exist in the database
            Optional<AssessmentResultEntity> resultOpt = assessmentResultService.getAssessmentResultByUserAssessment(userAssessment);
            
            if (resultOpt.isPresent()) {
                AssessmentResultEntity assessmentResult = resultOpt.get();
                
                // Load existing recommendations
                return persistenceService.getPersistedRecommendations(assessmentResult);
            }
            
            return null;
        } catch (Exception e) {
            LOGGER.error("Error getting existing recommendations for assessment {}: {}", 
                userAssessment.getUserQuizAssessment(), e.getMessage());
            return null;
        }
    }

    /**
     * Regenerate only the dream career analysis using existing career path recommendations
     */
    public DreamCareerInsight regenerateDreamCareerAnalysis(UserAssessmentEntity userAssessment, List<CareerPathRecommendation> careerPaths) throws Exception {
        LOGGER.info("Regenerating dream career analysis for user assessment: {}", userAssessment.getUserQuizAssessment());
        
        // Get career interest profile
        Optional<CareerInterestProfileEntity> profileOpt = careerInterestProfileService.getMostRecentActiveProfile(userAssessment.getUser().getUserId());
        if (!profileOpt.isPresent() || profileOpt.get().getDreamCareer() == null || profileOpt.get().getDreamCareer().trim().isEmpty()) {
            throw new IllegalStateException("No dream career set in user profile");
        }
        
        // Get assessment result to build student profile
        Optional<AssessmentResultEntity> resultOpt = assessmentResultService.getAssessmentResultByUserAssessment(userAssessment);
        if (!resultOpt.isPresent()) {
            throw new IllegalStateException("Assessment result not found");
        }
        
        AssessmentResultEntity assessmentResult = resultOpt.get();
        List<UserAssessmentSectionResultEntity> sectionResults = userAssessmentService.getSectionResultsForAssessment(userAssessment);
        
        // Build student profile the same way as in the main generation method
        StudentProfile studentProfile = StudentProfile.from(assessmentResult, sectionResults);
        
        // Generate new dream career analysis with existing career recommendations
        return buildDreamCareerInsight(userAssessment, studentProfile, careerPaths);
    }

    /**
     * Persist updated recommendations with new dream career analysis
     */
    public void persistUpdatedRecommendations(AssessmentResultEntity assessmentResult, AdvancedRecommendationResponse updatedRecommendations) {
        try {
            LOGGER.info("Persisting updated recommendations with new dream career analysis for assessment result: {}", assessmentResult.getResultId());
            
            // Use the existing persistence service to save the updated recommendations
            persistenceService.persistRecommendations(assessmentResult, updatedRecommendations);
            
            LOGGER.info("Successfully persisted updated recommendations with new dream career analysis");
        } catch (Exception e) {
            LOGGER.error("Error persisting updated recommendations for assessment result {}: {}", 
                assessmentResult.getResultId(), e.getMessage(), e);
            throw new RuntimeException("Failed to persist updated recommendations", e);
        }
    }
}

