package com.kada.da.modules.billing.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kada.da.modules.billing.domain.ThanhToan;
import com.kada.da.modules.billing.service.ThanhToanService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/thanh-toan")
@RequiredArgsConstructor
public class ThanhToanController {

    private final ThanhToanService thanhToanService;

    // Tạo thanh toán mới
    @PostMapping
    public ResponseEntity<ThanhToan> createThanhToan(@RequestBody ThanhToan thanhToan) {
        ThanhToan response = thanhToanService.createThanhToan(thanhToan);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
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
    public ResponseEntity<List<ThanhToan>> getThanhToanByMaNs(@PathVariable String maNs) {
        return ResponseEntity.ok(thanhToanService.getThanhToanByMaNs(maNs));
    }
}
