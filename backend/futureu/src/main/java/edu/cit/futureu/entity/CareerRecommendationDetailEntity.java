package edu.cit.futureu.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;

@Entity
@Table(name = "career_recommendation_detail")
public class CareerRecommendationDetailEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @JsonBackReference
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "career_path_recommendation_id", nullable = false)
    private CareerPathRecommendationEntity careerPathRecommendation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "career_id", nullable = false)
    private CareerEntity career;

    @Column(nullable = false)
    private double matchPercentage;

    @Column(length = 2000)
    private String summary;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String explanation; // Detailed explanation of why this career fits

    @Column
    private Integer ranking; // 1st, 2nd, 3rd, etc. within the career path

    // Constructors
    public CareerRecommendationDetailEntity() {}

    // Getters and Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public CareerPathRecommendationEntity getCareerPathRecommendation() { return careerPathRecommendation; }
    public void setCareerPathRecommendation(CareerPathRecommendationEntity careerPathRecommendation) { this.careerPathRecommendation = careerPathRecommendation; }

    public CareerEntity getCareer() { return career; }
    public void setCareer(CareerEntity career) { this.career = career; }

    public double getMatchPercentage() { return matchPercentage; }
    public void setMatchPercentage(double matchPercentage) { this.matchPercentage = matchPercentage; }

    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }

    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }

    public Integer getRanking() { return ranking; }
    public void setRanking(Integer ranking) { this.ranking = ranking; }
}