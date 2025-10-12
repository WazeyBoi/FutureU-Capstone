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
        RiaSecType.REALISTIC, List.of("practical", "hands-on", "mechanical", "technical", "build", "operate", "equipment", "tools", 
            "construct", "assemble", "repair", "maintain", "physical", "tangible", "manual", "fabricate", "install", "hardware"),
        RiaSecType.INVESTIGATIVE, List.of("research", "analyze", "investigate", "data", "science", "problem-solving", "inquiry", "experiment",
            "analyse", "study", "examine", "explore", "discover", "test", "observe", "hypothesis", "analytical", "systematic", "evaluate", "assess", "review", "scientist", "researcher"),
        RiaSecType.ARTISTIC, List.of("creative", "design", "art", "storytelling", "express", "visual", "music", "multimedia",
            "innovative", "imaginative", "original", "aesthetic", "artistic", "craft", "illustrate", "compose", "perform", "create", "graphic", "animation", "cinema"),
        RiaSecType.SOCIAL, List.of("communicate", "team", "support", "teach", "mentor", "community", "people", "public",
            "help", "assist", "counsel", "guide", "collaborate", "cooperate", "interact", "serve", "social", "interpersonal", "empathy", "care", "nurture", "educate", "train"),
        RiaSecType.ENTERPRISING, List.of("lead", "business", "entrepreneur", "persuade", "manage", "strategy", "advocate", "marketing",
            "leadership", "direct", "supervise", "coordinate", "influence", "negotiate", "sales", "commerce", "profit", "venture", "initiative", "executive", "organize", "delegate"),
        RiaSecType.CONVENTIONAL, List.of("organize", "detail", "structured", "process", "administration", "compliance", "accuracy", "planning",
            "systematic", "methodical", "orderly", "precise", "record", "document", "file", "schedule", "coordinate", "arrange", "procedure", "protocol", "regulate", "standard", "audit")
    );

    private static final Map<AcademicTrackType, List<String>> TRACK_KEYWORDS = Map.of(
        AcademicTrackType.STEM, List.of("science", "technology", "engineering", "mathematics", "programming", "laboratory",
            "stem", "computer", "software", "hardware", "code", "algorithm", "data", "technical", "scientific", "mathematical", "computing", "it", "tech", "digital", "cyber", "robotics", "automation"),
        AcademicTrackType.ABM, List.of("business", "finance", "accounting", "management", "entrepreneur", "economics",
            "abm", "financial", "commerce", "corporate", "trade", "marketing", "sales", "administration", "bookkeeping", "profit", "revenue", "investment", "banking", "audit", "compliance"),
        AcademicTrackType.HUMSS, List.of("humanities", "social", "communication", "journalism", "education", "psychology",
            "humss", "sociology", "anthropology", "history", "philosophy", "literature", "language", "teaching", "counseling", "media", "writing", "human", "society", "culture", "political"),
        AcademicTrackType.TVL, List.of("technical", "vocational", "industrial", "mechanical", "culinary", "electrical",
            "tvl", "automotive", "carpentry", "plumbing", "welding", "construction", "manufacturing", "trades", "workshop", "machinery", "craft", "skilled", "hands-on", "practical"),
        AcademicTrackType.ARTS_DESIGN, List.of("arts", "design", "creative", "multimedia", "performance", "visual",
            "artistic", "graphic", "fashion", "interior", "architecture", "illustration", "photography", "film", "animation", "theater", "music", "dance", "painting", "sculpture"),
        AcademicTrackType.SPORTS, List.of("sports", "athletic", "fitness", "physical", "training", "coaching",
            "sport", "exercise", "athlete", "wellness", "recreation", "gym", "health", "kinesiology", "physiology", "competition", "team sport", "individual sport")
    );

    private static final Map<SkillCluster, List<String>> SKILL_KEYWORDS = Map.of(
        SkillCluster.LOGICAL_REASONING, List.of("logic", "reason", "analysis", "critical",
            "logical", "reasoning", "analytical", "think", "problem-solving", "deduction", "inference", "evaluate", "assess", "judge"),
        SkillCluster.MATHEMATICS, List.of("math", "statistics", "quantitative", "calculus",
            "mathematical", "numerical", "computation", "algebra", "geometry", "statistical", "calculate", "equation", "formula", "number"),
        SkillCluster.VERBAL_COMMUNICATION, List.of("write", "communication", "present", "story", "journal",
            "communicate", "speak", "articulate", "express", "convey", "presentation", "writing", "verbal", "rhetoric", "dialogue", "discuss", "explain"),
        SkillCluster.SCIENTIFIC_ANALYSIS, List.of("scientific", "research", "laboratory", "investigate",
            "science", "experiment", "hypothesis", "test", "observe", "empirical", "systematic", "methodology", "study", "explore"),
        SkillCluster.CREATIVITY, List.of("creative", "design", "innovation", "artistic",
            "innovate", "imagine", "invent", "original", "unique", "craft", "conceptualize", "brainstorm", "ideate", "aesthetic"),
        SkillCluster.SOCIAL_SERVICE, List.of("support", "counsel", "service", "community", "help",
            "assist", "care", "empathy", "compassion", "aid", "guidance", "mentor", "nurture", "serve", "volunteer"),
        SkillCluster.BUSINESS_LEADERSHIP, List.of("lead", "manage", "strategy", "entrepreneur", "business",
            "leadership", "management", "supervise", "direct", "coordinate", "organize", "plan", "execute", "delegate", "strategic", "vision")
    );

    private static final Set<String> POSITIVE_CONTEXT_KEYWORDS = Set.of(
        "growing", "demand", "high demand", "in-demand", "in demand", "emerging", "opportunity", "strong outlook", "expanding", "critical",
        "booming", "thriving", "needed", "sought", "sought-after", "hot field", "competitive", "lucrative", "growth", "promising",
        "high-paying", "future", "trending", "popular", "essential", "vital", "important", "valuable", "competitive salary"
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
