package edu.cit.futureu.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import edu.cit.futureu.entity.QuestionEntity;
import edu.cit.futureu.entity.AssessmentCategoryEntity;
import edu.cit.futureu.service.QuestionService;
import edu.cit.futureu.service.AssessmentCategoryService;

@RestController
@RequestMapping(method = RequestMethod.GET, path = "/api/question")
public class QuestionController {

    @Autowired
    private QuestionService questionService;

    @Autowired
    private AssessmentCategoryService assessmentCategoryService;

    @PostMapping("/postQuestion")
    public QuestionEntity postQuestion(@RequestBody QuestionEntity question) {
        return questionService.createQuestion(question);
    }

    @GetMapping("/getAllQuestions")
    public List<QuestionEntity> getAllQuestions() {
        return questionService.getAllQuestions();
    }

    @GetMapping("/getQuestion/{questionId}")
    public QuestionEntity getQuestionById(@PathVariable int questionId) {
        return questionService.getQuestionById(questionId).orElse(null);
    }

    @GetMapping("/getQuestionsByAssessmentCategory/{assessmentCategoryId}")
    public List<QuestionEntity> getQuestionsByAssessmentCategory(@PathVariable int assessmentCategoryId) {
        AssessmentCategoryEntity category = assessmentCategoryService.getAssessmentCategoryById(assessmentCategoryId).orElse(null);
        if (category != null) {
            return questionService.getQuestionsByAssessmentCategory(category);
        }
        return List.of();
    }

    @PutMapping("/putQuestion")
    public QuestionEntity putQuestion(@RequestParam int questionId, @RequestBody QuestionEntity newQuestion) {
        newQuestion.setQuestionId(questionId);
        return questionService.updateQuestion(newQuestion);
    }

    @DeleteMapping("/deleteQuestion/{questionId}")
    public String deleteQuestion(@PathVariable int questionId) {
        boolean deleted = questionService.deleteQuestion(questionId);
        return deleted ? "Question with ID " + questionId + " successfully deleted" : "Question with ID " + questionId + " not found";
    }
}
