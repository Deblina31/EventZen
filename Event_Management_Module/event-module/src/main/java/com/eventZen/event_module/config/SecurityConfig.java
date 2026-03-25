package com.eventZen.event_module.config;

import com.eventZen.event_module.utils.JwtFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity // Allows @PreAuthorize to work
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // 1. Enable CORS using the bean defined below
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // 2. Disable CSRF (Required for JWT/Stateless APIs)
                .csrf(csrf -> csrf.disable())

                // 3. Set Session to Stateless (No JSESSIONID cookies)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // 4. Set Permissions
                .authorizeHttpRequests(auth -> auth
                        // Allow all OPTIONS requests (CORS Preflight)
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // Secure all Event endpoints - requires a valid JWT
                        .requestMatchers("/events", "/events/**").authenticated()

                        // Allow any other utility endpoints (like health checks)
                        .anyRequest().permitAll()
                )

                // 5. Add our Custom JWT Filter before the standard Auth filter
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Allow your React Frontend
        configuration.setAllowedOrigins(List.of("http://localhost:3000"));

        // Allow all standard REST methods
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));

        // CRITICAL: Allow the Authorization header so the JWT can get through
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Accept", "X-Requested-With"));

        // Allow sending credentials (cookies, auth headers)
        configuration.setAllowCredentials(true);

        // How long the browser should cache this CORS response (3600 seconds = 1 hour)
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}