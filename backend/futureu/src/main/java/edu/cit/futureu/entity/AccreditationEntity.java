package edu.cit.futureu.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity
public class AccreditationEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int accredId;

    // Many-to-one relationship with School
    @ManyToOne
    @JoinColumn(name = "schoolId", nullable = false)
    private SchoolEntity school;

    private String title;
    private String description;

    public AccreditationEntity() {

    }

    public int getAccredId() {
        return accredId;
    }

    public void setAccredId(int accredId) {
        this.accredId = accredId;
    }

    public SchoolEntity getSchool() {
        return school;
    }

    public void setSchool(SchoolEntity school) {
        this.school = school;
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

}
