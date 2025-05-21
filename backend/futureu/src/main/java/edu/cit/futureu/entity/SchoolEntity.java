package edu.cit.futureu.entity;

import java.math.BigDecimal;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "school")
public class SchoolEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int schoolId;

    private String name;
    private String location;
    private String type;
    private String schoolWebsiteUrl;
    
    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(precision = 9, scale = 6)
    private BigDecimal latitude;

    @Column(precision = 9, scale = 6)
    private BigDecimal longitude;

    @Column(precision = 2, scale = 1)
    private BigDecimal averageRating;

    // One-to-many to Testimony
    @JsonManagedReference(value = "school-testimony")
    @OneToMany(mappedBy = "school", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TestimonyEntity> testimonies;

    // One-to-many to SchoolProgram
    @JsonIgnore
    @OneToMany(mappedBy = "school", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SchoolProgramEntity> schoolPrograms;

    public SchoolEntity() {}

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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getLatitude() {
        return latitude;
    }

    public void setLatitude(BigDecimal latitude) {
        this.latitude = latitude;
    }

    public BigDecimal getLongitude() {
        return longitude;
    }

    public void setLongitude(BigDecimal longitude) {
        this.longitude = longitude;
    }

    public List<TestimonyEntity> getTestimonies() {
        return testimonies;
    }

    public void setTestimonies(List<TestimonyEntity> testimonies) {
        this.testimonies = testimonies;
    }

    public List<SchoolProgramEntity> getSchoolPrograms() {
        return schoolPrograms;
    }

    public void setSchoolPrograms(List<SchoolProgramEntity> schoolPrograms) {
        this.schoolPrograms = schoolPrograms;
    }

    public String getSchoolWebsiteUrl() {
        return schoolWebsiteUrl;
    }

    public void setSchoolWebsiteUrl(String schoolWebsiteUrl) {
        this.schoolWebsiteUrl = schoolWebsiteUrl;
    }

    public BigDecimal getAverageRating() {
        return averageRating;
    }

    public void setAverageRating(BigDecimal averageRating) {
       this.averageRating = averageRating;
    }
}
