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
                // Thả cửa cho Đăng nhập, Đăng ký, Swagger API Docs VÀ CÁC API PUBLIC
                .requestMatchers(
                        "/v3/api-docs",
                        "/v3/api-docs/**",
                        "/swagger-ui/**",
                        "/swagger-ui.html",
                        "/webjars/**",
                        "/api/v1/auth/login",
                        "/api/v1/auth/register",
                        "/api/v1/auth/forgot-password",
                        // 🔥 2 DÒNG NÀY LÀ CHÌA KHÓA MỞ DROPDOWN CHO KHÁCH ĐẶT LỊCH NÀY 🔥
                        "/api/v1/nhan-su/chuc-vu/**",
                        "/api/v1/goi-kham/active"
                ).permitAll()
                // --- BẮT ĐẦU PHÂN QUYỀN CHUẨN THEO DB ---

                // Kho hàng & Sản phẩm: Dành cho Thủ kho và Quản lý
                .requestMatchers("/api/v1/san-pham/**", "/api/v1/kho-hang/**")
                .hasAnyRole("THU_KHO", "ADMIN")
                // Lịch hẹn: Khách hàng xem lịch của họ, Lễ tân xếp lịch, Bác sĩ và Quản lý
                .requestMatchers("/api/v1/lich-hen/**")
                .hasAnyRole("BAC_SI", "LE_TAN", "ADMIN", "CUSTOMER")
                // Khách hàng: Lễ tân tiếp nhận và Quản lý
                .requestMatchers("/api/v1/khach-hang/**")
                .hasAnyRole("LE_TAN", "ADMIN")
                // Khám bệnh: Bác sĩ trực tiếp khám và Quản lý theo dõi
                .requestMatchers("/api/v1/kham-benh/**")
                .hasAnyRole("BAC_SI", "ADMIN")
                // Các tính năng tối cao (Dashboard thống kê, Admin tổng): Chỉ Quản lý
                .requestMatchers("/api/v1/dashboard/**", "/api/v1/admin/**")
                .hasRole("ADMIN")
                // Các đường dẫn khác phải có Token mới được vào
                .anyRequest().authenticated()
                )
                .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}
