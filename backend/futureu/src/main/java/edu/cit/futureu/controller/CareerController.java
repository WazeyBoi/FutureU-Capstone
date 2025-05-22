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
import edu.cit.futureu.service.CareerProgramService;
import edu.cit.futureu.service.CareerService;
import edu.cit.futureu.service.ProgramService;

@RestController
@RequestMapping(method=RequestMethod.GET, path="/api/career")
public class CareerController {
    
    @Autowired
    private CareerService careerService;
    
    @Autowired
    private ProgramService programService;
    
    @Autowired
    private CareerProgramService careerProgramService;
    
    @GetMapping("/test")
    public String test() {
        return "Career API is working!";
    }
    
    // Class to handle career data with program association
    public static class CareerDTO {
        private CareerEntity career;
        private Integer programId;
        
        public CareerEntity getCareer() {
            return career;
        }
        
        public void setCareer(CareerEntity career) {
            this.career = career;
        }
        
        public Integer getProgramId() {
            return programId;
        }
        
        public void setProgramId(Integer programId) {
            this.programId = programId;
        }
    }

    // CREATE
    @PostMapping("/postCareerRecord")
    public CareerEntity postCareerRecord(@RequestBody CareerDTO careerDTO) {
        // Save the career first
        CareerEntity savedCareer = careerService.createCareer(careerDTO.getCareer());
        
        // Create association with program if program ID is provided
        if (careerDTO.getProgramId() != null) {
            careerProgramService.associateCareerWithProgram(
                savedCareer.getCareerId(), careerDTO.getProgramId());
        }
        
        // Fetch the updated career with its program association
        return careerService.getCareerById(savedCareer.getCareerId()).orElse(savedCareer);
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
    
    // Updated to filter by salary String
    @GetMapping("/filterBySalary")
    public List<CareerEntity> filterBySalary(@RequestParam String salary) {
        return careerService.filterCareersBySalary(salary);
    }
    
    // New endpoint to filter by career description
    @GetMapping("/filterByDescription")
    public List<CareerEntity> filterByDescription(@RequestParam String description) {
        return careerService.filterCareersByDescription(description);
    }
    
    // UPDATE
    @PutMapping("/putCareerDetails")
    public CareerEntity putCareerDetails(@RequestParam int careerId, @RequestBody CareerDTO careerDTO) {
        // Set the career ID from path parameter
        careerDTO.getCareer().setCareerId(careerId);
        
        // Update career details
        CareerEntity updatedCareer = careerService.updateCareer(careerDTO.getCareer());
        
        if (updatedCareer != null) {
            // Handle program association update
            if (careerDTO.getProgramId() != null) {
                // Remove existing associations first (to avoid duplicates)
                List<ProgramEntity> existingPrograms = careerProgramService.getProgramsByCareer(careerId);
                for (ProgramEntity existingProgram : existingPrograms) {
                    careerProgramService.deleteAssociation(careerId, existingProgram.getProgramId());
                }
                
                // Create new association
                careerProgramService.associateCareerWithProgram(careerId, careerDTO.getProgramId());
            }
            
            // Return updated career with refreshed data
            return careerService.getCareerById(careerId).orElse(updatedCareer);
        }
        
        return null;
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
