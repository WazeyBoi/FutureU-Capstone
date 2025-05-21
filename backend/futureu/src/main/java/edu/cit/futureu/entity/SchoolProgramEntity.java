package edu.cit.futureu.entity;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "school_program")
public class SchoolProgramEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int schoolProgramId;

    // Many-to-one relationship with School
    @ManyToOne
    @JoinColumn(name = "schoolId", nullable = false)
    private SchoolEntity school;

    // Many-to-one relationship with Program
    @ManyToOne
    @JoinColumn(name = "programId", nullable = false)
    private ProgramEntity program;

    // One-to-many relationship with Accreditation
    @OneToMany(mappedBy = "schoolProgram")
    @JsonManagedReference
    private List<AccreditationEntity> accreditations;

    public SchoolProgramEntity() {

    }

    public int getSchoolProgramId() {
        return schoolProgramId;
    }

    public void setSchoolProgramId(int schoolProgramId) {
        this.schoolProgramId = schoolProgramId;
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

    public List<AccreditationEntity> getAccreditations() {
        return accreditations;
    }

    public void setAccreditations(List<AccreditationEntity> accreditations) {
        this.accreditations = accreditations;
    }
}
