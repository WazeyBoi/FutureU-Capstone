package edu.cit.futureu.entity;

import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;

@Entity
public class SchoolEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int schoolId;

    private String name;
    private String location;
    private String type;
    private String virtualTourUrl;

    // One-to-many to Testimony
    @OneToMany(mappedBy = "school", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TestimonyEntity> testimonies;

    // One-to-many to Accreditation
    @OneToMany(mappedBy = "school", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AccreditationEntity> accreditations;

    // One-to-many to SchoolProgram
    @OneToMany(mappedBy = "school", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SchoolProgramEntity> schoolPrograms;

    public SchoolEntity() {

    }

    public int getSchoolId() {
        return schoolId;
    }

    public void setSchoolId(int schoolId) {
        this.schoolId = schoolId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getVirtualTourUrl() {
        return virtualTourUrl;
    }

    public void setVirtualTourUrl(String virtualTourUrl) {
        this.virtualTourUrl = virtualTourUrl;
    }

    public List<TestimonyEntity> getTestimonies() {
        return testimonies;
    }

    public void setTestimonies(List<TestimonyEntity> testimonies) {
        this.testimonies = testimonies;
    }

    public List<AccreditationEntity> getAccreditations() {
        return accreditations;
    }

    public void setAccreditations(List<AccreditationEntity> accreditations) {
        this.accreditations = accreditations;
    }

    public List<SchoolProgramEntity> getSchoolPrograms() {
        return schoolPrograms;
    }

    public void setSchoolPrograms(List<SchoolProgramEntity> schoolPrograms) {
        this.schoolPrograms = schoolPrograms;
    }

}
