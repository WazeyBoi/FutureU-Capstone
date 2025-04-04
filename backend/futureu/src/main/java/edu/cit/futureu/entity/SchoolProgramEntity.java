package edu.cit.futureu.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity
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

    // Many-to-one relationship with Accreditation
    @ManyToOne
    @JoinColumn(name = "accredId")
    private AccreditationEntity accreditation;

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

    public AccreditationEntity getAccreditation() {
        return accreditation;
    }

    public void setAccreditation(AccreditationEntity accreditation) {
        this.accreditation = accreditation;
    }

    
}
