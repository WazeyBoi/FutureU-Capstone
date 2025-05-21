package edu.cit.futureu.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import edu.cit.futureu.entity.CareerEntity;
import edu.cit.futureu.entity.CareerProgramEntity;
import edu.cit.futureu.entity.ProgramEntity;
import edu.cit.futureu.repository.CareerProgramRepository;
import edu.cit.futureu.repository.CareerRepository;

@Service
public class CareerService {

    @Autowired
    private CareerRepository careerRepository;
    
    @Autowired
    private CareerProgramRepository careerProgramRepository;
    
    // Create operations
    public CareerEntity createCareer(CareerEntity career) {
        return careerRepository.save(career);
    }
    
    // Read operations
    public List<CareerEntity> getAllCareers() {
        return careerRepository.findAll();
    }
    
    public Optional<CareerEntity> getCareerById(int id) {
        return careerRepository.findById(id);
    }
    
    // Updated to use the many-to-many relationship
    public List<CareerEntity> getCareersByProgram(ProgramEntity program) {
        List<CareerProgramEntity> associations = careerProgramRepository.findByProgram(program);
        return associations.stream()
            .map(CareerProgramEntity::getCareer)
            .collect(Collectors.toList());
    }
    
    public List<CareerEntity> searchCareersByTitle(String title) {
        return careerRepository.findByCareerTitleContainingIgnoreCase(title);
    }
    
    public List<CareerEntity> filterCareersByIndustry(String industry) {
        return careerRepository.findByIndustryContainingIgnoreCase(industry);
    }
    
    public List<CareerEntity> filterCareersByJobTrend(String jobTrend) {
        return careerRepository.findByJobTrendContainingIgnoreCase(jobTrend);
    }
    
    public List<CareerEntity> filterCareersBySalary(String salary) {
        return careerRepository.findBySalaryContainingIgnoreCase(salary);
    }
    
    public List<CareerEntity> filterCareersByDescription(String description) {
        return careerRepository.findByCareerDescriptionContainingIgnoreCase(description);
    }
    
    // Update operations
    public CareerEntity updateCareer(CareerEntity career) {
        if (careerRepository.existsById(career.getCareerId())) {
            return careerRepository.save(career);
        }
        return null; // Career not found
    }
    
    // Delete operations
    public boolean deleteCareer(int id) {
        if (careerRepository.existsById(id)) {
            careerRepository.deleteById(id);
            return true;
        }
        return false; // Career not found
    }
}
