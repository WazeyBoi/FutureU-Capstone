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

import edu.cit.futureu.entity.ChoiceEntity;
import edu.cit.futureu.entity.QuestionEntity;
import edu.cit.futureu.service.ChoiceService;
import edu.cit.futureu.service.QuestionService;

@RestController
@RequestMapping(method=RequestMethod.GET, path="/api/choice")
public class ChoiceController {
    
    @Autowired
    private ChoiceService choiceService;
    
    @Autowired
    private QuestionService questionService;
    
    @GetMapping("/test")
    public String test() {
        return "Choice API is working!";
    }

    // CREATE
    @PostMapping("/postChoice")
    public ChoiceEntity postChoice(@RequestBody ChoiceEntity choice) {
        return choiceService.createChoice(choice);
    }
    
    // READ
    @GetMapping("/getAllChoices")
    public List<ChoiceEntity> getAllChoices() {
        return choiceService.getAllChoices();
    }
    
    @GetMapping("/getChoice/{choiceId}")
    public ChoiceEntity getChoiceById(@PathVariable int choiceId) {
        return choiceService.getChoiceById(choiceId)
                .orElse(null);
    }
    
    @GetMapping("/getChoicesByQuestion/{questionId}")
    public List<ChoiceEntity> getChoicesByQuestion(@PathVariable int questionId) {
        QuestionEntity question = questionService.getQuestionById(questionId).orElse(null);
        if (question != null) {
            return choiceService.getChoicesByQuestion(question);
        }
        return List.of();
    }
    
    @GetMapping("/getCorrectChoicesByQuestion/{questionId}")
    public List<ChoiceEntity> getCorrectChoicesByQuestion(@PathVariable int questionId) {
        QuestionEntity question = questionService.getQuestionById(questionId).orElse(null);
        if (question != null) {
            return choiceService.getCorrectChoicesByQuestion(question);
        }
        return List.of();
    }
    
    @GetMapping("/searchChoices")
    public List<ChoiceEntity> searchChoices(@RequestParam String text) {
        return choiceService.searchChoicesByText(text);
    }
    
    // UPDATE
    @PutMapping("/putChoice")
    public ChoiceEntity putChoice(@RequestParam int choiceId, @RequestBody ChoiceEntity newChoice) {
        newChoice.setChoiceId(choiceId);
        return choiceService.updateChoice(newChoice);
    }
    
    // DELETE
    @DeleteMapping("/deleteChoice/{choiceId}")
    public String deleteChoice(@PathVariable int choiceId) {
        boolean deleted = choiceService.deleteChoice(choiceId);
        return deleted ? "Choice with ID " + choiceId + " successfully deleted" : "Choice with ID " + choiceId + " not found";
    }
}
