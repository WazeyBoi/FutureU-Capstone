package edu.cit.futureu.entity;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "career")
public class CareerEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "career_id")
    private int careerId;

    @Column(name = "career_title", nullable = false)
    private String careerTitle;
    
    @Column(name = "salary")
    private String salary;
    
    @Column(name = "career_description", columnDefinition = "TEXT")
    private String careerDescription;
    
    @Column(name = "job_trend")
    private String jobTrend;
    
    @Column(name = "industry")
    private String industry;
    
    // One-to-Many relationship with CareerCareerPathEntity
    @JsonIgnore
    @OneToMany(mappedBy = "career", cascade = CascadeType.ALL)
    private List<CareerCareerPathEntity> careerCareerPaths;

    @JsonIgnore
    @OneToMany(mappedBy = "careerPath")
    private List<CareerRecommendationEntity> recommendation;

    public CareerEntity() {
    }

    public CareerEntity(String careerTitle, String industry, String salary, String jobTrend, String careerDescription) {
        this.careerTitle = careerTitle;
        this.industry = industry;
        this.salary = salary;
        this.jobTrend = jobTrend;
        this.careerDescription = careerDescription;
    }

    // Getters and Setters
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
    
    public List<CareerCareerPathEntity> getCareerCareerPaths() {
        return careerCareerPaths;
    }
    
    public void setCareerCareerPaths(List<CareerCareerPathEntity> careerCareerPaths) {
        this.careerCareerPaths = careerCareerPaths;
    }

    public List<CareerRecommendationEntity> getRecommendation() {
        return recommendation;
    }

    public void setRecommendation(List<CareerRecommendationEntity> recommendation) {
        this.recommendation = recommendation;
    }
    
    @Override
    public String toString() {
        return "CareerEntity{" +
                "careerId=" + careerId +
                ", careerTitle='" + careerTitle + '\'' +
                ", industry='" + industry + '\'' +
                ", salary='" + salary + '\'' +
                ", jobTrend='" + jobTrend + '\'' +
                '}';
    }
}
