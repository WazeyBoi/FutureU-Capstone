package edu.cit.futureu.controller;

import edu.cit.futureu.entity.QuizSubCategoryCategoryEntity;
import edu.cit.futureu.service.QuizSubCategoryCategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping(method=RequestMethod.GET, path="/api/quizSubCategoryCategory")
public class QuizSubCategoryCategoryController {
    
    @Autowired
    private QuizSubCategoryCategoryService quizSubCategoryCategoryService;

    public QuizSubCategoryCategoryController(QuizSubCategoryCategoryService quizSubCategoryCategoryService) {
        this.quizSubCategoryCategoryService = quizSubCategoryCategoryService;
    }

    @GetMapping("/test")
    public String test() {
        return "QuizSubCategoryCategory API is working!";
    }

    @GetMapping("/getAllQuizSubCategories")
    public ResponseEntity<List<QuizSubCategoryCategoryEntity>> getAllQuizSubCategories() {
        List<QuizSubCategoryCategoryEntity> quizSubCategories = quizSubCategoryCategoryService.getAllQuizSubCategories();
        return new ResponseEntity<>(quizSubCategories, HttpStatus.OK);
    }

    @GetMapping("/getQuizSubCategory/{id}")
    public ResponseEntity<QuizSubCategoryCategoryEntity> getQuizSubCategoryById(@PathVariable int id) {
        Optional<QuizSubCategoryCategoryEntity> quizSubCategory = quizSubCategoryCategoryService.getQuizSubCategoryById(id);
        return quizSubCategory
                .map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @GetMapping("/searchQuizSubCategories")
    public ResponseEntity<List<QuizSubCategoryCategoryEntity>> searchQuizSubCategories(@RequestParam String name) {
        List<QuizSubCategoryCategoryEntity> quizSubCategories = quizSubCategoryCategoryService.searchQuizSubCategoriesByName(name);
        return new ResponseEntity<>(quizSubCategories, HttpStatus.OK);
    }

    @PostMapping("/postQuizSubCategory")
    public ResponseEntity<QuizSubCategoryCategoryEntity> createQuizSubCategory(@RequestBody QuizSubCategoryCategoryEntity quizSubCategoryCategory) {
        QuizSubCategoryCategoryEntity savedQuizSubCategory = quizSubCategoryCategoryService.saveQuizSubCategory(quizSubCategoryCategory);
        return new ResponseEntity<>(savedQuizSubCategory, HttpStatus.CREATED);
    }

    @PutMapping("/putQuizSubCategory")
    public ResponseEntity<QuizSubCategoryCategoryEntity> updateQuizSubCategory(@RequestParam int id, @RequestBody QuizSubCategoryCategoryEntity quizSubCategoryCategory) {
        if (!quizSubCategoryCategoryService.getQuizSubCategoryById(id).isPresent()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        quizSubCategoryCategory.setQuizSubCategoryCategoryId(id);
        QuizSubCategoryCategoryEntity updatedQuizSubCategory = quizSubCategoryCategoryService.saveQuizSubCategory(quizSubCategoryCategory);
        return new ResponseEntity<>(updatedQuizSubCategory, HttpStatus.OK);
    }

    @DeleteMapping("/deleteQuizSubCategory/{id}")
    public ResponseEntity<Void> deleteQuizSubCategory(@PathVariable int id) {
        if (!quizSubCategoryCategoryService.getQuizSubCategoryById(id).isPresent()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        quizSubCategoryCategoryService.deleteQuizSubCategory(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
