package com.kada.da.modules.prescription.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kada.da.modules.prescription.domain.PhieuKeDon;
import com.kada.da.modules.prescription.service.PhieuKeDonService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/phieu-ke-don")
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
