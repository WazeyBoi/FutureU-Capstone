package edu.cit.futureu.recommendation;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.Map;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class DreamCareerInsight {

    private String dreamCareer;
    private Double closenessScore;
    private Map<String, Double> riasecGap;
    private Map<String, Double> aptitudeGap;
    private String guidance;
    private String encouragement;

    public String getDreamCareer() {
        return dreamCareer;
    }

    public void setDreamCareer(String dreamCareer) {
        this.dreamCareer = dreamCareer;
    }

    public Double getClosenessScore() {
        return closenessScore;
    }

    public void setClosenessScore(Double closenessScore) {
        this.closenessScore = closenessScore;
    }

    public Map<String, Double> getRiasecGap() {
        return riasecGap;
    }

    public void setRiasecGap(Map<String, Double> riasecGap) {
        this.riasecGap = riasecGap;
    }

    public Map<String, Double> getAptitudeGap() {
        return aptitudeGap;
    }

    public void setAptitudeGap(Map<String, Double> aptitudeGap) {
        this.aptitudeGap = aptitudeGap;
    }

    public String getGuidance() {
        return guidance;
    }

    public void setGuidance(String guidance) {
        this.guidance = guidance;
    }

    public String getEncouragement() {
        return encouragement;
    }

    public void setEncouragement(String encouragement) {
        this.encouragement = encouragement;
    }
}
