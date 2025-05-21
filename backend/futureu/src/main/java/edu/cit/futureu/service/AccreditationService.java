package edu.cit.futureu.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import edu.cit.futureu.entity.AccreditationEntity;
import edu.cit.futureu.entity.SchoolProgramEntity;
import edu.cit.futureu.repository.AccreditationRepository;

@Service
public class AccreditationService {

    @Autowired
    private AccreditationRepository accreditationRepository;
    
    // Create operations
    public AccreditationEntity createAccreditation(AccreditationEntity accreditation) {
        return accreditationRepository.save(accreditation);
    }
    
    // Read operations
    public List<AccreditationEntity> getAllAccreditations() {
        return accreditationRepository.findAll();
    }
    
    public Optional<AccreditationEntity> getAccreditationById(int id) {
        return accreditationRepository.findById(id);
    }
    
    public List<AccreditationEntity> getAccreditationsBySchoolProgram(SchoolProgramEntity schoolProgram) {
        return accreditationRepository.findBySchoolProgram(schoolProgram);
    }
    
    public List<AccreditationEntity> searchAccreditationsByTitle(String title) {
        return accreditationRepository.findByTitleContainingIgnoreCase(title);
    }
    
    public List<AccreditationEntity> getAccreditationsByRecognitionStatus(String recognitionStatus) {
        return accreditationRepository.findByRecognitionStatus(recognitionStatus);
    }
    
    public List<AccreditationEntity> getAccreditationsByAccreditingBody(String accreditingBody) {
        return accreditationRepository.findByAccreditingBody(accreditingBody);
    }
    
    public List<AccreditationEntity> getAccreditationsByAccreditationLevel(String accreditationLevel) {
        return accreditationRepository.findByAccreditationLevel(accreditationLevel);
    }
    
    // Update operations
    public AccreditationEntity updateAccreditation(AccreditationEntity accreditation) {
        if (accreditationRepository.existsById(accreditation.getAccredId())) {
            return accreditationRepository.save(accreditation);
        }
        return null; // Accreditation not found
    }
    
    // Delete operations
    public boolean deleteAccreditation(int id) {
        if (accreditationRepository.existsById(id)) {
            accreditationRepository.deleteById(id);
            return true;
        }
        return false; // Accreditation not found
    }
}
