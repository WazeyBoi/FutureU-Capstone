package edu.cit.futureu.recommendation;

import java.util.Map;
import java.util.Set;

import org.springframework.stereotype.Component;

/**
 * Computes similarity scores between student profiles and target profiles.
 */
@Component
public class RecommendationScoringService {

    private static final double RIASEC_WEIGHT = 0.40;
    private static final double TRACK_WEIGHT = 0.35;
    private static final double SKILL_WEIGHT = 0.15;
    private static final double CONTEXT_WEIGHT = 0.10;

    public RecommendationScore score(ProfileVector target, StudentProfile student) {
        if (target == null || student == null) {
            return new RecommendationScore(0, 0, 0, 0, 0);
        }
        double riasecScore = similarity(target.getRiasecWeights(), student.getRiasecWeights());
        double trackScore = similarity(target.getTrackWeights(), student.getTrackWeights());
        double skillScore = similarity(target.getSkillWeights(), student.getSkillWeights());
        double contextScore = Math.min(target.getContextSignal(), 1.0);
    double overall = (riasecScore * RIASEC_WEIGHT) +
             (trackScore * TRACK_WEIGHT) +
             (skillScore * SKILL_WEIGHT) +
             (contextScore * CONTEXT_WEIGHT);
    return new RecommendationScore(round(overall * 100),
                    round(riasecScore * RIASEC_WEIGHT * 100),
                    round(trackScore * TRACK_WEIGHT * 100),
                    round(skillScore * SKILL_WEIGHT * 100),
                    round(contextScore * CONTEXT_WEIGHT * 100));
    }

    private double similarity(Map<?, Double> target, Map<?, Double> student) {
        if (target == null || target.isEmpty() || student == null || student.isEmpty()) {
            return 0;
        }
        double score = 0;
        Set<?> keys = target.keySet();
        for (Object key : keys) {
            Double targetVal = target.get(key);
            Double studentVal = student.get(key);
            if (targetVal != null && studentVal != null) {
                score += targetVal * studentVal;
            }
        }
        return score;
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}
