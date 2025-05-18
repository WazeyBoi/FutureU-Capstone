package edu.cit.futureu.controller;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import edu.cit.futureu.entity.SchoolEntity;
import edu.cit.futureu.entity.TestimonyEntity;
import edu.cit.futureu.entity.UserEntity;
import edu.cit.futureu.repository.UserRepository;
import edu.cit.futureu.service.SchoolService;
import edu.cit.futureu.service.TestimonyService;
import edu.cit.futureu.service.UserService;

@RestController
@CrossOrigin(origins = "*", maxAge = 3600)
@RequestMapping(path="/api/testimony")
public class TestimonyController {
    
    @Autowired
    private TestimonyService testimonyService;
    
    @Autowired
    private SchoolService schoolService;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private UserRepository userRepository;
    
    /**
     * Helper method to get the current authenticated user
     * @return The UserEntity of the authenticated user or null if not authenticated
     */
    private UserEntity getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getName() != null) {
            return userRepository.findByEmail(authentication.getName());
        }
        return null;
    }
    
    /**
     * Check if the current user is the owner of a testimony
     * @param testimonyId The ID of the testimony to check
     * @return True if the current user is the owner, false otherwise
     */
    private boolean isTestimonyOwner(int testimonyId) {
        UserEntity currentUser = getCurrentUser();
        if (currentUser == null) {
            return false;
        }
        
        Optional<TestimonyEntity> testimony = testimonyService.getTestimonyById(testimonyId);
        if (testimony.isPresent() && testimony.get().getStudent() != null) {
            return testimony.get().getStudent().getUserId() == currentUser.getUserId();
        }
        
        return false;
    }
    
    /**
     * Helper method to convert a TestimonyEntity to a Map with the needed fields
     */
    private Map<String, Object> convertToMap(TestimonyEntity testimony) {
        Map<String, Object> map = new HashMap<>();
        
        // Add testimony data
        map.put("testimonyId", testimony.getTestimonyId());
        map.put("description", testimony.getDescription());
        map.put("rating", testimony.getRating());
        
        // Add school data
        if (testimony.getSchool() != null) {
            map.put("schoolId", testimony.getSchool().getSchoolId());
            map.put("schoolName", testimony.getSchool().getName());
        }
        
        // Add student data
        if (testimony.getStudent() != null) {
            map.put("studentId", testimony.getStudent().getUserId());
            map.put("studentFirstName", testimony.getStudent().getFirstName());
            map.put("studentLastName", testimony.getStudent().getLastname());
            map.put("userId", testimony.getStudent().getUserId()); // Add userId for ownership check on client side
        }
        
        return map;
    }
    
    @GetMapping("/test")
    public String test() {
        return "Testimony API is working!";
    }

    // CREATE
    @PostMapping(value = "/postTestimonyRecord", consumes = MediaType.APPLICATION_JSON_VALUE)
    public TestimonyEntity postTestimonyRecord(@RequestBody TestimonyEntity testimony) {
        return testimonyService.createTestimony(testimony);
    }
    
    // READ - Updated to return mapped data
    @GetMapping("/getAllTestimonies")
    public List<Map<String, Object>> getAllTestimonies() {
        List<TestimonyEntity> testimonies = testimonyService.getAllTestimonies();
        return testimonies.stream()
                .map(this::convertToMap)
                .collect(Collectors.toList());
    }
    
    // Get testimony by ID - Updated to return mapped data
    @GetMapping("/getTestimony/{testimonyId}")
    public ResponseEntity<?> getTestimonyById(@PathVariable int testimonyId) {
        return testimonyService.getTestimonyById(testimonyId)
                .map(this::convertToMap)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    // Get testimonies by school ID - Updated to return mapped data
    @GetMapping("/getTestimoniesBySchool/{schoolId}")
    public ResponseEntity<?> getTestimoniesBySchool(@PathVariable int schoolId) {
        SchoolEntity school = schoolService.getSchoolById(schoolId).orElse(null);
        if (school != null) {
            List<TestimonyEntity> testimonies = testimonyService.getTestimoniesBySchool(school);
            List<Map<String, Object>> responseList = testimonies.stream()
                    .map(this::convertToMap)
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(responseList);
        }
        return ResponseEntity.ok(Collections.emptyList());
    }
    
    // Get testimonies by student ID - Updated to return mapped data
    @GetMapping("/getTestimoniesByStudent/{userId}")
    public ResponseEntity<?> getTestimoniesByStudent(@PathVariable int userId) {
        UserEntity user = userService.getUserById(userId).orElse(null);
        if (user != null) {
            List<TestimonyEntity> testimonies = testimonyService.getTestimoniesByStudent(user);
            List<Map<String, Object>> responseList = testimonies.stream()
                    .map(this::convertToMap)
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(responseList);
        }
        return ResponseEntity.ok(Collections.emptyList());
    }
    
    // UPDATE - Added authorization check
    @PutMapping(value = "/putTestimonyDetails", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> putTestimonyDetails(@RequestParam int testimonyId, @RequestBody TestimonyEntity newTestimonyDetails) {
        // Check if the current user is the owner of the testimony
        if (!isTestimonyOwner(testimonyId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("You can only update your own testimonials");
        }
        
        newTestimonyDetails.setTestimonyId(testimonyId);
        TestimonyEntity updatedTestimony = testimonyService.updateTestimony(newTestimonyDetails);
        return ResponseEntity.ok(updatedTestimony);
    }
    
    // DELETE - Added authorization check
    @DeleteMapping("/deleteTestimonyDetails/{testimonyId}")
    public ResponseEntity<?> deleteTestimony(@PathVariable int testimonyId) {
        // Check if the current user is the owner of the testimony
        if (!isTestimonyOwner(testimonyId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("You can only delete your own testimonials");
        }
        
        boolean deleted = testimonyService.deleteTestimony(testimonyId);
        if (deleted) {
            return ResponseEntity.ok("Testimony with ID " + testimonyId + " successfully deleted");
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Testimony with ID " + testimonyId + " not found");
        }
    }

    /**
     * Get average rating by school
     * @param schoolId The ID of the school
     * @return The average rating for the specified school
     */
    @GetMapping("/getAverageRatingBySchool/{schoolId}")
    public ResponseEntity<?> getAverageRatingBySchool(@PathVariable int schoolId) {
        try {
            // Get the school entity
            Optional<SchoolEntity> schoolOptional = schoolService.getSchoolById(schoolId);
            if (!schoolOptional.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("School with ID " + schoolId + " not found");
            }
            
            SchoolEntity school = schoolOptional.get();
            List<TestimonyEntity> testimonies = testimonyService.getTestimoniesBySchool(school);
            
            // Calculate average rating if there are any testimonies with ratings
            double averageRating = 0.0;
            long ratingCount = 0;
            
            for (TestimonyEntity testimony : testimonies) {
                if (testimony.getRating() != null) {
                    averageRating += testimony.getRating();
                    ratingCount++;
                }
            }
            
            if (ratingCount > 0) {
                averageRating = averageRating / ratingCount;
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("schoolId", schoolId);
            response.put("averageRating", averageRating);
            response.put("ratingCount", ratingCount);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching average rating: " + e.getMessage());
        }
    }
    
    /**
     * Get all school ratings (to get averages for all schools at once)
     * @return Map of school IDs to their average ratings
     */
    @GetMapping("/getAllSchoolRatings")
    public ResponseEntity<?> getAllSchoolRatings() {
        try {
            List<SchoolEntity> schools = schoolService.getAllSchools();
            Map<Integer, Map<String, Object>> schoolRatings = new HashMap<>();
            
            for (SchoolEntity school : schools) {
                int schoolId = school.getSchoolId();
                List<TestimonyEntity> testimonies = testimonyService.getTestimoniesBySchool(school);
                
                double averageRating = 0.0;
                long ratingCount = 0;
                
                for (TestimonyEntity testimony : testimonies) {
                    if (testimony.getRating() != null) {
                        averageRating += testimony.getRating();
                        ratingCount++;
                    }
                }
                
                if (ratingCount > 0) {
                    averageRating = averageRating / ratingCount;
                }
                
                Map<String, Object> ratingInfo = new HashMap<>();
                ratingInfo.put("averageRating", averageRating);
                ratingInfo.put("ratingCount", ratingCount);
                ratingInfo.put("schoolName", school.getName());
                
                schoolRatings.put(schoolId, ratingInfo);
            }
            
            return ResponseEntity.ok(schoolRatings);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching school ratings: " + e.getMessage());
        }
    }

    // Get average rating for a school
    @GetMapping("/getSchoolAverageRating/{schoolId}")
    public ResponseEntity<?> getSchoolAverageRating(@PathVariable int schoolId) {
        SchoolEntity school = schoolService.getSchoolById(schoolId).orElse(null);
        if (school != null) {
            List<TestimonyEntity> testimonies = testimonyService.getTestimoniesBySchool(school);
            
            // Calculate average rating
            double averageRating = 0.0;
            int ratingCount = 0;
            
            for (TestimonyEntity testimony : testimonies) {
                if (testimony.getRating() != null && testimony.getRating() > 0) {
                    averageRating += testimony.getRating();
                    ratingCount++;
                }
            }
            
            if (ratingCount > 0) {
                averageRating = averageRating / ratingCount;
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("schoolId", schoolId);
            response.put("averageRating", averageRating);
            response.put("ratingCount", ratingCount);
            
            return ResponseEntity.ok(response);
        }
        
        return ResponseEntity.notFound().build();
    }
}
