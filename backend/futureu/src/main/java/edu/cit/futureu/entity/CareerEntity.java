package edu.cit.futureu.entity;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;

@Entity
@Table(name = "career")
public class CareerEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int careerId;

    private String careerTitle;
    private String salary;
    private String careerDescription;
    private String jobTrend;
    private String industry;
    
    // Replace direct many-to-one with many-to-many via CareerProgramEntity
    @JsonIgnore
    @OneToMany(mappedBy = "career", cascade = CascadeType.ALL)
    private List<CareerProgramEntity> careerPrograms;

    @JsonIgnore
    @OneToOne(mappedBy = "careerPath")
    private RecommendationEntity recommendation;

    public CareerEntity() {
    }

    public int getCareerId() {
        return careerId;
    }

    public void setCareerId(int careerId) {
        this.careerId = careerId;
    }

    public String getCareerTitle() {
        return careerTitle;
    }

    public void setCareerTitle(String careerTitle) {
        this.careerTitle = careerTitle;
    }

    public String getSalary() {
        return salary;
    }

    public void setSalary(String salary) {
        this.salary = salary;
    }

    public String getCareerDescription() {
        return careerDescription;
    }

    public void setCareerDescription(String careerDescription) {
        this.careerDescription = careerDescription;
    }

    public String getJobTrend() {
        return jobTrend;
    }

    public void setJobTrend(String jobTrend) {
        this.jobTrend = jobTrend;
    }

    public String getIndustry() {
        return industry;
    }

    public void setIndustry(String industry) {
        this.industry = industry;
    }
    
    public List<CareerProgramEntity> getCareerPrograms() {
        return careerPrograms;
    }

    public void setCareerPrograms(List<CareerProgramEntity> careerPrograms) {
        this.careerPrograms = careerPrograms;
    }

    public RecommendationEntity getRecommendation() {
        return recommendation;
    }

    public void setRecommendation(RecommendationEntity recommendation) {
        this.recommendation = recommendation;
    }
    
    // For backward compatibility - returns the first associated program
    @Transient
    public ProgramEntity getProgram() {
        if (careerPrograms != null && !careerPrograms.isEmpty()) {
            return careerPrograms.get(0).getProgram();
        }
        return null;
    }
    
    // This is now handled by the CareerProgramService
    public void setProgram(ProgramEntity program) {
        // Implementation handled by service layer
    }
}
