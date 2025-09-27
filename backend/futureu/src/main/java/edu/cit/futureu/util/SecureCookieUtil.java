package edu.cit.futureu.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class SecureCookieUtil {

    @Value("${futureu.app.cookieDomain}")
    private String cookieDomain;

    @Value("${futureu.app.cookieSecure}")
    private boolean cookieSecure;

    @Value("${futureu.app.cookieSameSite}")
    private String cookieSameSite;

    private static final String ACCESS_TOKEN_COOKIE = "futureu_access_token";
    private static final String REFRESH_TOKEN_COOKIE = "futureu_refresh_token";
    private static final String USER_INFO_COOKIE = "futureu_user_info";

    /**
     * Set secure HTTP-only cookie for access token
     */
    public void setAccessTokenCookie(HttpServletResponse response, String token, int maxAge) {
        Cookie cookie = new Cookie(ACCESS_TOKEN_COOKIE, token);
        cookie.setHttpOnly(true);
        cookie.setSecure(cookieSecure);
        cookie.setPath("/");
        cookie.setMaxAge(maxAge);
        
        if (!cookieDomain.equals("localhost")) {
            cookie.setDomain(cookieDomain);
        }
        
        // Set SameSite attribute via response header (Spring Boot doesn't support it directly)
        response.addHeader("Set-Cookie", String.format("%s=%s; HttpOnly; Secure=%s; SameSite=%s; Path=/; Max-Age=%d%s",
            ACCESS_TOKEN_COOKIE, token, cookieSecure, cookieSameSite, maxAge,
            !cookieDomain.equals("localhost") ? "; Domain=" + cookieDomain : ""));
    }

    /**
     * Set secure HTTP-only cookie for refresh token
     */
    public void setRefreshTokenCookie(HttpServletResponse response, String token, int maxAge) {
        Cookie cookie = new Cookie(REFRESH_TOKEN_COOKIE, token);
        cookie.setHttpOnly(true);
        cookie.setSecure(cookieSecure);
        cookie.setPath("/api/auth/refresh");
        cookie.setMaxAge(maxAge);
        
        if (!cookieDomain.equals("localhost")) {
            cookie.setDomain(cookieDomain);
        }
        
        response.addHeader("Set-Cookie", String.format("%s=%s; HttpOnly; Secure=%s; SameSite=%s; Path=/api/auth/refresh; Max-Age=%d%s",
            REFRESH_TOKEN_COOKIE, token, cookieSecure, cookieSameSite, maxAge,
            !cookieDomain.equals("localhost") ? "; Domain=" + cookieDomain : ""));
    }

    /**
     * Set secure cookie for user info (non-sensitive data only)
     */
    public void setUserInfoCookie(HttpServletResponse response, String userInfo, int maxAge) {
        Cookie cookie = new Cookie(USER_INFO_COOKIE, userInfo);
        cookie.setHttpOnly(false); // Allow JavaScript access for non-sensitive data
        cookie.setSecure(cookieSecure);
        cookie.setPath("/");
        cookie.setMaxAge(maxAge);
        
        if (!cookieDomain.equals("localhost")) {
            cookie.setDomain(cookieDomain);
        }
        
        response.addHeader("Set-Cookie", String.format("%s=%s; Secure=%s; SameSite=%s; Path=/; Max-Age=%d%s",
            USER_INFO_COOKIE, userInfo, cookieSecure, cookieSameSite, maxAge,
            !cookieDomain.equals("localhost") ? "; Domain=" + cookieDomain : ""));
    }

    /**
     * Clear all authentication cookies
     */
    public void clearAuthCookies(HttpServletResponse response) {
        // Clear access token
        response.addHeader("Set-Cookie", String.format("%s=; HttpOnly; Secure=%s; SameSite=%s; Path=/; Max-Age=0%s",
            ACCESS_TOKEN_COOKIE, cookieSecure, cookieSameSite,
            !cookieDomain.equals("localhost") ? "; Domain=" + cookieDomain : ""));
        
        // Clear refresh token
        response.addHeader("Set-Cookie", String.format("%s=; HttpOnly; Secure=%s; SameSite=%s; Path=/api/auth/refresh; Max-Age=0%s",
            REFRESH_TOKEN_COOKIE, cookieSecure, cookieSameSite,
            !cookieDomain.equals("localhost") ? "; Domain=" + cookieDomain : ""));
        
        // Clear user info
        response.addHeader("Set-Cookie", String.format("%s=; Secure=%s; SameSite=%s; Path=/; Max-Age=0%s",
            USER_INFO_COOKIE, cookieSecure, cookieSameSite,
            !cookieDomain.equals("localhost") ? "; Domain=" + cookieDomain : ""));
    }

    /**
     * Get cookie name for access token
     */
    public String getAccessTokenCookieName() {
        return ACCESS_TOKEN_COOKIE;
    }

    /**
     * Get cookie name for refresh token
     */
    public String getRefreshTokenCookieName() {
        return REFRESH_TOKEN_COOKIE;
    }

    /**
     * Get cookie name for user info
     */
    public String getUserInfoCookieName() {
        return USER_INFO_COOKIE;
    }
}
