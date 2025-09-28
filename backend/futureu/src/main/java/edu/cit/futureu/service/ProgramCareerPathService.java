package edu.cit.futureu.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import edu.cit.futureu.entity.CareerPathEntity;
import edu.cit.futureu.entity.ProgramCareerPathEntity;
import edu.cit.futureu.entity.ProgramEntity;
import edu.cit.futureu.repository.ProgramCareerPathRepository;

@Service
public class ProgramCareerPathService {
    
    @Autowired
    private ProgramCareerPathRepository programCareerPathRepository;
    
    @Autowired
    private ProgramService programService;
    
    @Autowired
    private CareerPathService careerPathService;
    
    // Create association between program and career path
    public ProgramCareerPathEntity associateProgramWithCareerPath(int programId, int careerPathId) {
        Optional<ProgramEntity> program = programService.getProgramById(programId);
        Optional<CareerPathEntity> careerPath = careerPathService.getCareerPathById(careerPathId);
        
        if (program.isPresent() && careerPath.isPresent()) {
            // Check if association already exists
            Optional<ProgramCareerPathEntity> existingAssociation = 
                programCareerPathRepository.findByProgramAndCareerPath(program.get(), careerPath.get());
            
            if (existingAssociation.isPresent()) {
                return existingAssociation.get();
            }
            
            // Create new association
            ProgramCareerPathEntity association = new ProgramCareerPathEntity();
            association.setProgram(program.get());
            association.setCareerPath(careerPath.get());
            
            return programCareerPathRepository.save(association);
        }
        
        return null;
    }
    
    // Get all associations
    public List<ProgramCareerPathEntity> getAllAssociations() {
        return programCareerPathRepository.findAll();
    }
    
    // Get all career paths associated with a program
    public List<CareerPathEntity> getCareerPathsByProgram(int programId) {
        Optional<ProgramEntity> program = programService.getProgramById(programId);
        if (program.isPresent()) {
            List<ProgramCareerPathEntity> associations = programCareerPathRepository.findByProgram(program.get());
            return associations.stream()
                .map(ProgramCareerPathEntity::getCareerPath)
                .collect(Collectors.toList());
        }
        return List.of();
    }
    
    // Get all programs associated with a career path
    public List<ProgramEntity> getProgramsByCareerPath(int careerPathId) {
        Optional<CareerPathEntity> careerPath = careerPathService.getCareerPathById(careerPathId);
        if (careerPath.isPresent()) {
            List<ProgramCareerPathEntity> associations = programCareerPathRepository.findByCareerPath(careerPath.get());
            return associations.stream()
                .map(ProgramCareerPathEntity::getProgram)
                .collect(Collectors.toList());
        }
        return List.of();
    }
    
    // Delete an association
    public boolean deleteAssociation(int programId, int careerPathId) {
        Optional<ProgramEntity> program = programService.getProgramById(programId);
        Optional<CareerPathEntity> careerPath = careerPathService.getCareerPathById(careerPathId);
        
        if (program.isPresent() && careerPath.isPresent()) {
            Optional<ProgramCareerPathEntity> association = 
                programCareerPathRepository.findByProgramAndCareerPath(program.get(), careerPath.get());
            
            if (association.isPresent()) {
                programCareerPathRepository.delete(association.get());
                return true;
            }
        }
        
        return false;
    }
}