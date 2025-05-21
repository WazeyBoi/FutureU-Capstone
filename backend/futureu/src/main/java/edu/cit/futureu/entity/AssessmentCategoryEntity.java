package edu.cit.futureu.entity;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.*;

@Entity
@Table(name = "assessment_category")
public class AssessmentCategoryEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int assessmentCategoryId;

    private String categoryName;
    private String description;

    // Many-to-one relationship with Assessment
    @JsonBackReference
    @ManyToOne
    @JoinColumn(name = "assessmentId", nullable = false)
    private AssessmentEntity assessment;

    // One-to-many with AssessmentSubCategoryEntity
    @JsonIgnore
    @OneToMany(mappedBy = "assessmentCategory", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AssessmentSubCategoryEntity> subCategories;

    @JsonIgnore
    @OneToMany(mappedBy = "assessmentCategory", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<QuestionEntity> questions;

    public AssessmentCategoryEntity() {}

    public int getAssessmentCategoryId() {
        return assessmentCategoryId;
    }

    public void setAssessmentCategoryId(int assessmentCategoryId) {
        this.assessmentCategoryId = assessmentCategoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<AssessmentSubCategoryEntity> getSubCategories() {
        return subCategories;
    }

    public void setSubCategories(List<AssessmentSubCategoryEntity> subCategories) {
        this.subCategories = subCategories;
    }

    public List<QuestionEntity> getQuestions() {
        return questions;
    }

    public void setQuestions(List<QuestionEntity> questions) {
        this.questions = questions;
    }
}