package edu.cit.futureu.recommendation;

import edu.cit.futureu.entity.AssessmentResultEntity;
import edu.cit.futureu.entity.UserAssessmentSectionResultEntity;
import java.util.List;
import java.util.Locale;

/**
 * Builds a normalized profile for the student based on stored assessment results.
 */
public class StudentProfile extends ProfileVector {

    private final AssessmentResultEntity assessmentResult;

    private StudentProfile(AssessmentResultEntity assessmentResult) {
        this.assessmentResult = assessmentResult;
    }

    public static StudentProfile from(AssessmentResultEntity result, List<UserAssessmentSectionResultEntity> sections) {
        StudentProfile profile = new StudentProfile(result);
        if (result != null) {
            profile.ingestRiasecScores(result);
            profile.ingestTrackScores(result);
            profile.ingestGsaScores(result);
        }
        if (sections != null) {
            profile.ingestSectionScores(sections);
        }
        profile.normalize();
        return profile;
    }

    private void ingestRiasecScores(AssessmentResultEntity result) {
        profileAddRiasec(RiaSecType.REALISTIC, result.getRealisticScore());
        profileAddRiasec(RiaSecType.INVESTIGATIVE, result.getInvestigativeScore());
        profileAddRiasec(RiaSecType.ARTISTIC, result.getArtisticScore());
        profileAddRiasec(RiaSecType.SOCIAL, result.getSocialScore());
        profileAddRiasec(RiaSecType.ENTERPRISING, result.getEnterprisingScore());
        profileAddRiasec(RiaSecType.CONVENTIONAL, result.getConventionalScore());
    }

    private void ingestTrackScores(AssessmentResultEntity result) {
        profileAddTrack(AcademicTrackType.STEM, result.getStemScore());
        profileAddTrack(AcademicTrackType.ABM, result.getAbmScore());
        profileAddTrack(AcademicTrackType.HUMSS, result.getHumssScore());
        profileAddTrack(AcademicTrackType.TVL, result.getTvlScore());
        profileAddTrack(AcademicTrackType.ARTS_DESIGN, result.getArtsDesignTrackScore());
        profileAddTrack(AcademicTrackType.SPORTS, result.getSportsTrackScore());
    }

    private void ingestGsaScores(AssessmentResultEntity result) {
        profileAddSkill(SkillCluster.LOGICAL_REASONING, result.getLogicalReasoningScore());
        profileAddSkill(SkillCluster.MATHEMATICS, result.getMathematicalAbilityScore());
        profileAddSkill(SkillCluster.SCIENTIFIC_ANALYSIS, result.getScientificAbilityScore());
        profileAddSkill(SkillCluster.VERBAL_COMMUNICATION, result.getVerbalAbilityScore());
        profileAddSkill(SkillCluster.CREATIVITY, result.getArtsDesignTrackScore());
        profileAddSkill(SkillCluster.SOCIAL_SERVICE, result.getSocialScore());
        profileAddSkill(SkillCluster.BUSINESS_LEADERSHIP, result.getEnterprisingScore());
    }

    private void ingestSectionScores(List<UserAssessmentSectionResultEntity> sections) {
        for (UserAssessmentSectionResultEntity section : sections) {
            Double percent = section.getPercentageScore();
            if (percent == null) {
                continue;
            }
            SkillCluster cluster = inferSkillCluster(section.getSectionName());
            if (cluster != null) {
                profileAddSkill(cluster, percent);
            }
        }
    }

    private SkillCluster inferSkillCluster(String sectionName) {
        if (sectionName == null) {
            return null;
        }
        String normalized = sectionName.toLowerCase(Locale.ENGLISH);
        if (normalized.contains("logic") || normalized.contains("reason")) {
            return SkillCluster.LOGICAL_REASONING;
        }
        if (normalized.contains("math")) {
            return SkillCluster.MATHEMATICS;
        }
        if (normalized.contains("science") || normalized.contains("biology") || normalized.contains("chemistry")) {
            return SkillCluster.SCIENTIFIC_ANALYSIS;
        }
        if (normalized.contains("verbal") || normalized.contains("reading") || normalized.contains("communication")) {
            return SkillCluster.VERBAL_COMMUNICATION;
        }
        if (normalized.contains("creative") || normalized.contains("arts") || normalized.contains("design")) {
            return SkillCluster.CREATIVITY;
        }
        if (normalized.contains("entrepreneur") || normalized.contains("business") || normalized.contains("leadership")) {
            return SkillCluster.BUSINESS_LEADERSHIP;
        }
        if (normalized.contains("social") || normalized.contains("service") || normalized.contains("community")) {
            return SkillCluster.SOCIAL_SERVICE;
        }
        return null;
    }

    private void profileAddRiasec(RiaSecType type, Double value) {
        if (value != null) {
            addRiasecWeight(type, Math.max(value, 0));
        }
    }

    private void profileAddTrack(AcademicTrackType type, Double value) {
        if (value != null) {
            addTrackWeight(type, Math.max(value, 0));
        }
    }

    private void profileAddSkill(SkillCluster cluster, Double value) {
        if (value != null) {
            addSkillWeight(cluster, Math.max(value, 0));
        }
    }

    public AssessmentResultEntity getAssessmentResult() {
        return assessmentResult;
    }

    public double getRiasecScore(RiaSecType type) {
        return getRiasecWeights().getOrDefault(type, 0.0);
    }

    public double getTrackScore(AcademicTrackType type) {
        return getTrackWeights().getOrDefault(type, 0.0);
    }

    public double getSkillScore(SkillCluster cluster) {
        return getSkillWeights().getOrDefault(cluster, 0.0);
    }
}
