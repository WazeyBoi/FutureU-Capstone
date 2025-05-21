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
import edu.cit.futureu.entity.SchoolProgramEntity;
import edu.cit.futureu.service.AccreditationService;
import edu.cit.futureu.service.SchoolProgramService;

@RestController
@RequestMapping(method=RequestMethod.GET, path="/api/accreditation")
public class AccreditationController {
    
    @Autowired
    private AccreditationService accreditationService;
    
    @Autowired
    private SchoolProgramService schoolProgramService;
    
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
    
    // Get accreditations by school program ID
    @GetMapping("/getAccreditationsBySchoolProgram/{schoolProgramId}")
    public List<AccreditationEntity> getAccreditationsBySchoolProgram(@PathVariable int schoolProgramId) {
        SchoolProgramEntity schoolProgram = schoolProgramService.getSchoolProgramById(schoolProgramId).orElse(null);
        if (schoolProgram != null) {
            return accreditationService.getAccreditationsBySchoolProgram(schoolProgram);
        }
        return List.of(); // Return empty list if school program not found
    }
    
    // Search accreditations by title
    @GetMapping("/searchAccreditations")
    public List<AccreditationEntity> searchAccreditations(@RequestParam String title) {
        return accreditationService.searchAccreditationsByTitle(title);
    }
    
    // Get accreditations by recognition status
    @GetMapping("/getByRecognitionStatus")
    public List<AccreditationEntity> getAccreditationsByRecognitionStatus(@RequestParam String status) {
        return accreditationService.getAccreditationsByRecognitionStatus(status);
    }
    
    // Get accreditations by accrediting body
    @GetMapping("/getByAccreditingBody")
    public List<AccreditationEntity> getAccreditationsByAccreditingBody(@RequestParam String body) {
        return accreditationService.getAccreditationsByAccreditingBody(body);
    }
    
    // Get accreditations by accreditation level
    @GetMapping("/getByAccreditationLevel")
    public List<AccreditationEntity> getAccreditationsByAccreditationLevel(@RequestParam String level) {
        return accreditationService.getAccreditationsByAccreditationLevel(level);
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
