package edu.cit.futureu.entity;

import java.time.LocalDateTime;
import java.util.List;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.CascadeType;

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
    @ManyToOne
    @JoinColumn(name = "assessmentId", nullable = false)
    private AssessmentEntity assessment;

    private LocalDateTime dateTaken;

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
}
