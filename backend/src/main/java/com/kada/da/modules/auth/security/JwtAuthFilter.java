package com.kada.da.modules.auth.security;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.kada.da.Util.JwtTokenUtil;
import com.kada.da.modules.auth.repository.TokenBlacklistRepository;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtTokenUtil jwtTokenUtil;
    private final TokenBlacklistRepository tokenBlacklistRepository;

    // BỔ SUNG HÀM NÀY: Cấp thẻ VIP đi thẳng, không cần soát Token cho Swagger và Auth (Login/Register)
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getServletPath();
        return path.startsWith("/v3/api-docs")
                || path.startsWith("/swagger-ui")
                || path.startsWith("/webjars")
                || path.equals("/swagger-ui.html")
                || path.equals("/api/v1/auth/login")
                || path.equals("/api/v1/auth/register")
                || path.equals("/api/v1/auth/forgot-password");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);

            try {
                if (tokenBlacklistRepository.existsByToken(token)) {
                    response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Token has been revoked");
                    return;
                }

                String username = jwtTokenUtil.getUsernameFromToken(token);
                // Lấy thẳng cái mảng roles từ token ra
                List<?> rawRoles = jwtTokenUtil.getClaimFromToken(token, claims -> claims.get("roles", List.class));
                List<String> roles = rawRoles != null ? rawRoles.stream()
                        .filter(String.class::isInstance)
                        .map(String.class::cast)
                        .collect(Collectors.toList()) : List.of();

                if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    // Biến đổi mảng roles thành danh sách quyền (Authorities)
                    List<SimpleGrantedAuthority> authorities = roles.stream()
                            .map(role -> new SimpleGrantedAuthority(role.toUpperCase())) // Đảm bảo đúng định dạng ROLE_ADMIN
                            .collect(Collectors.toList());

                    UsernamePasswordAuthenticationToken authToken = 
                        new UsernamePasswordAuthenticationToken(username, null, authorities);
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            } catch (Exception e) {
                System.out.println("Lỗi xác thực: " + e.getMessage());
            }
        }
        filterChain.doFilter(request, response);
    }
}
