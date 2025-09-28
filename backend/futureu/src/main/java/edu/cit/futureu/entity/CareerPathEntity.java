package edu.cit.futureu.entity;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;

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
    
    // One Career Path can have many Careers
    @JsonManagedReference("careerPath-careers")
    @OneToMany(mappedBy = "careerPath", cascade = CascadeType.ALL)
    private List<CareerEntity> careers;
    
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
    
    public List<CareerEntity> getCareers() {
        return careers;
    }
    
    public void setCareers(List<CareerEntity> careers) {
        this.careers = careers;
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