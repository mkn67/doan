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
import com.kada.da.Entity.Nhom;
import com.kada.da.Entity.TaiKhoan;
import com.kada.da.Service.TaiKhoanService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth") 
@RequiredArgsConstructor
public class TaiKhoanController {

    private final TaiKhoanService taiKhoanService;

    // API Đăng ký tài khoản mới: POST http://localhost:8080/api/auth/register
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody TaiKhoanRequestDTO request) {
        try {
            // Bước 1: Chuyển đổi DTO thành Entity để lưu xuống DB
            TaiKhoan taiKhoan = new TaiKhoan();
            taiKhoan.setMaTk(request.getMaTk());
            taiKhoan.setUsername(request.getUsername());
            taiKhoan.setPassword(request.getPassword()); // Tạm thời để plain text, sau này sẽ băm (hash) mật khẩu
            
            // Nếu có truyền mã nhóm, ta tạo một Nhom giả để gán vào (Hibernate sẽ tự map khóa ngoại)
            if (request.getMaNhom() != null && !request.getMaNhom().isEmpty()) {
                Nhom nhom = new Nhom();
                nhom.setMaNhom(request.getMaNhom());
                taiKhoan.setNhom(nhom);
            }

            // Bước 2: Gọi Service xử lý lưu
            TaiKhoan newTaiKhoan = taiKhoanService.createTaiKhoan(taiKhoan);
            
            // Trả về mã 200 OK kèm thông tin tài khoản vừa tạo
            return ResponseEntity.ok(newTaiKhoan);

        } catch (RuntimeException e) {
            // Nếu có lỗi (như trùng username), trả về mã 400 Bad Request kèm câu thông báo
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // API Lấy thông tin tài khoản: GET http://localhost:8080/api/auth/{username}
    @GetMapping("/{username}")
    public ResponseEntity<?> getUserByUsername(@PathVariable String username) {
        Optional<TaiKhoan> taiKhoan = taiKhoanService.findByUsername(username);
        
        if (taiKhoan.isPresent()) {
            return ResponseEntity.ok(taiKhoan.get());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Không tìm thấy người dùng!");
        }
    }
}