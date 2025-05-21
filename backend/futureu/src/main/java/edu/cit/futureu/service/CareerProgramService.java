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

@Service
public class CareerProgramService {
    
    @Autowired
    private CareerProgramRepository careerProgramRepository;
    
    @Autowired
    private CareerService careerService;
    
    @Autowired
    private ProgramService programService;
    
    // Create a new association between career and program
    public CareerProgramEntity associateCareerWithProgram(int careerId, int programId) {
        Optional<CareerEntity> career = careerService.getCareerById(careerId);
        Optional<ProgramEntity> program = programService.getProgramById(programId);
        
        if (career.isPresent() && program.isPresent()) {
            // Check if association already exists
            Optional<CareerProgramEntity> existingAssociation = 
                careerProgramRepository.findByCareerAndProgram(career.get(), program.get());
            
            if (existingAssociation.isPresent()) {
                return existingAssociation.get(); // Return existing association
            }
            
            // Create new association
            CareerProgramEntity careerProgram = new CareerProgramEntity();
            careerProgram.setCareer(career.get());
            careerProgram.setProgram(program.get());
            return careerProgramRepository.save(careerProgram);
        }
        
        return null;
    }
    
    // Get all career-program associations
    public List<CareerProgramEntity> getAllAssociations() {
        return careerProgramRepository.findAll();
    }
    
    // Get all programs associated with a career
    public List<ProgramEntity> getProgramsByCareer(int careerId) {
        Optional<CareerEntity> career = careerService.getCareerById(careerId);
        if (career.isPresent()) {
            List<CareerProgramEntity> associations = careerProgramRepository.findByCareer(career.get());
            return associations.stream()
                .map(CareerProgramEntity::getProgram)
                .collect(Collectors.toList());
        }
        return List.of();
    }
    
    // Get all careers associated with a program
    public List<CareerEntity> getCareersByProgram(int programId) {
        Optional<ProgramEntity> program = programService.getProgramById(programId);
        if (program.isPresent()) {
            List<CareerProgramEntity> associations = careerProgramRepository.findByProgram(program.get());
            return associations.stream()
                .map(CareerProgramEntity::getCareer)
                .collect(Collectors.toList());
        }
        return List.of();
    }
    
    // Delete an association
    public boolean deleteAssociation(int careerId, int programId) {
        Optional<CareerEntity> career = careerService.getCareerById(careerId);
        Optional<ProgramEntity> program = programService.getProgramById(programId);
        
        if (career.isPresent() && program.isPresent()) {
            Optional<CareerProgramEntity> association = 
                careerProgramRepository.findByCareerAndProgram(career.get(), program.get());
            
            if (association.isPresent()) {
                careerProgramRepository.delete(association.get());
                return true;
            }
        }
        
        return false;
    }
}
