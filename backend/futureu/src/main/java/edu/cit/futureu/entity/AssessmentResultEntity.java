package edu.cit.futureu.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;

@Entity
@Table(name = "assessment_result")
public class AssessmentResultEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "result_id")
    private Integer resultId;

    @JsonManagedReference
    @OneToOne
    @JoinColumn(name = "user_assessment_id", nullable = false)
    private UserAssessmentEntity userAssessment;

    @Column(name = "overall_score")
    private Double overallScore;

    @Column(name = "normalized_score")
    private Double normalizedScore;

    // GSA section scores
    private Double gsaScore;
    private Double scientificAbilityScore;
    private Double readingComprehensionScore;
    private Double verbalAbilityScore;
    private Double mathematicalAbilityScore;
    private Double logicalReasoningScore;

    // Academic Track scores
    private Double academicTrackScore;
    private Double stemScore;
    private Double abmScore;
    private Double humssScore;

    // Other Track scores
    private Double otherTrackScore;
    private Double tvlScore;
    private Double sportsTrackScore;
    private Double artsDesignTrackScore;

    // Interest Area scores (RIASEC)
    private Double interestAreaScore;
    private Double realisticScore;
    private Double investigativeScore;
    private Double artisticScore;
    private Double socialScore;
    private Double enterprisingScore;
    private Double conventionalScore;

    @JsonIgnore
    @OneToMany(mappedBy = "assessmentResult", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RecommendationEntity> recommendations = new ArrayList<>();

    private LocalDateTime dateComputed;

    // Constructor
    public AssessmentResultEntity() {
        this.dateComputed = LocalDateTime.now();
    }

    // Getters and Setters
    public Integer getResultId() {
        return resultId;
    }

    public void setResultId(Integer resultId) {
        this.resultId = resultId;
    }

    public UserAssessmentEntity getUserAssessment() {
        return userAssessment;
    }

    public void setUserAssessment(UserAssessmentEntity userAssessment) {
        this.userAssessment = userAssessment;
    }

    public Double getOverallScore() {
        return overallScore;
    }

    public void setOverallScore(Double overallScore) {
        this.overallScore = overallScore;
    }

    public Double getNormalizedScore() {
        return normalizedScore;
    }

    public void setNormalizedScore(Double normalizedScore) {
        this.normalizedScore = normalizedScore;
    }

    // GSA getters and setters
    public Double getGsaScore() {
        return gsaScore;
    }

    public void setGsaScore(Double gsaScore) {
        this.gsaScore = gsaScore;
    }

    public Double getScientificAbilityScore() {
        return scientificAbilityScore;
    }

    public void setScientificAbilityScore(Double scientificAbilityScore) {
        this.scientificAbilityScore = scientificAbilityScore;
    }

    public Double getReadingComprehensionScore() {
        return readingComprehensionScore;
    }

    public void setReadingComprehensionScore(Double readingComprehensionScore) {
        this.readingComprehensionScore = readingComprehensionScore;
    }

    public Double getVerbalAbilityScore() {
        return verbalAbilityScore;
    }

    public void setVerbalAbilityScore(Double verbalAbilityScore) {
        this.verbalAbilityScore = verbalAbilityScore;
    }

    public Double getMathematicalAbilityScore() {
        return mathematicalAbilityScore;
    }

    public void setMathematicalAbilityScore(Double mathematicalAbilityScore) {
        this.mathematicalAbilityScore = mathematicalAbilityScore;
    }

    public Double getLogicalReasoningScore() {
        return logicalReasoningScore;
    }

    public void setLogicalReasoningScore(Double logicalReasoningScore) {
        this.logicalReasoningScore = logicalReasoningScore;
    }

    // Academic track getters and setters
    public Double getAcademicTrackScore() {
        return academicTrackScore;
    }

    public void setAcademicTrackScore(Double academicTrackScore) {
        this.academicTrackScore = academicTrackScore;
    }

    public Double getStemScore() {
        return stemScore;
    }

    public void setStemScore(Double stemScore) {
        this.stemScore = stemScore;
    }

    public Double getAbmScore() {
        return abmScore;
    }

    public void setAbmScore(Double abmScore) {
        this.abmScore = abmScore;
    }

    public Double getHumssScore() {
        return humssScore;
    }

    public void setHumssScore(Double humssScore) {
        this.humssScore = humssScore;
    }

    // Other track getters and setters
    public Double getOtherTrackScore() {
        return otherTrackScore;
    }

    public void setOtherTrackScore(Double otherTrackScore) {
        this.otherTrackScore = otherTrackScore;
    }

    public Double getTvlScore() {
        return tvlScore;
    }

    public void setTvlScore(Double tvlScore) {
        this.tvlScore = tvlScore;
    }

    public Double getSportsTrackScore() {
        return sportsTrackScore;
    }

    public void setSportsTrackScore(Double sportsTrackScore) {
        this.sportsTrackScore = sportsTrackScore;
    }

    public Double getArtsDesignTrackScore() {
        return artsDesignTrackScore;
    }

    public void setArtsDesignTrackScore(Double artsDesignTrackScore) {
        this.artsDesignTrackScore = artsDesignTrackScore;
    }

    // Interest area getters and setters
    public Double getInterestAreaScore() {
        return interestAreaScore;
    }

    public void setInterestAreaScore(Double interestAreaScore) {
        this.interestAreaScore = interestAreaScore;
    }

    public Double getRealisticScore() {
        return realisticScore;
    }

    public void setRealisticScore(Double realisticScore) {
        this.realisticScore = realisticScore;
    }

    public Double getInvestigativeScore() {
        return investigativeScore;
    }

    public void setInvestigativeScore(Double investigativeScore) {
        this.investigativeScore = investigativeScore;
    }

    public Double getArtisticScore() {
        return artisticScore;
    }

    public void setArtisticScore(Double artisticScore) {
        this.artisticScore = artisticScore;
    }

    public Double getSocialScore() {
        return socialScore;
    }

    public void setSocialScore(Double socialScore) {
        this.socialScore = socialScore;
    }

    public Double getEnterprisingScore() {
        return enterprisingScore;
    }

    public void setEnterprisingScore(Double enterprisingScore) {
        this.enterprisingScore = enterprisingScore;
    }

    public Double getConventionalScore() {
        return conventionalScore;
    }

    public void setConventionalScore(Double conventionalScore) {
        this.conventionalScore = conventionalScore;
    }

    public List<RecommendationEntity> getRecommendations() {
        return recommendations;
    }

    public void setRecommendations(List<RecommendationEntity> recommendations) {
        this.recommendations = recommendations;
    }

    public LocalDateTime getDateComputed() {
        return dateComputed;
    }

    public void setDateComputed(LocalDateTime dateComputed) {
        this.dateComputed = dateComputed;
    }
}