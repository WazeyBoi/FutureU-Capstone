package edu.cit.futureu.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import org.springframework.http.HttpMethod; // Ensure this import is present
import edu.cit.futureu.entity.Role; // Ensure this import is present
import edu.cit.futureu.jwt.AuthEntryPointJwt;
import edu.cit.futureu.jwt.AuthTokenFilter;
import edu.cit.futureu.service.UserDetailsServiceImpl;


@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    @Autowired
    UserDetailsServiceImpl userDetailsService;

    @Autowired
    private AuthEntryPointJwt unauthorizedHandler;

    @Bean
    public AuthTokenFilter authenticationJwtTokenFilter() {
        return new AuthTokenFilter();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(Customizer.withDefaults()) // Enable CORS with default settings
            .csrf(csrf -> csrf.disable()) // Disable CSRF
            .exceptionHandling(exception -> exception.authenticationEntryPoint(unauthorizedHandler))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll() // For sign-in and sign-up
                .requestMatchers("/api/test/**").permitAll() // For general API testing
                .requestMatchers("/api/hello").permitAll() // Allow public access to hello endpoint
                
                // Allow public access to read-only school and program endpoints
                .requestMatchers(HttpMethod.GET, "/api/school/getAllSchools").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/program/getAllPrograms").permitAll()
                
                // Restrict all other API endpoints to users with the "STUDENT" role
                .requestMatchers("/api/school/**").hasAuthority(Role.STUDENT.name())
                .requestMatchers("/api/program/**").hasAuthority(Role.STUDENT.name())
                .requestMatchers("/api/career/**").hasAuthority(Role.STUDENT.name())
                .requestMatchers("/api/accreditation/**").hasAuthority(Role.STUDENT.name())
                .requestMatchers("/api/schoolprogram/**").hasAuthority(Role.STUDENT.name())
                .requestMatchers("/api/testimony/**").hasAuthority(Role.STUDENT.name())
                .requestMatchers("/api/assessment/**").hasAuthority(Role.STUDENT.name())
                .requestMatchers("/api/question/**").hasAuthority(Role.STUDENT.name())
                .requestMatchers("/api/answer/**").hasAuthority(Role.STUDENT.name())
                .requestMatchers("/api/userassessment/**").hasAuthority(Role.STUDENT.name())
                .requestMatchers("/api/assessmentresult/**").hasAuthority(Role.STUDENT.name())
                .requestMatchers("/api/recommendation/**").hasAuthority(Role.STUDENT.name())
                .requestMatchers("/api/user/**").hasAuthority(Role.STUDENT.name()) // User-specific data, excluding /api/auth
                .requestMatchers("/api/quizSubCategoryCategory/**").hasAuthority(Role.STUDENT.name()) // Added based on your project structure
                .requestMatchers("/api/choice/**").hasAuthority(Role.STUDENT.name()) // Added based on your project structure
                .anyRequest().authenticated() // All other requests must be authenticated
            );

        http.authenticationProvider(authenticationProvider());
        http.addFilterBefore(authenticationJwtTokenFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
