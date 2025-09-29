package edu.cit.futureu.recommendation;

import com.fasterxml.jackson.annotation.JsonIgnore;
import java.util.EnumMap;
import java.util.HashMap;
import java.util.Map;

/**
 * Shared structure storing weighted signals for RIASEC, academic tracks, and skill clusters.
 */
public class ProfileVector {

    private final EnumMap<RiaSecType, Double> riasecWeights = new EnumMap<>(RiaSecType.class);
    private final EnumMap<AcademicTrackType, Double> trackWeights = new EnumMap<>(AcademicTrackType.class);
    private final Map<SkillCluster, Double> skillWeights = new HashMap<>();
    private double contextSignal;

    public void addRiasecWeight(RiaSecType type, double weight) {
        if (type == null || weight == 0) {
            return;
        }
        riasecWeights.merge(type, weight, Double::sum);
    }

    public void addTrackWeight(AcademicTrackType type, double weight) {
        if (type == null || weight == 0) {
            return;
        }
        trackWeights.merge(type, weight, Double::sum);
    }

    public void addSkillWeight(SkillCluster cluster, double weight) {
        if (cluster == null || weight == 0) {
            return;
        }
        skillWeights.merge(cluster, weight, Double::sum);
    }

    public EnumMap<RiaSecType, Double> getRiasecWeights() {
        return riasecWeights;
    }

    public EnumMap<AcademicTrackType, Double> getTrackWeights() {
        return trackWeights;
    }

    public Map<SkillCluster, Double> getSkillWeights() {
        return skillWeights;
    }

    public double getContextSignal() {
        return contextSignal;
    }

    public void setContextSignal(double contextSignal) {
        this.contextSignal = contextSignal;
    }

    /**
     * Normalizes each map so the total equals 1, preserving relative weights.
     */
    public void normalize() {
        normalizeMap(riasecWeights);
        normalizeMap(trackWeights);
        normalizeMap(skillWeights);
        if (contextSignal < 0) {
            contextSignal = 0;
        }
        if (contextSignal > 1) {
            contextSignal = 1;
        }
    }

    private <T> void normalizeMap(Map<T, Double> map) {
        double sum = map.values().stream().mapToDouble(Double::doubleValue).sum();
        if (sum <= 0) {
            int size = map.size();
            if (size == 0) {
                return;
            }
            double uniform = 1.0 / size;
            for (Map.Entry<T, Double> entry : map.entrySet()) {
                entry.setValue(uniform);
            }
            return;
        }
        for (Map.Entry<T, Double> entry : map.entrySet()) {
            entry.setValue(entry.getValue() / sum);
        }
    }

    public void merge(ProfileVector other) {
        if (other == null) {
            return;
        }
        other.riasecWeights.forEach((key, value) -> addRiasecWeight(key, value));
        other.trackWeights.forEach((key, value) -> addTrackWeight(key, value));
        other.skillWeights.forEach((key, value) -> addSkillWeight(key, value));
        this.contextSignal += other.contextSignal;
    }

    @JsonIgnore
    public boolean isEmpty() {
        return riasecWeights.isEmpty() && trackWeights.isEmpty() && skillWeights.isEmpty();
    }
}
