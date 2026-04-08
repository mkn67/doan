package com.kada.da.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kada.da.Dto.LoginRequestDTO;
import com.kada.da.Dto.TaiKhoanRequestDTO; // Thêm import này
import com.kada.da.Dto.Response.LoginResponseDTO;
import com.kada.da.Dto.Response.TaiKhoanResponseDTO; // Thêm import này
import com.kada.da.Service.AuthService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@RequestBody LoginRequestDTO request) {
        return ResponseEntity.ok(authService.login(request));
    }

    // 👇 ĐÂY LÀ CHÌA KHÓA VÀNG MỞ RA CHỮ 200 OK 👇
    @PostMapping("/register")
    public ResponseEntity<TaiKhoanResponseDTO> register(@RequestBody TaiKhoanRequestDTO request) {
        // Lệnh này sẽ gọi thẳng vào cái hàm register có sinh mã tự động bên Service
        return ResponseEntity.ok(authService.register(request));
    }
}