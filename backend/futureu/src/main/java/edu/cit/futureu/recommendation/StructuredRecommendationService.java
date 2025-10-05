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

        DreamCareerInsight insight = buildDreamCareerInsight(userAssessment, studentProfile);
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

    private DreamCareerInsight buildDreamCareerInsight(UserAssessmentEntity userAssessment, StudentProfile studentProfile) {
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
     */
    private String buildCareerPathRefinementPrompt(
            List<CareerPathRecommendation> top10Paths, 
            StudentProfile studentProfile) {
        
        StringBuilder prompt = new StringBuilder();
        
        prompt.append("You are an expert career counselor tasked with refining career pathway recommendations.\n\n");
        
        prompt.append("STUDENT PROFILE:\n");
        Map<String, Object> profile = buildStudentProfileForAI(studentProfile);
        
        // Add student profile details
        profile.forEach((key, value) -> {
            if (value != null) {
                prompt.append("- ").append(key).append(": ").append(value).append("\n");
            }
        });
        
        prompt.append("\nDETERMINISTIC TOP 10 CAREER PATHS (with mathematical scores):\n");
        for (int i = 0; i < top10Paths.size(); i++) {
            CareerPathRecommendation path = top10Paths.get(i);
            prompt.append((i + 1)).append(". ").append(path.getCareerPathName())
                  .append(" - ").append(String.format("%.1f", path.getMatchPercentage())).append("% match\n");
            
            // Add component breakdown
            if (path.getComponentBreakdown() != null) {
                prompt.append("   Components: ");
                path.getComponentBreakdown().forEach((component, score) -> 
                    prompt.append(component).append(": ").append(String.format("%.1f", score)).append("%, "));
                prompt.append("\n");
            }
        }
        
        prompt.append("\nTASK:\n");
        prompt.append("Analyze this student's profile holistically and select the TOP 3 career paths that would be most suitable.\n");
        prompt.append("Consider:\n");
        prompt.append("1. Mathematical scores (but don't be bound by them)\n");
        prompt.append("2. Student's personality patterns and interests\n");
        prompt.append("3. Potential for growth and fulfillment\n");
        prompt.append("4. Market trends and future opportunities\n");
        prompt.append("5. Work-life balance alignment\n");
        prompt.append("6. Student's life circumstances and goals\n\n");
        
        prompt.append("RESPONSE FORMAT:\n");
        prompt.append("Return a JSON array with exactly 3 career paths in your recommended order:\n");
        prompt.append("[\n");
        prompt.append("  {\n");
        prompt.append("    \"careerPathName\": \"Exact name from the list above\",\n");
        prompt.append("    \"rank\": 1,\n");
        prompt.append("    \"adjustedScore\": 85.5,\n");
        prompt.append("    \"aiReasoning\": \"Why this path is best for this student\"\n");
        prompt.append("  },\n");
        prompt.append("  ... (2 more entries)\n");
        prompt.append("]\n\n");
        
        prompt.append("Ensure all careerPathName values EXACTLY match the names from the list above.");
        
        return prompt.toString();
    }
    
    /**
     * Parse AI response to get refined career path rankings
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
                    String aiReasoning = pathNode.has("aiReasoning") ? 
                        pathNode.get("aiReasoning").asText() : "";
                    
                    // Find matching original path
                    CareerPathRecommendation matchedPath = originalPaths.stream()
                        .filter(p -> p.getCareerPathName().equals(pathName))
                        .findFirst()
                        .orElse(null);
                    
                    if (matchedPath != null) {
                        // Create enhanced copy with AI adjustments
                        CareerPathRecommendation enhancedPath = createEnhancedCareerPath(
                            matchedPath, adjustedScore, aiReasoning);
                        refinedPaths.add(enhancedPath);
                        
                        System.out.println("   ✅ AI refined: " + pathName + 
                            " (Score: " + String.format("%.1f", adjustedScore) + "%)");
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
     * Create enhanced career path with AI adjustments
     */
    private CareerPathRecommendation createEnhancedCareerPath(
            CareerPathRecommendation original, 
            double adjustedScore, 
            String aiReasoning) {
        
        // Create new recommendation by copying from original
        CareerPathRecommendation enhanced = new CareerPathRecommendation();
        
        // Copy all original data
        enhanced.setCareerPathId(original.getCareerPathId());
        enhanced.setCareerPathName(original.getCareerPathName());
        enhanced.setMatchPercentage(adjustedScore > 0 ? adjustedScore : original.getMatchPercentage());
        enhanced.setComponentBreakdown(new HashMap<>(original.getComponentBreakdown()));
        
        // Enhance summary with AI reasoning
        String enhancedSummary = original.getSummary();
        if (aiReasoning != null && !aiReasoning.isEmpty()) {
            enhancedSummary = aiReasoning;
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
}

