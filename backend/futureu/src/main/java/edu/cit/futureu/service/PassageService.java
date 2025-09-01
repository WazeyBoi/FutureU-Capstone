package edu.cit.futureu.service;

import edu.cit.futureu.entity.PassageEntity;
import edu.cit.futureu.repository.PassageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PassageService {

    @Autowired
    private PassageRepository passageRepository;

    /**
     * Get all passages
     */
    public List<PassageEntity> getAllPassages() {
        return passageRepository.findAll();
    }

    /**
     * Get all passages ordered by title
     */
    public List<PassageEntity> getAllPassagesOrderedByTitle() {
        return passageRepository.findAllByOrderByTitle();
    }

    /**
     * Get all passages with their questions loaded
     */
    public List<PassageEntity> getAllPassagesWithQuestions() {
        return passageRepository.findAllWithQuestions();
    }

    /**
     * Get passage by ID
     */
    public PassageEntity getPassageById(int id) {
        Optional<PassageEntity> passage = passageRepository.findById(id);
        return passage.orElse(null);
    }

    /**
     * Get passage by ID with questions loaded
     */
    public PassageEntity getPassageByIdWithQuestions(int id) {
        Optional<PassageEntity> passage = passageRepository.findByIdWithQuestions(id);
        return passage.orElse(null);
    }

    /**
     * Search passages by title
     */
    public List<PassageEntity> searchPassagesByTitle(String title) {
        return passageRepository.findByTitleContainingIgnoreCase(title);
    }

    /**
     * Save passage (create or update)
     */
    public PassageEntity savePassage(PassageEntity passage) {
        return passageRepository.save(passage);
    }

    /**
     * Create new passage
     */
    public PassageEntity createPassage(String title, String passageText) {
        PassageEntity passage = new PassageEntity(title, passageText);
        return passageRepository.save(passage);
    }

    /**
     * Update passage
     */
    public PassageEntity updatePassage(int id, String title, String passageText) {
        Optional<PassageEntity> existingPassage = passageRepository.findById(id);
        if (existingPassage.isPresent()) {
            PassageEntity passage = existingPassage.get();
            passage.setTitle(title);
            passage.setPassageText(passageText);
            return passageRepository.save(passage);
        }
        return null;
    }

    /**
     * Delete passage
     */
    public boolean deletePassage(int id) {
        if (passageRepository.existsById(id)) {
            passageRepository.deleteById(id);
            return true;
        }
        return false;
    }

    /**
     * Check if passage exists
     */
    public boolean passageExists(int id) {
        return passageRepository.existsById(id);
    }

    /**
     * Get total count of passages
     */
    public long getPassageCount() {
        return passageRepository.count();
    }
}
