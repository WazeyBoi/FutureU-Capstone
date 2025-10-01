package edu.cit.futureu.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import edu.cit.futureu.entity.CareerCareerPathEntity;
import edu.cit.futureu.entity.CareerEntity;
import edu.cit.futureu.entity.CareerPathEntity;
import edu.cit.futureu.repository.CareerCareerPathRepository;

@Service
public class CareerCareerPathService {
    
    @Autowired
    private CareerCareerPathRepository careerCareerPathRepository;
    
    @Autowired
    private CareerService careerService;
    
    @Autowired
    private CareerPathService careerPathService;
    
    // Create association between career and career path
    @Transactional
    public CareerCareerPathEntity associateCareerWithCareerPath(int careerId, int careerPathId) {
        Optional<CareerEntity> careerOpt = careerService.getCareerById(careerId);
        Optional<CareerPathEntity> careerPathOpt = careerPathService.getCareerPathById(careerPathId);
        
        if (careerOpt.isPresent() && careerPathOpt.isPresent()) {
            CareerEntity career = careerOpt.get();
            CareerPathEntity careerPath = careerPathOpt.get();
            
            // Check if association already exists
            Optional<CareerCareerPathEntity> existingAssociation = 
                careerCareerPathRepository.findByCareerAndCareerPath(career, careerPath);
            
            if (existingAssociation.isPresent()) {
                return existingAssociation.get(); // Return existing association
            }
            
            // Create new association
            CareerCareerPathEntity association = new CareerCareerPathEntity();
            association.setCareer(career);
            association.setCareerPath(careerPath);
            
            return careerCareerPathRepository.save(association);
        }
        
        throw new RuntimeException("Career or CareerPath not found");
    }
    
    // Get all associations
    public List<CareerCareerPathEntity> getAllAssociations() {
        return careerCareerPathRepository.findAll();
    }
    
    // Get all career paths for a specific career
    public List<CareerPathEntity> getCareerPathsByCareer(int careerId) {
        List<CareerCareerPathEntity> associations = careerCareerPathRepository.findByCareer_CareerId(careerId);
        return associations.stream()
                .map(CareerCareerPathEntity::getCareerPath)
                .collect(Collectors.toList());
    }
    
    // Get all careers for a specific career path
    public List<CareerEntity> getCareersByCareerPath(int careerPathId) {
        List<CareerCareerPathEntity> associations = careerCareerPathRepository.findByCareerPath_CareerPathId(careerPathId);
        return associations.stream()
                .map(CareerCareerPathEntity::getCareer)
                .collect(Collectors.toList());
    }
    
    // Remove association between career and career path
    @Transactional
    public boolean removeCareerFromCareerPath(int careerId, int careerPathId) {
        Optional<CareerEntity> careerOpt = careerService.getCareerById(careerId);
        Optional<CareerPathEntity> careerPathOpt = careerPathService.getCareerPathById(careerPathId);
        
        if (careerOpt.isPresent() && careerPathOpt.isPresent()) {
            CareerEntity career = careerOpt.get();
            CareerPathEntity careerPath = careerPathOpt.get();
            
            Optional<CareerCareerPathEntity> association = 
                careerCareerPathRepository.findByCareerAndCareerPath(career, careerPath);
            
            if (association.isPresent()) {
                careerCareerPathRepository.delete(association.get());
                return true;
            }
        }
        
        return false;
    }
    
    // Check if association exists
    public boolean associationExists(int careerId, int careerPathId) {
        Optional<CareerEntity> careerOpt = careerService.getCareerById(careerId);
        Optional<CareerPathEntity> careerPathOpt = careerPathService.getCareerPathById(careerPathId);
        
        if (careerOpt.isPresent() && careerPathOpt.isPresent()) {
            return careerCareerPathRepository.existsByCareerAndCareerPath(
                careerOpt.get(), careerPathOpt.get());
        }
        
        return false;
    }
    
    // Get association by ID
    public Optional<CareerCareerPathEntity> getAssociationById(int id) {
        return careerCareerPathRepository.findById(id);
    }
    
    // Delete association by ID
    @Transactional
    public boolean deleteAssociation(int id) {
        if (careerCareerPathRepository.existsById(id)) {
            careerCareerPathRepository.deleteById(id);
            return true;
        }
        return false;
    }
    
    // Remove all associations for a career
    @Transactional
    public void removeAllAssociationsForCareer(int careerId) {
        List<CareerCareerPathEntity> associations = careerCareerPathRepository.findByCareer_CareerId(careerId);
        careerCareerPathRepository.deleteAll(associations);
    }
    
    // Remove all associations for a career path
    @Transactional
    public void removeAllAssociationsForCareerPath(int careerPathId) {
        List<CareerCareerPathEntity> associations = careerCareerPathRepository.findByCareerPath_CareerPathId(careerPathId);
        careerCareerPathRepository.deleteAll(associations);
    }
}