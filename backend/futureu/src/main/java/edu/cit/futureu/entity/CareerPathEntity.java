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
@Table(name = "career_path")
public class CareerPathEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int careerPathId;
    
    private String careerPathName;
    
    private String careerPathDescription;
    
    // One-to-Many relationship with CareerCareerPathEntity
    @JsonIgnore
    @OneToMany(mappedBy = "careerPath", cascade = CascadeType.ALL)
    private List<CareerCareerPathEntity> careerCareerPaths;
    
    // One Career Path can be associated with many Programs through ProgramCareerPathEntity
    @JsonIgnore
    @OneToMany(mappedBy = "careerPath", cascade = CascadeType.ALL)
    private List<ProgramCareerPathEntity> programCareerPaths;
    
    public CareerPathEntity() {
    }
    
    public CareerPathEntity(String careerPathName, String careerPathDescription) {
        this.careerPathName = careerPathName;
        this.careerPathDescription = careerPathDescription;
    }
    
    // Getters and Setters
    public int getCareerPathId() {
        return careerPathId;
    }
    
    public void setCareerPathId(int careerPathId) {
        this.careerPathId = careerPathId;
    }
    
    public String getCareerPathName() {
        return careerPathName;
    }
    
    public void setCareerPathName(String careerPathName) {
        this.careerPathName = careerPathName;
    }
    
    public String getCareerPathDescription() {
        return careerPathDescription;
    }
    
    public void setCareerPathDescription(String careerPathDescription) {
        this.careerPathDescription = careerPathDescription;
    }
    
    public List<CareerCareerPathEntity> getCareerCareerPaths() {
        return careerCareerPaths;
    }
    
    public void setCareerCareerPaths(List<CareerCareerPathEntity> careerCareerPaths) {
        this.careerCareerPaths = careerCareerPaths;
    }
    
    public List<ProgramCareerPathEntity> getProgramCareerPaths() {
        return programCareerPaths;
    }
    
    public void setProgramCareerPaths(List<ProgramCareerPathEntity> programCareerPaths) {
        this.programCareerPaths = programCareerPaths;
    }
    
    @Override
    public String toString() {
        return "CareerPathEntity{" +
                "careerPathId=" + careerPathId +
                ", careerPathName='" + careerPathName + '\'' +
                ", careerPathDescription='" + careerPathDescription + '\'' +
                '}';
    }
}