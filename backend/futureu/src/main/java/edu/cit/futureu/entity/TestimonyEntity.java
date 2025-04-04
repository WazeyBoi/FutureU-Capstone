package edu.cit.futureu.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity
public class TestimonyEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int testimonyId;

    // Many-to-one relationship with School
    @ManyToOne
    @JoinColumn(name = "schoolId", nullable = false)
    private SchoolEntity school;

    // Many-to-one relationship with User
    @ManyToOne
    @JoinColumn(name = "studentId", nullable = false)
    private UserEntity student;

    private String description;

    public TestimonyEntity() {

    }

    public int getTestimonyId() {
        return testimonyId;
    }

    public void setTestimonyId(int testimonyId) {
        this.testimonyId = testimonyId;
    }

    public SchoolEntity getSchool() {
        return school;
    }

    public void setSchool(SchoolEntity school) {
        this.school = school;
    }

    public UserEntity getStudent() {
        return student;
    }

    public void setStudent(UserEntity student) {
        this.student = student;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

}
