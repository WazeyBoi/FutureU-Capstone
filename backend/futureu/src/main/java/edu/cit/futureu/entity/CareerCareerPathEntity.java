package edu.cit.futureu.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "career_career_path")
public class CareerCareerPathEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    
    @JsonBackReference
    @ManyToOne
    @JoinColumn(name = "career_id", nullable = false)
    private CareerEntity career;
    
    @ManyToOne
    @JoinColumn(name = "career_path_id", nullable = false)
    private CareerPathEntity careerPath;
    
    public CareerCareerPathEntity() {
    }
    
    public CareerCareerPathEntity(CareerEntity career, CareerPathEntity careerPath) {
        this.career = career;
        this.careerPath = careerPath;
    }
    
    // Getters and Setters
    public int getId() {
        return id;
    }
    
    public void setId(int id) {
        this.id = id;
    }
    
    public CareerEntity getCareer() {
        return career;
    }
    
    public void setCareer(CareerEntity career) {
        this.career = career;
    }
    
    public CareerPathEntity getCareerPath() {
        return careerPath;
    }
    
    public void setCareerPath(CareerPathEntity careerPath) {
        this.careerPath = careerPath;
    }
    
    @Override
    public String toString() {
        return "CareerCareerPathEntity{" +
                "id=" + id +
                ", career=" + (career != null ? career.getCareerTitle() : "null") +
                ", careerPath=" + (careerPath != null ? careerPath.getCareerPathName() : "null") +
                '}';
    }
}