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
@Table(name = "program_career_path")
public class ProgramCareerPathEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    
    @JsonBackReference
    @ManyToOne
    @JoinColumn(name = "program_id", nullable = false)
    private ProgramEntity program;
    
    @ManyToOne
    @JoinColumn(name = "career_path_id", nullable = false)
    private CareerPathEntity careerPath;
    
    public ProgramCareerPathEntity() {
    }
    
    public ProgramCareerPathEntity(ProgramEntity program, CareerPathEntity careerPath) {
        this.program = program;
        this.careerPath = careerPath;
    }
    
    // Getters and Setters
    public int getId() {
        return id;
    }
    
    public void setId(int id) {
        this.id = id;
    }
    
    public ProgramEntity getProgram() {
        return program;
    }
    
    public void setProgram(ProgramEntity program) {
        this.program = program;
    }
    
    public CareerPathEntity getCareerPath() {
        return careerPath;
    }
    
    public void setCareerPath(CareerPathEntity careerPath) {
        this.careerPath = careerPath;
    }
    
    @Override
    public String toString() {
        return "ProgramCareerPathEntity{" +
                "id=" + id +
                ", program=" + (program != null ? program.getProgramName() : "null") +
                ", careerPath=" + (careerPath != null ? careerPath.getCareerPathName() : "null") +
                '}';
    }
}