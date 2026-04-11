package com.kada.da.Controller;

import java.time.LocalDateTime;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.kada.da.Service.HangChoService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/hang-cho")
@RequiredArgsConstructor
public class HangChoController {

    private final HangChoService hangChoService;

    // 1. Bác sĩ gọi bệnh nhân vào khám
    @PutMapping("/{maHc}/goi-kham")
    // @PreAuthorize("hasAnyRole('BAC_SI', 'ADMIN')") // Mở comment nếu ông có phân
    // quyền
    public ResponseEntity<String> goiVaoKham(@PathVariable String maHc) {
        // Truyền trạng thái "Đang khám" và giờ hiện tại
        hangChoService.capNhatTrangThaiHangCho(maHc, "Đang khám", LocalDateTime.now());
        return ResponseEntity.ok("Đã gọi bệnh nhân vào phòng khám");
    }

    // 2. Khám xong hoặc bệnh nhân bỏ về
    @PutMapping("/{maHc}/ket-thuc")
    // @PreAuthorize("hasAnyRole('BAC_SI', 'ADMIN')") // Mở comment nếu ông có phân
    // quyền
    public ResponseEntity<String> ketThucKham(
            @PathVariable String maHc,
            @RequestParam String trangThai) { // Frontend sẽ truyền lên: "Hoàn thành" hoặc "Bỏ về"

        // Khúc này không cần giờ vào khám nữa (truyền null)
        hangChoService.capNhatTrangThaiHangCho(maHc, trangThai, null);
        return ResponseEntity.ok("Cập nhật trạng thái thành: " + trangThai);
    }
}