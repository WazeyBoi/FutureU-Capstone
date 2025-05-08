package edu.cit.futureu.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "assessment_result")
public class AssessmentResultEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int resultId;

    // Many-to-one relationship with UserAssessment
    @ManyToOne
    @JoinColumn(name = "userQuizAssessment", nullable = false)
    private UserAssessmentEntity userAssessment;

    private double rawScore;    
    private double normalizedScore;
    private String interpretationText;

    @OneToOne(mappedBy = "assessmentResult", cascade = CascadeType.ALL)
    private RecommendationEntity recommendation;

    public AssessmentResultEntity() {}

    public int getResultId() { 
        return resultId; 
    }
    public void setResultId(int resultId) { 
        this.resultId = resultId; 
    }

    public UserAssessmentEntity getUserAssessment() { 
        return userAssessment; 
    }
    public void setUserAssessment(UserAssessmentEntity userAssessment) { 
        this.userAssessment = userAssessment; 
    }

    public double getRawScore() { 
        return rawScore; 
    }
    public void setRawScore(double rawScore) { 
        this.rawScore = rawScore; 
    }

    public double getNormalizedScore() { 
        return normalizedScore; }
    public void setNormalizedScore(double normalizedScore) { 
        this.normalizedScore = normalizedScore; 
    }

    public String getInterpretationText() { 
        return interpretationText; 
    }
    public void setInterpretationText(String interpretationText) { 
        this.interpretationText = interpretationText; 
    }

    public RecommendationEntity getRecommendation() { 
        return recommendation; 
    }
    public void setRecommendation(RecommendationEntity recommendation) { 
        this.recommendation = recommendation; 
    }
}