package edu.cit.futureu.entity;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "program")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class ProgramEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "program_id")
    private int programId;

    @Column(name = "program_name", nullable = false)
    private String programName;
    
    @Lob
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    // One-to-many to SchoolProgram remains unchanged
    @JsonIgnore
    @OneToMany(mappedBy = "program", cascade = CascadeType.ALL)
    private List<SchoolProgramEntity> schoolPrograms;

    // Replace CareerProgramEntity with ProgramCareerPathEntity
    @JsonManagedReference
    @OneToMany(mappedBy = "program", cascade = CascadeType.ALL)
    private List<ProgramCareerPathEntity> programCareerPaths;

    public ProgramEntity() {
    }

    public ProgramEntity(String programName, String description) {
        this.programName = programName;
        this.description = description;
    }

    // Getters and Setters
    public int getProgramId() {
        return programId;
    }

    public void setProgramId(int programId) {
        this.programId = programId;
    }

    public String getProgramName() {
        return programName;
    }

    public void setProgramName(String programName) {
        this.programName = programName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<SchoolProgramEntity> getSchoolPrograms() {
        return schoolPrograms;
    }

    public void setSchoolPrograms(List<SchoolProgramEntity> schoolPrograms) {
        this.schoolPrograms = schoolPrograms;
    }
    
    public List<ProgramCareerPathEntity> getProgramCareerPaths() {
        return programCareerPaths;
    }
    
    public void setProgramCareerPaths(List<ProgramCareerPathEntity> programCareerPaths) {
        this.programCareerPaths = programCareerPaths;
    }
    
    @Override
    public String toString() {
        return "ProgramEntity{" +
                "programId=" + programId +
                ", programName='" + programName + '\'' +
                ", description='" + description + '\'' +
                '}';
    }
}
