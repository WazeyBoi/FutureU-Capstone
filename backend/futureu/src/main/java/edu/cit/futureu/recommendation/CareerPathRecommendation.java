package edu.cit.futureu.recommendation;

import com.fasterxml.jackson.annotation.JsonInclude;
import edu.cit.futureu.entity.CareerPathEntity;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class CareerPathRecommendation {

    private int careerPathId;
    private String careerPathName;
    private double matchPercentage;
    private Map<String, Double> componentBreakdown;
    private final List<CareerRecommendationDetail> careers = new ArrayList<>();
    private final List<ProgramRecommendationDetail> programs = new ArrayList<>();

    public static CareerPathRecommendation from(CareerPathEntity path, double matchPercentage,
                                                RecommendationScore score) {
        CareerPathRecommendation recommendation = new CareerPathRecommendation();
        if (path != null) {
            recommendation.careerPathId = path.getCareerPathId();
            recommendation.careerPathName = path.getCareerPathName();
        }
        recommendation.matchPercentage = matchPercentage;
        Map<String, Double> breakdown = new HashMap<>();
        breakdown.put("riasec", score.getRiasecComponent());
        breakdown.put("aptitude", score.getTrackComponent());
        breakdown.put("skills", score.getSkillComponent());
        breakdown.put("context", score.getContextComponent());
        recommendation.componentBreakdown = breakdown;
        return recommendation;
    }

    public int getCareerPathId() {
        return careerPathId;
    }

    public String getCareerPathName() {
        return careerPathName;
    }

    public double getMatchPercentage() {
        return matchPercentage;
    }

    public Map<String, Double> getComponentBreakdown() {
        return componentBreakdown;
    }

    public List<CareerRecommendationDetail> getCareers() {
        return careers;
    }

    public List<ProgramRecommendationDetail> getPrograms() {
        return programs;
    }

    public void addCareer(CareerRecommendationDetail detail) {
        if (detail != null) {
            careers.add(detail);
        }
    }

    public void addProgram(ProgramRecommendationDetail detail) {
        if (detail != null) {
            programs.add(detail);
        }
    }
}
