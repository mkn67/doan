package com.kada.da.modules.report.dto;
import java.math.BigDecimal;

import lombok.Data;

@Data
public class DoanhThuResponseDTO {
    private String ngay;
    private Long soLuongDon;
    private BigDecimal doanhThuNgay;    
}
