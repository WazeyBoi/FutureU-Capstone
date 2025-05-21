package edu.cit.futureu.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import edu.cit.futureu.entity.CareerEntity;
import edu.cit.futureu.entity.CareerProgramEntity;
import edu.cit.futureu.entity.ProgramEntity;
import edu.cit.futureu.service.CareerProgramService;

@RestController
@RequestMapping(method=RequestMethod.GET, path="/api/careerprogram")
public class CareerProgramController {
    
    @Autowired
    private CareerProgramService careerProgramService;
    
    @GetMapping("/test")
    public String test() {
        return "CareerProgram API is working!";
    }
    
    // Create association between career and program
    @PostMapping("/associate")
    public CareerProgramEntity associateCareerWithProgram(
            @RequestParam int careerId, 
            @RequestParam int programId) {
        return careerProgramService.associateCareerWithProgram(careerId, programId);
    }
    
    // Get all associations
    @GetMapping("/getAllAssociations")
    public List<CareerProgramEntity> getAllAssociations() {
        return careerProgramService.getAllAssociations();
    }
    
    // Get all programs associated with a career
    @GetMapping("/getProgramsByCareer/{careerId}")
    public List<ProgramEntity> getProgramsByCareer(@PathVariable int careerId) {
        return careerProgramService.getProgramsByCareer(careerId);
    }
    
    // Get all careers associated with a program
    @GetMapping("/getCareersByProgram/{programId}")
    public List<CareerEntity> getCareersByProgram(@PathVariable int programId) {
        return careerProgramService.getCareersByProgram(programId);
    }
    
    // Delete association
    @DeleteMapping("/deleteAssociation")
    public String deleteAssociation(
            @RequestParam int careerId, 
            @RequestParam int programId) {
        boolean deleted = careerProgramService.deleteAssociation(careerId, programId);
        return deleted ? 
                "Association between career " + careerId + " and program " + programId + " successfully deleted" : 
                "Association not found";
    }
}
