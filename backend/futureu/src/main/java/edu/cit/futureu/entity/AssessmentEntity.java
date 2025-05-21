package edu.cit.futureu.entity;

import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.OneToMany;
import jakarta.persistence.CascadeType;

@Entity
@Table(name = "assessment")
public class AssessmentEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int assessmentId;

    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String status;
    private String type;
    private String title;
    private String description;

    // One-to-many relationship with AssessmentCategory
    @JsonIgnore
    @OneToMany(mappedBy = "assessment", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AssessmentCategoryEntity> categories;

    // One-to-many relationship with UserAssessment
    @JsonIgnore
    @OneToMany(mappedBy = "assessment", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<UserAssessmentEntity> userAssessments;

    public AssessmentEntity() {}

    public int getAssessmentId() {
        return assessmentId;
    }

    public void setAssessmentId(int assessmentId) {
        this.assessmentId = assessmentId;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<AssessmentCategoryEntity> getCategories() {
        return categories;
    }

    public void setCategories(List<AssessmentCategoryEntity> categories) {
        this.categories = categories;
    }

    public List<UserAssessmentEntity> getUserAssessments() {
        return userAssessments;
    }

    public void setUserAssessments(List<UserAssessmentEntity> userAssessments) {
        this.userAssessments = userAssessments;
    }
}