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

import edu.cit.futureu.entity.AccreditationEntity;
import edu.cit.futureu.entity.SchoolEntity;
import edu.cit.futureu.service.AccreditationService;
import edu.cit.futureu.service.SchoolService;

@RestController
@RequestMapping(method=RequestMethod.GET, path="/api/accreditation")
public class AccreditationController {
    
    @Autowired
    private AccreditationService accreditationService;
    
    @Autowired
    private SchoolService schoolService;
    
    @GetMapping("/test")
    public String test() {
        return "Accreditation API is working!";
    }

    // CREATE
    @PostMapping("/postAccreditationRecord")
    public AccreditationEntity postAccreditationRecord(@RequestBody AccreditationEntity accreditation) {
        return accreditationService.createAccreditation(accreditation);
    }
    
    // READ
    @GetMapping("/getAllAccreditations")
    public List<AccreditationEntity> getAllAccreditations() {
        return accreditationService.getAllAccreditations();
    }
    
    // Get accreditation by ID
    @GetMapping("/getAccreditation/{accredId}")
    public AccreditationEntity getAccreditationById(@PathVariable int accredId) {
        return accreditationService.getAccreditationById(accredId)
                .orElse(null);
    }
    
    // Get accreditations by school ID
    @GetMapping("/getAccreditationsBySchool/{schoolId}")
    public List<AccreditationEntity> getAccreditationsBySchool(@PathVariable int schoolId) {
        SchoolEntity school = schoolService.getSchoolById(schoolId).orElse(null);
        if (school != null) {
            return accreditationService.getAccreditationsBySchool(school);
        }
        return List.of(); // Return empty list if school not found
    }
    
    // Search accreditations by title
    @GetMapping("/searchAccreditations")
    public List<AccreditationEntity> searchAccreditations(@RequestParam String title) {
        return accreditationService.searchAccreditationsByTitle(title);
    }
    
    // UPDATE
    @PutMapping("/putAccreditationDetails")
    public AccreditationEntity putAccreditationDetails(@RequestParam int accredId, @RequestBody AccreditationEntity newAccreditationDetails) {
        newAccreditationDetails.setAccredId(accredId);
        return accreditationService.updateAccreditation(newAccreditationDetails);
    }
    
    // DELETE
    @DeleteMapping("/deleteAccreditationDetails/{accredId}")
    public String deleteAccreditation(@PathVariable int accredId) {
        boolean deleted = accreditationService.deleteAccreditation(accredId);
        return deleted ? "Accreditation with ID " + accredId + " successfully deleted" : "Accreditation with ID " + accredId + " not found";
    }
}
