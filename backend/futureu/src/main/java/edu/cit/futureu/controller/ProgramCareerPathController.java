package edu.cit.futureu.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import edu.cit.futureu.entity.CareerPathEntity;
import edu.cit.futureu.entity.ProgramCareerPathEntity;
import edu.cit.futureu.entity.ProgramEntity;
import edu.cit.futureu.service.ProgramCareerPathService;

@RestController
@RequestMapping("/api/program-career-path")
public class ProgramCareerPathController {
    
    @Autowired
    private ProgramCareerPathService programCareerPathService;
    
    @GetMapping("/test")
    public String test() {
        return "Program-CareerPath API is working!";
    }
    
    // CREATE ASSOCIATION
    @PostMapping("/associate")
    public ResponseEntity<?> associateProgramWithCareerPath(
            @RequestParam int programId, 
            @RequestParam int careerPathId) {
        try {
            ProgramCareerPathEntity association = programCareerPathService.associateProgramWithCareerPath(programId, careerPathId);
            return ResponseEntity.ok(association);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // GET ALL ASSOCIATIONS
    @GetMapping("/getAllAssociations")
    public List<ProgramCareerPathEntity> getAllAssociations() {
        return programCareerPathService.getAllAssociations();
    }
    
    // GET CAREER PATHS BY PROGRAM
    @GetMapping("/getCareerPathsByProgram/{programId}")
    public List<CareerPathEntity> getCareerPathsByProgram(@PathVariable int programId) {
        return programCareerPathService.getCareerPathsByProgram(programId);
    }
    
    // GET PROGRAMS BY CAREER PATH
    @GetMapping("/getProgramsByCareerPath/{careerPathId}")
    public List<ProgramEntity> getProgramsByCareerPath(@PathVariable int careerPathId) {
        return programCareerPathService.getProgramsByCareerPath(careerPathId);
    }
    
    // DELETE ASSOCIATION
    @DeleteMapping("/deleteAssociation")
    public ResponseEntity<Map<String, String>> deleteAssociation(
            @RequestParam int programId, 
            @RequestParam int careerPathId) {
        boolean deleted = programCareerPathService.deleteAssociation(programId, careerPathId);
        
        if (deleted) {
            return ResponseEntity.ok(Map.of(
                "message", 
                "Association between program " + programId + " and career path " + careerPathId + " deleted successfully"
            ));
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}