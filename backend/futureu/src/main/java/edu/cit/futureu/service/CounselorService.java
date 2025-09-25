package edu.cit.futureu.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import edu.cit.futureu.entity.UserEntity;
import edu.cit.futureu.entity.InstitutionEntity;
import edu.cit.futureu.entity.UserAssessmentEntity;
import edu.cit.futureu.repository.UserRepository;
import edu.cit.futureu.repository.InstitutionRepository;
import edu.cit.futureu.repository.UserAssessmentRepository;
import java.util.*;
import java.util.stream.Collectors;
import java.time.LocalDateTime;

@Service
public class CounselorService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private InstitutionRepository institutionRepository;
    
    @Autowired
    private UserAssessmentRepository userAssessmentRepository;
    
    public Optional<InstitutionEntity> getCounselorInstitution(int counselorId) {
        Optional<UserEntity> counselor = userRepository.findById(counselorId);
        if (counselor.isEmpty()) {
            return Optional.empty();
        }
        
        UserEntity counselorUser = counselor.get();
        String email = counselorUser.getEmail();
        
        if (email != null && email.contains("@")) {
            String domain = email.substring(email.indexOf("@") + 1);
            return institutionRepository.findByEmailDomain(domain);
        }
        
        return Optional.empty();
    }
    
    public List<Map<String, Object>> getInstitutionStudentResults(int counselorId) {
        Optional<InstitutionEntity> institution = getCounselorInstitution(counselorId);
        if (institution.isEmpty()) {
            return new ArrayList<>();
        }
        
        InstitutionEntity inst = institution.get();
        List<UserEntity> institutionStudents = new ArrayList<>();
        
        // Get students by email domain
        if (inst.getEmailDomain() != null) {
            List<UserEntity> emailStudents = userRepository.findByEmailContaining("@" + inst.getEmailDomain());
            institutionStudents.addAll(emailStudents);
        }
        
        // Get students by school code
        if (inst.getSchoolCode() != null) {
            List<UserEntity> codeStudents = userRepository.findBySchoolCode(inst.getSchoolCode());
            institutionStudents.addAll(codeStudents);
        }
        
        // Remove duplicates
        institutionStudents = institutionStudents.stream()
            .distinct()
            .filter(user -> user.getRole().name().equals("STUDENT"))
            .collect(Collectors.toList());
        
        // Build result with assessment data
        List<Map<String, Object>> results = new ArrayList<>();
        for (UserEntity student : institutionStudents) {
            Map<String, Object> studentData = new HashMap<>();
            studentData.put("userId", student.getUserId());
            studentData.put("firstName", student.getFirstName());
            studentData.put("lastName", student.getLastname());
            studentData.put("email", student.getEmail());
            studentData.put("schoolCode", student.getSchoolCode());
            
            // Get assessment data
            List<UserAssessmentEntity> assessments = userAssessmentRepository.findByUser_UserId(student.getUserId());
            studentData.put("assessmentsCompleted", assessments.size());
            
            if (!assessments.isEmpty()) {
                double avgScore = assessments.stream()
                    .mapToDouble(UserAssessmentEntity::getScore)
                    .average()
                    .orElse(0.0);
                studentData.put("averageScore", avgScore);
                
                LocalDateTime lastActivity = assessments.stream()
                    .map(UserAssessmentEntity::getDateCompleted)
                    .filter(Objects::nonNull)
                    .max(LocalDateTime::compareTo)
                    .orElse(null);
                studentData.put("lastActivity", lastActivity);
                
                // Add detailed assessments
                List<Map<String, Object>> assessmentDetails = assessments.stream()
                    .map(ua -> {
                        Map<String, Object> detail = new HashMap<>();
                        detail.put("title", ua.getAssessment() != null ? ua.getAssessment().getTitle() : "Unknown");
                        detail.put("category", "Assessment"); // Simplified category
                        detail.put("score", ua.getScore());
                        detail.put("completedAt", ua.getDateCompleted());
                        detail.put("status", ua.getStatus());
                        return detail;
                    })
                    .collect(Collectors.toList());
                studentData.put("assessments", assessmentDetails);
            } else {
                studentData.put("averageScore", null);
                studentData.put("lastActivity", null);
                studentData.put("assessments", new ArrayList<>());
            }
            
            results.add(studentData);
        }
        
        return results;
    }
    
    public Map<String, Object> getInstitutionAssessmentStats(int counselorId) {
        List<Map<String, Object>> studentResults = getInstitutionStudentResults(counselorId);
        
        Map<String, Object> stats = new HashMap<>();
        
        int totalAssessments = studentResults.stream()
            .mapToInt(student -> (Integer) student.get("assessmentsCompleted"))
            .sum();
        
        double averageScore = studentResults.stream()
            .filter(student -> student.get("averageScore") != null)
            .mapToDouble(student -> (Double) student.get("averageScore"))
            .average()
            .orElse(0.0);
        
        stats.put("totalStudents", studentResults.size());
        stats.put("totalAssessments", totalAssessments);
        stats.put("averageScore", averageScore);
        
        return stats;
    }
}