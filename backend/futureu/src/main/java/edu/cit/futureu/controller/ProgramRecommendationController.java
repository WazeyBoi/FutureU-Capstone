package edu.cit.futureu.controller;

import edu.cit.futureu.entity.ProgramRecommendationEntity;
import edu.cit.futureu.entity.AssessmentResultEntity;
import edu.cit.futureu.entity.ProgramEntity;
import edu.cit.futureu.service.ProgramRecommendationService;
import edu.cit.futureu.service.AssessmentResultService;
import edu.cit.futureu.service.ProgramService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/program-recommendation")
public class ProgramRecommendationController {
    @Autowired
    private ProgramRecommendationService programRecommendationService;
    @Autowired
    private AssessmentResultService assessmentResultService;
    @Autowired
    private ProgramService programService;

    @PostMapping
    public ResponseEntity<ProgramRecommendationEntity> create(@RequestBody ProgramRecommendationEntity entity) {
        return ResponseEntity.ok(programRecommendationService.create(entity));
    }

    @GetMapping("/by-result/{resultId}")
    public ResponseEntity<List<ProgramRecommendationEntity>> getByAssessmentResult(@PathVariable int resultId) {
        AssessmentResultEntity result = assessmentResultService.getAssessmentResultById(resultId).orElse(null);
        if (result == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(programRecommendationService.getByAssessmentResult(result));
    }

    @GetMapping("/by-program/{programId}")
    public ResponseEntity<List<ProgramRecommendationEntity>> getByProgram(@PathVariable int programId) {
        ProgramEntity program = programService.getProgramById(programId).orElse(null);
        if (program == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(programRecommendationService.getByProgram(program));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProgramRecommendationEntity> getById(@PathVariable int id) {
        return programRecommendationService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable int id) {
        programRecommendationService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
