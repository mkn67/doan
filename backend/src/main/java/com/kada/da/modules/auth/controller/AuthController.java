package com.kada.da.modules.auth.controller;

import java.security.Principal;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kada.da.modules.auth.dto.ChangePasswordRequestDTO;
import com.kada.da.modules.auth.dto.LoginRequestDTO;
import com.kada.da.modules.auth.dto.TaiKhoanRequestDTO;
import com.kada.da.modules.auth.dto.TaiKhoanResponseDTO;
import com.kada.da.modules.auth.dto.ForgotPasswordRequestDTO;
import com.kada.da.modules.auth.dto.ProfileResponseDTO;
import com.kada.da.modules.auth.dto.ProfileUpdateRequestDTO;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import com.kada.da.modules.auth.service.AuthService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequestDTO request) {
        try {
            return ResponseEntity.ok(authService.login(request));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    Map.of("message", e.getMessage() != null ? e.getMessage() : "Sai tên đăng nhập hoặc mật khẩu")
            );
        }
    }

    @PostMapping("/register")
    public ResponseEntity<TaiKhoanResponseDTO> register(
            @RequestBody TaiKhoanRequestDTO request) {
        // Lệnh này sẽ gọi thẳng vào cái hàm register có sinh mã tự động bên Service
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequestDTO request) {
        authService.forgotPassword(request);
        return ResponseEntity.ok(
                Map.of("status", "success", "message", "Mật khẩu của bạn đã được cập nhật thành công!"));
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ProfileResponseDTO> getMyProfile(Principal principal) {
        String username = principal.getName();
        return ResponseEntity.ok(authService.getProfile(username));
    }

    @PutMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ProfileResponseDTO> updateMyProfile(
            @Valid @RequestBody ProfileUpdateRequestDTO request,
            Principal principal) {
        String username = principal.getName();
        return ResponseEntity.ok(authService.updateProfile(username, request));
    }

    @PostMapping("/change-password")
    @PreAuthorize("isAuthenticated()") // Bắt buộc phải đăng nhập mới được đổi
    public ResponseEntity<?> changePassword(
            @Valid @RequestBody ChangePasswordRequestDTO request,
            Principal principal) {
        // Principal.getName() sẽ lấy ra username của người dùng đang gửi request
        String username = principal.getName();
        authService.changePassword(username, request);

        return ResponseEntity.ok(
                Map.of("status", "success", "message", "Đổi mật khẩu thành công!"));
    }

    @PostMapping("/logout")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> logout(@RequestHeader("Authorization") String authHeader) {
        authService.logout(authHeader);
        return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Đã đăng xuất và vô hiệu hóa token thành công"));
    }
}
