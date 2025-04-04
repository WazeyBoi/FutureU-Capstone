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

import edu.cit.futureu.entity.ProgramEntity;
import edu.cit.futureu.service.ProgramService;

@RestController
@RequestMapping(method=RequestMethod.GET, path="/api/program")
public class ProgramController {
    
    @Autowired
    private ProgramService programService;
    
    @GetMapping("/test")
    public String test() {
        return "Program API is working!";
    }

    // CREATE
    @PostMapping("/postProgramRecord")
    public ProgramEntity postProgramRecord(@RequestBody ProgramEntity program) {
        return programService.createProgram(program);
    }
    
    // READ
    @GetMapping("/getAllPrograms")
    public List<ProgramEntity> getAllPrograms() {
        return programService.getAllPrograms();
    }
    
    // Get program by ID
    @GetMapping("/getProgram/{programId}")
    public ProgramEntity getProgramById(@PathVariable int programId) {
        return programService.getProgramById(programId)
                .orElse(null);
    }
    
    // Search programs by name
    @GetMapping("/searchPrograms")
    public List<ProgramEntity> searchPrograms(@RequestParam String name) {
        return programService.searchProgramsByName(name);
    }
    
    // UPDATE
    @PutMapping("/putProgramDetails")
    public ProgramEntity putProgramDetails(@RequestParam int programId, @RequestBody ProgramEntity newProgramDetails) {
        newProgramDetails.setProgramId(programId);
        return programService.updateProgram(newProgramDetails);
    }
    
    // DELETE
    @DeleteMapping("/deleteProgramDetails/{programId}")
    public String deleteProgram(@PathVariable int programId) {
        boolean deleted = programService.deleteProgram(programId);
        return deleted ? "Program with ID " + programId + " successfully deleted" : "Program with ID " + programId + " not found";
    }
}
