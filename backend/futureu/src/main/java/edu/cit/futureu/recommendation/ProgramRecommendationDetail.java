package edu.cit.futureu.recommendation;

import com.fasterxml.jackson.annotation.JsonInclude;
import edu.cit.futureu.entity.ProgramEntity;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class ProgramRecommendationDetail {

    private int programId;
    private String programName;
    private double matchPercentage;
    private String summary;
    private List<Map<String, Object>> recommendedSchools;

    public static ProgramRecommendationDetail from(ProgramEntity program, double matchPercentage,
                                                   String summary, List<Map<String, Object>> schools) {
        ProgramRecommendationDetail detail = new ProgramRecommendationDetail();
        if (program != null) {
            detail.programId = program.getProgramId();
            detail.programName = program.getProgramName();
        }
    detail.matchPercentage = matchPercentage;
    detail.summary = summary;
    detail.recommendedSchools = schools != null ? new ArrayList<>(schools) : new ArrayList<>();
        return detail;
    }

    public int getProgramId() {
        return programId;
    }

    public String getProgramName() {
        return programName;
    }

    public double getMatchPercentage() {
        return matchPercentage;
    }

    public String getSummary() {
        return summary;
    }

    public List<Map<String, Object>> getRecommendedSchools() {
        return recommendedSchools;
    }

    public void setRecommendedSchools(List<Map<String, Object>> schools) {
        this.recommendedSchools.clear();
        if (schools != null) {
            this.recommendedSchools.addAll(schools);
        }
    }
}
