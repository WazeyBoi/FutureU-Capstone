package edu.cit.futureu.service;

import edu.cit.futureu.entity.ChoiceEntity;
import edu.cit.futureu.entity.QuestionEntity;
import edu.cit.futureu.repository.ChoiceRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ChoiceService {

    @Autowired
    private ChoiceRepository choiceRepository;
    
    // CREATE
    public List<ChoiceEntity> createChoices(List<ChoiceEntity> choices) {
        return choiceRepository.saveAll(choices);
    }
    
    // READ
    public List<ChoiceEntity> getAllChoices() {
        return choiceRepository.findAll();
    }
    
    public Optional<ChoiceEntity> getChoiceById(int choiceId) {
        return choiceRepository.findById(choiceId);
    }
    
    public List<ChoiceEntity> getChoicesByQuestion(QuestionEntity question) {
        return choiceRepository.findByQuestion(question);
    }
    
    public List<ChoiceEntity> getCorrectChoicesByQuestion(QuestionEntity question) {
        return choiceRepository.findByQuestionAndIsCorrectTrue(question);
    }
    
    public List<ChoiceEntity> searchChoicesByText(String text) {
        return choiceRepository.findByChoiceTextContainingIgnoreCase(text);
    }
    
    // UPDATE
    public ChoiceEntity updateChoice(ChoiceEntity choice) {
        if(choiceRepository.existsById(choice.getChoiceId())) {
            return choiceRepository.save(choice);
        }
        return null;
    }
    
    // DELETE
    public boolean deleteChoice(int choiceId) {
        if(choiceRepository.existsById(choiceId)) {
            choiceRepository.deleteById(choiceId);
            return true;
        }
        return false;
    }
}
