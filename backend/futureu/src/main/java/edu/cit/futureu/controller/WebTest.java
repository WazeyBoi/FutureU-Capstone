package edu.cit.futureu.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class WebTest {
    
    @GetMapping("/hello")
    public String helloWorld() {
        return "Hello World from FutureU!";
    }
}
