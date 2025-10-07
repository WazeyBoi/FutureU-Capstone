package edu.cit.futureu.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import edu.cit.futureu.entity.CareerPathEntity;
import edu.cit.futureu.repository.CareerPathRepository;

@Service
public class CareerPathService {
    
    @Autowired
    private CareerPathRepository careerPathRepository;
    
    // Create operations
    public CareerPathEntity createCareerPath(CareerPathEntity careerPath) {
        return careerPathRepository.save(careerPath);
    }

    public List<CareerPathEntity> createCareerPaths(List<CareerPathEntity> careerPaths) {
        return careerPathRepository.saveAll(careerPaths);
    }
    
    // Read operations
    public List<CareerPathEntity> getAllCareerPaths() {
        return careerPathRepository.findAll();
    }
    
    public Optional<CareerPathEntity> getCareerPathById(int id) {
        return careerPathRepository.findById(id);
    }
    
    public List<CareerPathEntity> searchCareerPathsByName(String name) {
        return careerPathRepository.findByCareerPathNameContainingIgnoreCase(name);
    }
    
    public List<CareerPathEntity> searchCareerPathsByDescription(String description) {
        return careerPathRepository.findByCareerPathDescriptionContainingIgnoreCase(description);
    }
    
    // Update operations
    public CareerPathEntity updateCareerPath(CareerPathEntity careerPath) {
        if (careerPathRepository.existsById(careerPath.getCareerPathId())) {
            return careerPathRepository.save(careerPath);
        }
        return null;
    }
    
    // Delete operations
    public boolean deleteCareerPath(int id) {
        if (careerPathRepository.existsById(id)) {
            careerPathRepository.deleteById(id);
            return true;
        }
        return false;
    }
}