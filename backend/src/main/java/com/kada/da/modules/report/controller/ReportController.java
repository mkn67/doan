package com.kada.da.modules.report.controller;

import java.util.List;
import java.time.LocalDate;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;

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

    @GetMapping("/export-excel")
    @PreAuthorize("hasRole('ADMIN') or hasRole('LE_TAN') or hasRole('THU_NGAN')")
    public ResponseEntity<byte[]> exportExcel(
            @RequestParam(required = false) Integer thang,
            @RequestParam(required = false) Integer nam) {
        
        int t = (thang != null) ? thang : LocalDate.now().getMonthValue();
        int n = (nam != null) ? nam : LocalDate.now().getYear();
        
        List<DoanhThuResponseDTO> revenueList = reportService.thongKeDoanhThuThang(t, n);
        
        StringBuilder csv = new StringBuilder();
        // BOM UTF-8 để Excel hiển thị đúng tiếng Việt
        csv.append("\ufeff");
        
        csv.append("BÁO CÁO THỐNG KÊ DOANH THU VISION CARE\n");
        csv.append("Tháng: ").append(t).append(", Năm: ").append(n).append("\n");
        csv.append("Thời gian xuất báo cáo: ").append(java.time.LocalDateTime.now()).append("\n\n");
        
        csv.append("Ngày khám,Số lượng hóa đơn,Doanh thu (VND)\n");
        
        BigDecimal tongDoanhThu = BigDecimal.ZERO;
        long tongSoDon = 0;
        
        for (DoanhThuResponseDTO item : revenueList) {
            String ngay = item.getNgay() != null ? item.getNgay() : "N/A";
            long soDon = item.getSoLuongDon() != null ? item.getSoLuongDon() : 0;
            BigDecimal doanhThu = item.getDoanhThuNgay() != null ? item.getDoanhThuNgay() : BigDecimal.ZERO;
            
            csv.append(ngay).append(",")
               .append(soDon).append(",")
               .append(doanhThu).append("\n");
               
            tongDoanhThu = tongDoanhThu.add(doanhThu);
            tongSoDon += soDon;
        }
        
        csv.append("\n");
        csv.append("TỔNG CỘNG,, \n");
        csv.append("Tổng số hóa đơn:,").append(tongSoDon).append(",\n");
        csv.append("Tổng doanh thu:,").append(tongDoanhThu).append(",VND\n");
        
        byte[] csvBytes = csv.toString().getBytes(StandardCharsets.UTF_8);
        String filename = "baocao_doanhthu_" + t + "_" + n + ".csv";
        
        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(org.springframework.http.MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(csvBytes);
    }
}