package edu.cit.futureu.entity;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "career_interest_profile")
public class CareerInterestProfileEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "profile_id")
    private int profileId;
    
    // Many profiles belong to one user (one user can have multiple profiles over time)
    @JsonBackReference("user-interestProfiles")
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;
    
    @Column(name = "main_interests_hobbies", columnDefinition = "TEXT")
    private String mainInterestsHobbies;
    
    @Column(name = "dream_career", columnDefinition = "TEXT")
    private String dreamCareer;
    
    @Column(name = "personal_strengths_skills", columnDefinition = "TEXT")
    private String personalStrengthsSkills;
    
    @Column(name = "career_values", columnDefinition = "TEXT")
    private String careerValues;
    
    @Column(name = "preferred_work_environment", columnDefinition = "TEXT")
    private String preferredWorkEnvironment;
    
    @Column(name = "education_training_aspirations", columnDefinition = "TEXT")
    private String educationTrainingAspirations;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "is_active", columnDefinition = "BOOLEAN DEFAULT true")
    private boolean isActive = true;
    
    public CareerInterestProfileEntity() {
    }
    
    public CareerInterestProfileEntity(UserEntity user, String mainInterestsHobbies, 
            String dreamCareer, String personalStrengthsSkills, String careerValues,
            String preferredWorkEnvironment, String educationTrainingAspirations) {
        this.user = user;
        this.mainInterestsHobbies = mainInterestsHobbies;
        this.dreamCareer = dreamCareer;
        this.personalStrengthsSkills = personalStrengthsSkills;
        this.careerValues = careerValues;
        this.preferredWorkEnvironment = preferredWorkEnvironment;
        this.educationTrainingAspirations = educationTrainingAspirations;
    }
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public int getProfileId() {
        return profileId;
    }
    
    public void setProfileId(int profileId) {
        this.profileId = profileId;
    }
    
    public UserEntity getUser() {
        return user;
    }
    
    public void setUser(UserEntity user) {
        this.user = user;
    }
    
    public String getMainInterestsHobbies() {
        return mainInterestsHobbies;
    }
    
    public void setMainInterestsHobbies(String mainInterestsHobbies) {
        this.mainInterestsHobbies = mainInterestsHobbies;
    }
    
    public String getDreamCareer() {
        return dreamCareer;
    }
    
    public void setDreamCareer(String dreamCareer) {
        this.dreamCareer = dreamCareer;
    }
    
    public String getPersonalStrengthsSkills() {
        return personalStrengthsSkills;
    }
    
    public void setPersonalStrengthsSkills(String personalStrengthsSkills) {
        this.personalStrengthsSkills = personalStrengthsSkills;
    }
    
    public String getCareerValues() {
        return careerValues;
    }
    
    public void setCareerValues(String careerValues) {
        this.careerValues = careerValues;
    }
    
    public String getPreferredWorkEnvironment() {
        return preferredWorkEnvironment;
    }
    
    public void setPreferredWorkEnvironment(String preferredWorkEnvironment) {
        this.preferredWorkEnvironment = preferredWorkEnvironment;
    }
    
    public String getEducationTrainingAspirations() {
        return educationTrainingAspirations;
    }
    
    public void setEducationTrainingAspirations(String educationTrainingAspirations) {
        this.educationTrainingAspirations = educationTrainingAspirations;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public boolean isActive() {
        return isActive;
    }
    
    public void setActive(boolean active) {
        isActive = active;
    }
    
    @Override
    public String toString() {
        return "CareerInterestProfileEntity{" +
                "profileId=" + profileId +
                ", user=" + (user != null ? user.getEmail() : "null") +
                ", dreamCareer='" + dreamCareer + '\'' +
                ", createdAt=" + createdAt +
                ", isActive=" + isActive +
                '}';
    }
}