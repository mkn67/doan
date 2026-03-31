package com.kada.da.Controller;

import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kada.da.Dto.TaiKhoanRequestDTO;
import com.kada.da.Entity.TaiKhoan;
import com.kada.da.Mapper.TaiKhoanMapper;
import com.kada.da.Service.TaiKhoanService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth") 
@RequiredArgsConstructor
public class TaiKhoanController {
    private final TaiKhoanService taiKhoanService;
    /**
     * API Đăng ký tài khoản mới
     * URL: POST http://localhost:8080/api/auth/register
     */
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody TaiKhoanRequestDTO request) {
        // Bước 1: Dùng Mapper chuyển DTO thành Entity
        TaiKhoan taiKhoan = TaiKhoanMapper.toEntity(request);
        // Bước 2: Gọi Service xử lý lưu
        TaiKhoan newTaiKhoan = taiKhoanService.createTaiKhoan(taiKhoan);  
        // Bước 3: Trả về mã 201 Created kèm thông tin tài khoản
        return ResponseEntity.status(HttpStatus.CREATED).body(newTaiKhoan);
    }
    /**
     * API Lấy thông tin tài khoản theo Username
     * URL: GET http://localhost:8080/api/auth/{username}
     */
    @GetMapping("/{username}")
    public ResponseEntity<?> getUserByUsername(@PathVariable String username) {
        Optional<TaiKhoan> taiKhoan = taiKhoanService.findByUsername(username);
        // Dùng if-else để Java không bị nhầm lẫn kiểu dữ liệu (TaiKhoan vs String)
        if (taiKhoan.isPresent()) {
            return ResponseEntity.ok(taiKhoan.get());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                                 .body("Không tìm thấy người dùng: " + username);
        }
    }
}