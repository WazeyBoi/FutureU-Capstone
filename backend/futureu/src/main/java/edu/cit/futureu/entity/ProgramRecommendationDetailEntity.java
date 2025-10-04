package edu.cit.futureu.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;

@Entity
@Table(name = "program_recommendation_detail")
public class ProgramRecommendationDetailEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @JsonBackReference
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "career_path_recommendation_id", nullable = false)
    private CareerPathRecommendationEntity careerPathRecommendation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "program_id", nullable = false)
    private ProgramEntity program;

    @Column(nullable = false)
    private double matchPercentage;

    @Column(length = 2000)
    private String summary;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String explanation; // Detailed explanation of why this program fits

    @Column
    private Integer ranking; // 1st, 2nd, 3rd, etc. within the career path

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String recommendedSchoolsJson; // JSON string storing school recommendations

    // Constructors
    public ProgramRecommendationDetailEntity() {}

    // Getters and Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public CareerPathRecommendationEntity getCareerPathRecommendation() { return careerPathRecommendation; }
    public void setCareerPathRecommendation(CareerPathRecommendationEntity careerPathRecommendation) { this.careerPathRecommendation = careerPathRecommendation; }

    public ProgramEntity getProgram() { return program; }
    public void setProgram(ProgramEntity program) { this.program = program; }

    public double getMatchPercentage() { return matchPercentage; }
    public void setMatchPercentage(double matchPercentage) { this.matchPercentage = matchPercentage; }

    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }

    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }

    public Integer getRanking() { return ranking; }
    public void setRanking(Integer ranking) { this.ranking = ranking; }

    public String getRecommendedSchoolsJson() { return recommendedSchoolsJson; }
    public void setRecommendedSchoolsJson(String recommendedSchoolsJson) { this.recommendedSchoolsJson = recommendedSchoolsJson; }
}