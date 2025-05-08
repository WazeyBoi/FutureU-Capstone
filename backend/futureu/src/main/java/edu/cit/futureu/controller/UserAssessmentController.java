package edu.cit.futureu.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import edu.cit.futureu.entity.UserAssessmentEntity;
import edu.cit.futureu.entity.UserEntity;
import edu.cit.futureu.entity.AssessmentEntity;
import edu.cit.futureu.service.UserAssessmentService;
import edu.cit.futureu.service.UserService;
import edu.cit.futureu.service.AssessmentService;

@RestController
@RequestMapping(method=RequestMethod.GET, path="/api/userassessment")
public class UserAssessmentController {

    @Autowired
    private UserAssessmentService userAssessmentService;

    @Autowired
    private UserService userService;

    @Autowired
    private AssessmentService assessmentService;

    @GetMapping("/test")
    public String test() {
        return "UserAssessment API is working!";
    }

    // CREATE
    @PostMapping("/postUserAssessmentRecord")
    public UserAssessmentEntity postUserAssessmentRecord(@RequestBody UserAssessmentEntity userAssessment) {
        return userAssessmentService.createUserAssessment(userAssessment);
    }

    // READ
    @GetMapping("/getAllUserAssessments")
    public List<UserAssessmentEntity> getAllUserAssessments() {
        return userAssessmentService.getAllUserAssessments();
    }

    @GetMapping("/getUserAssessment/{id}")
    public UserAssessmentEntity getUserAssessmentById(@PathVariable int id) {
        return userAssessmentService.getUserAssessmentById(id).orElse(null);
    }

    @GetMapping("/getUserAssessmentsByUser/{userId}")
    public List<UserAssessmentEntity> getUserAssessmentsByUser(@PathVariable int userId) {
        UserEntity user = userService.getUserById(userId).orElse(null);
        if (user != null) {
            return userAssessmentService.getUserAssessmentsByUser(user);
        }
        return List.of();
    }

    @GetMapping("/getUserAssessmentsByAssessment/{assessmentId}")
    public List<UserAssessmentEntity> getUserAssessmentsByAssessment(@PathVariable int assessmentId) {
        AssessmentEntity assessment = assessmentService.getAssessmentById(assessmentId).orElse(null);
        if (assessment != null) {
            return userAssessmentService.getUserAssessmentsByAssessment(assessment);
        }
        return List.of();
    }

    // UPDATE
    @PutMapping("/putUserAssessmentDetails")
    public UserAssessmentEntity putUserAssessmentDetails(@RequestParam int id, @RequestBody UserAssessmentEntity newDetails) {
        newDetails.setUserQuizAssessment(id);
        return userAssessmentService.updateUserAssessment(newDetails);
    }

    // DELETE
    @DeleteMapping("/deleteUserAssessment/{id}")
    public String deleteUserAssessment(@PathVariable int id) {
        boolean deleted = userAssessmentService.deleteUserAssessment(id);
        return deleted ? "UserAssessment with ID " + id + " successfully deleted" : "UserAssessment with ID " + id + " not found";
    }
}
