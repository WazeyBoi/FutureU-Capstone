package edu.cit.futureu.recommendation;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.ArrayList;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class AdvancedRecommendationResponse {

    private int assessmentResultId;
    private List<CareerPathRecommendation> careerPaths = new ArrayList<>();
    private DreamCareerInsight dreamCareerInsight;

    public int getAssessmentResultId() {
        return assessmentResultId;
    }

    public void setAssessmentResultId(int assessmentResultId) {
        this.assessmentResultId = assessmentResultId;
    }

    public List<CareerPathRecommendation> getCareerPaths() {
        return careerPaths;
    }

    public void setCareerPaths(List<CareerPathRecommendation> careerPaths) {
        this.careerPaths = careerPaths;
    }

    public DreamCareerInsight getDreamCareerInsight() {
        return dreamCareerInsight;
    }

    public void setDreamCareerInsight(DreamCareerInsight dreamCareerInsight) {
        this.dreamCareerInsight = dreamCareerInsight;
    }
}
