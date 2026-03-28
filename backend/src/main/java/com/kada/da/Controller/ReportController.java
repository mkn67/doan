package com.kada.da.Controller;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.kada.da.Dto.Response.DoanhThuResponseDTO;

import jakarta.persistence.EntityManager;
import jakarta.persistence.ParameterMode;
import jakarta.persistence.StoredProcedureQuery;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {
    private final EntityManager em;
    /**
     * API Thống kê doanh thu theo tháng/nam
     * URL: GET http://localhost:8081/api/reports/revenue?thang=3&nam=2026
     */
    @GetMapping("/revenue")
    @PreAuthorize("hasRole('ADMIN') or hasRole('QUAN_LY')") 
    public ResponseEntity<?> getRevenue(@RequestParam int thang, @RequestParam int nam) {
        // 1. Khởi tạo Query gọi Stored Procedure
        StoredProcedureQuery sp = em.createStoredProcedureQuery("SP_THONG_KE_DOANH_THU_THANG");
        // 2. Đăng ký các tham số (Phải khớp chính xác với khai báo trong Oracle)
        sp.registerStoredProcedureParameter("p_thang", Integer.class, ParameterMode.IN);
        sp.registerStoredProcedureParameter("p_nam", Integer.class, ParameterMode.IN);
        // Với Oracle REF_CURSOR, trong JPA ta dùng void.class hoặc ResultSet.class
        sp.registerStoredProcedureParameter("c_data", void.class, ParameterMode.REF_CURSOR);       
        // 3. Truyền giá trị vào tham số
        sp.setParameter("p_thang", thang);
        sp.setParameter("p_nam", nam); 
        // 4. Thực thi
        sp.execute();
        // 5. Lấy kết quả từ Cursor và map sang DTO
        @SuppressWarnings("unchecked")
        List<Object[]> rows = sp.getResultList();  
        List<DoanhThuResponseDTO> result = rows.stream().map(r -> {
            DoanhThuResponseDTO row = new DoanhThuResponseDTO();
            // r[0], r[1], r[2] tương ứng với các cột trong câu lệnh SELECT của SP
            row.setNgay(r[0] != null ? r[0].toString() : ""); 
            row.setSoLuongDon(r[1] != null ? ((Number) r[1]).longValue() : 0L);
            row.setDoanhThuNgay(r[2] != null ? new BigDecimal(r[2].toString()) : BigDecimal.ZERO);
            return row;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }
}