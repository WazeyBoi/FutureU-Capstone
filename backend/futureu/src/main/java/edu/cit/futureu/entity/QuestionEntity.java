package edu.cit.futureu.entity;

import jakarta.persistence.*;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;

@Entity
@Table(name = "question")
public class QuestionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int questionId;

    // Many-to-one relationship with AssessmentCategory
    @JsonManagedReference
    @ManyToOne
    @JoinColumn(name = "assessmentCategoryId")
    private AssessmentCategoryEntity assessmentCategory;
    
    // Add the relationship to QuizSubCategoryCategory
    @JsonManagedReference
    @ManyToOne
    @JoinColumn(name = "quizSubCategoryCategoryId")
    private QuizSubCategoryCategoryEntity quizSubCategoryCategory;

    @JsonManagedReference
    @ManyToOne
    @JoinColumn(name = "assessmentSubCategoryId", nullable = false)
    private AssessmentSubCategoryEntity assessmentSubCategory;

    private String questionText;
    private String category;
    private String difficultyLevel;
    private String correctAnswer;
    private String questionType;

    @JsonBackReference
    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AnswerEntity> answers;

    @JsonBackReference
    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ChoiceEntity> choices;

    public QuestionEntity() {}

    public int getQuestionId() {
        return questionId;
    }

    public void setQuestionId(int questionId) {
        this.questionId = questionId;
    }

    public AssessmentCategoryEntity getAssessmentCategory() {
        return assessmentCategory;
    }

    public void setAssessmentCategory(AssessmentCategoryEntity assessmentCategory) {
        this.assessmentCategory = assessmentCategory;
    }

    public QuizSubCategoryCategoryEntity getQuizSubCategoryCategory() {
        return quizSubCategoryCategory;
    }

    public void setQuizSubCategoryCategory(QuizSubCategoryCategoryEntity quizSubCategoryCategory) {
        this.quizSubCategoryCategory = quizSubCategoryCategory;
    }

    public String getQuestionText() {
        return questionText;
    }

    public void setQuestionText(String questionText) {
        this.questionText = questionText;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getDifficultyLevel() {
        return difficultyLevel;
    }

    public void setDifficultyLevel(String difficultyLevel) {
        this.difficultyLevel = difficultyLevel;
    }

    public String getCorrectAnswer() {
        return correctAnswer;
    }

    public void setCorrectAnswer(String correctAnswer) {
        this.correctAnswer = correctAnswer;
    }

    public List<AnswerEntity> getAnswers() {
        return answers;
    }

    public void setAnswers(List<AnswerEntity> answers) {
        this.answers = answers;
    }

    public String getQuestionType() {
        return questionType;
    }

    public void setQuestionType(String questionType) {
        this.questionType = questionType;
    }

    public List<ChoiceEntity> getChoices() {
        return choices;
    }

    public void setChoices(List<ChoiceEntity> choices) {
        this.choices = choices;
    }

    public AssessmentSubCategoryEntity getAssessmentSubCategory() {
        return assessmentSubCategory;
    }

    public void setAssessmentSubCategory(AssessmentSubCategoryEntity assessmentSubCategory) {
        this.assessmentSubCategory = assessmentSubCategory;
    }

    
}
