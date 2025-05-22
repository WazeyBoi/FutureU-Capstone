package edu.cit.futureu.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "virtual_campus_tour")
public class VirtualCampusToursEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int virtualCampusTourId;

    @ManyToOne
    @JoinColumn(name = "schoolId", nullable = false)
    private SchoolEntity school;

    private String virtualCampusTourUrl;
    
    @Column(columnDefinition = "TEXT")
    private String caption;

    private boolean featured = false;
    private int views = 0;

    // Optionally add timestamps, status, etc.

    public VirtualCampusToursEntity() {}

    public int getVirtualCampusTourId() {
        return virtualCampusTourId;
    }

    public void setVirtualCampusTourId(int virtualCampusTourId) {
        this.virtualCampusTourId = virtualCampusTourId;
    }

    public SchoolEntity getSchool() {
        return school;
    }

    public void setSchool(SchoolEntity school) {
        this.school = school;
    }

    public String getVirtualCampusTourUrl() {
        return virtualCampusTourUrl;
    }

    public void setVirtualCampusTourUrl(String virtualCampusTourUrl) {
        this.virtualCampusTourUrl = virtualCampusTourUrl;
    }

    public String getCaption() {
        return caption;
    }

    public void setCaption(String caption) {
        this.caption = caption;
    }

    public boolean isFeatured() {
        return featured;
    }

    public void setFeatured(boolean featured) {
        this.featured = featured;
    }

    public int getViews() {
        return views;
    }

    public void setViews(int views) {
        this.views = views;
    }
}