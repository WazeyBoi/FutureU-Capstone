package edu.cit.futureu.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "school_program")
public class SchoolProgramEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int schoolProgramId;

    @Column(name = "school_program_url", length = 512)
    private String schoolProgramURL;

    @Column(name = "school_program_url_type", length = 32)
    private String schoolProgramURLType;

    // Many-to-one relationship with School
    @ManyToOne
    @JoinColumn(name = "schoolId", nullable = false)
    private SchoolEntity school;

    // Many-to-one relationship with Program
    @ManyToOne
    @JoinColumn(name = "programId", nullable = false)
    private ProgramEntity program;

    // Many-to-one relationship with Accreditation
    @ManyToOne
    @JoinColumn(name = "accred_id")
    private AccreditationEntity accreditation;

    public SchoolProgramEntity() {

    }

    public int getSchoolProgramId() {
        return schoolProgramId;
    }

    public void setSchoolProgramId(int schoolProgramId) {
        this.schoolProgramId = schoolProgramId;
    }

    public String getSchoolProgramURL() {
        return schoolProgramURL;
    }

    public void setSchoolProgramURL(String schoolProgramURL) {
        this.schoolProgramURL = schoolProgramURL;
    }

    public SchoolEntity getSchool() {
        return school;
    }

    public void setSchool(SchoolEntity school) {
        this.school = school;
    }

    public ProgramEntity getProgram() {
        return program;
    }

    public void setProgram(ProgramEntity program) {
        this.program = program;
    }

    public AccreditationEntity getAccreditation() {
        return accreditation;
    }

    public void setAccreditation(AccreditationEntity accreditation) {
        this.accreditation = accreditation;
    }

    public String getSchoolProgramURLType() {
        return schoolProgramURLType;
    }

    public void setSchoolProgramURLType(String schoolProgramURLType) {
        this.schoolProgramURLType = schoolProgramURLType;
    }
}
