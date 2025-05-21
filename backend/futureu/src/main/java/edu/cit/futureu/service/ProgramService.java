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
import edu.cit.futureu.repository.ProgramRepository;

@Service
public class ProgramService {

    @Autowired
    private ProgramRepository programRepository;
    
    @Autowired
    private CareerProgramRepository careerProgramRepository;
    
    // Create operations
    public ProgramEntity createProgram(ProgramEntity program) {
        return programRepository.save(program);
    }
    
    // Read operations
    public List<ProgramEntity> getAllPrograms() {
        return programRepository.findAll();
    }
    
    public Optional<ProgramEntity> getProgramById(int id) {
        return programRepository.findById(id);
    }
    
    public List<ProgramEntity> searchProgramsByName(String name) {
        return programRepository.findByProgramNameContainingIgnoreCase(name);
    }
    
    // New method to get programs by career
    public List<ProgramEntity> getProgramsByCareer(CareerEntity career) {
        List<CareerProgramEntity> associations = careerProgramRepository.findByCareer(career);
        return associations.stream()
            .map(CareerProgramEntity::getProgram)
            .collect(Collectors.toList());
    }
    
    // Update operations
    public ProgramEntity updateProgram(ProgramEntity program) {
        if (programRepository.existsById(program.getProgramId())) {
            return programRepository.save(program);
        }
        return null; // Program not found
    }
    
    // Delete operations
    public boolean deleteProgram(int id) {
        if (programRepository.existsById(id)) {
            programRepository.deleteById(id);
            return true;
        }
        return false; // Program not found
    }
}
