package edu.cit.futureu.recommendation;

import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

import org.springframework.stereotype.Component;

import edu.cit.futureu.entity.CareerEntity;
import edu.cit.futureu.entity.CareerPathEntity;
import edu.cit.futureu.entity.ProgramEntity;

/**
 * Extracts heuristic weight vectors for career paths, careers, and programs based on textual descriptions.
 */
@Component
public class CareerProfileAnalyzer {

    private static final Map<RiaSecType, List<String>> RIASEC_KEYWORDS = Map.of(
        RiaSecType.REALISTIC, List.of("practical", "hands-on", "mechanical", "technical", "build", "operate", "equipment", "tools"),
        RiaSecType.INVESTIGATIVE, List.of("research", "analyze", "investigate", "data", "science", "problem-solving", "inquiry", "experiment"),
        RiaSecType.ARTISTIC, List.of("creative", "design", "art", "storytelling", "express", "visual", "music", "multimedia"),
        RiaSecType.SOCIAL, List.of("communicate", "team", "support", "teach", "mentor", "community", "people", "public"),
        RiaSecType.ENTERPRISING, List.of("lead", "business", "entrepreneur", "persuade", "manage", "strategy", "advocate", "marketing"),
        RiaSecType.CONVENTIONAL, List.of("organize", "detail", "structured", "process", "administration", "compliance", "accuracy", "planning")
    );

    private static final Map<AcademicTrackType, List<String>> TRACK_KEYWORDS = Map.of(
        AcademicTrackType.STEM, List.of("science", "technology", "engineering", "mathematics", "programming", "laboratory"),
        AcademicTrackType.ABM, List.of("business", "finance", "accounting", "management", "entrepreneur", "economics"),
        AcademicTrackType.HUMSS, List.of("humanities", "social", "communication", "journalism", "education", "psychology"),
        AcademicTrackType.TVL, List.of("technical", "vocational", "industrial", "mechanical", "culinary", "electrical"),
        AcademicTrackType.ARTS_DESIGN, List.of("arts", "design", "creative", "multimedia", "performance", "visual"),
        AcademicTrackType.SPORTS, List.of("sports", "athletic", "fitness", "physical", "training", "coaching")
    );

    private static final Map<SkillCluster, List<String>> SKILL_KEYWORDS = Map.of(
        SkillCluster.LOGICAL_REASONING, List.of("logic", "reason", "analysis", "critical"),
        SkillCluster.MATHEMATICS, List.of("math", "statistics", "quantitative", "calculus"),
        SkillCluster.VERBAL_COMMUNICATION, List.of("write", "communication", "present", "story", "journal"),
        SkillCluster.SCIENTIFIC_ANALYSIS, List.of("scientific", "research", "laboratory", "investigate"),
        SkillCluster.CREATIVITY, List.of("creative", "design", "innovation", "artistic"),
        SkillCluster.SOCIAL_SERVICE, List.of("support", "counsel", "service", "community", "help"),
        SkillCluster.BUSINESS_LEADERSHIP, List.of("lead", "manage", "strategy", "entrepreneur", "business")
    );

    private static final Set<String> POSITIVE_CONTEXT_KEYWORDS = Set.of(
        "growing", "demand", "high demand", "in-demand", "emerging", "opportunity", "strong outlook", "expanding", "critical"
    );

    public ProfileVector buildProfile(CareerPathEntity path) {
        ProfileVector vector = new ProfileVector();
        if (path == null) {
            return vector;
        }
        analyzeText(vector, path.getCareerPathDescription());
        if (path.getCareerCareerPaths() != null) {
            path.getCareerCareerPaths().stream()
                .map(link -> link != null ? link.getCareer() : null)
                .filter(career -> career != null)
                .forEach(career -> vector.merge(buildProfile(career)));
        }
        vector.normalize();
        return vector;
    }

    public ProfileVector buildProfile(CareerEntity career) {
        ProfileVector vector = new ProfileVector();
        if (career == null) {
            return vector;
        }
        analyzeText(vector, career.getCareerDescription());
        analyzeText(vector, career.getIndustry());
        vector.normalize();
        return vector;
    }

    public ProfileVector buildProfile(ProgramEntity program) {
        ProfileVector vector = new ProfileVector();
        if (program == null) {
            return vector;
        }
        analyzeText(vector, program.getProgramName());
        analyzeText(vector, program.getDescription());
        vector.normalize();
        return vector;
    }

    private void analyzeText(ProfileVector vector, String text) {
        if (text == null || text.isBlank()) {
            return;
        }
        String normalized = text.toLowerCase(Locale.ENGLISH);
        RIASEC_KEYWORDS.forEach((type, keywords) -> {
            for (String keyword : keywords) {
                if (normalized.contains(keyword)) {
                    vector.addRiasecWeight(type, 1.0);
                }
            }
        });
        TRACK_KEYWORDS.forEach((type, keywords) -> {
            for (String keyword : keywords) {
                if (normalized.contains(keyword)) {
                    vector.addTrackWeight(type, 1.0);
                }
            }
        });
        SKILL_KEYWORDS.forEach((cluster, keywords) -> {
            for (String keyword : keywords) {
                if (normalized.contains(keyword)) {
                    vector.addSkillWeight(cluster, 1.0);
                }
            }
        });
        for (String keyword : POSITIVE_CONTEXT_KEYWORDS) {
            if (normalized.contains(keyword)) {
                vector.setContextSignal(vector.getContextSignal() + 1.0);
            }
        }
    }
}
