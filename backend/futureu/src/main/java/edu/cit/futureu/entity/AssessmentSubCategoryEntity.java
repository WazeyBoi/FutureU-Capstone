package edu.cit.futureu.entity;

import java.util.List;

import jakarta.persistence.*;

@Entity
@Table(name = "assessment_sub_category")
public class AssessmentSubCategoryEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int assessmentSubCategoryId;

    private String subCategoryName;
    private String description;

    // Many-to-one relationship with AssessmentCategory
    @ManyToOne
    @JoinColumn(name = "assessmentCategoryId", nullable = false)
    private AssessmentCategoryEntity assessmentCategory;

    @OneToMany(mappedBy = "assesssmentSubCategory", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<QuizSubCategoryCategoryEntity> quizSubCategoryCategories;

    public AssessmentSubCategoryEntity() {}

    public int getAssessmentSubCategoryId() {
        return assessmentSubCategoryId;
    }

    public void setAssessmentSubCategoryId(int assessmentSubCategoryId) {
        this.assessmentSubCategoryId = assessmentSubCategoryId;
    }

    public String getSubCategoryName() {
        return subCategoryName;
    }

    public void setSubCategoryName(String subCategoryName) {
        this.subCategoryName = subCategoryName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public AssessmentCategoryEntity getAssessmentCategory() {
        return assessmentCategory;
    }

    public void setAssessmentCategory(AssessmentCategoryEntity assessmentCategory) {
        this.assessmentCategory = assessmentCategory;
    }
}