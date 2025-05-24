package edu.cit.futureu.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.*;

@Entity
@Table(name = "career_recommendation")
public class CareerRecommendationEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int recommendationId;

    // Many-to-one relationship with AssessmentResult
    @JsonBackReference
    @ManyToOne
    @JoinColumn(name = "resultId", nullable = false)
    private AssessmentResultEntity assessmentResult;

    // One-to-one relationship with Career (optional, can be null)
    @OneToOne
    @JoinColumn(name = "careerId")
    private CareerEntity careerPath;

    private double confidenceScore;

    @Column(length = 2000)
    private String description;

    public CareerRecommendationEntity() {}

    public int getRecommendationId() { return recommendationId; }
    public void setRecommendationId(int recommendationId) { this.recommendationId = recommendationId; }

    public AssessmentResultEntity getAssessmentResult() { return assessmentResult; }
    public void setAssessmentResult(AssessmentResultEntity assessmentResult) { this.assessmentResult = assessmentResult; }

    public CareerEntity getCareerPath() { return careerPath; }
    public void setCareerPath(CareerEntity careerPath) { this.careerPath = careerPath; }

    public double getConfidenceScore() { return confidenceScore; }
    public void setConfidenceScore(double confidenceScore) { this.confidenceScore = confidenceScore; }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

}