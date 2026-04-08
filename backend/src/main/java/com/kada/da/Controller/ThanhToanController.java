package com.kada.da.Controller;

import com.kada.da.Entity.ThanhToan;
import com.kada.da.Service.ThanhToanService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/thanh-toan")
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