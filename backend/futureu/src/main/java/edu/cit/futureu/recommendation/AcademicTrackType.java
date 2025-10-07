package edu.cit.futureu.recommendation;

import java.util.HashMap;
import java.util.Map;

/**
 * Enumeration encapsulating the SHS tracks / strands used for aptitude alignment.
 */
public enum AcademicTrackType {
    STEM,
    ABM,
    HUMSS,
    TVL,
    ARTS_DESIGN,
    SPORTS;

    private static final Map<String, AcademicTrackType> LOOKUP = new HashMap<>();

    static {
        LOOKUP.put("STEM", STEM);
        LOOKUP.put("SCIENCE", STEM);
        LOOKUP.put("TECH", STEM);
        LOOKUP.put("TECHNOLOGY", STEM);
        LOOKUP.put("ENGINEERING", STEM);
        LOOKUP.put("MATHEMATICS", STEM);

        LOOKUP.put("ABM", ABM);
        LOOKUP.put("BUSINESS", ABM);
        LOOKUP.put("ACCOUNTING", ABM);
        LOOKUP.put("FINANCE", ABM);
        LOOKUP.put("MANAGEMENT", ABM);

        LOOKUP.put("HUMSS", HUMSS);
        LOOKUP.put("HUMANITIES", HUMSS);
        LOOKUP.put("SOCIAL", HUMSS);
        LOOKUP.put("COMMUNICATION", HUMSS);
        LOOKUP.put("EDUCATION", HUMSS);

        LOOKUP.put("TVL", TVL);
        LOOKUP.put("TECHNICAL", TVL);
        LOOKUP.put("VOCATIONAL", TVL);
        LOOKUP.put("LIVELIHOOD", TVL);
        LOOKUP.put("INDUSTRIAL", TVL);

        LOOKUP.put("ARTS", ARTS_DESIGN);
        LOOKUP.put("DESIGN", ARTS_DESIGN);
        LOOKUP.put("CREATIVE", ARTS_DESIGN);
        LOOKUP.put("MUSIC", ARTS_DESIGN);

        LOOKUP.put("SPORTS", SPORTS);
        LOOKUP.put("ATHLETIC", SPORTS);
        LOOKUP.put("PHYSICAL", SPORTS);
        LOOKUP.put("FITNESS", SPORTS);
    }

    public static AcademicTrackType fromKeyword(String keyword) {
        if (keyword == null) {
            return null;
        }
        return LOOKUP.get(keyword.trim().toUpperCase());
    }
}
