package edu.cit.futureu.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import edu.cit.futureu.entity.SchoolEntity;
import edu.cit.futureu.entity.TestimonyEntity;
import edu.cit.futureu.entity.UserEntity;
import edu.cit.futureu.repository.TestimonyRepository;
import edu.cit.futureu.repository.SchoolRepository;
import edu.cit.futureu.repository.UserRepository;

@Service
public class TestimonyService {

    @Autowired
    private TestimonyRepository testimonyRepository;
    
    @Autowired
    private SchoolRepository schoolRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    // Create operations
    public TestimonyEntity createTestimony(TestimonyEntity testimony) {
        return testimonyRepository.save(testimony);
    }
    
    // Read operations
    public List<TestimonyEntity> getAllTestimonies() {
        List<TestimonyEntity> testimonies = testimonyRepository.findAll();
        
        // Ensure student and school entities are fully loaded
        for (TestimonyEntity testimony : testimonies) {
            if (testimony.getStudent() != null && testimony.getStudent().getUserId() > 0) {
                UserEntity student = userRepository.findById(testimony.getStudent().getUserId()).orElse(null);
                testimony.setStudent(student);
            }
            
            if (testimony.getSchool() != null && testimony.getSchool().getSchoolId() > 0) {
                SchoolEntity school = schoolRepository.findById(testimony.getSchool().getSchoolId()).orElse(null);
                testimony.setSchool(school);
            }
        }
        
        return testimonies;
    }
    
    public Optional<TestimonyEntity> getTestimonyById(int id) {
        Optional<TestimonyEntity> testimony = testimonyRepository.findById(id);
        
        // If present, ensure student and school are fully loaded
        if (testimony.isPresent()) {
            TestimonyEntity entity = testimony.get();
            
            if (entity.getStudent() != null && entity.getStudent().getUserId() > 0) {
                UserEntity student = userRepository.findById(entity.getStudent().getUserId()).orElse(null);
                entity.setStudent(student);
            }
            
            if (entity.getSchool() != null && entity.getSchool().getSchoolId() > 0) {
                SchoolEntity school = schoolRepository.findById(entity.getSchool().getSchoolId()).orElse(null);
                entity.setSchool(school);
            }
        }
        
        return testimony;
    }
    
    public List<TestimonyEntity> getTestimoniesBySchool(SchoolEntity school) {
        List<TestimonyEntity> testimonies = testimonyRepository.findBySchool(school);
        
        // For each testimony, ensure the student is fully loaded with all attributes
        for (TestimonyEntity testimony : testimonies) {
            if (testimony.getStudent() != null && testimony.getStudent().getUserId() > 0) {
                // Fetch the complete student entity
                UserEntity student = userRepository.findById(testimony.getStudent().getUserId()).orElse(null);
                if (student != null) {
                    testimony.setStudent(student);
                }
            }
            
            // Make sure school is also properly populated
            testimony.setSchool(school);
        }
        
        return testimonies;
    }
    
    public List<TestimonyEntity> getTestimoniesByStudent(UserEntity student) {
        List<TestimonyEntity> testimonies = testimonyRepository.findByStudent(student);
        
        // For each testimony, ensure the school is fully loaded
        for (TestimonyEntity testimony : testimonies) {
            if (testimony.getSchool() != null && testimony.getSchool().getSchoolId() > 0) {
                SchoolEntity school = schoolRepository.findById(testimony.getSchool().getSchoolId()).orElse(null);
                if (school != null) {
                    testimony.setSchool(school);
                }
            }
            
            // Make sure student is also properly populated
            testimony.setStudent(student);
        }
        
        return testimonies;
    }
    
    // Update operations
    public TestimonyEntity updateTestimony(TestimonyEntity testimony) {
        if (!testimonyRepository.existsById(testimony.getTestimonyId())) {
            return null; // Testimony not found
        }
        
        // Get the existing testimony to retain relationships if not provided
        TestimonyEntity existingTestimony = testimonyRepository.findById(testimony.getTestimonyId()).orElse(null);
        if (existingTestimony == null) {
            return null;
        }
        
        // Ensure school is not null - use existing if new one is not provided
        if (testimony.getSchool() == null || testimony.getSchool().getSchoolId() == 0) {
            testimony.setSchool(existingTestimony.getSchool());
        } else {
            // Fetch actual school entity from database to prevent transient entity errors
            SchoolEntity school = schoolRepository.findById(testimony.getSchool().getSchoolId()).orElse(null);
            if (school != null) {
                testimony.setSchool(school);
            } else {
                testimony.setSchool(existingTestimony.getSchool());
            }
        }
        
        // Ensure student is not null - use existing if new one is not provided
        if (testimony.getStudent() == null || testimony.getStudent().getUserId() == 0) {
            testimony.setStudent(existingTestimony.getStudent());
        } else {
            // Fetch actual user entity from database to prevent transient entity errors
            UserEntity student = userRepository.findById(testimony.getStudent().getUserId()).orElse(null);
            if (student != null) {
                testimony.setStudent(student);
            } else {
                testimony.setStudent(existingTestimony.getStudent());
            }
        }
        
        // Update only the fields that can be changed
        existingTestimony.setDescription(testimony.getDescription());
        
        // Update rating if provided
        if (testimony.getRating() != null) {
            existingTestimony.setRating(testimony.getRating());
        }
        
        return testimonyRepository.save(existingTestimony);
    }
    
    // Delete operations
    public boolean deleteTestimony(int id) {
        if (testimonyRepository.existsById(id)) {
            testimonyRepository.deleteById(id);
            return true;
        }
        return false; // Testimony not found
    }
}
