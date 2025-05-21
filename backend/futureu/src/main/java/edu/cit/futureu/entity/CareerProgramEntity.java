package edu.cit.futureu.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "career_program")
public class CareerProgramEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    
    @ManyToOne
    @JoinColumn(name = "career_id")
    private CareerEntity career;
    
    @ManyToOne
    @JoinColumn(name = "program_id")
    private ProgramEntity program;
    
    public CareerProgramEntity() {
    }
    
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
    
    public ProgramEntity getProgram() {
        return program;
    }
    
    public void setProgram(ProgramEntity program) {
        this.program = program;
    }
}
