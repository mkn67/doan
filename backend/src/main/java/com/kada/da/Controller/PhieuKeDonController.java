package com.kada.da.Controller;

import com.kada.da.Entity.PhieuKeDon;
import com.kada.da.Service.PhieuKeDonService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/phieu-ke-don")
@RequiredArgsConstructor
public class PhieuKeDonController {

    private final PhieuKeDonService phieuKeDonService;

    // API: Tạo đơn thuốc mới
    @PostMapping
    public ResponseEntity<PhieuKeDon> taoDonThuoc(@RequestBody PhieuKeDon phieuKeDon) {
        PhieuKeDon response = phieuKeDonService.taoDonThuoc(phieuKeDon);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // API: Lấy danh sách đơn thuốc theo mã Hồ sơ thị lực
    @GetMapping("/ho-so/{maHoSo}")
    public ResponseEntity<List<PhieuKeDon>> layDonThuocTheoHoSo(@PathVariable String maHoSo) {
        List<PhieuKeDon> response = phieuKeDonService.layDonThuocTheoHoSo(maHoSo);
        return ResponseEntity.ok(response);
    }
}