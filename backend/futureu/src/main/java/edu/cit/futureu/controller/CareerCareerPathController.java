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

import edu.cit.futureu.entity.CareerCareerPathEntity;
import edu.cit.futureu.entity.CareerEntity;
import edu.cit.futureu.entity.CareerPathEntity;
import edu.cit.futureu.service.CareerCareerPathService;

@RestController
@RequestMapping("/api/career-career-path")
public class CareerCareerPathController {
    
    @Autowired
    private CareerCareerPathService careerCareerPathService;
    
    @GetMapping("/test")
    public String test() {
        return "Career-CareerPath API is working!";
    }
    
    // CREATE ASSOCIATION
    @PostMapping("/associate")
    public ResponseEntity<?> associateCareerWithCareerPath(
            @RequestParam int careerId, 
            @RequestParam int careerPathId) {
        try {
            CareerCareerPathEntity association = careerCareerPathService.associateCareerWithCareerPath(careerId, careerPathId);
            return ResponseEntity.ok(association);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // GET ALL ASSOCIATIONS
    @GetMapping("/getAllAssociations")
    public List<CareerCareerPathEntity> getAllAssociations() {
        return careerCareerPathService.getAllAssociations();
    }
    
    // GET CAREER PATHS BY CAREER
    @GetMapping("/getCareerPathsByCareer/{careerId}")
    public List<CareerPathEntity> getCareerPathsByCareer(@PathVariable int careerId) {
        return careerCareerPathService.getCareerPathsByCareer(careerId);
    }
    
    // GET CAREERS BY CAREER PATH
    @GetMapping("/getCareersByCareerPath/{careerPathId}")
    public List<CareerEntity> getCareersByCareerPath(@PathVariable int careerPathId) {
        return careerCareerPathService.getCareersByCareerPath(careerPathId);
    }
    
    // CHECK IF ASSOCIATION EXISTS
    @GetMapping("/exists")
    public ResponseEntity<Map<String, Boolean>> associationExists(
            @RequestParam int careerId, 
            @RequestParam int careerPathId) {
        boolean exists = careerCareerPathService.associationExists(careerId, careerPathId);
        return ResponseEntity.ok(Map.of("exists", exists));
    }
    
    // GET ASSOCIATION BY ID
    @GetMapping("/getAssociation/{id}")
    public ResponseEntity<?> getAssociationById(@PathVariable int id) {
        return careerCareerPathService.getAssociationById(id)
                .map(association -> ResponseEntity.ok(association))
                .orElse(ResponseEntity.notFound().build());
    }
    
    // REMOVE ASSOCIATION
    @DeleteMapping("/removeAssociation")
    public ResponseEntity<Map<String, String>> removeCareerFromCareerPath(
            @RequestParam int careerId, 
            @RequestParam int careerPathId) {
        boolean removed = careerCareerPathService.removeCareerFromCareerPath(careerId, careerPathId);
        
        if (removed) {
            return ResponseEntity.ok(Map.of(
                "message", 
                "Association between career " + careerId + " and career path " + careerPathId + " removed successfully"
            ));
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    // DELETE ASSOCIATION BY ID
    @DeleteMapping("/deleteAssociation/{id}")
    public ResponseEntity<Map<String, String>> deleteAssociation(@PathVariable int id) {
        boolean deleted = careerCareerPathService.deleteAssociation(id);
        
        if (deleted) {
            return ResponseEntity.ok(Map.of("message", "Association with ID " + id + " deleted successfully"));
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    // REMOVE ALL ASSOCIATIONS FOR A CAREER
    @DeleteMapping("/removeAllForCareer/{careerId}")
    public ResponseEntity<Map<String, String>> removeAllAssociationsForCareer(@PathVariable int careerId) {
        careerCareerPathService.removeAllAssociationsForCareer(careerId);
        return ResponseEntity.ok(Map.of("message", "All associations for career " + careerId + " removed successfully"));
    }
    
    // REMOVE ALL ASSOCIATIONS FOR A CAREER PATH
    @DeleteMapping("/removeAllForCareerPath/{careerPathId}")
    public ResponseEntity<Map<String, String>> removeAllAssociationsForCareerPath(@PathVariable int careerPathId) {
        careerCareerPathService.removeAllAssociationsForCareerPath(careerPathId);
        return ResponseEntity.ok(Map.of("message", "All associations for career path " + careerPathId + " removed successfully"));
    }
}