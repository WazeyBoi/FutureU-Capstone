
package edu.cit.futureu.service;

import java.util.List;
import java.util.Optional;
import java.util.Collections;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import edu.cit.futureu.entity.AccreditationEntity;
import edu.cit.futureu.entity.SchoolEntity;
import edu.cit.futureu.entity.SchoolProgramEntity;
import edu.cit.futureu.repository.AccreditationRepository;
import edu.cit.futureu.repository.SchoolProgramRepository;

@Service
public class AccreditationService {

    @Autowired
    private AccreditationRepository accreditationRepository;
    
    @Autowired
    private SchoolProgramRepository schoolProgramRepository;
    
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
    
    public List<AccreditationEntity> getAccreditationsBySchool(SchoolEntity school) {
        return accreditationRepository.findBySchool(school);
    }
    
    public List<AccreditationEntity> getAccreditationsBySchoolProgram(SchoolProgramEntity schoolProgram) {
        if (schoolProgram != null && schoolProgram.getAccreditation() != null) {
            Integer accredId = schoolProgram.getAccreditation().getAccredId();
            Optional<AccreditationEntity> accreditation = accreditationRepository.findByAccredId(accredId);
            return accreditation.map(Collections::singletonList).orElse(Collections.emptyList());
        }
        return Collections.emptyList();
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
    @Transactional
    public boolean deleteAccreditation(int id) {
        if (accreditationRepository.existsById(id)) {
            // First, find all SchoolPrograms that reference this accreditation
            List<SchoolProgramEntity> programsWithAccreditation = 
                schoolProgramRepository.findByAccreditation_AccredId(id);
            
            // Remove the accreditation reference from all these programs
            for (SchoolProgramEntity program : programsWithAccreditation) {
                program.setAccreditation(null);
                schoolProgramRepository.save(program);
            }
            
            // Now it's safe to delete the accreditation
            accreditationRepository.deleteById(id);
            return true;
        }
        return false; // Accreditation not found
    }
}