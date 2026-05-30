package com.kada.da.modules.billing.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.kada.da.modules.billing.domain.ThanhToan;
import com.kada.da.modules.billing.dto.ThanhToanRequestDTO;
import com.kada.da.modules.billing.service.ThanhToanService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/v1/thanh-toan")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class ThanhToanController {

    private final ThanhToanService thanhToanService;

    // Tạo thanh toán mới
    @PostMapping
    public ResponseEntity<?> createThanhToan(@Valid @RequestBody ThanhToanRequestDTO dto) {
        try {
            return ResponseEntity.ok(thanhToanService.xuLyThanhToan(dto));
        } catch (Exception e) {
            log.error("Lỗi tại Controller: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        }
    }

    // Lấy toàn bộ lịch sử
    @GetMapping
    public ResponseEntity<List<ThanhToan>> getAllThanhToan() {
        return ResponseEntity.ok(thanhToanService.getAllThanhToan());
    }

    // Lấy chi tiết 1 giao dịch
    @GetMapping("/{maTt}")
    public ResponseEntity<ThanhToan> getThanhToanById(@PathVariable String maTt) {
        return ResponseEntity.ok(thanhToanService.getThanhToanById(maTt));
    }

    // Tra cứu thanh toán theo Hóa đơn
    @GetMapping("/hoa-don/{maHd}")
    public ResponseEntity<List<ThanhToan>> getThanhToanByMaHd(@PathVariable String maHd) {
        return ResponseEntity.ok(thanhToanService.getThanhToanByMaHd(maHd));
    }

    // Tra cứu danh sách thu tiền của 1 Nhân sự
    @GetMapping("/nhan-su/{maNs}")
    public ResponseEntity<List<ThanhToan>> getThanhToanByMaNs(
            @PathVariable String maNs,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        return ResponseEntity.ok(thanhToanService.getThanhToanByMaNs(maNs, start, end));
    }
}
