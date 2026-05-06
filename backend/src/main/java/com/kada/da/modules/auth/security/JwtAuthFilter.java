package com.kada.da.modules.auth.security;

import java.io.IOException;
import java.util.List;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.kada.da.Util.JwtTokenUtil;
import com.kada.da.modules.auth.repository.TokenBlacklistRepository;

import io.jsonwebtoken.JwtException;
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
                || path.startsWith("/api/v1/auth");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);

            try {
                // KIỂM TRA BLACKLIST Ở ĐÂY
                if (tokenBlacklistRepository.existsByToken(token)) {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.getWriter().write("Token da bi thu hoi (Logged out)");
                    return; // Chặn đứng, không cho đi tiếp
                }

                String username = jwtTokenUtil.getUsernameFromToken(token);
                String maNhom = jwtTokenUtil.getClaimFromToken(token, claims -> claims.get("maNhom", String.class));

                if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + maNhom.toUpperCase());
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(username,
                            null, List.of(authority));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            } catch (JwtException | IllegalArgumentException e) {
                System.out.println("Lỗi xác thực Token: " + e.getMessage());
            }
        }
        filterChain.doFilter(request, response);
    }
}
