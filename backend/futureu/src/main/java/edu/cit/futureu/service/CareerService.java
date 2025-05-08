package edu.cit.futureu.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import edu.cit.futureu.entity.CareerEntity;
import edu.cit.futureu.entity.ProgramEntity;
import edu.cit.futureu.repository.CareerRepository;

@Service
public class CareerService {

    @Autowired
    private CareerRepository careerRepository;
    
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
    
    public List<CareerEntity> getCareersByProgram(ProgramEntity program) {
        return careerRepository.findByProgram(program);
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
    
    public List<CareerEntity> filterCareersBySalaryRange(double minSalary, double maxSalary) {
        return careerRepository.findBySalaryBetween(minSalary, maxSalary);
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
