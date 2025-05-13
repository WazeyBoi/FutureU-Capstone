package edu.cit.futureu.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "quiz_sub_category_category")
public class QuizSubCategoryCategoryEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int quizSubCategoryCategoryId;

    @ManyToOne
    @JoinColumn(name = "assessmentSubCategoryId", nullable = false)
    private AssessmentSubCategoryEntity assesssmentSubCategory;

    private String quizSubCategoryCategoryName;
    private String quizSubCategoryCategoryDescription;

    public QuizSubCategoryCategoryEntity() {
    }
    
    public int getQuizSubCategoryCategoryId() {
        return quizSubCategoryCategoryId;
    }

    public void setQuizSubCategoryCategoryId(int quizSubCategoryCategoryId) {
        this.quizSubCategoryCategoryId = quizSubCategoryCategoryId;
    }

    public AssessmentSubCategoryEntity getAssesssmentSubCategory() {
        return assesssmentSubCategory;
    }

    public void setAssesssmentSubCategory(AssessmentSubCategoryEntity assesssmentSubCategory) {
        this.assesssmentSubCategory = assesssmentSubCategory;
    }

    public String getQuizSubCategoryCategoryName() {
        return quizSubCategoryCategoryName;
    }

    public void setQuizSubCategoryCategoryName(String quizSubCategoryCategoryName) {
        this.quizSubCategoryCategoryName = quizSubCategoryCategoryName;
    }

    public String getQuizSubCategoryCategoryDescription() {
        return quizSubCategoryCategoryDescription;
    }

    public void setQuizSubCategoryCategoryDescription(String quizSubCategoryCategoryDescription) {
        this.quizSubCategoryCategoryDescription = quizSubCategoryCategoryDescription;
    }
    
}
