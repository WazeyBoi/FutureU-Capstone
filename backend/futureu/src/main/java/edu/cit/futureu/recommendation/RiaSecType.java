package edu.cit.futureu.recommendation;

/**
 * Enumeration for the Holland RIASEC personality types used for career alignment.
 */
import java.util.HashMap;
import java.util.Map;

public enum RiaSecType {
    REALISTIC,
    INVESTIGATIVE,
    ARTISTIC,
    SOCIAL,
    ENTERPRISING,
    CONVENTIONAL;

    private static final Map<String, RiaSecType> LOOKUP = new HashMap<>();

    static {
        LOOKUP.put("R", REALISTIC);
        LOOKUP.put("REALISTIC", REALISTIC);
        LOOKUP.put("I", INVESTIGATIVE);
        LOOKUP.put("INVESTIGATIVE", INVESTIGATIVE);
        LOOKUP.put("A", ARTISTIC);
        LOOKUP.put("ARTISTIC", ARTISTIC);
        LOOKUP.put("S", SOCIAL);
        LOOKUP.put("SOCIAL", SOCIAL);
        LOOKUP.put("E", ENTERPRISING);
        LOOKUP.put("ENTERPRISING", ENTERPRISING);
        LOOKUP.put("C", CONVENTIONAL);
        LOOKUP.put("CONVENTIONAL", CONVENTIONAL);
    }

    public static RiaSecType fromName(String name) {
        if (name == null) {
            return null;
        }
        String normalized = name.trim().toUpperCase();
        return LOOKUP.get(normalized);
    }
}
