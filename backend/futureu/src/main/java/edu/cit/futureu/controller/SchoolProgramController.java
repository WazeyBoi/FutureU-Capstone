
package edu.cit.futureu.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import edu.cit.futureu.entity.AccreditationEntity;
import edu.cit.futureu.entity.ProgramEntity;
import edu.cit.futureu.entity.SchoolEntity;
import edu.cit.futureu.entity.SchoolProgramEntity;
import edu.cit.futureu.service.AccreditationService;
import edu.cit.futureu.service.ProgramService;
import edu.cit.futureu.service.SchoolProgramService;
import edu.cit.futureu.service.SchoolService;

@RestController
@RequestMapping(method=RequestMethod.GET, path="/api/schoolprogram")
public class SchoolProgramController {
    
    @Autowired
    private SchoolProgramService schoolProgramService;
    
    @Autowired
    private SchoolService schoolService;
    
    @Autowired
    private ProgramService programService;
    
    @Autowired
    private AccreditationService accreditationService;
    
    @GetMapping("/test")
    public String test() {
        return "SchoolProgram API is working!";
    }

    // CREATE
    @PostMapping("/postSchoolProgramRecord")
    public SchoolProgramEntity postSchoolProgramRecord(@RequestBody SchoolProgramEntity schoolProgram) {
        return schoolProgramService.createSchoolProgram(schoolProgram);
    }
    
    // READ
    @GetMapping("/getAllSchoolPrograms")
    public List<SchoolProgramEntity> getAllSchoolPrograms() {
        return schoolProgramService.getAllSchoolPrograms();
    }
    
    // Get school program by ID
    @GetMapping("/getSchoolProgram/{schoolProgramId}")
    public SchoolProgramEntity getSchoolProgramById(@PathVariable int schoolProgramId) {
        return schoolProgramService.getSchoolProgramById(schoolProgramId)
                .orElse(null);
    }
    
    // Get school programs by school ID
    @GetMapping("/getSchoolProgramsBySchool/{schoolId}")
    public List<SchoolProgramEntity> getSchoolProgramsBySchool(@PathVariable int schoolId) {
        SchoolEntity school = schoolService.getSchoolById(schoolId).orElse(null);
        if (school != null) {
            List<SchoolProgramEntity> schoolPrograms = schoolProgramService.getSchoolProgramsBySchool(school);
            
            // Ensure all related entities are eagerly loaded and accessible
            return schoolPrograms.stream()
                .peek(sp -> {
                    if (sp.getAccreditation() != null) {
                        // Touch the accreditation to force eager loading
                        AccreditationEntity accred = sp.getAccreditation();
                        accred.getAccreditationLevel();
                        accred.getAccreditingBody();
                        accred.getRecognitionStatus();
                    }
                })
                .collect(Collectors.toList());
        }
        return List.of(); // Return empty list if school not found
    }
    
    // Get school programs by program ID
    @GetMapping("/getSchoolProgramsByProgram/{programId}")
    public List<SchoolProgramEntity> getSchoolProgramsByProgram(@PathVariable int programId) {
        ProgramEntity program = programService.getProgramById(programId).orElse(null);
        if (program != null) {
            return schoolProgramService.getSchoolProgramsByProgram(program);
        }
        return List.of(); // Return empty list if program not found
    }
    
    // Get school program by school ID and program ID
    @GetMapping("/getSchoolProgramBySchoolAndProgram")
    public SchoolProgramEntity getSchoolProgramBySchoolAndProgram(
            @RequestParam int schoolId, 
            @RequestParam int programId) {
        SchoolEntity school = schoolService.getSchoolById(schoolId).orElse(null);
        ProgramEntity program = programService.getProgramById(programId).orElse(null);
        if (school != null && program != null) {
            return schoolProgramService.getSchoolProgramBySchoolAndProgram(school, program);
        }
        return null; // Return null if school or program not found
    }
    
    // UPDATE
    @PutMapping("/putSchoolProgramDetails")
    public SchoolProgramEntity putSchoolProgramDetails(
            @RequestParam int schoolProgramId, 
            @RequestBody SchoolProgramEntity newSchoolProgramDetails) {
        newSchoolProgramDetails.setSchoolProgramId(schoolProgramId);
        return schoolProgramService.updateSchoolProgram(newSchoolProgramDetails);
    }
    
    // DELETE
    @DeleteMapping("/deleteSchoolProgramDetails/{schoolProgramId}")
    public String deleteSchoolProgram(@PathVariable int schoolProgramId) {
        boolean deleted = schoolProgramService.deleteSchoolProgram(schoolProgramId);
        return deleted ? 
                "School Program with ID " + schoolProgramId + " successfully deleted" : 
                "School Program with ID " + schoolProgramId + " not found";
    }
    
    // DEPARTMENT-BASED OPERATIONS
    
    // Get school programs by exact department name
    @GetMapping("/getSchoolProgramsByDepartment")
    public List<SchoolProgramEntity> getSchoolProgramsByDepartment(@RequestParam String department) {
        return schoolProgramService.getSchoolProgramsByDepartment(department);
    }
    
    // Search school programs by department keyword (case-insensitive)
    @GetMapping("/searchSchoolProgramsByDepartment")
    public List<SchoolProgramEntity> searchSchoolProgramsByDepartment(@RequestParam String departmentKeyword) {
        return schoolProgramService.searchSchoolProgramsByDepartment(departmentKeyword);
    }
    
    // Get school programs by school ID and department
    @GetMapping("/getSchoolProgramsBySchoolAndDepartment")
    public List<SchoolProgramEntity> getSchoolProgramsBySchoolAndDepartment(
            @RequestParam int schoolId, 
            @RequestParam String department) {
        SchoolEntity school = schoolService.getSchoolById(schoolId).orElse(null);
        if (school != null) {
            return schoolProgramService.getSchoolProgramsBySchoolAndDepartment(school, department);
        }
        return List.of(); // Return empty list if school not found
    }
    
    // Get school programs by program ID and department
    @GetMapping("/getSchoolProgramsByProgramAndDepartment")
    public List<SchoolProgramEntity> getSchoolProgramsByProgramAndDepartment(
            @RequestParam int programId, 
            @RequestParam String department) {
        ProgramEntity program = programService.getProgramById(programId).orElse(null);
        if (program != null) {
            return schoolProgramService.getSchoolProgramsByProgramAndDepartment(program, department);
        }
        return List.of(); // Return empty list if program not found
    }
}
