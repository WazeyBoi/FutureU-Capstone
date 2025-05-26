package edu.cit.futureu.dto;

public class JwtResponse {
    private String token;
    private String type = "Bearer";
    private int id;
    private String email;
    private String role;
    private String firstName; // Add this line

    public JwtResponse(String accessToken, int id, String email, String role, String firstName) {
        this.token = accessToken;
        this.id = id;
        this.email = email;
        this.role = role;
        this.firstName = firstName;
    }

    // Getters and Setters
    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

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
