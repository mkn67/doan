package com.kada.da.Controller;

import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kada.da.Entity.TaiKhoan;
import com.kada.da.Service.TaiKhoanService;

import lombok.RequiredArgsConstructor;

@RestController
// Đổi hẳn sang /api/tai-khoan cho chuẩn RESTful và dứt tình với AuthController
@RequestMapping("/api/tai-khoan")
@RequiredArgsConstructor
public class TaiKhoanController {

    private final TaiKhoanService taiKhoanService;

    /**
     * API Lấy thông tin tài khoản theo Username
     * URL: GET http://localhost:8080/api/tai-khoan/{username}
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

    // Nơi đây đã sẵn sàng để ông thêm các hàm như lấy danh sách, xóa tài khoản...
    // sau này!
}