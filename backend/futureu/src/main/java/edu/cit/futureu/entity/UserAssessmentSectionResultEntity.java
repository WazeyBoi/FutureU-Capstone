package edu.cit.futureu.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonManagedReference;

@Entity
@Table(name = "user_assessment_section_result")
public class UserAssessmentSectionResultEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int sectionResultId;

    @JsonManagedReference
    @ManyToOne
    @JoinColumn(name = "userAssessmentId", nullable = false)
    private UserAssessmentEntity userAssessment;

    private String sectionId;
    private String sectionName;
    private String sectionType; // GSA, ACADEMIC_TRACK, OTHER_TRACK, INTEREST_AREA
    private Double sectionScore;
    private Integer correctAnswers;
    private Integer totalQuestions;
    private Double percentageScore;
    private LocalDateTime dateComputed;

    // Constructor
    public UserAssessmentSectionResultEntity() {
        this.dateComputed = LocalDateTime.now();
    }

    // Getters and Setters
    public int getSectionResultId() {
        return sectionResultId;
    }

    public void setSectionResultId(int sectionResultId) {
        this.sectionResultId = sectionResultId;
    }

    public UserAssessmentEntity getUserAssessment() {
        return userAssessment;
    }

    public void setUserAssessment(UserAssessmentEntity userAssessment) {
        this.userAssessment = userAssessment;
    }

    public String getSectionId() {
        return sectionId;
    }

    public void setSectionId(String sectionId) {
        this.sectionId = sectionId;
    }

    public String getSectionName() {
        return sectionName;
    }

    public void setSectionName(String sectionName) {
        this.sectionName = sectionName;
    }

    public String getSectionType() {
        return sectionType;
    }

    public void setSectionType(String sectionType) {
        this.sectionType = sectionType;
    }

    public Double getSectionScore() {
        return sectionScore;
    }

    public void setSectionScore(Double sectionScore) {
        this.sectionScore = sectionScore;
    }

    public Integer getCorrectAnswers() {
        return correctAnswers;
    }

    public void setCorrectAnswers(Integer correctAnswers) {
        this.correctAnswers = correctAnswers;
    }

    public Integer getTotalQuestions() {
        return totalQuestions;
    }

    public void setTotalQuestions(Integer totalQuestions) {
        this.totalQuestions = totalQuestions;
    }

    public Double getPercentageScore() {
        return percentageScore;
    }

    public void setPercentageScore(Double percentageScore) {
        this.percentageScore = percentageScore;
    }

    public LocalDateTime getDateComputed() {
        return dateComputed;
    }

    public void setDateComputed(LocalDateTime dateComputed) {
        this.dateComputed = dateComputed;
    }
}
