package edu.cit.futureu.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.util.List;

@Entity
@Table(name = "passage")
public class PassageEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    
    @Column(nullable = false)
    private String title;
    
    @Column(name = "passage_text", columnDefinition = "TEXT", nullable = false)
    private String passageText;
    
    // One-to-many relationship with questions
    @JsonIgnore
    @OneToMany(mappedBy = "passage", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<QuestionEntity> questions;
    
    // Constructors
    public PassageEntity() {}
    
    public PassageEntity(String title, String passageText) {
        this.title = title;
        this.passageText = passageText;
    }
    
    // Getters and Setters
    public int getId() {
        return id;
    }
    
    public void setId(int id) {
        this.id = id;
    }
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getPassageText() {
        return passageText;
    }
    
    public void setPassageText(String passageText) {
        this.passageText = passageText;
    }
    
    public List<QuestionEntity> getQuestions() {
        return questions;
    }
    
    public void setQuestions(List<QuestionEntity> questions) {
        this.questions = questions;
    }
}
