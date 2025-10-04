package edu.cit.futureu.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "career_path_recommendation")
public class CareerPathRecommendationEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @JsonBackReference
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assessment_result_id", nullable = false)
    private AssessmentResultEntity assessmentResult;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "career_path_id", nullable = false)
    private CareerPathEntity careerPath;

    @Column(nullable = false)
    private double matchPercentage;

    // Component breakdown scores
    private Double riasecScore;
    private Double aptitudeScore;
    private Double skillScore;
    private Double contextScore;

    @Column(length = 1000)
    private String summary;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private String recommendationType; // "STRUCTURED" or "AI_GENERATED"

    // One-to-many relationships for detailed recommendations
    @JsonManagedReference
    @OneToMany(mappedBy = "careerPathRecommendation", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<CareerRecommendationDetailEntity> careerDetails = new ArrayList<>();

    @JsonManagedReference
    @OneToMany(mappedBy = "careerPathRecommendation", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ProgramRecommendationDetailEntity> programDetails = new ArrayList<>();

    // Constructors
    public CareerPathRecommendationEntity() {
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public AssessmentResultEntity getAssessmentResult() { return assessmentResult; }
    public void setAssessmentResult(AssessmentResultEntity assessmentResult) { this.assessmentResult = assessmentResult; }

    public CareerPathEntity getCareerPath() { return careerPath; }
    public void setCareerPath(CareerPathEntity careerPath) { this.careerPath = careerPath; }

    public double getMatchPercentage() { return matchPercentage; }
    public void setMatchPercentage(double matchPercentage) { this.matchPercentage = matchPercentage; }

    public Double getRiasecScore() { return riasecScore; }
    public void setRiasecScore(Double riasecScore) { this.riasecScore = riasecScore; }

    public Double getAptitudeScore() { return aptitudeScore; }
    public void setAptitudeScore(Double aptitudeScore) { this.aptitudeScore = aptitudeScore; }

    public Double getSkillScore() { return skillScore; }
    public void setSkillScore(Double skillScore) { this.skillScore = skillScore; }

    public Double getContextScore() { return contextScore; }
    public void setContextScore(Double contextScore) { this.contextScore = contextScore; }

    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public String getRecommendationType() { return recommendationType; }
    public void setRecommendationType(String recommendationType) { this.recommendationType = recommendationType; }

    public List<CareerRecommendationDetailEntity> getCareerDetails() { return careerDetails; }
    public void setCareerDetails(List<CareerRecommendationDetailEntity> careerDetails) { this.careerDetails = careerDetails; }

    public List<ProgramRecommendationDetailEntity> getProgramDetails() { return programDetails; }
    public void setProgramDetails(List<ProgramRecommendationDetailEntity> programDetails) { this.programDetails = programDetails; }
}