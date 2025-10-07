package edu.cit.futureu.controller;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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

import edu.cit.futureu.entity.CareerEntity;
import edu.cit.futureu.entity.CareerPathEntity;
import edu.cit.futureu.entity.ProgramEntity;
import edu.cit.futureu.service.CareerCareerPathService;
import edu.cit.futureu.service.CareerPathService;
import edu.cit.futureu.service.CareerService;
import edu.cit.futureu.service.ProgramCareerPathService;

@RestController
@RequestMapping(method=RequestMethod.GET, path="/api/career")
public class CareerController {
    
    @Autowired
    private CareerService careerService;
    
    @Autowired
    private CareerPathService careerPathService;
    
    @Autowired
    private CareerCareerPathService careerCareerPathService;
    
    @Autowired
    private ProgramCareerPathService programCareerPathService;
    
    @GetMapping("/test")
    public String test() {
        return "Career API is working!";
    }
    
    // Class to handle career data with career path association
    public static class CareerDTO {
        private CareerEntity career;
        private Integer careerPathId;
        
        public CareerEntity getCareer() {
            return career;
        }
        
        public void setCareer(CareerEntity career) {
            this.career = career;
        }
        
        public Integer getCareerPathId() {
            return careerPathId;
        }
        
        public void setCareerPathId(Integer careerPathId) {
            this.careerPathId = careerPathId;
        }
    }

    // CREATE
    @PostMapping("/postCareerRecord")
    public CareerEntity postCareerRecord(@RequestBody CareerDTO careerDTO) {
        // Save the career first
        CareerEntity savedCareer = careerService.createCareer(careerDTO.getCareer());
        
        // Create association with career path if career path ID is provided
        if (careerDTO.getCareerPathId() != null) {
            careerCareerPathService.associateCareerWithCareerPath(
                savedCareer.getCareerId(), careerDTO.getCareerPathId());
        }
        
        // Fetch the updated career with its career path association
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
    
    // Get careers by career path ID
    @GetMapping("/getCareersByCareerPath/{careerPathId}")
    public List<CareerEntity> getCareersByCareerPath(@PathVariable int careerPathId) {
        return careerCareerPathService.getCareersByCareerPath(careerPathId);
    }
    
    // Search careers by title
    @GetMapping("/searchCareers")
    public List<CareerEntity> searchCareers(@RequestParam String title) {
        return careerService.searchCareersByTitle(title);
    }
    
    // Filter by industry
    @GetMapping("/filterByIndustry")
    public List<CareerEntity> filterByIndustry(@RequestParam String industry) {
        return careerService.filterCareersByIndustry(industry);
    }
    
    // Filter by job trend
    @GetMapping("/filterByJobTrend")
    public List<CareerEntity> filterByJobTrend(@RequestParam String jobTrend) {
        return careerService.filterCareersByJobTrend(jobTrend);
    }
    
    // Filter by salary
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
            // Handle career path association update
            if (careerDTO.getCareerPathId() != null) {
                careerCareerPathService.associateCareerWithCareerPath(careerId, careerDTO.getCareerPathId());
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
        return deleted ? "Career deleted successfully" : "Career not found";
    }
    
    /**
     * Get all programs associated with a career
     * @param careerId - The career ID
     * @return List of programs
     */
    @GetMapping("/getProgramsByCareer/{careerId}")
    public ResponseEntity<List<ProgramEntity>> getProgramsByCareer(@PathVariable int careerId) {
        try {
            List<ProgramEntity> programs = careerService.getProgramsByCareer(careerId);
            return ResponseEntity.ok(programs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Get programs for multiple careers in one request (BATCH)
     * @param careerIds - Comma-separated list of career IDs
     * @return Map of careerId -> List of programs
     */
    @GetMapping("/getProgramsByCareersBatch")
    public ResponseEntity<Map<Integer, List<ProgramEntity>>> getProgramsByCareersBatch(
            @RequestParam String careerIds) {
        try {
            // Parse comma-separated IDs
            List<Integer> ids = Arrays.stream(careerIds.split(","))
                .map(String::trim)
                .map(Integer::parseInt)
                .collect(Collectors.toList());
            
            // Fetch programs for all careers
            Map<Integer, List<ProgramEntity>> result = new HashMap<>();
            for (Integer careerId : ids) {
                List<ProgramEntity> programs = careerService.getProgramsByCareer(careerId);
                result.put(careerId, programs);
            }
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Get career paths and their careers by program ID
     * @param programId - The program ID
     * @return Map of career path name -> List of careers
     */
    @GetMapping("/getCareerPathsByProgram/{programId}")
    public ResponseEntity<Map<String, Object>> getCareerPathsByProgram(@PathVariable int programId) {
        try {
            // Get career paths associated with this program
            List<CareerPathEntity> careerPaths = programCareerPathService.getCareerPathsByProgram(programId);
            
            Map<String, Object> result = new HashMap<>();
            List<Map<String, Object>> careerPathData = new ArrayList<>();
            
            for (CareerPathEntity careerPath : careerPaths) {
                Map<String, Object> pathData = new HashMap<>();
                pathData.put("careerPathId", careerPath.getCareerPathId());
                pathData.put("careerPathName", careerPath.getCareerPathName());
                pathData.put("careerPathDescription", careerPath.getCareerPathDescription());
                
                // Get careers for this career path
                List<CareerEntity> careers = careerCareerPathService.getCareersByCareerPath(careerPath.getCareerPathId());
                pathData.put("careers", careers);
                
                careerPathData.add(pathData);
            }
            
            result.put("programId", programId);
            result.put("careerPaths", careerPathData);
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
