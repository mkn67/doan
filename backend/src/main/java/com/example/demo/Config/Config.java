// có vấn đề nho nhỏ là react cổng 3000 trong khi con java spring dùng cổng 8080 nên hội e tạo config để chúng giao tiếp vs nhau

package com.example.demo.Config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration 
public class Config implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // Áp dụng cho toàn bộ API (tất cả các endpoint)
                .allowedOrigins("http://localhost:3000", "http://localhost:5173") // Cho phép React (CRA hoặc Vite) truy cập
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Các HTTP method được phép
                .allowedHeaders("*") // Cho phép tất cả các header
                .allowCredentials(true); // Bắt buộc là true nếu sau này cậu dùng Token (JWT) hoặc Cookie
    }
}