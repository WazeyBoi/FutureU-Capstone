package edu.cit.futureu.controller;

import java.util.List;

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
            return schoolProgramService.getSchoolProgramsBySchool(school);
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
    
    // Get school programs by accreditation ID
    @GetMapping("/getSchoolProgramsByAccreditation/{accredId}")
    public List<SchoolProgramEntity> getSchoolProgramsByAccreditation(@PathVariable int accredId) {
        AccreditationEntity accreditation = accreditationService.getAccreditationById(accredId).orElse(null);
        if (accreditation != null) {
            return schoolProgramService.getSchoolProgramsByAccreditation(accreditation);
        }
        return List.of(); // Return empty list if accreditation not found
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
}
