package edu.cit.futureu.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "career")
public class CareerEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int careerId;

    private String careerTitle;
    private double salary;
    private String jobTrend;
    private String industry;
    
    // Many-to-one relationship with Program
    @JsonBackReference
    @ManyToOne
    @JoinColumn(name = "programId")
    private ProgramEntity program;

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

    public double getSalary() {
        return salary;
    }

    public void setSalary(double salary) {
        this.salary = salary;
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

    public ProgramEntity getProgram() {
        return program;
    }

    public void setProgram(ProgramEntity program) {
        this.program = program;
    }

    public RecommendationEntity getRecommendation() {
        return recommendation;
    }

    public void setRecommendation(RecommendationEntity recommendation) {
        this.recommendation = recommendation;
    }
}
