package com.kada.da.modules.report.controller;

import java.util.List;
import java.time.LocalDate;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.kada.da.modules.inventory.dto.CanhBaoHetHanDTO;
import com.kada.da.modules.report.dto.DoanhThuResponseDTO;
import com.kada.da.modules.report.dto.ThongKeTongQuanDTO;
import com.kada.da.modules.report.service.ReportService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/canh-bao-het-han")
    public ResponseEntity<List<CanhBaoHetHanDTO>> getCanhBaoHetHan(
            @RequestParam(defaultValue = "30") int soNgay) {
        List<CanhBaoHetHanDTO> result = reportService.canhBaoHangHetHan(soNgay);
        return ResponseEntity.ok(result);
    }

    /**
     * API Thống kê doanh thu theo tháng/năm URL: GET
     * http://localhost:8081/api/v1/reports/revenue?thang=3&nam=2026
     */
    @GetMapping("/revenue")
    @PreAuthorize("hasRole('ADMIN') or hasRole('LE_TAN') or hasRole('THU_NGAN')")
    public ResponseEntity<List<DoanhThuResponseDTO>> getRevenue(@RequestParam int thang, @RequestParam int nam) {
        List<DoanhThuResponseDTO> result = reportService.thongKeDoanhThuThang(thang, nam);
        return ResponseEntity.ok(result);
    }

    /**
     * API Thống kê doanh thu theo khoảng ngày
     * URL: GET /api/v1/reports/doanh-thu-theo-ngay?tuNgay=5&denNgay=2026
     */
    @GetMapping("/doanh-thu-theo-ngay")
    @PreAuthorize("hasRole('ADMIN') or hasRole('LE_TAN') or hasRole('THU_NGAN')")
    public ResponseEntity<?> getDoanhThuTheoNgay(
            @RequestParam String tuNgay,
            @RequestParam String denNgay) {
        if (!tuNgay.contains("-")) {
            int thang = Integer.parseInt(tuNgay);
            int nam = Integer.parseInt(denNgay);
            return ResponseEntity.ok(reportService.thongKeDoanhThuThang(thang, nam));
        } else {
            LocalDate start = LocalDate.parse(tuNgay);
            LocalDate end = LocalDate.parse(denNgay);
            return ResponseEntity.ok(reportService.thongKeDoanhThuNgay(start, end));
        }
    }

    @GetMapping("/tong-quan")
    @PreAuthorize("hasRole('ADMIN') or hasRole('LE_TAN') or hasRole('THU_NGAN')")
    public ResponseEntity<ThongKeTongQuanDTO> getThongKeTongQuan() {
        return ResponseEntity.ok(reportService.layThongKeTongQuan());
    }
}