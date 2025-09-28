package edu.cit.futureu.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "institution")
public class InstitutionEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int institutionId;

    @Column(nullable = false)
    private String name;
    
    @Column(unique = true)
    private String emailDomain;
    
    @Column(unique = true)
    private String schoolCode;
    
    @Column(columnDefinition = "TEXT")
    private String description;

    // Constructors
    public InstitutionEntity() {}

    public InstitutionEntity(String name, String emailDomain, String schoolCode, String description) {
        this.name = name;
        this.emailDomain = emailDomain;
        this.schoolCode = schoolCode;
        this.description = description;
    }

    // Getters and setters
    public int getInstitutionId() {
        return institutionId;
    }

    public void setInstitutionId(int institutionId) {
        this.institutionId = institutionId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmailDomain() {
        return emailDomain;
    }

    public void setEmailDomain(String emailDomain) {
        this.emailDomain = emailDomain;
    }

    public String getSchoolCode() {
        return schoolCode;
    }

    public void setSchoolCode(String schoolCode) {
        this.schoolCode = schoolCode;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}