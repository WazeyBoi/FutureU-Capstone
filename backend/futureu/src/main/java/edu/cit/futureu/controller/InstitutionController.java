package edu.cit.futureu.controller;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import edu.cit.futureu.entity.InstitutionEntity;
import edu.cit.futureu.service.CounselorService;
import edu.cit.futureu.service.InstitutionService;

@RestController
@RequestMapping("/api/institution")
@CrossOrigin(origins = "http://localhost:5173")
public class InstitutionController {
    
    @Autowired
    private InstitutionService institutionService;
    
    @Autowired
    private CounselorService counselorService;
    
    @GetMapping("/validate-email-domain/{domain}")
    public ResponseEntity<Map<String, Boolean>> validateEmailDomain(@PathVariable String domain) {
        boolean isValid = institutionService.isValidEmailDomain(domain);
        return ResponseEntity.ok(Map.of("valid", isValid));
    }
    
    @GetMapping("/validate-school-code/{code}")
    public ResponseEntity<Map<String, Boolean>> validateSchoolCode(@PathVariable String code) {
        boolean isValid = institutionService.isValidSchoolCode(code);
        return ResponseEntity.ok(Map.of("valid", isValid));
    }
    
    @GetMapping("/counselor/{counselorId}/institution")
    public ResponseEntity<InstitutionEntity> getCounselorInstitution(@PathVariable int counselorId) {
        Optional<InstitutionEntity> institution = counselorService.getCounselorInstitution(counselorId);
        // Return 200 with null body instead of 404 to allow frontend to handle gracefully
        return ResponseEntity.ok(institution.orElse(null));
    }
    
    @GetMapping("/counselor/{counselorId}/students")
    public ResponseEntity<List<Map<String, Object>>> getInstitutionStudentResults(@PathVariable int counselorId) {
        List<Map<String, Object>> results = counselorService.getInstitutionStudentResults(counselorId);
        return ResponseEntity.ok(results);
    }
    
    @GetMapping("/counselor/{counselorId}/stats")
    public ResponseEntity<Map<String, Object>> getInstitutionAssessmentStats(@PathVariable int counselorId) {
        Map<String, Object> stats = counselorService.getInstitutionAssessmentStats(counselorId);
        return ResponseEntity.ok(stats);
    }
    
    // Export endpoints would go here (CSV/PDF generation)
    @GetMapping("/counselor/{counselorId}/export/{format}")
    public ResponseEntity<String> exportInstitutionResults(
        @PathVariable int counselorId, 
        @PathVariable String format
    ) {
        // For now, return a simple success message
        // In a real implementation, this would generate and return the file
        return ResponseEntity.ok("Export functionality coming soon for format: " + format);
    }
    
    // Admin endpoints for managing institutions
    @GetMapping("/all")
    public ResponseEntity<List<InstitutionEntity>> getAllInstitutions() {
        List<InstitutionEntity> institutions = institutionService.getAllInstitutions();
        return ResponseEntity.ok(institutions);
    }
    
    @PostMapping("/create")
    public ResponseEntity<InstitutionEntity> createInstitution(@RequestBody InstitutionEntity institution) {
        InstitutionEntity saved = institutionService.saveInstitution(institution);
        return ResponseEntity.ok(saved);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<InstitutionEntity> getInstitutionById(@PathVariable int id) {
        Optional<InstitutionEntity> institution = institutionService.getInstitutionById(id);
        return institution
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<InstitutionEntity> updateInstitution(
        @PathVariable int id, 
        @RequestBody InstitutionEntity institution
    ) {
        if (!institutionService.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        institution.setInstitutionId(id);
        InstitutionEntity updated = institutionService.saveInstitution(institution);
        return ResponseEntity.ok(updated);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInstitution(@PathVariable int id) {
        if (!institutionService.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        institutionService.deleteInstitution(id);
        return ResponseEntity.noContent().build();
    }
}