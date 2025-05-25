package edu.cit.futureu.controller;

import edu.cit.futureu.service.GeminiAIService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/programschoolrecommendation")
public class ProgramSchoolRecommendationController {
    @Autowired
    private GeminiAIService geminiAIService;

    /**
     * POST endpoint to get best school recommendations for a list of programIds.
     * Example request body: [19, 21, 22, 23, 24]
     */
    @PostMapping("/getRecommendations")
    public List<Map<String, Object>> getRecommendations(@RequestBody List<Integer> programIds) {
        return geminiAIService.getProgramSchoolRecommendations(programIds);
    }
}
