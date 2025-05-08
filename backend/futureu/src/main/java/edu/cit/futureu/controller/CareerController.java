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

import edu.cit.futureu.entity.CareerEntity;
import edu.cit.futureu.entity.ProgramEntity;
import edu.cit.futureu.service.CareerService;
import edu.cit.futureu.service.ProgramService;

@RestController
@RequestMapping(method=RequestMethod.GET, path="/api/career")
public class CareerController {
    
    @Autowired
    private CareerService careerService;
    
    @Autowired
    private ProgramService programService;
    
    @GetMapping("/test")
    public String test() {
        return "Career API is working!";
    }

    // CREATE
    @PostMapping("/postCareerRecord")
    public CareerEntity postCareerRecord(@RequestBody CareerEntity career) {
        return careerService.createCareer(career);
    }
    
    // READ
    @GetMapping("/getAllCareers")
    public List<CareerEntity> getAllCareers() {
        return careerService.getAllCareers();
    }
    
    // Get career by ID
    @GetMapping("/getCareer/{careerId}")
    public CareerEntity getCareerById(@PathVariable int careerId) {
        return careerService.getCareerById(careerId)
                .orElse(null);
    }
    
    // Get careers by program ID
    @GetMapping("/getCareersByProgram/{programId}")
    public List<CareerEntity> getCareersByProgram(@PathVariable int programId) {
        ProgramEntity program = programService.getProgramById(programId).orElse(null);
        if (program != null) {
            return careerService.getCareersByProgram(program);
        }
        return List.of(); // Return empty list if program not found
    }
    
    // Search careers by title
    @GetMapping("/searchCareers")
    public List<CareerEntity> searchCareers(@RequestParam String title) {
        return careerService.searchCareersByTitle(title);
    }
    
    // Filter careers by industry
    @GetMapping("/filterByIndustry")
    public List<CareerEntity> filterByIndustry(@RequestParam String industry) {
        return careerService.filterCareersByIndustry(industry);
    }
    
    // Filter careers by job trend
    @GetMapping("/filterByJobTrend")
    public List<CareerEntity> filterByJobTrend(@RequestParam String jobTrend) {
        return careerService.filterCareersByJobTrend(jobTrend);
    }
    
    // Filter careers by salary range
    @GetMapping("/filterBySalaryRange")
    public List<CareerEntity> filterBySalaryRange(
            @RequestParam double minSalary, 
            @RequestParam double maxSalary) {
        return careerService.filterCareersBySalaryRange(minSalary, maxSalary);
    }
    
    // UPDATE
    @PutMapping("/putCareerDetails")
    public CareerEntity putCareerDetails(@RequestParam int careerId, @RequestBody CareerEntity newCareerDetails) {
        newCareerDetails.setCareerId(careerId);
        return careerService.updateCareer(newCareerDetails);
    }
    
    // DELETE
    @DeleteMapping("/deleteCareerDetails/{careerId}")
    public String deleteCareer(@PathVariable int careerId) {
        boolean deleted = careerService.deleteCareer(careerId);
        return deleted ? 
                "Career with ID " + careerId + " successfully deleted" : 
                "Career with ID " + careerId + " not found";
    }
}
