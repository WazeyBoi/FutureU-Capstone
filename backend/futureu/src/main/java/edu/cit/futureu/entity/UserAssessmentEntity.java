package edu.cit.futureu.entity;

import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;

@Entity
@Table(name = "user_assessment")
public class UserAssessmentEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int userQuizAssessment; // Primary key

    // Many-to-one relationship with User
    @ManyToOne
    @JoinColumn(name = "userId", nullable = false)
    private UserEntity user;

    private int attemptNo;
    private double score;

    // Many-to-one relationship with Assessment
    @JsonManagedReference
    @ManyToOne
    @JoinColumn(name = "assessmentId", nullable = false)
    private AssessmentEntity assessment;

    private LocalDateTime dateTaken;
    
    // New fields for tracking progress
    private String status; // "IN_PROGRESS", "COMPLETED", "ABANDONED"
    private LocalDateTime lastSavedTime;
    private Integer currentSectionIndex;
    private Double progressPercentage;
    private Integer timeSpentSeconds; // Add this field to track elapsed time
    // Store serialized user answers as JSON - useful for resuming
    @Column(columnDefinition = "TEXT")
    private String savedAnswers;
    // Store serialized questions list - ensure it's defined as a TEXT/LONGTEXT column
    @Column(columnDefinition = "LONGTEXT")
    private String savedSections;

    @JsonBackReference
    @OneToMany(mappedBy = "userAssessment", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AssessmentResultEntity> assessmentResults;

    public UserAssessmentEntity() {}

    public int getUserQuizAssessment() {
        return userQuizAssessment;
    }

    public void setUserQuizAssessment(int userQuizAssessment) {
        this.userQuizAssessment = userQuizAssessment;
    }

    public UserEntity getUser() {
        return user;
    }

    public void setUser(UserEntity user) {
        this.user = user;
    }

    public int getAttemptNo() {
        return attemptNo;
    }

    public void setAttemptNo(int attemptNo) {
        this.attemptNo = attemptNo;
    }

    public double getScore() {
        return score;
    }

    public void setScore(double score) {
        this.score = score;
    }

    public AssessmentEntity getAssessment() {
        return assessment;
    }

    public void setAssessment(AssessmentEntity assessment) {
        this.assessment = assessment;
    }

    public LocalDateTime getDateTaken() {
        return dateTaken;
    }

    public void setDateTaken(LocalDateTime dateTaken) {
        this.dateTaken = dateTaken;
    }

    public List<AssessmentResultEntity> getAssessmentResults() {
        return assessmentResults;
    }

    public void setAssessmentResults(List<AssessmentResultEntity> assessmentResults) {
        this.assessmentResults = assessmentResults;
    }

    // Getters and setters for new fields
    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getLastSavedTime() {
        return lastSavedTime;
    }

    public void setLastSavedTime(LocalDateTime lastSavedTime) {
        this.lastSavedTime = lastSavedTime;
    }

    public Integer getCurrentSectionIndex() {
        return currentSectionIndex;
    }

    public void setCurrentSectionIndex(Integer currentSectionIndex) {
        this.currentSectionIndex = currentSectionIndex;
    }

    public Double getProgressPercentage() {
        return progressPercentage;
    }

    public void setProgressPercentage(Double progressPercentage) {
        this.progressPercentage = progressPercentage;
    }
    
    public String getSavedAnswers() {
        return savedAnswers;
    }
    
    public void setSavedAnswers(String savedAnswers) {
        this.savedAnswers = savedAnswers;
    }
    
    public String getSavedSections() {
        return savedSections;
    }
    
    public void setSavedSections(String savedSections) {
        this.savedSections = savedSections;
    }
    
    public Integer getTimeSpentSeconds() {
        return timeSpentSeconds;
    }
    
    public void setTimeSpentSeconds(Integer timeSpentSeconds) {
        this.timeSpentSeconds = timeSpentSeconds;
    }
}
