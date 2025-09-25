package edu.cit.futureu.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import edu.cit.futureu.entity.InstitutionEntity;
import edu.cit.futureu.repository.InstitutionRepository;
import java.util.List;
import java.util.Optional;

@Service
public class InstitutionService {
    
    @Autowired
    private InstitutionRepository institutionRepository;
    
    public List<InstitutionEntity> getAllInstitutions() {
        return institutionRepository.findAll();
    }
    
    public Optional<InstitutionEntity> getInstitutionById(int id) {
        return institutionRepository.findById(id);
    }
    
    public Optional<InstitutionEntity> getInstitutionByEmailDomain(String emailDomain) {
        return institutionRepository.findByEmailDomain(emailDomain);
    }
    
    public Optional<InstitutionEntity> getInstitutionBySchoolCode(String schoolCode) {
        return institutionRepository.findBySchoolCode(schoolCode);
    }
    
    public boolean isValidEmailDomain(String emailDomain) {
        return institutionRepository.existsByEmailDomain(emailDomain);
    }
    
    public boolean isValidSchoolCode(String schoolCode) {
        return institutionRepository.existsBySchoolCode(schoolCode);
    }
    
    public InstitutionEntity saveInstitution(InstitutionEntity institution) {
        return institutionRepository.save(institution);
    }
    
    public void deleteInstitution(int id) {
        institutionRepository.deleteById(id);
    }
    
    public boolean existsById(int id) {
        return institutionRepository.existsById(id);
    }
}