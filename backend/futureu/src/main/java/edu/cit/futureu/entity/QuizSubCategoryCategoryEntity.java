package edu.cit.futureu.entity;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "quiz_sub_category_category")
public class QuizSubCategoryCategoryEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int quizSubCategoryCategoryId;

    @JsonBackReference
    @ManyToOne
    @JoinColumn(name = "assessmentSubCategoryId", nullable = false)
    private AssessmentSubCategoryEntity assesssmentSubCategory;

    @JsonIgnore
    @OneToMany(mappedBy = "quizSubCategoryCategory", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<QuestionEntity> questions;


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

    public List<QuestionEntity> getQuestions() {
        return questions;
    }

    public void setQuestions(List<QuestionEntity> questions) {
        this.questions = questions;
    }
    
}
