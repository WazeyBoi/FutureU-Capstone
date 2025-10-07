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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import edu.cit.futureu.entity.CareerPathEntity;
import edu.cit.futureu.service.CareerPathService;

@RestController
@RequestMapping("/api/careerpath")
public class CareerPathController {
    
    @Autowired
    private CareerPathService careerPathService;
    
    @GetMapping("/test")
    public String test() {
        return "CareerPath API is working!";
    }
    
    // CREATE
    @PostMapping("/create")
    public CareerPathEntity createCareerPath(@RequestBody CareerPathEntity careerPath) {
        return careerPathService.createCareerPath(careerPath);
    }

    @PostMapping("/create/bulk")
    public List<CareerPathEntity> createCareerPaths(@RequestBody List<CareerPathEntity> careerPaths) {
        return careerPathService.createCareerPaths(careerPaths);
    }
    
    // READ
    @GetMapping("/getAll")
    public List<CareerPathEntity> getAllCareerPaths() {
        return careerPathService.getAllCareerPaths();
    }
    
    @GetMapping("/get/{careerPathId}")
    public CareerPathEntity getCareerPathById(@PathVariable int careerPathId) {
        return careerPathService.getCareerPathById(careerPathId).orElse(null);
    }
    
    @GetMapping("/search")
    public List<CareerPathEntity> searchCareerPaths(@RequestParam String query, @RequestParam String type) {
        if ("name".equals(type)) {
            return careerPathService.searchCareerPathsByName(query);
        } else if ("description".equals(type)) {
            return careerPathService.searchCareerPathsByDescription(query);
        }
        return List.of();
    }
    
    // UPDATE
    @PutMapping("/update")
    public CareerPathEntity updateCareerPath(@RequestBody CareerPathEntity careerPath) {
        return careerPathService.updateCareerPath(careerPath);
    }
    
    // DELETE
    @DeleteMapping("/delete/{careerPathId}")
    public String deleteCareerPath(@PathVariable int careerPathId) {
        boolean deleted = careerPathService.deleteCareerPath(careerPathId);
        return deleted ? "Career path deleted successfully" : "Career path not found";
    }
}