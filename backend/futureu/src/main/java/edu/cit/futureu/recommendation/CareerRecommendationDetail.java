package edu.cit.futureu.recommendation;

import com.fasterxml.jackson.annotation.JsonInclude;

import edu.cit.futureu.entity.CareerEntity;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class CareerRecommendationDetail {

    private int careerId;
    private String careerTitle;
    private double matchPercentage;
    private String summary;

    public static CareerRecommendationDetail from(CareerEntity career, double matchPercentage, String summary) {
        CareerRecommendationDetail detail = new CareerRecommendationDetail();
        if (career != null) {
            detail.careerId = career.getCareerId();
            detail.careerTitle = career.getCareerTitle();
        }
        detail.matchPercentage = matchPercentage;
        detail.summary = summary;
        return detail;
    }

    public int getCareerId() {
        return careerId;
    }

    public String getCareerTitle() {
        return careerTitle;
    }

    public double getMatchPercentage() {
        return matchPercentage;
    }

    public String getSummary() {
        return summary;
    }
}
