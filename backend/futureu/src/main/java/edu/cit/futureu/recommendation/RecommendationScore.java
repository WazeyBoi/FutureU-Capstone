package edu.cit.futureu.recommendation;

/**
 * Holds the component and overall scores for a recommendation calculation.
 */
public class RecommendationScore {

    private final double overall;
    private final double riasecComponent;
    private final double trackComponent;
    private final double skillComponent;
    private final double contextComponent;

    public RecommendationScore(double overall, double riasecComponent, double trackComponent,
                               double skillComponent, double contextComponent) {
        this.overall = overall;
        this.riasecComponent = riasecComponent;
        this.trackComponent = trackComponent;
        this.skillComponent = skillComponent;
        this.contextComponent = contextComponent;
    }

    public double getOverall() {
        return overall;
    }

    public double getRiasecComponent() {
        return riasecComponent;
    }

    public double getTrackComponent() {
        return trackComponent;
    }

    public double getSkillComponent() {
        return skillComponent;
    }

    public double getContextComponent() {
        return contextComponent;
    }
}
