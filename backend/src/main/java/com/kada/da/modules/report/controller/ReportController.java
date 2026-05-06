package com.kada.da.Controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.kada.da.Dto.Response.CanhBaoHetHanDTO;
import com.kada.da.Dto.Response.DoanhThuResponseDTO;
import com.kada.da.Service.ReportService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService; // ✅ Đã import đúng

    @GetMapping("/canh-bao-het-han")
    public ResponseEntity<List<CanhBaoHetHanDTO>> getCanhBaoHetHan(
            @RequestParam(defaultValue = "30") int soNgay) {
        List<CanhBaoHetHanDTO> result = reportService.canhBaoHangHetHan(soNgay);
        return ResponseEntity.ok(result);
    }

    /**
     * API Thống kê doanh thu theo tháng/năm
     * URL: GET http://localhost:8081/api/reports/revenue?thang=3&nam=2026
     */
    @GetMapping("/revenue")
    @PreAuthorize("hasRole('ADMIN') or hasRole('QUAN_LY')")
    public ResponseEntity<List<DoanhThuResponseDTO>> getRevenue(@RequestParam int thang, @RequestParam int nam) {
        List<DoanhThuResponseDTO> result = reportService.thongKeDoanhThuThang(thang, nam);
        return ResponseEntity.ok(result);
    }
}