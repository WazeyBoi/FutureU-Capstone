package edu.cit.futureu.recommendation;

import java.util.Map;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class DreamCareerInsight {

    private String dreamCareer;
    private Double closenessScore;
    
    // New comprehensive AI analysis fields (stored as JSON strings, will be parsed by frontend)
    private String fieldAlignment;
    private String strengthsAlignment;
    private String misalignmentInsights;
    private String personalizedFocusAreas;
    private String encouragement;
    
    // Legacy fields - keep for backward compatibility
    private Map<String, Double> riasecGap;
    private Map<String, Double> aptitudeGap;
    private String guidance;

    // Getters and Setters
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

    // New comprehensive AI analysis getters and setters
    public String getFieldAlignment() {
        return fieldAlignment;
    }

    public void setFieldAlignment(String fieldAlignment) {
        this.fieldAlignment = fieldAlignment;
    }

    public String getStrengthsAlignment() {
        return strengthsAlignment;
    }

    public void setStrengthsAlignment(String strengthsAlignment) {
        this.strengthsAlignment = strengthsAlignment;
    }

    public String getMisalignmentInsights() {
        return misalignmentInsights;
    }

    public void setMisalignmentInsights(String misalignmentInsights) {
        this.misalignmentInsights = misalignmentInsights;
    }

    public String getPersonalizedFocusAreas() {
        return personalizedFocusAreas;
    }

    public void setPersonalizedFocusAreas(String personalizedFocusAreas) {
        this.personalizedFocusAreas = personalizedFocusAreas;
    }

    public String getEncouragement() {
        return encouragement;
    }

    public void setEncouragement(String encouragement) {
        this.encouragement = encouragement;
    }

    // Legacy getters and setters - keep for backward compatibility
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
}
