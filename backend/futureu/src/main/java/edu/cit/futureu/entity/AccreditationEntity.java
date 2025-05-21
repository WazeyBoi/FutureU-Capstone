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
@Table(name = "accreditation")
public class AccreditationEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int accredId;

    // Many-to-one relationship with SchoolProgram
    @ManyToOne
    @JoinColumn(name = "school_program_id")
    @JsonBackReference
    private SchoolProgramEntity schoolProgram;

    private String title;
    private String description;
    private String recognitionStatus;
    private String accreditingBody;
    private String accreditationLevel;

    public AccreditationEntity() {

    }

    public int getAccredId() {
        return accredId;
    }

    public void setAccredId(int accredId) {
        this.accredId = accredId;
    }

    public SchoolProgramEntity getSchoolProgram() {
        return schoolProgram;
    }

    public void setSchoolProgram(SchoolProgramEntity schoolProgram) {
        this.schoolProgram = schoolProgram;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getRecognitionStatus() {
        return recognitionStatus;
    }

    public void setRecognitionStatus(String recognitionStatus) {
        this.recognitionStatus = recognitionStatus;
    }

    public String getAccreditingBody() {
        return accreditingBody;
    }

    public void setAccreditingBody(String accreditingBody) {
        this.accreditingBody = accreditingBody;
    }

    public String getAccreditationLevel() {
        return accreditationLevel;
    }

    public void setAccreditationLevel(String accreditationLevel) {
        this.accreditationLevel = accreditationLevel;
    }
}
