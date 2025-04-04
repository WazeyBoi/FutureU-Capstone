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

import edu.cit.futureu.entity.SchoolEntity;
import edu.cit.futureu.entity.TestimonyEntity;
import edu.cit.futureu.entity.UserEntity;
import edu.cit.futureu.service.SchoolService;
import edu.cit.futureu.service.TestimonyService;
import edu.cit.futureu.service.UserService;

@RestController
@RequestMapping(method=RequestMethod.GET, path="/api/testimony")
public class TestimonyController {
    
    @Autowired
    private TestimonyService testimonyService;
    
    @Autowired
    private SchoolService schoolService;
    
    @Autowired
    private UserService userService;
    
    @GetMapping("/test")
    public String test() {
        return "Testimony API is working!";
    }

    // CREATE
    @PostMapping("/postTestimonyRecord")
    public TestimonyEntity postTestimonyRecord(@RequestBody TestimonyEntity testimony) {
        return testimonyService.createTestimony(testimony);
    }
    
    // READ
    @GetMapping("/getAllTestimonies")
    public List<TestimonyEntity> getAllTestimonies() {
        return testimonyService.getAllTestimonies();
    }
    
    // Get testimony by ID
    @GetMapping("/getTestimony/{testimonyId}")
    public TestimonyEntity getTestimonyById(@PathVariable int testimonyId) {
        return testimonyService.getTestimonyById(testimonyId)
                .orElse(null);
    }
    
    // Get testimonies by school ID
    @GetMapping("/getTestimoniesBySchool/{schoolId}")
    public List<TestimonyEntity> getTestimoniesBySchool(@PathVariable int schoolId) {
        SchoolEntity school = schoolService.getSchoolById(schoolId).orElse(null);
        if (school != null) {
            return testimonyService.getTestimoniesBySchool(school);
        }
        return List.of(); // Return empty list if school not found
    }
    
    // Get testimonies by student ID
    @GetMapping("/getTestimoniesByStudent/{userId}")
    public List<TestimonyEntity> getTestimoniesByStudent(@PathVariable int userId) {
        // Assuming there's a method to get user by ID in UserService
        UserEntity user = userService.getUserById(userId).orElse(null);
        if (user != null) {
            return testimonyService.getTestimoniesByStudent(user);
        }
        return List.of(); // Return empty list if user not found
    }
    
    // UPDATE
    @PutMapping("/putTestimonyDetails")
    public TestimonyEntity putTestimonyDetails(@RequestParam int testimonyId, @RequestBody TestimonyEntity newTestimonyDetails) {
        newTestimonyDetails.setTestimonyId(testimonyId);
        return testimonyService.updateTestimony(newTestimonyDetails);
    }
    
    // DELETE
    @DeleteMapping("/deleteTestimonyDetails/{testimonyId}")
    public String deleteTestimony(@PathVariable int testimonyId) {
        boolean deleted = testimonyService.deleteTestimony(testimonyId);
        return deleted ? 
                "Testimony with ID " + testimonyId + " successfully deleted" : 
                "Testimony with ID " + testimonyId + " not found";
    }
}
