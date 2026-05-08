package com.kada.da.Security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.kada.da.modules.auth.security.JwtAuthFilter;

import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final UserDetailsService userDetailsService;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())
                .authenticationProvider(authenticationProvider())
                .authorizeHttpRequests(auth -> auth
                // Cấp kim bài miễn tử cho các request thăm dò từ Frontend
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                // Thả cửa cho Đăng nhập, Đăng ký và Swagger API Docs
                .requestMatchers(
                        "/v3/api-docs",
                        "/v3/api-docs/**",
                        "/swagger-ui/**",
                        "/swagger-ui.html",
                        "/webjars/**",
                        "/api/v1/auth/**"
                ).permitAll()
                // --- BẮT ĐẦU PHÂN QUYỀN CHUẨN THEO DB ---

                // Kho hàng & Sản phẩm: Dành cho Thủ kho (NH03) và Quản lý (NH04)
                .requestMatchers("/api/v1/san-pham/**", "/api/v1/kho-hang/**")
                .hasAnyAuthority("ROLE_NH03", "ROLE_NH04")
                // Lịch hẹn: Khách hàng (NH07) xem lịch của họ, Lễ tân (NH06) xếp lịch, Bác sĩ (NH01) và Quản lý (NH04)
                .requestMatchers("/api/v1/lich-hen/**")
                .hasAnyAuthority("ROLE_NH01", "ROLE_NH06", "ROLE_NH04", "ROLE_NH07")
                // Khách hàng: Lễ tân (NH06) tiếp nhận và Quản lý (NH04)
                .requestMatchers("/api/v1/khach-hang/**")
                .hasAnyAuthority("ROLE_NH06", "ROLE_NH04")
                // Khám bệnh: Bác sĩ (NH01) trực tiếp khám và Quản lý (NH04) theo dõi
                .requestMatchers("/api/v1/kham-benh/**")
                .hasAnyAuthority("ROLE_NH01", "ROLE_NH04")
                // Các tính năng tối cao (Dashboard thống kê, Admin tổng): Chỉ Quản lý (NH04)
                .requestMatchers("/api/v1/dashboard/**", "/api/v1/admin/**")
                .hasAuthority("ROLE_NH04")
                // Các đường dẫn khác phải có Token mới được vào
                .anyRequest().authenticated()
                )
                .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}
