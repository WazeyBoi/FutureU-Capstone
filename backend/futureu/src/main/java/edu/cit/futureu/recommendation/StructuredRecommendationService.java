package edu.cit.futureu.recommendation;

import edu.cit.futureu.entity.AssessmentResultEntity;
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
import edu.cit.futureu.service.UserAssessmentService;
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

    @Transactional(readOnly = true)
    public AdvancedRecommendationResponse generate(UserAssessmentEntity userAssessment) {
        AssessmentResultEntity assessmentResult = assessmentResultService
            .getAssessmentResultByUserAssessment(userAssessment)
            .orElseThrow(() -> new IllegalArgumentException("No assessment result found"));

        List<UserAssessmentSectionResultEntity> sectionResults =
            userAssessmentService.getSectionResultsForAssessment(userAssessment);

        StudentProfile studentProfile = StudentProfile.from(assessmentResult, sectionResults);

        List<CareerPathRecommendation> careerPathRecommendations = buildCareerPathRecommendations(studentProfile);

        DreamCareerInsight insight = buildDreamCareerInsight(userAssessment, studentProfile);

        AdvancedRecommendationResponse response = new AdvancedRecommendationResponse();
        response.setAssessmentResultId(assessmentResult.getResultId());
        response.setCareerPaths(careerPathRecommendations);
        response.setDreamCareerInsight(insight);
        return response;
    }

    private List<CareerPathRecommendation> buildCareerPathRecommendations(StudentProfile studentProfile) {
        List<CareerPathEntity> allPaths = careerPathRepository.findAll();
        List<CareerPathRecommendation> scoredPaths = new ArrayList<>();
        for (CareerPathEntity path : allPaths) {
            ProfileVector vector = profileAnalyzer.buildProfile(path);
            vector.normalize();
            RecommendationScore score = scoringService.score(vector, studentProfile);
            if (score.getOverall() <= 0) {
                continue;
            }
            CareerPathRecommendation recommendation = CareerPathRecommendation.from(path, score.getOverall(), score);
            populateCareersForPath(path, studentProfile, recommendation);
            populateProgramsForPath(path, studentProfile, recommendation);
            scoredPaths.add(recommendation);
        }
        return scoredPaths.stream()
            .sorted(Comparator.comparingDouble(CareerPathRecommendation::getMatchPercentage).reversed())
            .limit(3)
            .collect(Collectors.toList());
    }

    private void populateCareersForPath(CareerPathEntity path, StudentProfile studentProfile,
                                         CareerPathRecommendation recommendation) {
        List<CareerEntity> careers = path.getCareers();
        if (careers == null || careers.isEmpty()) {
            return;
        }
        List<CareerRecommendationDetail> scoredCareers = new ArrayList<>();
        for (CareerEntity career : careers) {
            ProfileVector vector = profileAnalyzer.buildProfile(career);
            vector.normalize();
            RecommendationScore score = scoringService.score(vector, studentProfile);
            if (score.getOverall() <= 0) {
                continue;
            }
            String summary = buildCareerSummary(career, score);
            scoredCareers.add(CareerRecommendationDetail.from(career, score.getOverall(), summary));
        }
        scoredCareers.sort(Comparator.comparingDouble(CareerRecommendationDetail::getMatchPercentage).reversed());
        for (int i = 0; i < Math.min(5, scoredCareers.size()); i++) {
            recommendation.addCareer(scoredCareers.get(i));
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
            String summary = buildProgramSummary(program, score);
            scoredPrograms.add(ProgramRecommendationDetail.from(program, score.getOverall(), summary, null));
            programIds.add(program.getProgramId());
        }
        Map<Integer, List<Map<String, Object>>> schoolsByProgram = fetchSchoolsForPrograms(programIds);
        scoredPrograms.forEach(program -> {
            List<Map<String, Object>> schools = schoolsByProgram.get(program.getProgramId());
            if (schools != null) {
                program.setRecommendedSchools(schools);
            }
        });
        scoredPrograms.sort(Comparator.comparingDouble(ProgramRecommendationDetail::getMatchPercentage).reversed());
        for (int i = 0; i < Math.min(5, scoredPrograms.size()); i++) {
            recommendation.addProgram(scoredPrograms.get(i));
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

    private String buildCareerSummary(CareerEntity career, RecommendationScore score) {
        return String.format(Locale.ENGLISH,
            "%s aligns well with your strengths (overall match %.0f%%).",
            career.getCareerTitle(), score.getOverall());
    }

    private String buildProgramSummary(ProgramEntity program, RecommendationScore score) {
        return String.format(Locale.ENGLISH,
            "%s supports your target skills (overall match %.0f%%).",
            program.getProgramName(), score.getOverall());
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
}
