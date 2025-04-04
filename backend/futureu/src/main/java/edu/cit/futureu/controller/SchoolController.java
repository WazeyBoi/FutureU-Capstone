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
import edu.cit.futureu.service.SchoolService;

@RestController
@RequestMapping(method=RequestMethod.GET, path="/api/school")
public class SchoolController {
    
    @Autowired
    private SchoolService schoolService;
    
    @GetMapping("/test")
    public String test() {
        return "School API is working!";
    }

    // CREATE
    @PostMapping("/postSchoolRecord")
    public SchoolEntity postSchoolRecord(@RequestBody SchoolEntity school) {
        return schoolService.createSchool(school);
    }
    
    // READ
    @GetMapping("/getAllSchools")
    public List<SchoolEntity> getAllSchools() {
        return schoolService.getAllSchools();
    }
    
    // Get school by ID
    @GetMapping("/getSchool/{schoolId}")
    public SchoolEntity getSchoolById(@PathVariable int schoolId) {
        return schoolService.getSchoolById(schoolId)
                .orElse(null);
    }
    
    // Search schools by name
    @GetMapping("/searchSchools")
    public List<SchoolEntity> searchSchools(@RequestParam String name) {
        return schoolService.searchSchoolsByName(name);
    }
    
    // Filter schools by location
    @GetMapping("/filterByLocation")
    public List<SchoolEntity> filterByLocation(@RequestParam String location) {
        return schoolService.filterSchoolsByLocation(location);
    }
    
    // Filter schools by type
    @GetMapping("/filterByType")
    public List<SchoolEntity> filterByType(@RequestParam String type) {
        return schoolService.filterSchoolsByType(type);
    }
    
    // UPDATE
    @PutMapping("/putSchoolDetails")
    public SchoolEntity putSchoolDetails(@RequestParam int schoolId, @RequestBody SchoolEntity newSchoolDetails) {
        newSchoolDetails.setSchoolId(schoolId);
        return schoolService.updateSchool(newSchoolDetails);
    }
    
    // DELETE
    @DeleteMapping("/deleteSchoolDetails/{schoolId}")
    public String deleteSchool(@PathVariable int schoolId) {
        boolean deleted = schoolService.deleteSchool(schoolId);
        return deleted ? "School with ID " + schoolId + " successfully deleted" : "School with ID " + schoolId + " not found";
    }
}
