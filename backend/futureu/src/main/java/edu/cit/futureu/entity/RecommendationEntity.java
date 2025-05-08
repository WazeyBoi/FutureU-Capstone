package edu.cit.futureu.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "recommendation")
public class RecommendationEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int recommendationId;

    // One-to-one relationship with AssessmentResult
    @OneToOne
    @JoinColumn(name = "resultId", nullable = false)
    private AssessmentResultEntity assessmentResult;

    // One-to-one relationship with Career (optional, can be null)
    @OneToOne
    @JoinColumn(name = "careerId")
    private CareerEntity careerPath;

    private String suggestedProgram;
    private double confidenceScore;

    public RecommendationEntity() {}

    public int getRecommendationId() { return recommendationId; }
    public void setRecommendationId(int recommendationId) { this.recommendationId = recommendationId; }

    public AssessmentResultEntity getAssessmentResult() { return assessmentResult; }
    public void setAssessmentResult(AssessmentResultEntity assessmentResult) { this.assessmentResult = assessmentResult; }

    public CareerEntity getCareerPath() { return careerPath; }
    public void setCareerPath(CareerEntity careerPath) { this.careerPath = careerPath; }

    public String getSuggestedProgram() { return suggestedProgram; }
    public void setSuggestedProgram(String suggestedProgram) { this.suggestedProgram = suggestedProgram; }

    public double getConfidenceScore() { return confidenceScore; }
    public void setConfidenceScore(double confidenceScore) { this.confidenceScore = confidenceScore; }
}