package edu.cit.futureu.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
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
    
    @PersistenceContext
    private EntityManager entityManager;
    
    public Optional<InstitutionEntity> getCounselorInstitution(int counselorId) {
        Optional<UserEntity> counselor = userRepository.findById(counselorId);
        if (counselor.isEmpty()) {
            return Optional.empty();
        }
        
        UserEntity counselorUser = counselor.get();
        String email = counselorUser.getEmail();
        
        // First try to find institution by email domain
        if (email != null && email.contains("@")) {
            String domain = email.substring(email.indexOf("@") + 1);
            Optional<InstitutionEntity> institutionByEmail = institutionRepository.findByEmailDomain(domain);
            if (institutionByEmail.isPresent()) {
                return institutionByEmail;
            }
        }
        
        // Fallback: Try to find institution by counselor's school code
        if (counselorUser.getSchoolCode() != null && !counselorUser.getSchoolCode().trim().isEmpty()) {
            return institutionRepository.findBySchoolCode(counselorUser.getSchoolCode().trim());
        }
        
        return Optional.empty();
    }
    
    /**
     * Optimized version that uses batch loading to avoid N+1 queries
     * Returns only summary data to reduce memory usage
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getInstitutionStudentResults(int counselorId) {
        Optional<InstitutionEntity> institution = getCounselorInstitution(counselorId);
        if (institution.isEmpty()) {
            return new ArrayList<>();
        }
        
        InstitutionEntity inst = institution.get();
        Set<Integer> studentIds = new HashSet<>();
        
        // Get student IDs by email domain (more efficient - only IDs)
        if (inst.getEmailDomain() != null) {
            String jpql = "SELECT u.userId FROM UserEntity u WHERE u.email LIKE :domain AND u.role = 'STUDENT'";
            Query query = entityManager.createQuery(jpql);
            query.setParameter("domain", "%@" + inst.getEmailDomain());
            @SuppressWarnings("unchecked")
            List<Integer> emailStudentIds = query.getResultList();
            studentIds.addAll(emailStudentIds);
        }
        
        // Get student IDs by school code
        if (inst.getSchoolCode() != null) {
            String jpql = "SELECT u.userId FROM UserEntity u WHERE u.schoolCode = :code AND u.role = 'STUDENT'";
            Query query = entityManager.createQuery(jpql);
            query.setParameter("code", inst.getSchoolCode());
            @SuppressWarnings("unchecked")
            List<Integer> codeStudentIds = query.getResultList();
            studentIds.addAll(codeStudentIds);
        }
        
        if (studentIds.isEmpty()) {
            return new ArrayList<>();
        }
        
        // Batch load all students in one query
        String studentJpql = "SELECT DISTINCT u FROM UserEntity u WHERE u.userId IN :ids";
        Query studentQuery = entityManager.createQuery(studentJpql, UserEntity.class);
        studentQuery.setParameter("ids", studentIds);
        @SuppressWarnings("unchecked")
        List<UserEntity> institutionStudents = studentQuery.getResultList();
        
        // Batch load all assessments for all students in one query (avoid N+1)
        String assessmentJpql = "SELECT ua FROM UserAssessmentEntity ua " +
                                 "JOIN FETCH ua.assessment " +
                                 "WHERE ua.user.userId IN :studentIds";
        Query assessmentQuery = entityManager.createQuery(assessmentJpql, UserAssessmentEntity.class);
        assessmentQuery.setParameter("studentIds", studentIds);
        @SuppressWarnings("unchecked")
        List<UserAssessmentEntity> allAssessments = assessmentQuery.getResultList();
        
        // Group assessments by student ID for efficient lookup
        Map<Integer, List<UserAssessmentEntity>> assessmentsByStudent = allAssessments.stream()
            .collect(Collectors.groupingBy(ua -> ua.getUser().getUserId()));
        
        // Build result with assessment data (lightweight - no detailed assessment list)
        List<Map<String, Object>> results = new ArrayList<>();
        for (UserEntity student : institutionStudents) {
            Map<String, Object> studentData = new HashMap<>();
            studentData.put("userId", student.getUserId());
            studentData.put("firstName", student.getFirstName());
            studentData.put("lastName", student.getLastname());
            studentData.put("email", student.getEmail());
            studentData.put("schoolCode", student.getSchoolCode());
            
            // Get assessment data from pre-loaded map
            List<UserAssessmentEntity> assessments = assessmentsByStudent.getOrDefault(student.getUserId(), new ArrayList<>());
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
                
                // Only include summary, not full assessment details to save memory
                studentData.put("assessments", new ArrayList<>()); // Empty to maintain API compatibility
            } else {
                studentData.put("averageScore", null);
                studentData.put("lastActivity", null);
                studentData.put("assessments", new ArrayList<>());
            }
            
            results.add(studentData);
        }
        
        return results;
    }
    
    /**
     * Paginated version for better memory management
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getInstitutionStudentResultsPaginated(int counselorId, int page, int size) {
        Optional<InstitutionEntity> institution = getCounselorInstitution(counselorId);
        if (institution.isEmpty()) {
            Map<String, Object> emptyResult = new HashMap<>();
            emptyResult.put("students", new ArrayList<>());
            emptyResult.put("totalElements", 0);
            emptyResult.put("totalPages", 0);
            emptyResult.put("currentPage", page);
            return emptyResult;
        }
        
        InstitutionEntity inst = institution.get();
        Set<Integer> studentIds = new HashSet<>();
        
        // Get student IDs by email domain
        if (inst.getEmailDomain() != null) {
            String jpql = "SELECT u.userId FROM UserEntity u WHERE u.email LIKE :domain AND u.role = 'STUDENT'";
            Query query = entityManager.createQuery(jpql);
            query.setParameter("domain", "%@" + inst.getEmailDomain());
            @SuppressWarnings("unchecked")
            List<Integer> emailStudentIds = query.getResultList();
            studentIds.addAll(emailStudentIds);
        }
        
        // Get student IDs by school code
        if (inst.getSchoolCode() != null) {
            String jpql = "SELECT u.userId FROM UserEntity u WHERE u.schoolCode = :code AND u.role = 'STUDENT'";
            Query query = entityManager.createQuery(jpql);
            query.setParameter("code", inst.getSchoolCode());
            @SuppressWarnings("unchecked")
            List<Integer> codeStudentIds = query.getResultList();
            studentIds.addAll(codeStudentIds);
        }
        
        if (studentIds.isEmpty()) {
            Map<String, Object> emptyResult = new HashMap<>();
            emptyResult.put("students", new ArrayList<>());
            emptyResult.put("totalElements", 0);
            emptyResult.put("totalPages", 0);
            emptyResult.put("currentPage", page);
            return emptyResult;
        }
        
        // Get total count
        long totalCount = studentIds.size();
        int totalPages = (int) Math.ceil((double) totalCount / size);
        
        // Get paginated student IDs
        List<Integer> paginatedIds = studentIds.stream()
            .skip((long) (page - 1) * size)
            .limit(size)
            .collect(Collectors.toList());
        
        // Batch load paginated students
        String studentJpql = "SELECT DISTINCT u FROM UserEntity u WHERE u.userId IN :ids";
        Query studentQuery = entityManager.createQuery(studentJpql, UserEntity.class);
        studentQuery.setParameter("ids", paginatedIds);
        @SuppressWarnings("unchecked")
        List<UserEntity> institutionStudents = studentQuery.getResultList();
        
        // Batch load assessments only for this page of students
        String assessmentJpql = "SELECT ua FROM UserAssessmentEntity ua " +
                                 "JOIN FETCH ua.assessment " +
                                 "WHERE ua.user.userId IN :studentIds";
        Query assessmentQuery = entityManager.createQuery(assessmentJpql, UserAssessmentEntity.class);
        assessmentQuery.setParameter("studentIds", paginatedIds);
        @SuppressWarnings("unchecked")
        List<UserAssessmentEntity> allAssessments = assessmentQuery.getResultList();
        
        // Group assessments by student ID
        Map<Integer, List<UserAssessmentEntity>> assessmentsByStudent = allAssessments.stream()
            .collect(Collectors.groupingBy(ua -> ua.getUser().getUserId()));
        
        // Build result
        List<Map<String, Object>> results = new ArrayList<>();
        for (UserEntity student : institutionStudents) {
            Map<String, Object> studentData = new HashMap<>();
            studentData.put("userId", student.getUserId());
            studentData.put("firstName", student.getFirstName());
            studentData.put("lastName", student.getLastname());
            studentData.put("email", student.getEmail());
            studentData.put("schoolCode", student.getSchoolCode());
            
            List<UserAssessmentEntity> assessments = assessmentsByStudent.getOrDefault(student.getUserId(), new ArrayList<>());
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
                studentData.put("assessments", new ArrayList<>());
            } else {
                studentData.put("averageScore", null);
                studentData.put("lastActivity", null);
                studentData.put("assessments", new ArrayList<>());
            }
            
            results.add(studentData);
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("students", results);
        response.put("totalElements", totalCount);
        response.put("totalPages", totalPages);
        response.put("currentPage", page);
        response.put("pageSize", size);
        
        return response;
    }
    
    /**
     * Optimized stats method that doesn't load all student data
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getInstitutionAssessmentStats(int counselorId) {
        Optional<InstitutionEntity> institution = getCounselorInstitution(counselorId);
        if (institution.isEmpty()) {
            Map<String, Object> emptyStats = new HashMap<>();
            emptyStats.put("totalStudents", 0);
            emptyStats.put("totalAssessments", 0);
            emptyStats.put("averageScore", 0.0);
            return emptyStats;
        }
        
        InstitutionEntity inst = institution.get();
        Set<Integer> studentIds = new HashSet<>();
        
        // Get student IDs by email domain
        if (inst.getEmailDomain() != null) {
            String jpql = "SELECT u.userId FROM UserEntity u WHERE u.email LIKE :domain AND u.role = 'STUDENT'";
            Query query = entityManager.createQuery(jpql);
            query.setParameter("domain", "%@" + inst.getEmailDomain());
            @SuppressWarnings("unchecked")
            List<Integer> emailStudentIds = query.getResultList();
            studentIds.addAll(emailStudentIds);
        }
        
        // Get student IDs by school code
        if (inst.getSchoolCode() != null) {
            String jpql = "SELECT u.userId FROM UserEntity u WHERE u.schoolCode = :code AND u.role = 'STUDENT'";
            Query query = entityManager.createQuery(jpql);
            query.setParameter("code", inst.getSchoolCode());
            @SuppressWarnings("unchecked")
            List<Integer> codeStudentIds = query.getResultList();
            studentIds.addAll(codeStudentIds);
        }
        
        if (studentIds.isEmpty()) {
            Map<String, Object> emptyStats = new HashMap<>();
            emptyStats.put("totalStudents", 0);
            emptyStats.put("totalAssessments", 0);
            emptyStats.put("averageScore", 0.0);
            return emptyStats;
        }
        
        // Get total assessment count and average score in one query
        String statsJpql = "SELECT COUNT(ua), AVG(ua.score) FROM UserAssessmentEntity ua " +
                          "WHERE ua.user.userId IN :studentIds";
        Query statsQuery = entityManager.createQuery(statsJpql);
        statsQuery.setParameter("studentIds", studentIds);
        Object[] statsResult = (Object[]) statsQuery.getSingleResult();
        
        Long totalAssessments = ((Number) statsResult[0]).longValue();
        Double averageScore = statsResult[1] != null ? ((Number) statsResult[1]).doubleValue() : 0.0;
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalStudents", studentIds.size());
        stats.put("totalAssessments", totalAssessments.intValue());
        stats.put("averageScore", averageScore);
        
        return stats;
    }
}