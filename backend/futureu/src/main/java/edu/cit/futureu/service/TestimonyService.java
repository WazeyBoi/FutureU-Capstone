package edu.cit.futureu.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import edu.cit.futureu.entity.SchoolEntity;
import edu.cit.futureu.entity.TestimonyEntity;
import edu.cit.futureu.entity.UserEntity;
import edu.cit.futureu.repository.TestimonyRepository;

@Service
public class TestimonyService {

    @Autowired
    private TestimonyRepository testimonyRepository;
    
    // Create operations
    public TestimonyEntity createTestimony(TestimonyEntity testimony) {
        return testimonyRepository.save(testimony);
    }
    
    // Read operations
    public List<TestimonyEntity> getAllTestimonies() {
        return testimonyRepository.findAll();
    }
    
    public Optional<TestimonyEntity> getTestimonyById(int id) {
        return testimonyRepository.findById(id);
    }
    
    public List<TestimonyEntity> getTestimoniesBySchool(SchoolEntity school) {
        return testimonyRepository.findBySchool(school);
    }
    
    public List<TestimonyEntity> getTestimoniesByStudent(UserEntity student) {
        return testimonyRepository.findByStudent(student);
    }
    
    // Update operations
    public TestimonyEntity updateTestimony(TestimonyEntity testimony) {
        if (testimonyRepository.existsById(testimony.getTestimonyId())) {
            return testimonyRepository.save(testimony);
        }
        return null; // Testimony not found
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
