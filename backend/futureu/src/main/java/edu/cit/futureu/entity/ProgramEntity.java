package edu.cit.futureu.entity;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "program")
public class ProgramEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int programId;

    private String programName;
    private String description;

    // One-to-many to SchoolProgram
    @JsonIgnore
    @OneToMany(mappedBy = "program", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SchoolProgramEntity> schoolPrograms;

    public ProgramEntity() {

    }

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

    
}
