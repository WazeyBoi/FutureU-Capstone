package edu.cit.futureu.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import edu.cit.futureu.entity.ProgramEntity;
import edu.cit.futureu.repository.ProgramRepository;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ProgramMappingService {

    @Autowired
    private ProgramRepository programRepository;
    
    /**
     * Find the closest matching programs in the database based on AI recommendations
     */
    public List<ProgramEntity> mapRecommendationsToDatabasePrograms(List<Map<String, Object>> aiRecommendations) {
        List<ProgramEntity> matchedPrograms = new ArrayList<>();
        
        // Get all programs from the database
        List<ProgramEntity> allPrograms = programRepository.findAll();
        
        // For each AI recommendation, find the closest match in the database
        for (Map<String, Object> recommendation : aiRecommendations) {
            String recommendedProgramName = (String) recommendation.get("name");
            ProgramEntity match = findBestMatch(recommendedProgramName, allPrograms);
            
            if (match != null) {
                matchedPrograms.add(match);
            }
        }
        
        // Return unique matched programs
        return matchedPrograms.stream().distinct().collect(Collectors.toList());
    }
    
    /**
     * Find the best matching program based on program name similarity
     */
    private ProgramEntity findBestMatch(String recommendedName, List<ProgramEntity> programs) {
        ProgramEntity bestMatch = null;
        double highestScore = 0.0;
        
        for (ProgramEntity program : programs) {
            double similarityScore = calculateSimilarity(recommendedName.toLowerCase(), 
                                                       program.getProgramName().toLowerCase());
            
            if (similarityScore > highestScore) {
                highestScore = similarityScore;
                bestMatch = program;
            }
        }
        
        // Only return a match if the similarity is above a threshold
        return highestScore > 0.5 ? bestMatch : null;
    }
    
    /**
     * Calculate text similarity using Jaccard similarity
     */
    private double calculateSimilarity(String text1, String text2) {
        Set<String> set1 = new HashSet<>(Arrays.asList(text1.split(" ")));
        Set<String> set2 = new HashSet<>(Arrays.asList(text2.split(" ")));
        
        Set<String> intersection = new HashSet<>(set1);
        intersection.retainAll(set2);
        
        Set<String> union = new HashSet<>(set1);
        union.addAll(set2);
        
        return (double) intersection.size() / union.size();
    }
}
