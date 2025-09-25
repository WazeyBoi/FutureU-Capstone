package edu.cit.futureu.controller;

import edu.cit.futureu.entity.PassageEntity;
import edu.cit.futureu.service.PassageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/passages")
@CrossOrigin(origins = "*")
public class PassageController {

    @Autowired
    private PassageService passageService;

    /**
     * Get all passages
     */
    @GetMapping
    public ResponseEntity<List<PassageEntity>> getAllPassages() {
        try {
            List<PassageEntity> passages = passageService.getAllPassagesOrderedByTitle();
            return ResponseEntity.ok(passages);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get all passages with questions
     */
    @GetMapping("/with-questions")
    public ResponseEntity<List<PassageEntity>> getAllPassagesWithQuestions() {
        try {
            List<PassageEntity> passages = passageService.getAllPassagesWithQuestions();
            return ResponseEntity.ok(passages);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get passage by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<PassageEntity> getPassageById(@PathVariable int id) {
        try {
            PassageEntity passage = passageService.getPassageById(id);
            if (passage != null) {
                return ResponseEntity.ok(passage);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get passage by ID with questions
     */
    @GetMapping("/{id}/questions")
    public ResponseEntity<PassageEntity> getPassageByIdWithQuestions(@PathVariable int id) {
        try {
            PassageEntity passage = passageService.getPassageByIdWithQuestions(id);
            if (passage != null) {
                return ResponseEntity.ok(passage);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Search passages by title
     */
    @GetMapping("/search")
    public ResponseEntity<List<PassageEntity>> searchPassages(@RequestParam String title) {
        try {
            List<PassageEntity> passages = passageService.searchPassagesByTitle(title);
            return ResponseEntity.ok(passages);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Create new passage
     */
    @PostMapping
    public ResponseEntity<PassageEntity> createPassage(@RequestBody PassageEntity passage) {
        try {
            PassageEntity savedPassage = passageService.savePassage(passage);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedPassage);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Update passage
     */
    @PutMapping("/{id}")
    public ResponseEntity<PassageEntity> updatePassage(
            @PathVariable int id, 
            @RequestBody PassageEntity passage) {
        try {
            if (!passageService.passageExists(id)) {
                return ResponseEntity.notFound().build();
            }
            
            PassageEntity updatedPassage = passageService.updatePassage(id, passage.getTitle(), passage.getPassageText());
            if (updatedPassage != null) {
                return ResponseEntity.ok(updatedPassage);
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Delete passage
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePassage(@PathVariable int id) {
        try {
            boolean deleted = passageService.deletePassage(id);
            if (deleted) {
                return ResponseEntity.ok().build();
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get passage count
     */
    @GetMapping("/count")
    public ResponseEntity<Long> getPassageCount() {
        try {
            long count = passageService.getPassageCount();
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
