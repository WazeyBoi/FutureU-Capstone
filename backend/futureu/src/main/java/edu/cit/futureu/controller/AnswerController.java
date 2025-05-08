package edu.cit.futureu.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import edu.cit.futureu.entity.AnswerEntity;
import edu.cit.futureu.entity.UserEntity;
import edu.cit.futureu.entity.QuestionEntity;
import edu.cit.futureu.service.AnswerService;
import edu.cit.futureu.service.UserService;
import edu.cit.futureu.service.QuestionService;

@RestController
@RequestMapping(method = RequestMethod.GET, path = "/api/answer")
public class AnswerController {

    @Autowired
    private AnswerService answerService;

    @Autowired
    private UserService userService;

    @Autowired
    private QuestionService questionService;

    @PostMapping("/postAnswer")
    public AnswerEntity postAnswer(@RequestBody AnswerEntity answer) {
        return answerService.createAnswer(answer);
    }

    @GetMapping("/getAllAnswers")
    public List<AnswerEntity> getAllAnswers() {
        return answerService.getAllAnswers();
    }

    @GetMapping("/getAnswer/{answerId}")
    public AnswerEntity getAnswerById(@PathVariable int answerId) {
        return answerService.getAnswerById(answerId).orElse(null);
    }

    @GetMapping("/getAnswersByUser/{userId}")
    public List<AnswerEntity> getAnswersByUser(@PathVariable int userId) {
        UserEntity user = userService.getUserById(userId).orElse(null);
        if (user != null) {
            return answerService.getAnswersByUser(user);
        }
        return List.of();
    }

    @GetMapping("/getAnswersByQuestion/{questionId}")
    public List<AnswerEntity> getAnswersByQuestion(@PathVariable int questionId) {
        QuestionEntity question = questionService.getQuestionById(questionId).orElse(null);
        if (question != null) {
            return answerService.getAnswersByQuestion(question);
        }
        return List.of();
    }

    @GetMapping("/getAnswersByUserAndQuestion")
    public List<AnswerEntity> getAnswersByUserAndQuestion(@RequestParam int userId, @RequestParam int questionId) {
        UserEntity user = userService.getUserById(userId).orElse(null);
        QuestionEntity question = questionService.getQuestionById(questionId).orElse(null);
        if (user != null && question != null) {
            return answerService.getAnswersByUserAndQuestion(user, question);
        }
        return List.of();
    }

    @PutMapping("/putAnswer")
    public AnswerEntity putAnswer(@RequestParam int answerId, @RequestBody AnswerEntity newAnswer) {
        newAnswer.setAnswerId(answerId);
        return answerService.updateAnswer(newAnswer);
    }

    @DeleteMapping("/deleteAnswer/{answerId}")
    public String deleteAnswer(@PathVariable int answerId) {
        boolean deleted = answerService.deleteAnswer(answerId);
        return deleted ? "Answer with ID " + answerId + " successfully deleted" : "Answer with ID " + answerId + " not found";
    }
}
