package com.kada.da.Config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();

        config.setAllowCredentials(true);
        // Thay vì config.addAllowedOrigin("*");
        // Hãy dùng allowedOriginPatterns hoặc chỉ định rõ localhost:3000
        config.addAllowedOriginPattern("http://localhost:3000");

        config.addAllowedHeader("*");
        config.addAllowedMethod("*");
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                // 👉 DẸP DẤU * ĐI, CHỈ ĐỊNH THẲNG MẶT CỔNG CỦA FRONTEND LUÔN
                .allowedOrigins("http://localhost:3000", "http://localhost:5173", "http://localhost:8080")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true) // Đã ghi rõ origin ở trên thì true thoải mái không bao giờ lỗi
                .maxAge(3600);
    }
}
