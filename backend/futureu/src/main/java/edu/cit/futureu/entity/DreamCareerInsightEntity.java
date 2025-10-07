package edu.cit.futureu.entity;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "dream_career_insight")
public class DreamCareerInsightEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @JsonBackReference
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assessment_result_id", nullable = false)
    private AssessmentResultEntity assessmentResult;

    @Column(length = 500)
    private String dreamCareer;

    @Column
    private Double closenessScore; // How close the student is to their dream career

    // New comprehensive AI analysis fields
    @Lob
    @Column(columnDefinition = "TEXT")
    private String fieldAlignment; // JSON string containing field analysis

    @Lob
    @Column(columnDefinition = "TEXT")
    private String strengthsAlignment; // JSON string containing strengths analysis

    @Lob
    @Column(columnDefinition = "TEXT")
    private String misalignmentInsights; // JSON string containing gap analysis

    @Lob
    @Column(columnDefinition = "TEXT")
    private String personalizedFocusAreas; // JSON string containing focus areas

    @Lob
    @Column(columnDefinition = "TEXT")
    private String encouragement; // JSON string containing encouragement analysis

    // Legacy fields - keep for backward compatibility
    @Lob
    @Column(columnDefinition = "TEXT")
    private String guidance; // Specific guidance on how to reach the dream career

    @Column(length = 1000)
    private String riasecGap; // JSON string of RIASEC gaps

    @Column(length = 1000)
    private String aptitudeGap; // JSON string of aptitude gaps

    @Column(nullable = false)
    private LocalDateTime createdAt;

    // Constructors
    public DreamCareerInsightEntity() {
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public AssessmentResultEntity getAssessmentResult() { return assessmentResult; }
    public void setAssessmentResult(AssessmentResultEntity assessmentResult) { this.assessmentResult = assessmentResult; }

    public String getDreamCareer() { return dreamCareer; }
    public void setDreamCareer(String dreamCareer) { this.dreamCareer = dreamCareer; }

    public Double getClosenessScore() { return closenessScore; }
    public void setClosenessScore(Double closenessScore) { this.closenessScore = closenessScore; }

    // New comprehensive AI analysis getters and setters
    public String getFieldAlignment() { return fieldAlignment; }
    public void setFieldAlignment(String fieldAlignment) { this.fieldAlignment = fieldAlignment; }

    public String getStrengthsAlignment() { return strengthsAlignment; }
    public void setStrengthsAlignment(String strengthsAlignment) { this.strengthsAlignment = strengthsAlignment; }

    public String getMisalignmentInsights() { return misalignmentInsights; }
    public void setMisalignmentInsights(String misalignmentInsights) { this.misalignmentInsights = misalignmentInsights; }

    public String getPersonalizedFocusAreas() { return personalizedFocusAreas; }
    public void setPersonalizedFocusAreas(String personalizedFocusAreas) { this.personalizedFocusAreas = personalizedFocusAreas; }

    public String getEncouragement() { return encouragement; }
    public void setEncouragement(String encouragement) { this.encouragement = encouragement; }

    // Legacy getters and setters - keep for backward compatibility
    public String getGuidance() { return guidance; }
    public void setGuidance(String guidance) { this.guidance = guidance; }

    public String getRiasecGap() { return riasecGap; }
    public void setRiasecGap(String riasecGap) { this.riasecGap = riasecGap; }

    public String getAptitudeGap() { return aptitudeGap; }
    public void setAptitudeGap(String aptitudeGap) { this.aptitudeGap = aptitudeGap; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}