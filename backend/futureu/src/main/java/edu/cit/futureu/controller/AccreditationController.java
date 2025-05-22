package edu.cit.futureu.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
import edu.cit.futureu.entity.SchoolProgramEntity;
import edu.cit.futureu.service.AccreditationService;
import edu.cit.futureu.service.SchoolProgramService;
import edu.cit.futureu.service.SchoolService;

@RestController
@RequestMapping(method=RequestMethod.GET, path="/api/accreditation")
public class AccreditationController {
    
    @Autowired
    private AccreditationService accreditationService;
    
    @Autowired
    private SchoolService schoolService;
    
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
    
    // Get by ID
    @GetMapping("/getAccreditation/{accredId}")
    public AccreditationEntity getAccreditationById(@PathVariable int accredId) {
        return accreditationService.getAccreditationById(accredId)
                .orElse(null);
    }
    
    // Get accreditations by school
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

    // Get accreditations by recognition status
    @GetMapping("/getByRecognitionStatus")
    public List<AccreditationEntity> getByRecognitionStatus(@RequestParam String status) {
        return accreditationService.getAccreditationsByRecognitionStatus(status);
    }
    
    // Get accreditations by accrediting body
    @GetMapping("/getByAccreditingBody")
    public List<AccreditationEntity> getByAccreditingBody(@RequestParam String body) {
        return accreditationService.getAccreditationsByAccreditingBody(body);
    }
    
    // Get accreditations by accreditation level
    @GetMapping("/getByAccreditationLevel")
    public List<AccreditationEntity> getByAccreditationLevel(@RequestParam String level) {
        return accreditationService.getAccreditationsByAccreditationLevel(level);
    }
    
    // UPDATE
    @PutMapping("/putAccreditationDetails")
    public AccreditationEntity putAccreditationDetails(
            @RequestParam int accredId, 
            @RequestBody AccreditationEntity newAccreditationDetails) {
        newAccreditationDetails.setAccredId(accredId);
        return accreditationService.updateAccreditation(newAccreditationDetails);
    }
    
    // DELETE
    @DeleteMapping("/deleteAccreditationDetails/{accredId}")
    public String deleteAccreditation(@PathVariable int accredId) {
        boolean deleted = accreditationService.deleteAccreditation(accredId);
        return deleted ? 
                "Accreditation with ID " + accredId + " successfully deleted" : 
                "Accreditation with ID " + accredId + " not found";
    }
    
    // NEW ENDPOINT: Assign accreditation to school programs
    @PostMapping("/assignToSchoolPrograms")
    public ResponseEntity<?> assignAccreditationToSchoolPrograms(
            @RequestParam int accredId,
            @RequestParam int schoolId,
            @RequestParam(required = false) Integer programId) {
        
        try {
            // Get the accreditation
            AccreditationEntity accreditation = accreditationService.getAccreditationById(accredId)
                    .orElseThrow(() -> new Exception("Accreditation not found with ID: " + accredId));
            
            // Get the school
            SchoolEntity school = schoolService.getSchoolById(schoolId)
                    .orElseThrow(() -> new Exception("School not found with ID: " + schoolId));
            
            // Get the school programs
            List<SchoolProgramEntity> programs;
            
            if (programId != null) {
                // Only get a specific program
                SchoolProgramEntity specific = schoolProgramService.getSchoolProgramById(programId)
                        .orElse(null);
                
                if (specific != null && specific.getSchool().getSchoolId() == schoolId) {
                    programs = List.of(specific);
                } else {
                    return ResponseEntity.badRequest().body("Invalid program ID or program doesn't belong to the specified school");
                }
            } else {
                // Get all programs for this school
                programs = schoolProgramService.getSchoolProgramsBySchool(school);
            }
            
            // Update each program with the accreditation
            int updatedCount = 0;
            for (SchoolProgramEntity program : programs) {
                program.setAccreditation(accreditation);
                schoolProgramService.updateSchoolProgram(program);
                updatedCount++;
            }
            
            return ResponseEntity.ok("Successfully assigned accreditation to " + updatedCount + " program(s)");
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error assigning accreditation: " + e.getMessage());
        }
    }
}
