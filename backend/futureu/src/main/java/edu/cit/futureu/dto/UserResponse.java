package edu.cit.futureu.dto;

public class UserResponse {
    private int id;
    private String email;
    private String role;
    private String firstName;

    public UserResponse(int id, String email, String role, String firstName) {
        this.id = id;
        this.email = email;
        this.role = role;
        this.firstName = firstName;
    }

    // Getters and Setters
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }
}